import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({ config }) => {
    const location = useLocation();
    const { seo, seo_schema, seo_redirects } = config || {};

    const currentPath = location.pathname;

    // --- Redirect Logic ---
    if (seo_redirects && Array.isArray(seo_redirects.rules)) {
        const rule = seo_redirects.rules.find(r => r.from === currentPath && r.status === 'Active');
        if (rule && rule.to) {
            window.location.replace(rule.to);
            return null; // Stop rendering if redirecting
        }
    }

    if (!seo) {
        console.warn('SEO config missing, using defaults.');
        return (
            <Helmet>
                <title>ANTHA Tech — Digital Agency</title>
                <meta name="description" content="Transforming ideas into digital reality." />
            </Helmet>
        );
    }

    // --- Page Match Logic ---
    const pageMeta = seo.perPage?.find(p => {
        const pageName = (p.page || '').toLowerCase().trim();
        const routePath = currentPath.toLowerCase().trim();
        
        if (pageName === routePath) return true;
        if (pageName === 'home' && routePath === '/') return true;
        if (pageName !== '' && pageName !== '/' && routePath.startsWith(pageName)) return true;
        
        return false;
    });

    const title = pageMeta?.title || seo.defaultTitle || seo.siteName;
    const description = pageMeta?.desc || seo.defaultDesc;
    const ogImage = pageMeta?.ogImage || seo.ogImage;
    const siteName = seo.siteName;
    const robotsMeta = pageMeta?.robotsMeta || seo.robotsMeta || 'index, follow';
    const canonicalUrl = pageMeta?.canonicalUrl || (seo.canonicalBase ? `${seo.canonicalBase.replace(/\/$/, '')}${currentPath}` : '');

    // --- Schema Generation ---
    const generatedSchema = useMemo(() => {
        if (!seo_schema) return null;
        const s = seo_schema;
        if (s.customJson) {
            try { JSON.parse(s.customJson); return s.customJson; } catch { return null; }
        }
        const base = {
            organization: {
                "@context": "https://schema.org", "@type": "Organization",
                "name": s.orgName || siteName || '', "url": s.orgUrl || '',
                "logo": s.orgLogo || '', "description": s.orgDesc || seo.defaultDesc || '',
                "foundingDate": s.orgFoundingDate || '',
                "contactPoint": { "@type": "ContactPoint", "telephone": s.orgPhone || '', "contactType": "customer service", "email": s.orgEmail || '' },
                "address": { "@type": "PostalAddress", "streetAddress": s.orgAddress || '', "addressLocality": s.orgCity || '', "addressRegion": s.orgRegion || '', "postalCode": s.orgPostalCode || '', "addressCountry": s.orgCountry || '' },
                "sameAs": s.socialUrls ? s.socialUrls.split(',').map(u => u.trim()).filter(Boolean) : []
            },
            localBusiness: {
                "@context": "https://schema.org", "@type": "ProfessionalService",
                "name": s.orgName || siteName || '', "url": s.orgUrl || '', "telephone": s.orgPhone || '',
                "description": s.orgDesc || seo.defaultDesc || '',
                "address": { "@type": "PostalAddress", "streetAddress": s.orgAddress || '', "addressLocality": s.orgCity || '', "addressRegion": s.orgRegion || '', "addressCountry": s.orgCountry || '' },
                "areaServed": { "@type": "City", "name": s.orgCity || 'Chennai' }
            },
            website: { "@context": "https://schema.org", "@type": "WebSite", "name": s.orgName || siteName || '', "url": s.orgUrl || '' },
            service: { "@context": "https://schema.org", "@type": "Service", "provider": { "@type": "Organization", "name": s.orgName || siteName || '' }, "areaServed": { "@type": "City", "name": s.orgCity || 'Chennai' } },
            faqPage: { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [] },
            breadcrumb: { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": s.orgUrl || '' }] },
            article: { "@context": "https://schema.org", "@type": "BlogPosting", "headline": "", "author": { "@type": "Person", "name": seo.author || '' }, "publisher": { "@type": "Organization", "name": s.orgName || siteName || '' } },
            review: { "@context": "https://schema.org", "@type": "Review", "itemReviewed": { "@type": "Organization", "name": s.orgName || siteName || '' } },
        };
        return JSON.stringify(base[s.activeType] || base.organization);
    }, [seo_schema, siteName, seo.defaultDesc, seo.author]);

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="robots" content={robotsMeta} />
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            
            {/* Open Graph */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            {ogImage && <meta property="og:image" content={ogImage} />}
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}

            {/* Structured Schema JSON-LD */}
            {generatedSchema && (
                <script type="application/ld+json">
                    {generatedSchema}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
