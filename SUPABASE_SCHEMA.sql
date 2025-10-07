-- ============================================
-- SpeedX Admin Dashboard - Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    target TEXT NOT NULL DEFAULT 'all' CHECK (target IN ('all', 'specific')),
    target_user_ids TEXT[],
    image_url TEXT,
    action_url TEXT,
    active BOOLEAN DEFAULT true,
    scheduled_for TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(active);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON public.announcements(priority);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements
CREATE POLICY "Public can view active announcements"
    ON public.announcements
    FOR SELECT
    USING (active = true);

CREATE POLICY "Admins can manage announcements"
    ON public.announcements
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 2. ANNOUNCEMENT READS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.announcement_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_reads_user ON public.announcement_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement ON public.announcement_reads(announcement_id);

ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reads"
    ON public.announcement_reads
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own reads"
    ON public.announcement_reads
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- ============================================
-- 3. APP CONFIG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.app_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_config_key ON public.app_config(key);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view config"
    ON public.app_config
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage config"
    ON public.app_config
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 4. ADMIN USERS TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
    permissions JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin users"
    ON public.admin_users
    FOR SELECT
    USING (true);

-- ============================================
-- 5. AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to announcements
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to app_config
CREATE TRIGGER update_app_config_updated_at
    BEFORE UPDATE ON public.app_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================
GRANT ALL ON public.announcements TO authenticated;
GRANT ALL ON public.announcement_reads TO authenticated;
GRANT ALL ON public.app_config TO authenticated;
GRANT ALL ON public.admin_users TO authenticated;

GRANT ALL ON public.announcements TO service_role;
GRANT ALL ON public.announcement_reads TO service_role;
GRANT ALL ON public.app_config TO service_role;
GRANT ALL ON public.admin_users TO service_role;

-- ============================================
-- 7. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample announcement
-- INSERT INTO public.announcements (title, message, priority, target, created_by)
-- VALUES 
-- ('Welcome to SpeedX!', 'Thanks for joining our community. Start your first trip today!', 'high', 'all', 'admin'),
-- ('New Feature Released', 'Check out our new Blitz Mode with multiple route options!', 'medium', 'all', 'admin');

-- Insert sample app config
-- INSERT INTO public.app_config (key, value, description)
-- VALUES
-- ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
-- ('max_speed_limit', '200', 'Maximum speed limit in MPH'),
-- ('enable_blitz_mode', 'true', 'Enable/disable Blitz mode feature');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('announcements', 'announcement_reads', 'app_config', 'admin_users');

-- Check RLS policies
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE schemaname = 'public';

-- ============================================
-- NOTES
-- ============================================
-- 1. Make sure you have the user_badges table from the previous schema
-- 2. Ensure your trips table exists for analytics
-- 3. Configure RLS policies based on your security requirements
-- 4. Add your email to admin_users table to access the dashboard
-- 5. Use service_role key for admin operations (keep it secret!)

-- ============================================
-- ADD YOUR ADMIN USER
-- ============================================
-- Replace with your email and user ID from Supabase Auth
-- INSERT INTO public.admin_users (user_id, email, role)
-- VALUES ('your-user-id-from-auth', 'your-email@example.com', 'super_admin');

-- ============================================
-- COMPLETE! 🎉
-- ============================================
-- Your database is now ready for the admin dashboard!
-- Next steps:
-- 1. Configure your .env.local file
-- 2. Run npm install
-- 3. Run npm run dev
-- 4. Access your dashboard at http://localhost:3000
