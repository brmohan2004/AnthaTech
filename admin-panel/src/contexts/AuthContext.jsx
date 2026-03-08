import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import { getAdminProfile } from '../api/auth';
import { upsertAdminSession } from '../api/content';
import { parseJwtId, parseUserAgent } from '../utils/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.error('Failed to sync admin session:', e);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        getAdminProfile(s.user.id).then(setProfile).catch(() => { });
        syncAdminSession(s);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        getAdminProfile(s.user.id).then(setProfile).catch(() => { });
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          syncAdminSession(s);
        }
      } else {
        setProfile(null);
      }
    });


    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!session,
    role: profile?.role || 'editor',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;