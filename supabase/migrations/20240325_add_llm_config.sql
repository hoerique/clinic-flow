-- Migration: Add provider and model columns to ai_agents
ALTER TABLE public.ai_agents 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS model TEXT DEFAULT 'gpt-4o';
