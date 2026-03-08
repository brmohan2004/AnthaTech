import supabase from '../config/supabaseClient';

// Sign in with email + password
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// MFA: Enroll TOTP
export async function enrollMFA() {
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
  if (error) throw error;
  return data;
}

// MFA: Verify TOTP during login
export async function verifyMFA(factorId, code) {
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) throw challengeError;

  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });
  if (error) throw error;
  return data;
}

// MFA: List enrolled factors
export async function listMFAFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  return data;
}

// Normalize Supabase MFA listFactors() output to a consistent TOTP factor array.
export function getTotpFactors(factorsData) {
  if (Array.isArray(factorsData)) return factorsData;
  if (Array.isArray(factorsData?.totp)) return factorsData.totp;
  if (Array.isArray(factorsData?.all)) {
    return factorsData.all.filter((f) => (f?.factor_type || '').toLowerCase() === 'totp');
  }
  return [];
}

export function getVerifiedTotpFactors(factorsData) {
  return getTotpFactors(factorsData).filter((f) => f?.status === 'verified');
}

// MFA: Unenroll a factor
export async function unenrollMFA(factorId) {
  const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw error;
  return data;
}

// Get admin profile (role, security settings)
export async function getAdminProfile(userId) {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', userId)
    .limit(1);
  if (error) throw error;
  return data?.[0] || null;
}

// Update Password
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

// Update admin profile
export async function updateAdminProfile(userId, updates) {
  const { data, error } = await supabase
    .from('admin_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Delete admin profile row (the Edge Function handles auth.users deletion)
export async function deleteAdminProfile(userId) {
  const { error } = await supabase
    .from('admin_profiles')
    .delete()
    .eq('id', userId);
  if (error) throw error;
}

// List all admin profiles (super_admin only)
export async function listAdminProfiles() {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .order('role');
  if (error) throw error;
  return data;
}