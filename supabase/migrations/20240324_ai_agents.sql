-- Migration: Create ai_agents table
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    objetivo_agente TEXT NOT NULL,
    tom_de_comunicacao TEXT,
    regras_de_negocio TEXT,
    limites_operacionais TEXT,
    permissoes_ativas TEXT,
    tools JSONB DEFAULT '[]'::jsonb,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

-- Política de acesso para usuários autenticados
CREATE POLICY "Allow all access for authenticated users on ai_agents" ON public.ai_agents
    FOR ALL USING (true) WITH CHECK (true);

-- Permissões
GRANT ALL ON public.ai_agents TO authenticated;
GRANT ALL ON public.ai_agents TO service_role;
