import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import { getAdminProfile } from '../api/auth';
import { upsertAdminSession, getSiteConfig } from '../api/content';
import { parseJwtId, parseUserAgent } from '../utils/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [rolePerms, setRolePerms] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchRolePerms = async () => {
    try {
      const config = await getSiteConfig();
      if (config.role_permissions) {
        setRolePerms(typeof config.role_permissions === 'string' 
          ? JSON.parse(config.role_permissions) 
          : config.role_permissions);
      }
    } catch (err) {
      console.error('Failed to load role permissions:', err);
    }
  };

  const syncAdminSession = async (s) => {
    if (!s?.user) return;
    try {
      const { browser, os } = parseUserAgent();
      await upsertAdminSession({
        admin_id: s.user.id,
        browser,
        os,
        device: `${browser} on ${os}`,
        jwt_id: parseJwtId(s.access_token),
        is_current: true,
      });
    } catch (e) {
      // If the background sync fails due to an invalid session/refresh token, handle it
      if (e?.status === 400 || e?.message?.toLowerCase().includes('refresh token')) {
        console.warn('Sync failed due to invalid session. Clearing local state.');
        supabase.auth.signOut().finally(() => {
          setSession(null);
          setUser(null);
        });
      } else {
        console.error('Failed to sync admin session:', e);
      }
    }
  };

  useEffect(() => {
    fetchRolePerms();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      if (error) {
        console.warn('Session initialization notice:', error.message);
        // If it's a refresh token error or invalid session, clear everything
        if (error.status === 400 || error.message?.toLowerCase().includes('refresh token')) {
          supabase.auth.signOut().finally(() => {
            setSession(null);
            setUser(null);
            setLoading(false);
          });
          return;
        }
        setLoading(false); // For other types of errors, still stop loading
        return;
      }

      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        getAdminProfile(s.user.id).then(setProfile).catch(() => { });
        syncAdminSession(s);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user) {
        getAdminProfile(s.user.id).then(setProfile).catch(() => { });
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          syncAdminSession(s);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });


    return () => subscription.unsubscribe();
  }, []);

  const getEffectivePermissions = React.useCallback(() => {
    if (!profile) return {};
    const roleKey = profile.role === 'super_admin' ? 'Super Admin' : 
                   profile.role === 'admin' ? 'Admin' : 
                   profile.role === 'editor' ? 'Editor' : 'Viewer';
    
    // Merge individual permissions with role-based ones
    return {
      ...(rolePerms[roleKey] || {}),
      ...(profile.access_permissions || {}),
    };
  }, [profile, rolePerms]);

  const canView = React.useCallback((sectionId) => {
    if (profile?.role === 'super_admin') return true;
    const perms = getEffectivePermissions();
    return perms[sectionId]?.view ?? false;
  }, [profile, getEffectivePermissions]);

  const canEdit = React.useCallback((sectionId) => {
    if (profile?.role === 'super_admin') return true;
    const perms = getEffectivePermissions();
    return perms[sectionId]?.edit ?? false;
  }, [profile, getEffectivePermissions]);

  const value = React.useMemo(() => ({
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!session,
    role: profile?.role || 'editor',
    permissions: getEffectivePermissions(),
    canView,
    canEdit,
    checkPermission: (sectionId) => {
      if (profile?.role === 'super_admin') return true;
      const perms = getEffectivePermissions();
      const hasEdit = perms[sectionId]?.edit ?? false;
      if (!hasEdit) {
        // Return false so the caller knows it failed
        return false;
      }
      return true;
    },
    refreshPermissions: fetchRolePerms
  }), [user, profile, session, loading, canView, canEdit, getEffectivePermissions, profile?.role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;