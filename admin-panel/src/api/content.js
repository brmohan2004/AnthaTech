import supabase from '../config/supabaseClient';
import { withCache, invalidateLocalCache } from './cacheManager';

// ─── Hero Content ────────────────────────────────────────────
export async function getHeroContent() {
  const { data, error } = await supabase.from('hero_content').select('*').single();
  if (error) throw error;
  return data;
}

export async function updateHeroContent(updates) {
  const { data: rows } = await supabase.from('hero_content').select('id').limit(1);
  const id = rows?.[0]?.id;
  if (!id) throw new Error('No hero_content row found');
  const { data, error } = await supabase.from('hero_content').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ─── About Content ───────────────────────────────────────────
export async function getAboutContent(section) {
  const { data, error } = await supabase.from('about_content').select('*').eq('section', section).single();
  if (error) throw error;
  return data;
}

export async function updateAboutContent(section, updates) {
  const { data, error } = await supabase.from('about_content').update(updates).eq('section', section).select().single();
  if (error) throw error;
  return data;
}

// ─── Projects ────────────────────────────────────────────────
export async function getProjects() {
  const { data, error } = await supabase.from('projects').select('*').order('display_order');
  if (error) throw error;
  return data.map(p => ({
    ...p,
    heroDescription: p.hero_description,
    publishAt: p.publish_at,
    coverImage: p.image,
    relatedProjects: p.related_projects || [],
    previewLink: p.preview_link,
    status: p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : 'Draft',
  }));
}

export async function getProjectBySlug(slug) {
  const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).single();
  if (error) throw error;
  return data;
}

export async function createProject(project) {
  const p = { ...project };
  if (p.status) p.status = p.status.toLowerCase();
  const { data, error } = await supabase.from('projects').insert(p).select().single();
  if (error) throw error;
  return data;
}

