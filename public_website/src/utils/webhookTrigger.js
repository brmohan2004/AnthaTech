import supabase from '../config/supabaseClient';

/**
 * Triggers all active webhooks subscribed to a specific event.
 * @param {string} eventName The event ID (e.g., 'new_message', 'quotation_requested')
 * @param {object} payload The data to send to the webhook
 */
export async function triggerWebhooks(eventName, payload) {
    try {
        console.log(`[Webhook] Fetching hooks for event: ${eventName}`);
        
        // 1. Fetch active webhooks for this event
        const { data: hooks, error } = await supabase
            .from('webhooks')
            .select('id, url, secret, events')
            .eq('status', 'active');

        if (error) {
            console.error('[Webhook] Error fetching webhooks:', error);
            return;
        }

        // Filter hooks subscribed to this event manually for safety
        const activeHooks = hooks.filter(h => h.events && h.events.includes(eventName));
        
        if (!activeHooks || activeHooks.length === 0) {
            console.log('[Webhook] No active webhooks found for this event.');
            return;
        }

        console.log(`[Webhook] Triggering ${activeHooks.length} webhooks...`);

        // 2. Fire requests to each webhook
        const promises = activeHooks.map(async (h) => {
            try {
                let response;
                
                // TWILIO PRO LOGIC
                if (h.url.includes('api.twilio.com')) {
                    const sid = h.url.split('/Accounts/')[1].split('/')[0];
                    const auth = btoa(`${sid}:${h.secret}`);
                    
                    // Try to get recipient number from URL query, fallback to payload or hardcoded
                    const urlObj = new URL(h.url);
                    const recipient = urlObj.searchParams.get('to') || '+919962442165'; 

                    const msg = `🔔 *New ${eventName.replace('_', ' ')}!*
                    👤 Name: ${payload.name}
                    📞 Contact: ${payload.email}
                    📝 Info: ${payload.message}`.slice(0, 1600);

                    console.log(`[Webhook] Sending to Twilio: ${sid} -> ${recipient}`);

                    response = await fetch(h.url, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${auth}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            'From': 'whatsapp:+14155238886',
                            'To': `whatsapp:${recipient}`,
                            'Body': msg
                        })
                    });
                } 
                // CALLMEBOT / GET LOGIC
                else if (h.url.includes('whatsapp.php')) {
                    const msg = `New ${eventName}: ${payload.name} (${payload.email}) - ${payload.message}`.slice(0, 500);
                    const finalUrl = `${h.url}&text=${encodeURIComponent(msg)}`;
                    response = await fetch(finalUrl, { method: 'GET' });
                }
                // GENERIC POST / ZAPIER LOGIC
                else {
                    response = await fetch(h.url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: eventName,
                            secret: h.secret,
                            timestamp: new Date().toISOString(),
                            data: payload
                        }),
                    });
                }

                // Update the database with the result
                await supabase
                    .from('webhooks')
                    .update({ 
                        last_triggered_at: new Date().toISOString(),
                        last_result: response.ok ? 'ok' : 'error' 
                    })
                    .eq('id', h.id);

                console.log(`[Webhook] Success: ${h.url} -> ${response.status}`);
            } catch (err) {
                console.error(`[Webhook] Failed to trigger ${h.url}:`, err);
            }
        });

        await Promise.all(promises);

    } catch (err) {
        console.error('[Webhook] Fatal error:', err);
    }
}
