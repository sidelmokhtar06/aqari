# Vercel Deployment Guide for Aqari

This guide walks you through deploying the Aqari real estate platform to Vercel with full Supabase integration and Web Analytics.

## Prerequisites

- [Vercel account](https://vercel.com) (free)
- [Supabase project](https://supabase.com) (free tier available)
- GitHub account with this repository

## Step 1: Prepare Supabase

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** (found in Settings → API)

### 1.2 Set Up Database
1. Go to **SQL Editor** in Supabase dashboard
2. Copy-paste the contents of `supabase/schema.sql` from this repo
3. Click "Run" to create tables, RLS policies, and seed demo data

### 1.3 Create Admin User (Optional)
1. Go to **Authentication → Users → Add User**
2. Create a new user with your email
3. Go to **SQL Editor** and run:
   ```sql
   INSERT INTO admin_users (user_id) VALUES ('YOUR_USER_ID');
   ```
   (Replace `YOUR_USER_ID` with the ID from the Users table)

## Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..." → "Project"**
3. Select **"Import Git Repository"**
4. Connect your GitHub account and select `sidelmokhtar06/aqari`
5. Click **"Import"**

### 2.2 Configure Environment Variables
In the Vercel project settings:

1. Go to **Settings → Environment Variables**
2. Add two variables:
   - **Name:** `SUPABASE_URL`
     **Value:** `https://your-project.supabase.co` (from your Supabase project)
   - **Name:** `SUPABASE_ANON_KEY`
     **Value:** Your anon key (from Supabase Settings → API)
3. Click **"Add"** for each variable

### 2.3 Deploy
1. Click **"Deploy"** button
2. Wait for the build to complete (should be instant, no build step needed)
3. Your site is now live! Vercel will provide a URL like `https://aqari-xxx.vercel.app`

## Step 3: Configure Supabase for Your Domain

1. Go to **Supabase → Project Settings → Authentication**
2. Under **Authorized domains**, add:
   - Your Vercel URL (e.g., `https://aqari-xxx.vercel.app`)
   - Any custom domain if you have one
3. This allows the admin panel auth to work properly

## Step 4: Enable Vercel Web Analytics

Vercel Web Analytics is enabled automatically and tracks:
- Page views
- User interactions
- Custom events (listing views, contacts, searches, etc.)

### View Your Analytics
1. Go to your Vercel project dashboard
2. Click **"Analytics"** tab
3. Monitor:
   - Page performance
   - Geographic distribution
   - Browser/device usage
   - Core Web Vitals

## Testing

### 1. Test Public Site
- Visit your Vercel URL
- Browse listings (uses mock data until configured)
- Try search and filters

### 2. Test Admin Panel
- Go to `/admin.html`
- Log in with the admin user you created
- Try approving/featuring/deleting listings

### 3. Test Database Connection
- Create a new listing via "Publier" page
- If Supabase is configured, it should appear in the database
- Admins can approve it and it will appear on the public site

## Troubleshooting

### "Supabase not configured" banner appears
**Fix:** Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in Vercel environment variables and the deploy has updated.

### Admin login fails
**Fix:** 
1. Verify your Supabase project URL is in **Authentication → Authorized domains**
2. Confirm the user exists in Supabase **Auth → Users**
3. Check browser console for specific error messages

### Photos won't upload
**Fix:**
1. Verify `listing-images` bucket exists in Supabase Storage
2. Check RLS policies allow authenticated users to upload
3. Test with Supabase directly to isolate the issue

### Analytics not showing data
**Fix:**
- Vercel Web Analytics are automatically enabled
- Wait 5-10 minutes for first data to appear
- Check that you're viewing the public URL (not localhost)

## Customization

### Change Colors/Branding
Edit these files:
- `js/tailwind-config.js` — primary, accent, success colors
- `css/theme.css` — additional styling
- `css/rtl.css` — Arabic RTL support

### Add Property Types or Locations
Edit `js/app.js`:
```javascript
export const PROPERTY_TYPES = [
  'appartement', 'villa', 'terrain', ...
];
export const LOCATIONS = [
  'Tevragh Zeina', 'Ksar', ...
];
```

### Update Translations
Edit `js/i18n.js` for French/Arabic text.

## Performance Tips

1. **Images:** Use high-quality photos (1200x800 minimum)
2. **SEO:** Each listing auto-generates meta tags for social sharing
3. **Speed:** The site is static HTML/CSS/JS — no build step needed

## Support

For issues:
1. Check Vercel deployment logs: **Deployments → View logs**
2. Check browser console: Right-click → Inspect → Console tab
3. Visit Supabase dashboard to verify database and RLS policies

## Next Steps

- Set up a custom domain in Vercel
- Configure email notifications for new listings
- Add WhatsApp notification on new contact
- Set up CloudFlare Turnstile for spam protection
- Customize admin panel with more features

---

**Deployed and ready to manage real estate listings!** 🎉
