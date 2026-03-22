/**
 * Generates a branded HTML email body for custom replies
 * @param {Object} emails - The emails object from site_config
 * @param {string} bodyText - The custom message body
 * @returns {string} Branded HTML
 */
export function generateBrandedEmailHtml(emails, bodyText) {
    const finalBody = (bodyText || '').replace(/\n/g, '<br>');
    const logoUrl = emails?.logo_url || '';
    const websiteLink = emails?.website_link || '';
    
    const logoHtml = logoUrl ? `<div style="text-align: center; margin-bottom: 24px;"><img src="${logoUrl}" alt="Logo" style="max-width: 150px; height: auto;"></div>` : '';
    const buttonHtml = websiteLink ? `
      <div style="text-align: center; margin-top: 32px;">
        <a href="${websiteLink.startsWith('http') ? websiteLink : 'https://' + websiteLink}" 
           style="background-color: #1a365d; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 800; display: inline-block;">
           Visit Our Website
        </a>
      </div>` : '';
  
    return `
      <div style="font-family: 'Inter', 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a202c; line-height: 1.6;">
        ${logoHtml}
        <div style="background: #ffffff; border: 1px solid #edf2f7; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="font-size: 16px; color: #4a5568;">${finalBody}</div>
          ${buttonHtml}
        </div>
        <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.05em;">
          &copy; ${new Date().getFullYear()} Antha Tech. All rights reserved.
        </div>
      </div>
    `;
}
