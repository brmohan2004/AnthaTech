export const sendBrevoEmail = async ({ to, subject, htmlContent, attachments = [] }) => {
    // We use the VITE_ prefixed key to ensure it's available in the browser build.
    // If it's missing, we fall back to checking if the prefix was forgotten.
    const apiKey = import.meta.env.VITE_BREVO_API_KEY || import.meta.env.BREVO_API_KEY;

    if (!apiKey) {
        throw new Error("Brevo API key is missing. Please add VITE_BREVO_API_KEY to your .env file.");
    }

    const payload = {
        sender: { email: "info.anthatech@gmail.com", name: "Antha Tech" }, // Keep your verified sender email here
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
    };

    if (attachments && attachments.length > 0) {
        payload.attachment = attachments.map(att => ({
            name: att.name,
            content: att.base64Content // Brevo expects the base64 string directly
        }));
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Email failed: ${errorData.message}`);
    }

    return await response.json();
};
