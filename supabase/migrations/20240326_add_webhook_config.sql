-- Migration: Add webhook configuration columns to api_configs
ALTER TABLE public.api_configs 
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS webhook_secret TEXT;
