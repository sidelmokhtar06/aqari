# GitHub Setup Instructions

## Step 1: Create a new repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `aqari`
3. **Description:** "Bilingual real estate listings platform for Mauritania"
4. **Public** (so others can see it)
5. **Do NOT** initialize with README, .gitignore, or license (we already have them)
6. Click **Create repository**

## Step 2: Push your local repository to GitHub

Copy-paste these commands into your terminal in the `aqari` directory:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aqari.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Verify

Visit `https://github.com/YOUR_USERNAME/aqari` — you should see your project with the README and all files.

## Optional: Add Topics

On GitHub, add topics to help discoverability:
- `real-estate`
- `mauritania`
- `supabase`
- `bilingual`
- `javascript`
- `tailwind`

Done! Your project is now on GitHub. 🎉
