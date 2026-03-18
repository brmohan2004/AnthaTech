/**
 * SUPABASE ANTI-PAUSE SCRIPT
 * 
 * To prevent Supabase from pausing your free tier project due to inactivity,
 * this script performs a simple read operation.
 * 
 * Suggested Implementation:
 * 1. Host this on an external free "Keep-Alive" service (e.g., cron-job.org, 
 *    UptimeRobot, or a GitHub Action).
 * 2. Set it to run every few days.
 */

import { createClient } from '@supabase/supabase-js';

// Load your credentials from environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'your-project-url'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function keepAlive() {
  console.log('🔄 Pinging Supabase to keep project alive...');
  
  try {
    // Perform a simple read from a table that exists (e.g., site_config or projects)
    const { data, error } = await supabase
      .from('site_config')
      .select('key')
      .limit(1);

    if (error) throw error;

    console.log('✅ Ping successful! Database is active.');
  } catch (err) {
    console.error('❌ Failed to ping Supabase:', err.message);
  }
}

keepAlive();
