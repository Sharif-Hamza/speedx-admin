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
    ('leaderboards', 'Leaderboards', 'Global and friend leaderboards (future feature)', false, '{}'::jsonb)
ON CONFLICT (feature_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON public.feature_flags(enabled);

-- Grant permissions
GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT UPDATE ON public.feature_flags TO authenticated;

COMMENT ON TABLE public.feature_flags IS 'Feature flags for controlling app features dynamically';
