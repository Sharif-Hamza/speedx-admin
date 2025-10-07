-- ============================================
-- ADD ADMIN USER TO SPEEDX DASHBOARD
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Insert your user as super admin
INSERT INTO public.admin_users (user_id, email, role, permissions)
VALUES (
    'cbd216ac-b5d6-448e-b5f0-814b9a6c3b77',
    'your-email@example.com', -- Replace with your actual email
    'super_admin',
    '{"manage_users": true, "manage_announcements": true, "manage_badges": true, "view_analytics": true}'::jsonb
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'super_admin',
    permissions = '{"manage_users": true, "manage_announcements": true, "manage_badges": true, "view_analytics": true}'::jsonb,
    updated_at = NOW();

-- Verify admin was added
SELECT * FROM public.admin_users WHERE user_id = 'cbd216ac-b5d6-448e-b5f0-814b9a6c3b77';

-- ✅ Done! You can now access the admin dashboard with this account.
