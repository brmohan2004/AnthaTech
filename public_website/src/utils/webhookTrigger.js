import supabase from '../config/supabaseClient';

/**
 * Triggers all active webhooks subscribed to a specific event.
 * @param {string} eventName The event ID (e.g., 'new_message', 'quotation_requested')
 * @param {object} payload The data to send to the webhook
 */
export async function triggerWebhooks(eventName, payload) {
    try {
        // 1. Fetch active webhooks for this event
        // Note: For this to work for public users, you MUST add a SELECT policy
        // to the 'webhooks' table for 'anon' role (public).
        const { data: hooks, error } = await supabase
            .from('webhooks')
            .select('url, secret')
            .eq('status', 'active')
            .contains('events', [eventName]);

        if (error) {
            console.error('Error fetching webhooks:', error);
            return;
        }

        if (!hooks || hooks.length === 0) return;

        console.log(`Triggering ${hooks.length} webhooks for event: ${eventName}`);

        // 2. Fire and forget requests to each webhook
        const promises = hooks.map(async (h) => {
            try {
                const response = await fetch(h.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Webhook-Event': eventName,
                        'X-Webhook-Secret': h.secret || '',
                    },
                    body: JSON.stringify({
                        event: eventName,
                        timestamp: new Date().toISOString(),
                        data: payload
                    }),
                });

                // We don't wait for response in production for better performance,
                // but we might want to log failures.
                if (!response.ok) {
                    console.warn(`Webhook ${h.url} returned status ${response.status}`);
                }
            } catch (err) {
                console.error(`Failed to trigger webhook ${h.url}:`, err);
            }
        });

        // Fire all requests in parallel without blocking the main UI too much
        Promise.all(promises).catch(e => console.error('Error in webhook promises:', e));

    } catch (err) {
        console.error('Fatal error in triggerWebhooks:', err);
    }
}
