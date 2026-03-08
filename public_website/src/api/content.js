import supabase from '../config/supabaseClient';

// ─── Caching Logic ───────────────────────────────────────────
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
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

// ─── Mapping helpers ─────────────────────────────────────────
// DB column names match admin panel writes. These mappers
// translate to the names the public website components expect.

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
  return {
    ...p,
    category_pill: p.category || '',
    cover_image_url: p.image || '',
    gallery_urls: Array.isArray(p.gallery) ? p.gallery : [],
    review_quote: p.review?.quote || '',
    review_author: p.review?.author || '',
    review_role: p.review?.role || '',
    review_company: p.review?.company || '',
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
  return withCache(`project_${slug}`, async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
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
  updateSubmissionTime();
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

