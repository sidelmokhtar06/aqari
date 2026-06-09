// Load Supabase config from environment or window globals.
//
// Priority (in order):
// 1. window.__SUPABASE_URL__ (set by Netlify function or local HTML)
// 2. Falls back to placeholder (shows setup banner)
//
// For local development:
// - Option A: Add a local-config.js (not committed) with window.__SUPABASE_URL__ and window.__SUPABASE_ANON_KEY__
// - Option B: Set environment variables in Netlify
//
// For Netlify deployment:
// - Add SUPABASE_URL and SUPABASE_ANON_KEY as environment variables in Netlify dashboard

export function getSupabaseConfig() {
  return {
    url: window.__SUPABASE_URL__ || 'YOUR_SUPABASE_URL',
    key: window.__SUPABASE_ANON_KEY__ || 'YOUR_SUPABASE_ANON_KEY',
  };
}
