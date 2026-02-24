-- Migration: Add uzapi_token column to api_configs
ALTER TABLE public.api_configs 
ADD COLUMN IF NOT EXISTS uzapi_token TEXT;
