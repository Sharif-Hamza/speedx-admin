-- Feature Flags Table for Dynamic Feature Management
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_key TEXT UNIQUE NOT NULL,
    feature_name TEXT NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON public.feature_flags(enabled);

-- Enable Row Level Security
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read feature flags (for iOS app)
CREATE POLICY "Feature flags are publicly readable"
ON public.feature_flags FOR SELECT
USING (true);

-- Policy: Only authenticated admins can update
CREATE POLICY "Only authenticated users can update feature flags"
ON public.feature_flags FOR UPDATE
USING (auth.role() = 'authenticated');

-- Policy: Only authenticated admins can insert
CREATE POLICY "Only authenticated users can insert feature flags"
ON public.feature_flags FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Insert default feature flags
INSERT INTO public.feature_flags (feature_key, feature_name, description, enabled, config) VALUES
('blitz_mode', 'Blitz Mode', 'Race against ETA to reach destinations faster', true, '{"show_in_nav": true, "allow_recording": true}'::jsonb),
('badges', 'Badge System', 'Earn and collect achievement badges', true, '{"show_in_stats": true, "allow_earning": true, "show_progress": true}'::jsonb),
('simple_drive', 'Simple Drive Mode', 'Standard trip recording mode', true, '{"show_in_nav": true, "allow_recording": true}'::jsonb),
('video_recaps', 'Video Recaps', 'Generate and download video recaps of trips', true, '{"allow_generation": true, "allow_download": true}'::jsonb),
('leaderboards', 'Leaderboards', 'Global and friend leaderboards (future feature)', false, '{"show_global": false, "show_friends": false}'::jsonb)
ON CONFLICT (feature_key) DO NOTHING;

-- Create function to update timestamp automatically
CREATE OR REPLACE FUNCTION update_feature_flags_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_feature_flags_timestamp ON public.feature_flags;
CREATE TRIGGER update_feature_flags_timestamp
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_flags_timestamp();

COMMENT ON TABLE public.feature_flags IS 'Dynamic feature flags for enabling/disabling app features remotely';
COMMENT ON COLUMN public.feature_flags.feature_key IS 'Unique identifier for the feature';
COMMENT ON COLUMN public.feature_flags.enabled IS 'Whether the feature is currently enabled';
COMMENT ON COLUMN public.feature_flags.config IS 'Additional JSON configuration for the feature';
