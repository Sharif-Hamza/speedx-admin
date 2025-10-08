# 🚨 URGENT: Feature Flags Setup Instructions

## The Problem
Your toggles are reverting because the `feature_flags` table doesn't exist in your Supabase database yet!

## The Solution (Takes 2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your SpeedX project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Migration

Copy and paste this ENTIRE SQL script and click **RUN**:

```sql
-- Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_key TEXT UNIQUE NOT NULL,
    feature_name TEXT NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read feature flags
CREATE POLICY "Anyone can read feature flags"
ON public.feature_flags
FOR SELECT
USING (true);

-- Create policy for authenticated users to update feature flags
CREATE POLICY "Authenticated users can update feature flags"
ON public.feature_flags
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Insert initial feature flags
INSERT INTO public.feature_flags (feature_key, feature_name, description, enabled, config)
VALUES 
    ('blitz_mode', 'Blitz Mode', 'Race against ETA to reach destinations faster', true, '{"beta": false}'::jsonb),
    ('badges', 'Badge System', 'Earn and collect achievement badges', true, '{"total_badges": 12}'::jsonb),
    ('simple_drive', 'Simple Drive Mode', 'Standard trip recording mode', true, '{}'::jsonb),
    ('video_recaps', 'Video Recaps', 'Generate and download video recaps of trips', true, '{"max_duration": 60}'::jsonb),
    ('leaderboards', 'Leaderboards', 'Global and friend leaderboards (future feature)', false, '{"max_duration": 60}'::jsonb)
ON CONFLICT (feature_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON public.feature_flags(enabled);

-- Grant permissions
GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT UPDATE ON public.feature_flags TO authenticated;

COMMENT ON TABLE public.feature_flags IS 'Feature flags for controlling app features dynamically';
```

### Step 3: Verify the Table Was Created

1. In Supabase, go to **"Table Editor"**
2. You should see a new table called **`feature_flags`**
3. Click on it - you should see 5 rows with your features

### Step 4: Test Your Admin Dashboard

1. Go back to your admin dashboard
2. Click **"Features"** tab in the sidebar
3. Try toggling any feature
4. It should now **STAY TOGGLED** ✅

### Step 5: Test on iOS App

1. Open your iOS app (wait 30 seconds for it to poll for changes)
2. Toggle "Blitz Mode" OFF in admin
3. Wait 30 seconds
4. Check iOS app - Blitz Mode button should disappear!

## ✅ What This Creates

- **Table**: `feature_flags` with 5 initial features
- **Security**: Row Level Security enabled
- **Permissions**: Anyone can read, authenticated users can update
- **Initial Data**: All features enabled by default (except leaderboards)

## 🔍 How to Check if It's Working

### In Supabase:
```sql
SELECT * FROM feature_flags;
```

You should see 5 rows:
- blitz_mode (enabled: true)
- badges (enabled: true)
- simple_drive (enabled: true)
- video_recaps (enabled: true)
- leaderboards (enabled: false)

### In Admin Dashboard:
- All toggles should work and persist
- No more reverting!

### In iOS App:
- Features should hide/show based on admin toggles
- Updates appear within 30 seconds

## 🚨 Still Not Working?

If you're still having issues after running the migration:

1. **Check browser console** (F12) for errors
2. **Check Supabase logs** for API errors
3. **Verify environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` is set
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
   - `SUPABASE_SERVICE_ROLE_KEY` is set (for admin updates)

4. **Check that you're logged in** to the admin dashboard

## 📞 Need Help?

The migration file is saved at:
`/Users/areen/Desktop/SYNKR 2/speedx-admin/supabase_feature_flags_migration.sql`

You can also run it directly from your terminal if you have the Supabase CLI installed.
