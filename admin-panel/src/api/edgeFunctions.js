import supabase from '../config/supabaseClient';

const EDGE_FN_URL = import.meta.env.VITE_EDGE_FN_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function invokeEdgeFunction(name, body = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch(`${EDGE_FN_URL}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || `Edge function ${name} failed`);
  }

  return response.json();
}

// Invalidate cache for specific routes (when CF Workers are set up)
export async function invalidateCache(routes) {
  return invokeEdgeFunction('invalidate-cache', { routes });
}

// Send contact notification email
export async function sendContactNotification(messageId) {
  return invokeEdgeFunction('send-contact-notification', { messageId });
}

// Send community application notification
export async function sendApplicationNotification(applicationId) {
  return invokeEdgeFunction('send-application-notification', { applicationId });
}

// Approve community member
export async function approveCommunityMember(applicationId) {
  return invokeEdgeFunction('approve-community-member', { applicationId });
}

// Create backup
export async function createBackup() {
  return invokeEdgeFunction('create-backup', {});
}

// Generate preview token for draft content
export async function generatePreviewToken(tableName, recordId) {
  return invokeEdgeFunction('generate-preview-token', { tableName, recordId });
}

// Create a new admin user (super_admin only)
export async function createAdminUser({ email, password, full_name, role }) {
  return invokeEdgeFunction('manage-admin-user', {
    action: 'create',
    email,
    password,
    full_name,
    role,
  });
}

// Delete an admin user permanently (super_admin only)
export async function deleteAdminUser(userId) {
  return invokeEdgeFunction('manage-admin-user', {
    action: 'delete',
    userId,
  });
}