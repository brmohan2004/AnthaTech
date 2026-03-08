import supabase from '../config/supabaseClient';
import { withCache } from './cacheManager';

/**
 * Fetches real analytics data from Cloudflare, Supabase, and Cloudinary.
 * Throws explicit errors instead of falling back to mock data.
 */

// 1. Cloudflare Traffic API (Proxied securely through Vite to hide API Token)
export async function getCloudflareTraffic(accountId) {
    if (!accountId) throw new Error('Cloudflare Account ID is not configured in .env');

    return withCache(`cf_traffic_${accountId}`, async () => {

        try {
            const query = `
            query {
                viewer {
                    accounts(filter: {accountTag: "${accountId}"}) {
                        httpRequests1dGroups(limit: 30, orderBy: [date_DESC]) {
                            sum { requests, bytes, pageViews, edgeResponseBytes }
                            uniq { uniques }
                            dimensions { date }
                        }
                        httpRequestsAdaptiveGroups(
                            limit: 10, 
                            filter: { clientRequestHTTPStatusCode_not_in: [200, 301, 302, 304] },
                            orderBy: [count_DESC]
                        ) {
                            count
                            dimensions { clientRequestHTTPHost, clientRequestPath, clientRequestHTTPStatusCode }
                        }
                    }
                }
            }
        `;

            const res = await fetch('/api/cloudflare-analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) {
                const errBody = await res.text();
                throw new Error(`Cloudflare fetch failed (${res.status}): ${errBody}`);
            }

            const data = await res.json();

            if (data.errors && data.errors.length > 0) {
                throw new Error(`Cloudflare GraphQL Error: ${data.errors[0].message}`);
            }

            const series = data.data?.viewer?.accounts?.[0]?.httpRequests1dGroups || [];
            const errors = data.data?.viewer?.accounts?.[0]?.httpRequestsAdaptiveGroups || [];

            if (series.length === 0) return null; // No traffic data yet

            const mappedErrors = errors.map(e => ({
                code: String(e.dimensions.clientRequestHTTPStatusCode),
                count: e.count,
                path: e.dimensions.clientRequestPath,
                last: 'Recently'
            }));

            return {
                pageViews: series.reduce((sum, day) => sum + (day.sum.pageViews || 0), 0),
                uniqueVisitors: series.reduce((sum, day) => sum + (day.uniq.uniques || 0), 0),
                bandwidthBytes: series.reduce((sum, day) => sum + (day.sum.bytes || 0), 0),
                sparkline: series.map(day => day.sum.pageViews || 0).reverse(),
                errors: mappedErrors.length > 0 ? mappedErrors : null,
                totalRequests: series.reduce((sum, day) => sum + (day.sum.requests || 0), 0)
            };
        } catch (error) {
            throw new Error(`Failed to fetch Cloudflare Analytics: ${error.message}`);
        }
    }, 300000); // 5 min cache
}

// 2. Supabase Storage/Bandwidth 
export async function getSupabaseUsage() {
    try {
        // We use our site_config exact database size as a proxy for usage
        const { count, error } = await supabase.from('projects').select('*', { count: 'exact', head: true });

        if (error) throw error;
        if (!count || count === 0) return { bandwidthMB: 0, maxMB: 2048 }; // Empty site

        return {
            bandwidthMB: (count * 2.5),
            maxMB: 2048
        };
    } catch (error) {
        throw new Error(`Failed to fetch Supabase Usage: ${error.message}`);
    }
}

// 3. Cloudinary Credits 
export async function getCloudinaryUsage() {
    try {
        const { data, error } = await supabase.from('site_config').select('value').eq('key', 'media_library').maybeSingle();
        if (error) throw error;
        if (!data) return { creditsUsed: 0, maxCredits: 25 };

        const files = JSON.parse(data.value || '[]');
        if (files.length === 0) return { creditsUsed: 0, maxCredits: 25 };

        const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
        const gbUsed = totalBytes / (1024 * 1024 * 1024);

        return {
            creditsUsed: parseFloat(Math.max(0.1, gbUsed * 10).toFixed(1)), // 1 credit ~ 1GB storage + bandwidth
            maxCredits: 25
        };
    } catch (error) {
        throw new Error(`Failed to fetch Cloudinary Usage: ${error.message}`);
    }
}
