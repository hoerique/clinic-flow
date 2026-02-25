-- Migration: Create profiles and user_invitations tables

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT,
    email TEXT,
    perfil TEXT NOT NULL DEFAULT 'Usuario', -- Administrador, Recepcionista, Profissional, Usuario
    status TEXT NOT NULL DEFAULT 'ativo', -- ativo, inativo
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS no profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.profiles;
CREATE POLICY "Administradores podem ver todos os perfis" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND perfil = 'Administrador'
        )
    );

DROP POLICY IF EXISTS "Administradores podem atualizar todos os perfis" ON public.profiles;
CREATE POLICY "Administradores podem atualizar todos os perfis" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND perfil = 'Administrador'
        )
    );

DROP POLICY IF EXISTS "Administradores podem inserir novos perfis" ON public.profiles;
CREATE POLICY "Administradores podem inserir novos perfis" ON public.profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND perfil = 'Administrador'
        )
    );

-- 2. User Invitations Table
CREATE TABLE IF NOT EXISTS public.user_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role TEXT NOT NULL, -- Administrador, Recepcionista, Profissional, Usuario
    status TEXT NOT NULL DEFAULT 'pendente', -- pendente, aceito, expirado
    invited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Habilitar RLS no user_invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Políticas para user_invitations
DROP POLICY IF EXISTS "Administradores podem gerenciar convites" ON public.user_invitations;
CREATE POLICY "Administradores podem gerenciar convites" ON public.user_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND perfil = 'Administrador'
        )
    );

-- 3. Trigger para criar perfil automaticamente ao registrar (opcional, mas boa prática)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nome, email, perfil)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'nome', NEW.email, COALESCE(NEW.raw_user_meta_data->>'perfil', 'Usuario'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger logic (commented out as it might conflict with existing flows if not careful)
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
