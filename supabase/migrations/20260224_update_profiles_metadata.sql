-- Migration: Add metadata to invitations and clinical fields to profiles

-- 1. Update user_invitations to include metadata
ALTER TABLE public.user_invitations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Update profiles to include clinical fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='telefone') THEN
        ALTER TABLE public.profiles ADD COLUMN telefone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='especialidade') THEN
        ALTER TABLE public.profiles ADD COLUMN especialidade TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='cor') THEN
        ALTER TABLE public.profiles ADD COLUMN cor TEXT DEFAULT '#0ea5e9';
    END IF;
END $$;

-- 3. Trigger setup to also insert into public.profissionais if perfil is 'Profissional'
CREATE OR REPLACE FUNCTION public.handle_new_user_with_profissional()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into profiles
    INSERT INTO public.profiles (id, nome, email, perfil, telefone, especialidade, cor)
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data->>'nome', 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'perfil', 'Usuario'),
        NEW.raw_user_meta_data->>'telefone',
        NEW.raw_user_meta_data->>'especialidade',
        COALESCE(NEW.raw_user_meta_data->>'cor', '#0ea5e9')
    );

    -- If role is Profissional, also insert into public.profissionais
    IF (NEW.raw_user_meta_data->>'perfil' = 'Profissional') THEN
        INSERT INTO public.profissionais (id, nome, email, telefone, especialidade, cor, ativo)
        VALUES (
            NEW.id, -- Use same ID as Auth/Profile
            NEW.raw_user_meta_data->>'nome',
            NEW.email,
            NEW.raw_user_meta_data->>'telefone',
            NEW.raw_user_meta_data->>'especialidade',
            COALESCE(NEW.raw_user_meta_data->>'cor', '#0ea5e9'),
            TRUE
        )
        ON CONFLICT (id) DO UPDATE SET
            nome = EXCLUDED.nome,
            telefone = EXCLUDED.telefone,
            especialidade = EXCLUDED.especialidade,
            cor = EXCLUDED.cor;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger (assuming we want to enable it now)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_profissional();
