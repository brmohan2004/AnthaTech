/**
 * Generates a branded CORPORATE HTML email body for custom replies
 * @param {Object} siteConfig - The full site configuration
 * @param {string} bodyText - The custom message body
 * @returns {string} Premium Corporate HTML
 */
/**
 * Generates a branded CORPORATE HTML email body for custom replies
 * @param {Object} siteConfig - The full site configuration
 * @param {string} bodyText - The custom message body
 * @returns {string} Natural Corporate HTML
 */
export function generateBrandedEmailHtml(siteConfig, bodyText) {
    const emails = siteConfig?.emails ? (typeof siteConfig.emails === 'string' ? JSON.parse(siteConfig.emails) : siteConfig.emails) : {};
    const social = siteConfig?.social ? (typeof siteConfig.social === 'string' ? JSON.parse(siteConfig.social) : siteConfig.social) : {};
    
    const finalBody = (bodyText || '').replace(/\n/g, '<br>');
    const logoUrl = emails?.logo_url || '';
    const websiteLink = emails?.website_link || '';
    
    const logoHtml = logoUrl ? `<img src="${logoUrl}" alt="Antha Tech" style="max-width: 120px; height: auto; display: block; margin-bottom: 40px;">` : '<h2 style="margin:0 0 40px 0; color:#1a365d;">Antha Tech</h2>';
    
    const buttonHtml = websiteLink ? `
      <div style="margin-top: 40px; text-align: left;">
        <a href="${websiteLink.startsWith('http') ? websiteLink : 'https://' + websiteLink}" 
           style="background-color: #1a365d; color: #ffffff; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; letter-spacing: 0.5px;">
           Visit Official Website
        </a>
      </div>` : '';

    const getPlatformIcon = (p) => {
        const icons = {
            linkedin: 'https://cdn-icons-png.flaticon.com/32/145/145807.png',
            instagram: 'https://cdn-icons-png.flaticon.com/32/2111/2111463.png',
            twitter: 'https://cdn-icons-png.flaticon.com/32/733/733579.png',
            facebook: 'https://cdn-icons-png.flaticon.com/32/124/124010.png',
            youtube: 'https://cdn-icons-png.flaticon.com/32/1384/1384060.png',
            behance: 'https://cdn-icons-png.flaticon.com/32/145/145799.png',
            github: 'https://cdn-icons-png.flaticon.com/32/733/733553.png'
        };
        return icons[p] || '';
    };

    const activeSocials = ['linkedin', 'instagram', 'twitter', 'behance', 'github', 'facebook', 'youtube']
        .filter(p => social[p])
        .map(p => ({
            url: social[p],
            slogan: social[`${p}_slogan`] || `Follow us on ${p.charAt(0).toUpperCase() + p.slice(1)}`
        }));

    const socialHtml = activeSocials.length > 0 ? `
        <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #edf2f7;">
            <p style="margin: 0 0 20px 0; font-size: 12px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 1px;">Connect With Us</p>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${activeSocials.map(s => {
                    const platform = ['linkedin', 'instagram', 'twitter', 'behance', 'github', 'facebook', 'youtube'].find(p => s.url.includes(p)) || 'linkedin';
                    const iconUrl = getPlatformIcon(platform);
                    return `
                    <tr>
                        <td style="padding-bottom: 12px; vertical-align: middle;">
                            <a href="${s.url}" style="text-decoration: none; display: block;">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="width: 24px; padding-right: 12px; vertical-align: middle;">
                                            <img src="${iconUrl}" width="16" height="16" alt="${platform}" style="display: block; border: 0;">
                                        </td>
                                        <td style="vertical-align: middle;">
                                            <span style="font-size: 13px; color: #4a5568; font-weight: 500; font-family: 'Inter', sans-serif;">${s.slogan}</span>
                                        </td>
                                    </tr>
                                </table>
                            </a>
                        </td>
                    </tr>
                `}).join('')}
            </table>
        </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 40px 20px;">
          <tr>
            <td align="left">
              <div style="max-width: 600px; margin: 0 auto; text-align: left;">
                <!-- Header -->
                ${logoHtml}

                <!-- Content -->
                <div style="font-size: 16px; line-height: 1.6; color: #2d3748; margin-bottom: 30px;">
                  ${finalBody}
                </div>
                
                ${buttonHtml}
                
                <!-- Social & Footer -->
                ${socialHtml}

                <div style="margin-top: 50px; text-align: left;">
                  <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                    &copy; ${new Date().getFullYear()} Antha Tech. Professional Digital Solutions.
                  </p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
}
