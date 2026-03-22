import supabase from '../config/supabaseClient';
import { triggerWebhooks } from '../utils/webhookTrigger';

// ─── Caching Logic ───────────────────────────────────────────
const CACHE_TTL = 30 * 1000; // 30 seconds cache (reduced for testing)
const cache = new Map();

/**
 * Executes a function with caching logic.
 * @param {string} key Unique key for the cache entry
 * @param {Function} fetchFn The async function to call if cache is miss
 */
async function withCache(key, fetchFn) {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, { data, timestamp: now });
  return data;
}

export function clearCommunityCache() {
  cache.delete('community_teaser');
  cache.delete('community_how_it_works');
  cache.delete('community_perks');
  cache.delete('community_all');
}

// ─── Throttling Logic ────────────────────────────────────────
const SUBMISSION_COOLDOWN = 60 * 1000; // 1 minute cooldown
let lastSubmissionTime = 0;

function checkThrottling() {
  const now = Date.now();
  if (now - lastSubmissionTime < SUBMISSION_COOLDOWN) {
    const remaining = Math.ceil((SUBMISSION_COOLDOWN - (now - lastSubmissionTime)) / 1000);
    throw new Error(`Please wait ${remaining} seconds before submitting again.`);
  }
}

function updateSubmissionTime() {
  lastSubmissionTime = Date.now();
}


// ─── Mapping helpers ─────────────────────────────────────────
// DB column names match admin panel writes. These mappers
// translate to the names the public website components expect.

/**
 * Generates a branded CORPORATE HTML email body for auto-responders
 */
