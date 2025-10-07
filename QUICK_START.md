# 🚀 Quick Start Guide - SpeedX Admin Dashboard

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your SpeedX project
3. Navigate to **Settings** → **API**
4. Copy these values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOi.....
service_role key: eyJhbGciOi.....
```

## Step 2: Create Environment File

Create a file named `.env.local` in the `speedx-admin` folder with this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Replace** the values with your actual Supabase credentials!

## Step 3: Run Database Schema

1. Go to Supabase Dashboard → **SQL Editor**
2. Click "**New Query**"
3. Copy ALL content from `SUPABASE_SCHEMA.sql`
4. Paste and click "**Run**"
5. Wait for ✅ Success!

## Step 4: Start the Dashboard

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

## Step 5: Test It Out!

You should see:
- ✅ Dashboard with stats
- ✅ Users table (might be empty if no users yet)
- ✅ Announcements panel
- ✅ Beautiful UI with sidebar navigation

## Troubleshooting

### "Cannot connect to Supabase"
- Check your `.env.local` file exists
- Verify credentials are correct
- Restart dev server: `npm run dev`

### "Table doesn't exist"
- Run the SQL schema in Supabase
- Check table was created: Go to **Database** → **Tables**

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

## Next Steps

1. ✅ Post your first announcement
2. ✅ View user statistics
3. ✅ Award badges to users
4. ✅ Deploy to Netlify (when ready)

## Deploy to Netlify

1. Push code to GitHub
2. Go to https://netlify.com
3. Click "**New site from Git**"
4. Select your repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables (same as `.env.local`)
7. Deploy!

---

**Need Help?** Check the full README.md for detailed docs!
