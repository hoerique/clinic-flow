-- Migration: Refactor api_configs to column-based schema
DROP TABLE IF EXISTS public.api_configs;

CREATE TABLE public.api_configs (
    id INTEGER PRIMARY KEY DEFAULT 1,
    openai_key TEXT,
    gemini_key TEXT,
    anthropic_key TEXT,
    whatsapp_instance TEXT,
    whatsapp_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Habilitar RLS
ALTER TABLE public.api_configs ENABLE ROW LEVEL SECURITY;

-- Política de acesso para usuários autenticados
CREATE POLICY "Allow all access for authenticated users" ON public.api_configs
    FOR ALL USING (true) WITH CHECK (true);

-- Permissões
GRANT ALL ON public.api_configs TO authenticated;
GRANT ALL ON public.api_configs TO service_role;

-- Inserir a linha inicial de configuração
INSERT INTO public.api_configs (id) VALUES (1) ON CONFLICT DO NOTHING;
