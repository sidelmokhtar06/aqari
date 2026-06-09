// Local development configuration (NOT COMMITTED TO GIT)
//
// For local development without environment variables:
// 1. Copy this file to local-config.js (ignored by git)
// 2. Replace YOUR_SUPABASE_URL and YOUR_ANON_KEY with actual values
// 3. Add this script to the <head> of each HTML file:
//    <script src="./local-config.js"></script>
//    (before the main app scripts)
//
// For Netlify deployment: use Netlify dashboard environment variables instead.

window.__SUPABASE_URL__ = 'YOUR_SUPABASE_URL';
window.__SUPABASE_ANON_KEY__ = 'YOUR_ANON_KEY';
