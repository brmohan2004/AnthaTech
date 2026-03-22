export const sendBrevoEmail = async ({ to, subject, htmlContent }) => {
    const apiKey = import.meta.env.VITE_BREVO_API_KEY;

    if (!apiKey) {
        console.warn("Auto-Reply skipped: VITE_BREVO_API_KEY is missing in public_website/.env");
        return null;
    }

    const payload = {
        sender: { email: "info.anthatech@gmail.com", name: "Antha Tech" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
    };

    try {
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
    } catch (err) {
        console.error("Failed to send automated email via Brevo:", err);
        return null;
    }
};