function generateAutoReplyHtml(siteConfig, recipientName, rawBodyText) {
  const emails = typeof siteConfig.emails === 'string' ? JSON.parse(siteConfig.emails) : (siteConfig.emails || {});
  const social = typeof siteConfig.social === 'string' ? JSON.parse(siteConfig.social) : (siteConfig.social || {});
  
  const finalBody = (rawBodyText || '').replace(/{name}/g, recipientName).replace(/\n/g, '<br>');
  const logoUrl = emails.logo_url || '';
  const websiteLink = emails.website_link || '';
  
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

function mapHero(d) {
  if (!d) return null;
  return {
    badge_text: d.badge || '',
    title_line_1: d.title1 || '',
    title_line_2: d.title2 || '',
    subtitle_1: d.subtitle1 || '',
    subtitle_2: d.subtitle2 || '',
    cta_primary_text: d.primary_cta_text || '',
    cta_primary_route: d.primary_cta_link || '/',
    cta_secondary_text: d.secondary_cta_text || '',
    client_logos: Array.isArray(d.logos) ? d.logos.map(l => (typeof l === 'object' && l !== null) ? l.url : l) : [],
  };
}

function mapProject(p) {
  if (!p) return null;
  const gallery_urls = Array.isArray(p.gallery) 
    ? p.gallery
        .map(img => (typeof img === 'object' && img !== null) ? img.url : img)
        .filter(url => url !== (p.image || '')) 
    : [];

  return {
    ...p,
    category_pill: p.category || '',
    cover_image_url: p.image || '',
    gallery_urls,
    preview_link: p.preview_link || '',
    review_quote: p.review?.quote || '',
    review_author: p.review?.author || '',
    review_role: p.review?.role || '',
    review_company: p.review?.company || '',
    mobile_image_url: p.mobile_image || '',
    tab_image_url: p.tab_image || '',
    desktop_image_url: p.desktop_image || gallery_urls[0] || '',
  };
}

function mapService(s) {
  if (!s) return null;
  return {
    ...s,
    title: s.name || '',
    short_description: s.description || '',
    graphic_url: s.graphic || '',
    process_steps: Array.isArray(s.process) ? s.process : [],
    offers: Array.isArray(s.offers) ? s.offers : [],
    benefits: Array.isArray(s.benefits) ? s.benefits : [],
  };
}

function mapReview(r) {
  if (!r) return null;
  return {
    ...r,
    author_name: r.author || '',
    author_role: r.role || '',
    avatar_url: r.avatar || null,
  };
}

function mapBlogPost(b) {
  if (!b) return null;
  return {
    ...b,
    short_description: b.short_desc || '',
    cover_image_url: b.cover || '',
  };
}

function mapCommunityRow(d) {
  if (!d) return null;
  // content can be an array (how_it_works, perks stored as array directly)
  // or an object (teaser stored as { title1, title2, ... })
  const c = Array.isArray(d.content) ? {} : (d.content || {});
  const contentArray = Array.isArray(d.content) ? d.content : null;
  return {
    ...d,
    title_1: c.title1 || '',
    title_2: c.title2 || '',
    description: c.description || '',
    cta_text: c.ctaText || '',
    stats: Array.isArray(c.stats) ? c.stats : [],
    tracks: Array.isArray(c.tracks) ? c.tracks : [],
    // how_it_works: admin stores as array [{id, title, desc}], or legacy {steps:[]}
    steps: contentArray || (Array.isArray(c.steps) ? c.steps : []),
    // perks: admin stores as array [{id, title, desc, icon}], or legacy {perks:[]}
    perks: contentArray || (Array.isArray(c.perks) ? c.perks : []),
  };
}

// ─── Hero Content ────────────────────────────────────────────
export async function fetchHeroContent() {
  return withCache('hero_content', async () => {
    const { data, error } = await supabase.from('hero_content').select('*').single();
    if (error) {
      console.error('Error fetching hero content:', error);
      throw new Error(`Failed to load hero section: ${error.message}`);
    }
    return mapHero(data);
  });
}


// ─── About Content ───────────────────────────────────────────
export async function fetchAboutContent(section) {
  return withCache(`about_content_${section}`, async () => {
    const { data, error } = await supabase.from('about_content').select('*').eq('section', section).maybeSingle();
    if (error) {
      console.error(`Error fetching about content (${section}):`, error);
      throw new Error(`Failed to load ${section} section: ${error.message}`);
    }
    if (!data) return null;

    const c = data.content || {};
    if (section === 'about1') {
      return {
        logo_url: c.logoUrl || null,
        btn_primary: c.button1Text || 'Get in Touch',
        btn_secondary: c.button2Text || 'More about us',
        paragraph_1: c.paragraph1 || [],
        paragraph_2: c.paragraph2 || []
      };
    }
    if (section === 'hero') {
      return {
        badge_text: c.badge || 'About us',
        title_1: c.title1 || 'We are',
        title_2: c.title2 || 'coder',
        description: c.description || 'We Design, Build, and Deliver.'
      };
    }
    return {
      badge_text: c.badge || '',
      title_1: c.title1 || '',
      title_2: c.title2 || '',
      description: c.description || '',
      stats: Array.isArray(c.stats) ? c.stats : []
    };
  });
}


// ─── Projects ────────────────────────────────────────────────
export async function fetchProjects() {
  return withCache('projects_list', async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .order('display_order');
    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error(`Failed to load projects: ${error.message}`);
    }
    return (data || []).map(mapProject);
  });
}


export async function fetchProjectBySlug(slug) {
  const trimmedSlug = (slug || '').trim();
  return withCache(`project_${trimmedSlug}`, async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .ilike('slug', `%${trimmedSlug}%`)
      .eq('status', 'published')
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error(`Error fetching project (${slug}):`, error);
      throw new Error(`Failed to load project details: ${error.message}`);
    }
    if (!data) throw new Error('Project not found');
    return mapProject(data);
  });
}


// ─── Services ────────────────────────────────────────────────
export async function fetchServices() {
  return withCache('services_list', async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order');
    if (error) {
      console.error('Error fetching services:', error);
      throw new Error(`Failed to load services: ${error.message}`);
    }
    return (data || []).map(mapService);
  });
}


export async function fetchServiceBySlug(slug) {
  return withCache(`service_${slug}`, async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) {
      console.error(`Error fetching service (${slug}):`, error);
      throw new Error(`Failed to load service details: ${error.message}`);
    }
    if (!data) throw new Error('Service not found');
    return mapService(data);
  });
}


// ─── Highlights ──────────────────────────────────────────────
export async function fetchHighlightsContent() {
  const { data, error } = await supabase.from('highlights_content').select('*').maybeSingle();
  if (error) {
    console.error('Error fetching highlights:', error);
    throw new Error(`Failed to load highlights: ${error.message}`);
  }
  if (!data) return null;
  return { ...data, header_rich_text: data.header };
}

