// Supabase client config. Insert your project URL and anon key.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const SUPABASE_URL = 'https://ahqlzyftbmbhlqgpohwk.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocWx6eWZ0Ym1iaGxxZ3BvaHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjUzNDQsImV4cCI6MjA5NjQ0MTM0NH0.iXDhHWjSbQ8beTCGNWhYSb4lrpB4cgAP8onNibypYIs';

export const isConfigured =
  SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
