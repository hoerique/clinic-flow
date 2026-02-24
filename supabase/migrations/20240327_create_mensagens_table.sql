-- Migration: Create mensagens table for WhatsApp conversation history
CREATE TABLE IF NOT EXISTS public.mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_wa TEXT NOT NULL,
    corpo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    paciente_nome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Política de acesso para usuários autenticados
CREATE POLICY "Allow all access for authenticated users on mensagens" ON public.mensagens
    FOR ALL USING (true) WITH CHECK (true);

-- Permissões
GRANT ALL ON public.mensagens TO authenticated;
GRANT ALL ON public.mensagens TO service_role;
