# SpeedX Admin Dashboard - Netlify Deployment Guide

## 📋 Prerequisites

- ✅ Netlify account
- ✅ GitHub repository (recommended) or manual deploy
- ✅ Supabase project credentials

## 🚀 Deployment Steps

### Option 1: Deploy via Netlify CLI (Recommended)

#### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Build the Project
```bash
cd "/Users/areen/Desktop/SYNKR 2/speedx-admin"
npm run build
```

#### Step 3: Login to Netlify
```bash
netlify login
```

#### Step 4: Deploy
```bash
# First time deployment
netlify deploy --prod

# Follow prompts:
# - Create & configure a new site? Yes
# - Team: Select your team
# - Site name: speedx-admin (or your choice)
# - Publish directory: .next
```

### Option 2: Deploy via Netlify Dashboard

#### Step 1: Build the Project Locally
```bash
cd "/Users/areen/Desktop/SYNKR 2/speedx-admin"
npm run build
```

#### Step 2: Create netlify.toml
Already exists! It's configured for Next.js.

#### Step 3: Deploy via Dashboard
1. Go to https://app.netlify.com/
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the `.next` folder
4. Wait for deployment

### Option 3: Deploy via GitHub (Best for Auto-Deploy)

#### Step 1: Push to GitHub
```bash
cd "/Users/areen/Desktop/SYNKR 2/speedx-admin"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### Step 2: Connect to Netlify
1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions`

## 🔐 Environment Variables Setup

### CRITICAL: Add These to Netlify

Go to: **Site settings → Environment variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://bzfrmujzxmfufvumknkq.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZnJtdWp6eG1mdWZ2dW1rbmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTI5NDIsImV4cCI6MjA3NTE2ODk0Mn0.WAFT7xsTsRR35TxjXL17aodv3oF-HbJQV8Pl6ztXvlE

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZnJtdWp6eG1mdWZ2dW1rbmtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU5Mjk0MiwiZXhwIjoyMDc1MTY4OTQyfQ.DMm6Mvj-DMynP6Xq7PlRwlV0W3QqZ17alyauOCPKG_o

ADMIN_EMAILS=hsharif701@gmail.com
```

### How to Add in Netlify:
1. Go to your site dashboard
2. Click "Site settings"
3. Click "Environment variables" in sidebar
4. Click "Add a variable"
5. Add each variable above
6. Click "Save"

## ⚙️ Netlify Configuration

The `netlify.toml` file is already configured:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
```

## 🔄 Update iOS App to Use Netlify URL

Your iOS app uses the **same Supabase backend**, so:

### ✅ No Changes Needed!

The iOS app connects directly to Supabase, not to the admin dashboard. The admin dashboard is just a web interface for managing the same Supabase database.

### What This Means:
- **iOS App** → Supabase (direct connection)
- **Admin Dashboard** → Supabase (direct connection)
- **They share the same data** ✅

### URLs:
- **Supabase API**: `https://bzfrmujzxmfufvumknkq.supabase.co`
- **Admin Dashboard**: `https://your-site.netlify.app` (just for viewing/managing)

## 🧪 Testing After Deployment

### Step 1: Visit Your Netlify URL
```
https://your-site-name.netlify.app
```

### Step 2: Test Login
- Go to `/login`
- Login with: `hsharif701@gmail.com`
- Should redirect to dashboard

### Step 3: Verify Data
- Check if stats are loading
- Check if users are visible
- Try posting an announcement
- Verify announcement appears in iOS app

### Step 4: Test from iOS App
- iOS app should still work normally
- Should see announcements posted from Netlify dashboard
- All data syncs through Supabase

## 🐛 Troubleshooting

### Issue: Build Fails

**Solution**: Check Node version
```bash
# In netlify.toml, ensure:
[build.environment]
  NODE_VERSION = "18"
```

### Issue: Environment Variables Not Working

**Solution**: 
1. Make sure variables start with `NEXT_PUBLIC_` for client-side
2. Rebuild the site after adding variables
3. Check "Deploys" → "Trigger deploy" → "Clear cache and deploy"

### Issue: 404 on Routes

**Solution**: Next.js plugin should handle this, but if issues persist:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Issue: Functions Not Working

**Solution**: API routes should work automatically with Next.js on Netlify

## 📊 Performance Optimization

### Enable Build Plugins
1. Go to Site settings → Build & deploy → Build plugins
2. Enable "Next.js Build Plugin" (should be auto-enabled)

### Enable Asset Optimization
1. Go to Site settings → Build & deploy → Post processing
2. Enable:
   - ✅ Bundle CSS
   - ✅ Minify CSS
   - ✅ Minify JS
   - ✅ Minify images

## 🔒 Security Best Practices

### 1. Secure Your Admin Routes
Already implemented! Login required for all admin pages.

### 2. Use Environment Variables
Never commit `.env.local` to GitHub!

### 3. Enable HTTPS
Netlify provides free SSL/TLS automatically ✅

### 4. Set Up Supabase RLS
Row Level Security is already configured in your Supabase project.

## 📱 Custom Domain (Optional)

### Step 1: Add Custom Domain
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `admin.speedx.app`)

### Step 2: Configure DNS
Add CNAME record:
```
Type: CNAME
Name: admin (or @)
Value: your-site-name.netlify.app
```

### Step 3: Enable HTTPS
Netlify will automatically provision SSL certificate.

## 🚀 Deployment Checklist

- [ ] Build project locally (`npm run build`)
- [ ] Test build locally (`npm start`)
- [ ] Add environment variables to Netlify
- [ ] Deploy to Netlify
- [ ] Test login on Netlify URL
- [ ] Verify data loads correctly
- [ ] Test posting announcement
- [ ] Verify announcement appears in iOS app
- [ ] Set up custom domain (optional)

## 📝 Quick Deploy Commands

### Manual Deploy
```bash
cd "/Users/areen/Desktop/SYNKR 2/speedx-admin"
npm run build
netlify deploy --prod
```

### Auto-Deploy (GitHub)
Just push to main branch:
```bash
git add .
git commit -m "Update dashboard"
git push origin main
```

Netlify will automatically rebuild and deploy! 🎉

## 🎉 You're Done!

Your admin dashboard will be live at:
```
https://your-site-name.netlify.app
```

The iOS app will continue working normally, and both will share the same Supabase database!

---

**Need Help?**
- Netlify Docs: https://docs.netlify.com/
- Next.js on Netlify: https://docs.netlify.com/integrations/frameworks/next-js/

**Ready to deploy?** Run `netlify deploy --prod` in the speedx-admin folder!
