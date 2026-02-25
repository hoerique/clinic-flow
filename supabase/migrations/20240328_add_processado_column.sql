-- Migration: Add processado column to mensagens table
ALTER TABLE public.mensagens 
ADD COLUMN IF NOT EXISTS processado BOOLEAN DEFAULT false;

-- Index to optimize polling
CREATE INDEX IF NOT EXISTS idx_mensagens_processado ON public.mensagens(processado) WHERE processado = false;
