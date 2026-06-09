// Supabase client config. Keys are loaded from environment variables (not hardcoded).
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { getSupabaseConfig } from './config.js';

const config = getSupabaseConfig();
export const SUPABASE_URL = config.url;
export const SUPABASE_ANON_KEY = config.key;

export const isConfigured =
  SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