// ─── Process Steps ───────────────────────────────────────────
export async function fetchProcessSteps() {
  const { data, error } = await supabase.from('process_steps').select('*').maybeSingle();
  if (error) {
    console.error('Error fetching process steps:', error);
    throw new Error(`Failed to load process steps: ${error.message}`);
  }
  if (!data) return null;
  return { ...data, badge_text: data.badge, title_1: data.title1, title_2: data.title2 };
}

// ─── Reviews ─────────────────────────────────────────────────
export async function fetchReviews() {
  return withCache('reviews_list', async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'active')
      .order('display_order');
    if (error) {
      console.error('Error fetching reviews:', error);
      throw new Error(`Failed to load reviews: ${error.message}`);
    }
    return (data || []).map(mapReview);
  });
}


// ─── Community Content ───────────────────────────────────────
export async function fetchCommunityContent(section) {
  const key = section ? `community_${section}` : 'community_all';
  return withCache(key, async () => {
    if (section) {
      const { data, error } = await supabase.from('community_content').select('*').eq('section', section).maybeSingle();
      if (error) {
        console.error(`Error fetching community content (${section}):`, error);
        throw new Error(`Failed to load community content: ${error.message}`);
      }
      return data ? mapCommunityRow(data) : null;
    }
    const { data, error } = await supabase.from('community_content').select('*').order('section');
    if (error) {
      console.error('Error fetching all community content:', error);
      throw new Error(`Failed to load community sections: ${error.message}`);
    }
    return (data || []).map(mapCommunityRow);
  });
}


// ─── Community Application (Public Submit) ───────────────────
export async function submitCommunityApplication(application) {
  checkThrottling();
  const { error } = await supabase.from('community_applications').insert(application);
  if (error) {
    console.error('Error submitting community application:', error);
    throw new Error(`Submission failed: ${error.message}`);
  }
  updateSubmissionTime();
  
  // Trigger webhook notifications
  triggerWebhooks('new_application', {
    full_name: application.full_name,
    email: application.email,
    track: application.track,
    message: application.message
  });

  // Auto-Responder Email
  try {
    const config = await fetchSiteConfig();
    const emailsStr = config.emails || '{}';
    const emailTpl = typeof emailsStr === 'string' ? JSON.parse(emailsStr) : emailsStr;
    const { sendBrevoEmail } = await import('./brevo');

    if (emailTpl.application_subject && emailTpl.application_body) {
      const htmlContent = generateAutoReplyHtml(config, application.full_name, emailTpl.application_body);
      await sendBrevoEmail({ to: application.email, subject: emailTpl.application_subject, htmlContent });
    }
  } catch (err) {
    console.error('AutoResponder Failed:', err);
  }

  return true;
}


// ─── Blog Posts ──────────────────────────────────────────────
export async function fetchBlogPosts() {
  return withCache('blog_posts_list', async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching blog posts:', error);
      throw new Error(`Failed to load blog posts: ${error.message}`);
    }
    return (data || []).map(mapBlogPost);
  });
}


export async function fetchBlogPostBySlug(slug) {
  return withCache(`blog_post_${slug}`, async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) {
      console.error(`Error fetching blog post (${slug}):`, error);
      throw new Error(`Failed to load blog post: ${error.message}`);
    }
    if (!data) throw new Error('Blog post not found');
    return mapBlogPost(data);
  });
}


