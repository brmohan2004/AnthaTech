import supabase from '../config/supabaseClient';
import { fetchSiteConfig } from '../api/content';

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
                
                // Extract mobile number from message to build button links
                let mobile = payload.mobile || '';
                if (!mobile && payload.message) {
                    const mMatch = typeof payload.message === 'string' && payload.message.match(/Mobile:\s*([+0-9\s()-]+)/);
                    if (mMatch) mobile = mMatch[1].replace(/[^0-9+]/g, '');
                }
                const pName = payload.name || payload.full_name || 'N/A';
                const pEmail = payload.email || 'N/A';
                const pMsg = payload.message || 'N/A';
                
                const waLink = mobile ? `https://wa.me/${mobile}` : 'https://wa.me/';
                const callLink = mobile ? `tel:${mobile}` : 'tel:';
                const emailLink = `mailto:${pEmail}`;
                const meetingLinkEmail = `mailto:${pEmail}?subject=Meeting%20Link&body=Hi%20${encodeURIComponent(pName)},%0A%0AHere%20is%20the%20link%20for%20our%20meeting:%20`;
                
                let linkText = '';
                if (eventName === 'quotation_requested' || eventName === 'new_application') {
                    linkText = `\n\n💬 Message: ${waLink}\n📞 Call: ${callLink}\n✉️ Email: ${emailLink}`;
                } else if (eventName === 'call_scheduled') {
                    linkText = `\n\n🔗 Send Meeting Link: ${meetingLinkEmail}\n📞 Call: ${callLink}\n💬 Message: ${waLink}\n✉️ Email: ${emailLink}`;
                }

                // TWILIO PRO LOGIC
                if (h.url.includes('api.twilio.com')) {
                    const sid = h.url.split('/Accounts/')[1].split('/')[0];
                    const auth = btoa(`${sid}:${h.secret}`);
                                       // 1. Determine recipient
                    const urlObj = new URL(h.url);
                    let recipient = urlObj.searchParams.get('to');
                    
                    if (!recipient) {
                        try {
                           const config = await fetchSiteConfig();
                           const contactStr = config.contact || '{}';
                           const contact = typeof contactStr === 'string' ? JSON.parse(contactStr) : contactStr;
                           recipient = contact.phone || '+919962442165';
                        } catch (e) {
                           console.warn('[Webhook] Failed to fetch fallback phone:', e);
                           recipient = '+919962442165';
                        }
                    }

                    // 2. Determine Sender (Twilio Sandbox default or custom)
                    const sender = urlObj.searchParams.get('from') || 'whatsapp:+14155238886';

                    recipient = recipient.replace(/\s+/g, '+'); 
                    if (!recipient.startsWith('+')) recipient = '+' + recipient;

                    const msg = `🔔 *New ${eventName.replace('_', ' ')}!*\n👤 Name: ${pName}\n📧 Email: ${pEmail}\n📝 Info: ${pMsg}${linkText}`.slice(0, 1600);

                    console.log(`[Webhook] Sending to Twilio: ${sid} -> ${recipient} (From: ${sender})`);

                    // Use a proxy because Twilio API blocks CORS from browsers
                    const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(h.url.split('?')[0]);

                    response = await fetch(proxyUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${auth}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            'From': sender.startsWith('whatsapp:') ? sender : `whatsapp:${sender}`,
                            'To': `whatsapp:${recipient}`,
                            'Body': msg
                        })
                    });
                } 
                // CALLMEBOT / GET LOGIC
                else if (h.url.includes('whatsapp.php')) {
                    const msg = `New ${eventName}: ${pName} (${pEmail}) - ${pMsg}${linkText}`.slice(0, 4000);
                    const finalUrl = `${h.url}&text=${encodeURIComponent(msg)}`;
                    response = await fetch(finalUrl, { method: 'GET' });
                }
                // TELEGRAM LOGIC (100% Free & Unlimited)
                else if (h.url.includes('api.telegram.org')) {
                    const text = `🚀 *New ${eventName.replace('_', ' ')}!*\n👤 *Name:* ${pName}\n📧 *Email:* ${pEmail}\n📝 *Info:* ${pMsg}`.slice(0, 4000);
                    
                    let inlineKeyboard = [];
                    if (eventName === 'quotation_requested' || eventName === 'new_application') {
                        inlineKeyboard = [[
                            { text: '💬 WhatsApp', url: waLink }
                        ]];
                    } else if (eventName === 'call_scheduled') {
                        inlineKeyboard = [[
                            { text: '🔗 Send Meet Link', url: `https://mail.google.com/mail/?view=cm&fs=1&to=${pEmail}&su=Meeting+Link` },
                            { text: '💬 WhatsApp', url: waLink }
                        ]];
                    }

                    let finalUrl = `${h.url}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
                    if (inlineKeyboard.length > 0) {
                        finalUrl += `&reply_markup=${encodeURIComponent(JSON.stringify({ inline_keyboard: inlineKeyboard }))}`;
                    }
                    
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

                if (!response.ok) {
                    console.error(`[Webhook] Fetch failed with status: ${response.status}`);
                    const text = await response.text();
                    console.error(`[Webhook] Fetch response: ${text.slice(0, 100)}`);
                }

                // Update the database with the result
                const { error: updateError } = await supabase
                    .from('webhooks')
                    .update({ 
                        last_triggered_at: new Date().toISOString(),
                        last_result: response.ok ? 'ok' : 'error' 
                    })
                    .eq('id', h.id);

                if (updateError) {
                    console.error(`[Webhook] Supabase update failed (RLS blocked?):`, updateError);
                } else if (response.ok) {
                    console.log(`[Webhook] Success: ${h.url} -> ${response.status}`);
                }
            } catch (err) {
                console.error(`[Webhook] Failed to trigger (Network error?):`, err);
            }
        });

        await Promise.all(promises);

    } catch (err) {
        console.error('[Webhook] Fatal error:', err);
    }
}