export async function updateProject(id, updates) {
  const u = { ...updates };
  if (u.status) u.status = u.status.toLowerCase();
  const { data, error } = await supabase.from('projects').update(u).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

// ─── Services ────────────────────────────────────────────────
export async function getServices() {
  const { data, error } = await supabase.from('services').select('*').order('display_order');
  if (error) throw error;
  return data.map(s => ({
    ...s,
    status: s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : 'Draft',
    heroBgColor: s.hero_bg_color,
  }));
}

export async function getServiceBySlug(slug) {
  const { data, error } = await supabase.from('services').select('*').eq('slug', slug).single();
  if (error) throw error;
  return data;
}

export async function createService(service) {
  const s = { ...service };
  if (s.status) s.status = s.status.toLowerCase();
  const { data, error } = await supabase.from('services').insert(s).select().single();
  if (error) throw error;
  return data;
}

export async function updateService(id, updates) {
  const u = { ...updates };
  if (u.status) u.status = u.status.toLowerCase();
  const { data, error } = await supabase.from('services').update(u).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteService(id) {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

// ─── Highlights Content ──────────────────────────────────────
export async function getHighlightsContent() {
  const { data, error } = await supabase.from('highlights_content').select('*').single();
  if (error) throw error;
  return data;
}

export async function updateHighlightsContent(updates) {
  const { data: rows } = await supabase.from('highlights_content').select('id').limit(1);
  const id = rows?.[0]?.id;
  if (!id) throw new Error('No highlights_content row found');
  const { data, error } = await supabase.from('highlights_content').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ─── Process Steps ───────────────────────────────────────────
export async function getProcessSteps() {
  const { data, error } = await supabase.from('process_steps').select('*').single();
  if (error) throw error;
  return data;
}

export async function updateProcessSteps(updates) {
  const { data: rows } = await supabase.from('process_steps').select('id').limit(1);
  const id = rows?.[0]?.id;
  if (!id) throw new Error('No process_steps row found');
  const { data, error } = await supabase.from('process_steps').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ─── Reviews ─────────────────────────────────────────────────
export async function getReviews() {
  const { data, error } = await supabase.from('reviews').select('*').order('display_order');
  if (error) throw error;
  return data;
}

export async function createReview(review) {
  const r = { ...review };
  if (r.status) r.status = r.status.toLowerCase();
  const { data, error } = await supabase.from('reviews').insert(r).select().single();
  if (error) throw error;
  return data;
}

export async function updateReview(id, updates) {
  const u = { ...updates };
  if (u.status) u.status = u.status.toLowerCase();
  const { data, error } = await supabase.from('reviews').update(u).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteReview(id) {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

// ─── Community Content ───────────────────────────────────────
export async function getCommunityContent(section) {
  if (section) {
    const { data, error } = await supabase.from('community_content').select('*').eq('section', section).maybeSingle();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('community_content').select('*').order('section');
  if (error) throw error;
  return data;
}

export async function updateCommunityContent(section, updates) {
  const { data, error } = await supabase
    .from('community_content')
    .update(updates)
    .eq('section', section)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Community Applications ──────────────────────────────────
export async function getCommunityApplications(statusFilter) {
  let query = supabase.from('community_applications').select('*').order('applied_at', { ascending: false });
  if (statusFilter) query = query.eq('status', statusFilter.toLowerCase());
  const { data, error } = await query;
  if (error) throw error;
  return data.map(m => ({
    ...m,
    name: m.full_name,
    status: m.status ? m.status.charAt(0).toUpperCase() + m.status.slice(1) : 'Pending'
  }));
}

export async function updateApplicationStatus(id, status) {
  const { data, error } = await supabase.from('community_applications').update({ status: status.toLowerCase() }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCommunityApplication(id) {
  const { error } = await supabase.from('community_applications').delete().eq('id', id);
  if (error) throw error;
}

// ─── Blog Posts ──────────────────────────────────────────────
export async function getBlogPosts() {
  const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(p => ({
    ...p,
    shortDesc: p.short_desc,
    date: p.date_label,
    coverImage: p.cover,
    publishAt: p.publish_at,
    status: p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : 'Draft',
  }));
}

export async function getBlogPostBySlug(slug) {
  const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
  if (error) throw error;
  return data;
}

export async function createBlogPost(post) {
  const p = { ...post };
  if (p.status) p.status = p.status.toLowerCase();
  const { data, error } = await supabase.from('blog_posts').insert(p).select().single();
  if (error) throw error;
  return data;
}

export async function updateBlogPost(id, updates) {
  const u = { ...updates };
  if (u.status) u.status = u.status.toLowerCase();
  const { data, error } = await supabase.from('blog_posts').update(u).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBlogPost(id) {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw error;
}

// ─── Contact Messages ────────────────────────────────────────
export async function getContactMessages(statusFilter) {
  return withCache(`messages_${statusFilter || 'All'}`, async () => {
    let query = supabase.from('contact_messages').select('*').order('received_at', { ascending: false }).limit(100);
    if (statusFilter && statusFilter !== 'All') {
      query = query.eq('status', statusFilter.toLowerCase());
    }
    const { data, error } = await query;
    if (error) throw error;

    return data.map(m => ({
      ...m,
      sender: m.sender_name,
      email: m.sender_email,
      content: m.message,
      preview: m.message ? (m.message.slice(0, 50) + '...') : '',
      status: m.status ? m.status.charAt(0).toUpperCase() + m.status.slice(1) : 'New',
      timestamp: new Date(m.received_at).toLocaleString(),
      date: new Date(m.received_at).toLocaleDateString(),
    }));
  }, 60000); // cache for 1 minute
}

export async function updateMessageStatus(id, status) {
  invalidateLocalCache('messages_');
  const { data, error } = await supabase.from('contact_messages').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMessage(id) {
  invalidateLocalCache('messages_');
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw error;
}

export async function markAllMessagesRead() {
  invalidateLocalCache('messages_');
  const { error } = await supabase.from('contact_messages').update({ status: 'read' }).eq('status', 'new');
  if (error) throw error;
}

// ─── Site Config ─────────────────────────────────────────────
export async function getSiteConfig() {
  return withCache('site_config', async () => {
    const { data, error } = await supabase.from('site_config').select('*');
    if (error) throw error;
    // Convert to key-value map
    return data.reduce((acc, row) => { acc[row.key] = row.value; return acc; }, {});
  }, 300000); // 5 minutes
}

export async function updateSiteConfig(key, value) {
  invalidateLocalCache('site_config');

  // First attempt to update
  const { data: updateData, error: updateError } = await supabase
    .from('site_config')
    .update({ value })
    .eq('key', key)
    .select();

  if (updateError) throw updateError;

  if (updateData && updateData.length > 0) {
    return updateData[0];
  } else {
    // If not found, attempt to insert (assuming RLS allows it for admins)
    const { data: insertData, error: insertError } = await supabase
      .from('site_config')
      .insert([{ key, value }])
      .select()
      .single();
    if (insertError) throw insertError;
    return insertData;
  }
}

export async function updateSiteConfigBatch(entries) {
  invalidateLocalCache('site_config');
  // entries can be an array of {key, value} objects OR a single object with key-value pairs
  let updates = [];
  if (Array.isArray(entries)) {
    updates = entries;
  } else {
    updates = Object.entries(entries).map(([key, value]) => ({ key, value }));
  }

  // Use upsert logic: update first, insert if key doesn't exist
  const promises = updates.map(async ({ key, value }) => {
    const { data: updateData, error: updateError } = await supabase
      .from('site_config')
      .update({ value })
      .eq('key', key)
      .select();

    if (updateError) throw updateError;

    // If no rows were updated, the key doesn't exist yet — insert it
    if (!updateData || updateData.length === 0) {
      const { error: insertError } = await supabase
        .from('site_config')
        .insert([{ key, value }]);
      if (insertError) throw insertError;
    }
  });
  await Promise.all(promises);
}

// ─── Content History ─────────────────────────────────────────
export async function getContentHistory(tableName, recordId) {
  const { data, error } = await supabase
    .from('content_history')
    .select('*')
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('version_number', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

export async function saveContentSnapshot(tableName, recordId, snapshotData, changeSummary) {
  // Get next version number
  const { data: latest } = await supabase
    .from('content_history')
    .select('version_number')
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('version_number', { ascending: false })
    .limit(1);

  const nextVersion = (latest?.[0]?.version_number || 0) + 1;

  const { data, error } = await supabase.from('content_history').insert({
    table_name: tableName,
    record_id: recordId,
    snapshot_data: snapshotData,
    version_number: nextVersion,
    change_summary: changeSummary,
  }).select().single();
  if (error) throw error;
  return data;
}

// ─── Notifications ───────────────────────────────────────────
export async function getNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function markNotificationRead(id) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
  if (error) throw error;
}

// ─── Audit Log ───────────────────────────────────────────────
export async function getAuditLog(filters = {}) {
  let query = supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(100);
  if (filters.event_type) query = query.eq('event_type', filters.event_type);
  if (filters.result) query = query.eq('result', filters.result);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function insertAuditLog(entry) {
  const { error } = await supabase.from('audit_log').insert(entry);
  if (error) throw error;
}

// ─── Admin Sessions ──────────────────────────────────────────
export async function getActiveSessions() {
  const { data, error } = await supabase
    .from('admin_sessions')
    .select('*')
    .is('revoked_at', null)
    .order('last_active', { ascending: false });
  if (error) throw error;
  return data;
}

export async function revokeSession(sessionId) {
  const { error } = await supabase
    .from('admin_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (error) throw error;
}

export async function upsertAdminSession(session) {
  const payload = {
    admin_id: session.admin_id,
    device: session.device || null,
    browser: session.browser || null,
    os: session.os || null,
    ip_address: session.ip_address || null,
    location: session.location || null,
    login_at: session.login_at || new Date().toISOString(),
    last_active: new Date().toISOString(),
    is_current: session.is_current !== false,
    jwt_id: session.jwt_id || null,
    revoked_at: null,
  };

  if (payload.jwt_id) {
    const { data: results, error: findError } = await supabase
      .from('admin_sessions')
      .select('id')
      .eq('jwt_id', payload.jwt_id)
      .limit(1);
    if (findError) throw findError;

    const existing = results?.[0];
    if (existing?.id) {
      const { error: updateError } = await supabase
        .from('admin_sessions')
        .update(payload)
        .eq('id', existing.id);
      if (updateError) throw updateError;
      return existing.id;
    }
  }

  const { data: inserted, error } = await supabase.from('admin_sessions').insert(payload).select('id');
  if (error) throw error;
  return inserted?.[0]?.id;
}

// ─── IP Blocklist ────────────────────────────────────────────
export async function getIPBlocklist() {
  const { data, error } = await supabase.from('ip_blocklist').select('*').order('blocked_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function blockIP(entry) {
  const { data, error } = await supabase.from('ip_blocklist').insert(entry).select().single();
  if (error) throw error;
  return data;
}

export async function unblockIP(id) {
  const { error } = await supabase.from('ip_blocklist').delete().eq('id', id);
  if (error) throw error;
}

// ─── Country Settings ────────────────────────────────────────
export async function getCountrySettings() {
  const { data, error } = await supabase.from('country_settings').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function updateCountrySettings(countries) {
  // Sync the table with the provided country list
  // For simplicity, we'll upsert all and handle deletions by not including them?
  // Actually, handle them one by one to ensure we don't accidentally delete others if we ever use this elsewhere.
  const promises = countries.map(async (c) => {
    const { id, updated_at, ...rest } = c;
    if (typeof id === 'string' && id.length > 10) { // existing uuid
        const { error } = await supabase.from('country_settings').update(rest).eq('id', id);
        if (error) throw error;
    } else { // new entry
        const { id: _, ...newRest } = rest;
        const { error } = await supabase.from('country_settings').insert([newRest]);
        if (error) throw error;
    }
  });

  await Promise.all(promises);
}

export async function deleteCountrySetting(id) {
    const { error } = await supabase.from('country_settings').delete().eq('id', id);
    if (error) throw error;
}

// ─── Webhooks ────────────────────────────────────────────────
export async function getWebhooks() {
  const { data, error } = await supabase.from('webhooks').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createWebhook(webhook) {
  const { data, error } = await supabase.from('webhooks').insert(webhook).select().single();
  if (error) throw error;
  return data;
}

export async function updateWebhook(id, updates) {
  const { data, error } = await supabase.from('webhooks').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteWebhook(id) {
  const { error } = await supabase.from('webhooks').delete().eq('id', id);
  if (error) throw error;
}

// ─── Legal Pages ─────────────────────────────────────────────
export async function getLegalPage(slug) {
  const { data, error } = await supabase
    .from('legal_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertLegalPage(slug, updates) {
  // Try update first
  const { data: existing } = await supabase
    .from('legal_pages')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase
      .from('legal_pages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('slug', slug)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('legal_pages')
      .insert({ slug, ...updates })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// ─── Dashboard Stats ─────────────────────────────────────────
export async function getDashboardStats() {
  return withCache('dashboard_stats', async () => {
    const [projects, blogs, messages, applications, pendingApps] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('community_applications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('community_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    return {
      totalProjects: projects.count || 0,
      totalBlogPosts: blogs.count || 0,
      unreadMessages: messages.count || 0,
      communityMembers: applications.count || 0,
      pendingApplications: pendingApps.count || 0,
    };
  }, 120000); // 2 minutes
}