// ─── Contact Form (Public Submit) ────────────────────────────
export async function submitContactMessage(message) {
  checkThrottling();
  const { error } = await supabase.from('contact_messages').insert({
    sender_name: message.name,
    sender_email: message.email,
    message: message.message,
  });
  if (error) {
    console.error('Error submitting contact message:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }

  try {
    const isQuote = message.message && message.message.startsWith('Quote Request');
    const isBooking = message.message && message.message.startsWith('Booking Request');
    const typeLabel = isQuote ? 'Quote' : isBooking ? 'Booking' : 'Message';

    await supabase.from('notifications').insert({
      type: 'message',
      title: `New ${typeLabel} from ${message.name}`,
      is_read: false
    });
  } catch (err) {
    console.error('Failed to create notification', err);
  }

  updateSubmissionTime();

  // Trigger webhook notifications
  const isQuote = message.message && message.message.startsWith('Quote Request');
  const isBooking = message.message && message.message.startsWith('Booking Request');
  const eventName = isQuote ? 'quotation_requested' : isBooking ? 'call_scheduled' : 'new_message';

  triggerWebhooks(eventName, {
    name: message.name,
    email: message.email,
    message: message.message,
    type: isQuote ? 'quote' : isBooking ? 'booking' : 'general'
  });

  // Auto-Responder Email
  try {
    const config = await fetchSiteConfig();
    const emailsStr = config.emails || '{}';
    const emailTpl = typeof emailsStr === 'string' ? JSON.parse(emailsStr) : emailsStr;
    const { sendBrevoEmail } = await import('./brevo');

    let tSubject = '';
    let tBody = '';

    if (isQuote) {
      tSubject = emailTpl.quotation_subject;
      tBody = emailTpl.quotation_body;
    } else if (isBooking) {
      tSubject = emailTpl.meeting_subject;
      tBody = emailTpl.meeting_body;
    }

    if (tSubject && tBody) {
        const htmlContent = generateAutoReplyHtml(config, message.name, tBody);
        await sendBrevoEmail({ to: message.email, subject: tSubject, htmlContent });
    }
  } catch (err) {
    console.error('AutoResponder Failed:', err);
  }

  return true;
}


// ─── Page Heroes ─────────────────────────────────────────────
export async function fetchPageHero(page) {
  return withCache(`page_hero_${page}`, async () => {
    // First, try a dedicated page_heroes table
    const { data: tableData, error: tableError } = await supabase
      .from('page_heroes')
      .select('*')
      .eq('page_name', page)
      .maybeSingle();

    if (tableData) {
      return {
        badge_text: tableData.badge || '',
        title_1: tableData.title1 || '',
        title_2: tableData.title2 || '',
        description: tableData.description || '',
        cta_label: tableData.cta_label || ''
      };
    }

    // Fallback constants if no DB entry exists
    const fallbacks = {
      projects: {
        badge_text: 'Our Projects',
        title_1: 'Latest Projects',
        title_2: 'solutions',
        description: "Every project is a journey. From the first spark of an idea to a brand identity that resonates across digital and physical spaces."
      },
      insights: {
        badge_text: 'Blogs',
        title_1: 'Insights',
        title_2: 'solutions',
        description: 'Explore the ever-evolving digital landscape with insights on design, development, and business strategies.'
      }
    };

    if (fallbacks[page]) {
      return fallbacks[page];
    }

    // If tableError is not "table not found" (PGRST205), log it
    if (tableError && tableError.code !== 'PGRST205') {
      console.error(`Error checking page_heroes for ${page}:`, tableError);
    }

    // Fallback to site_config
    const { data: configData, error: configError } = await supabase
      .from('site_config')
      .select('key, value')
      .or(`key.eq.${page}_hero_title,key.eq.${page}_hero_subtitle,key.eq.${page}_hero_badge`);

    if (configData && configData.length > 0) {
      const config = configData.reduce((acc, row) => { acc[row.key] = row.value; return acc; }, {});
      return {
        badge_text: config[`${page}_hero_badge`] || '',
        title_1: config[`${page}_hero_title`] || '',
        title_2: '',
        description: config[`${page}_hero_subtitle`] || ''
      };
    }

    if (configError) {
      console.error(`Error checking site_config for ${page} hero:`, configError);
    }

    return null;
  });
}


// ─── Country Settings ─────────────────────────────────────────────
export async function fetchCountrySettings() {
  const { data, error } = await supabase
    .from('country_settings')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) {
    console.error('Error fetching country settings:', error);
    return [];
  }
  return data;
}


// ─── Site Config ─────────────────────────────────────────────
export async function fetchSiteConfig() {
  return withCache('site_config_all', async () => {
    const { data, error } = await supabase.from('site_config').select('key, value');
    if (error) {
      console.error('Error fetching site config:', error);
      throw new Error(`Failed to load site configuration: ${error.message}`);
    }
    return (data || []).reduce((acc, row) => { acc[row.key] = row.value; return acc; }, {});
  });
}


// ─── Legal Pages ─────────────────────────────────────────────
export async function fetchLegalPage(slug) {
  return withCache(`legal_${slug}`, async () => {
    const { data, error } = await supabase
      .from('legal_pages')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      console.error(`Error fetching legal page (${slug}):`, error);
      throw new Error(`Failed to load page: ${error.message}`);
    }
    return data || null;
  });
}


