-- Migration: Create api_configs table
CREATE TABLE IF NOT EXISTS public.api_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name TEXT UNIQUE NOT NULL,
    key_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.api_configs ENABLE ROW LEVEL SECURITY;

-- Allow all access for authenticated users (simplified for internal config)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'api_configs' AND policyname = 'Allow all access for authenticated users'
    ) THEN
        CREATE POLICY "Allow all access for authenticated users" ON public.api_configs
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;
