# SpeedX Admin Dashboard - Netlify Deployment Guide

## 🚀 Your Code is Now on GitHub!

**Repository:** https://github.com/Sharif-Hamza/speedx-admin

**Latest Commit:** Feature Flag Management System ✅

---

## 📦 What's Included

✅ Feature Flag Management System
✅ User Management
✅ Announcements Panel
✅ Dashboard Statistics
✅ Auto-deploy from GitHub

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### Step 1: Run SQL in Supabase

Before deploying, create the feature_flags table:

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy the SQL from `supabase/feature_flags.sql`
4. Run the migration
5. ✅ Verify table created: `public.feature_flags`

### Step 2: Deploy to Netlify

#### A. Connect GitHub Repository

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**
4. Authorize Netlify (if needed)
5. Search for **"speedx-admin"**
6. Click on the repository

#### B. Configure Build Settings

Netlify should auto-detect Next.js. Verify these settings:

```
Base directory:        (leave empty)
Build command:         npm run build
Publish directory:     .next
```

#### C. Add Environment Variables

Click **"Add environment variables"** and add these:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Where to find these:**
1. Open Supabase Dashboard
2. Go to **Settings** → **API**
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

#### D. Deploy!

1. Click **"Deploy site"**
2. Wait 2-3 minutes
3. ✅ Your admin dashboard is live!

---

## 🎯 POST-DEPLOYMENT CHECKLIST

### 1. Test Admin Login

```
1. Visit your Netlify URL (e.g., speedx-admin-xyz.netlify.app)
2. Login with admin credentials
3. ✅ Should see dashboard
```

### 2. Test Feature Management

```
1. Click "Features" tab in sidebar
2. ✅ See all feature flags (Blitz Mode, Badges, etc.)
3. Toggle a feature
4. ✅ Should see instant update
5. Refresh page
6. ✅ Toggle state persisted
```

### 3. Test iOS App Integration

```
1. Run iOS app (Cmd+R in Xcode)
2. Check Xcode console for:
   "✅ Fetched X feature flags from server"
   "🎛️ Feature 'blitz_mode': ✅ ENABLED"
3. Toggle feature in admin
4. Wait 30 seconds
5. ✅ iOS app should reflect change
```

---

## 🔄 AUTO-DEPLOY WORKFLOW

Now every time you push to GitHub, Netlify will automatically:

1. Pull latest code
2. Run `npm run build`
3. Deploy new version
4. Update live site (< 2 minutes)

**To deploy changes:**
```bash
cd "/Users/areen/Desktop/SYNKR 2/speedx-admin"
git add .
git commit -m "Your commit message"
git push origin main
# ✅ Auto-deploys to Netlify
```

---

## 🌐 CUSTOM DOMAIN (Optional)

### Add Custom Domain to Netlify:

1. In Netlify, go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., admin.speedx.app)
4. Follow DNS configuration instructions
5. ✅ HTTPS automatically configured

### Recommended Domain Structure:

- **App:** speedx.app
- **Admin:** admin.speedx.app
- **API:** api.speedx.app (if needed)

---

## 🔒 SECURITY CHECKLIST

✅ **Environment Variables:**
- Never commit `.env.local` to GitHub
- All secrets in Netlify Environment Variables
- Service role key only on server-side

✅ **Supabase RLS:**
- Row Level Security enabled on all tables
- `admin_users` table restricts access
- Feature flags publicly readable (safe)

✅ **Admin Access:**
- Only authenticated admins can update features
- Login required for all admin actions
- Session-based authentication

---

## 📊 MONITORING

### Netlify Dashboard

**Monitor:**
- Deploy status
- Build logs
- Analytics
- Function logs (API routes)

**Access:**
- https://app.netlify.com
- Select your site
- View deployments and logs

### Supabase Dashboard

**Monitor:**
- Database queries
- API requests
- Real-time changes
- Table activity

**Access:**
- https://app.supabase.com
- Select your project
- View logs and metrics

---

## 🐛 TROUBLESHOOTING

### Build Fails on Netlify

**Issue:** Build command fails

**Solution:**
```
1. Check build logs in Netlify
2. Verify package.json scripts
3. Ensure all dependencies in package.json
4. Check Node version compatibility
```

### Environment Variables Not Working

**Issue:** Supabase connection fails

**Solution:**
```
1. Go to Netlify → Site settings → Environment variables
2. Verify all 3 variables are set
3. Check for typos in variable names
4. Redeploy site after adding variables
```

### Features Not Updating in iOS App

**Issue:** Toggle in admin but no change in app

**Solution:**
```
1. Check Supabase - is feature_flags table created?
2. Verify feature flag exists in table
3. Check iOS app logs for fetch errors
4. Wait 30s (polling interval)
5. Restart iOS app to force refresh
```

### Admin Can't Login

**Issue:** Login fails

**Solution:**
```
1. Check admin_users table exists in Supabase
2. Run ADD_ADMIN_USER.sql to create admin
3. Verify email/password correct
4. Check Supabase auth logs
```

---

## 📱 TESTING WORKFLOW

### 1. Admin Dashboard → Supabase

```bash
# Terminal in admin dashboard directory
npm run dev
# Open http://localhost:3000
# Login → Features → Toggle feature
# Check Supabase dashboard → feature_flags table
# ✅ Should see enabled=true/false updated
```

### 2. Supabase → iOS App

```bash
# Xcode console while running app
# Look for:
"✅ Fetched 5 feature flags from server"
"🎛️ Feature 'blitz_mode': ✅ ENABLED"
# ✅ App fetched flags successfully
```

### 3. End-to-End Test

```bash
1. Admin: Toggle "Blitz Mode" OFF
2. Wait 30 seconds
3. iOS: Check Xcode logs
   "🎛️ Feature 'blitz_mode': ❌ DISABLED"
4. iOS: Blitz mode should disappear from nav
5. Admin: Toggle "Blitz Mode" ON
6. Wait 30 seconds
7. iOS: Blitz mode returns
✅ Full workflow working!
```

---

## 🎉 SUCCESS CHECKLIST

- [ ] SQL migration run in Supabase
- [ ] feature_flags table created
- [ ] Default features inserted
- [ ] GitHub repository updated
- [ ] Netlify site deployed
- [ ] Environment variables configured
- [ ] Admin login working
- [ ] Feature toggles functional
- [ ] iOS app fetching flags
- [ ] End-to-end test passed

---

## 📝 QUICK REFERENCE

### Important URLs

- **GitHub Repo:** https://github.com/Sharif-Hamza/speedx-admin
- **Netlify Dashboard:** https://app.netlify.com
- **Supabase Dashboard:** https://app.supabase.com
- **Your Admin Site:** (Set after deployment)

### Key Files

- `supabase/feature_flags.sql` - Database schema
- `app/api/features/route.ts` - List features API
- `app/api/features/[key]/route.ts` - Update feature API
- `components/FeatureManagementPanel.tsx` - Admin UI
- `netlify.toml` - Netlify configuration

### Environment Variables

```bash
# Required for deployment
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 🚀 YOU'RE ALL SET!

Your SpeedX Admin Dashboard is ready for deployment!

1. **Run SQL migration** in Supabase ✅
2. **Deploy to Netlify** (2-3 minutes) ✅
3. **Test feature toggles** ✅
4. **Enjoy real-time control!** 🎉

Need help? Check the troubleshooting section above!
