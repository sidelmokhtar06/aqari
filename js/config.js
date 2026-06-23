// Load Supabase config.
//
// This is a no-build static site, so server-side environment variables (Vercel/
// Netlify dashboard) can't reach client-side JS. The Supabase URL + anon key are
// PUBLIC by design — the anon key ships to every browser and is protected by Row
// Level Security — so they are committed here as the defaults.
//
// Priority:
// 1. window.__SUPABASE_URL__ (optional override, e.g. local-config.js)
// 2. The committed public defaults below

const DEFAULT_SUPABASE_URL = 'https://ahqlzyftbmbhlqgpohwk.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocWx6eWZ0Ym1iaGxxZ3BvaHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjUzNDQsImV4cCI6MjA5NjQ0MTM0NH0.iXDhHWjSbQ8beTCGNWhYSb4lrpB4cgAP8onNibypYIs';

export function getSupabaseConfig() {
  return {
    url: window.__SUPABASE_URL__ || DEFAULT_SUPABASE_URL,
    key: window.__SUPABASE_ANON_KEY__ || DEFAULT_SUPABASE_ANON_KEY,
  };
}
