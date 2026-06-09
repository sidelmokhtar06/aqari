// Netlify Edge Function: inject per-listing OG tags for WhatsApp/social previews.
// Replaces <!--OG_TAGS--> markers with dynamic listing data for crawlers.

// Public anon key — safe to expose (same one the browser uses, protected by RLS).
const SUPABASE_URL = 'https://ahqlzyftbmbhlqgpohwk.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocWx6eWZ0Ym1iaGxxZ3BvaHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjUzNDQsImV4cCI6MjA5NjQ0MTM0NH0.iXDhHWjSbQ8beTCGNWhYSb4lrpB4cgAP8onNibypYIs';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=70';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export default async (request, context) => {
  const res = await context.next();
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return res;

  let listing;
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/listings?id=eq.${encodeURIComponent(id)}` +
        `&is_approved=eq.true&select=title,price,description,images,type,location&limit=1`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
    );
    listing = (await r.json())?.[0];
  } catch {
    return res; // network issue — keep default tags
  }
  if (!listing) return res;

  const price = new Intl.NumberFormat('fr-FR').format(Number(listing.price) || 0) + ' MRU';
  const title = `${esc(listing.title)} — ${price} | Aqari`;
  const desc = esc((listing.description || `Bien à ${listing.location}, Nouakchott`).slice(0, 180));
  const image = esc((listing.images && listing.images[0]) || DEFAULT_IMAGE);

  const tags = `
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Aqari">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${image}">`;

  const html = (await res.text()).replace(
    /<!--OG_TAGS-->[\s\S]*?<!--\/OG_TAGS-->/,
    tags,
  );
  return new Response(html, {
    status: res.status,
    headers: { ...Object.fromEntries(res.headers), 'content-type': 'text/html; charset=utf-8' },
  });
};
