-- =============================================
-- CLINIC FLOW - Setup completo do banco de dados
-- =============================================

-- 1. CRIAR TABELAS E ADICIONAR COLUNAS FALTANTES
-- =============================================

-- Tabela: pacientes
CREATE TABLE IF NOT EXISTS public.pacientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nome TEXT NOT NULL
);

-- Adicionar colunas se não existirem (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pacientes' AND column_name='cpf') THEN
        ALTER TABLE public.pacientes ADD COLUMN cpf TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pacientes' AND column_name='telefone') THEN
        ALTER TABLE public.pacientes ADD COLUMN telefone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pacientes' AND column_name='email') THEN
        ALTER TABLE public.pacientes ADD COLUMN email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pacientes' AND column_name='convenio') THEN
        ALTER TABLE public.pacientes ADD COLUMN convenio TEXT DEFAULT 'Particular';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pacientes' AND column_name='status') THEN
        ALTER TABLE public.pacientes ADD COLUMN status TEXT DEFAULT 'lead';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pacientes' AND column_name='tags') THEN
        ALTER TABLE public.pacientes ADD COLUMN tags TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pacientes' AND column_name='ultima_consulta') THEN
        ALTER TABLE public.pacientes ADD COLUMN ultima_consulta DATE;
    END IF;
    
    -- Remover restrição NOT NULL de clinica_id se ela existir
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pacientes' AND column_name='clinica_id') THEN
        ALTER TABLE public.pacientes ALTER COLUMN clinica_id DROP NOT NULL;
    END IF;
END $$;

-- Tabela: profissionais
CREATE TABLE IF NOT EXISTS public.profissionais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nome TEXT NOT NULL,
  especialidade TEXT,
  cor TEXT DEFAULT '#0ea5e9',
  email TEXT,
  telefone TEXT,
  ativo BOOLEAN DEFAULT TRUE
);

-- Tabela: agendamentos
CREATE TABLE IF NOT EXISTS public.agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES public.profissionais(id) ON DELETE CASCADE,
  data_hora TIMESTAMPTZ NOT NULL,
  duracao INTEGER DEFAULT 60,
  tipo TEXT DEFAULT 'Consulta',
  procedimento TEXT,
  duracao_slots INTEGER DEFAULT 2,
  status TEXT DEFAULT 'agendado',
  observacoes TEXT
);

-- Tabela: oportunidades (CRM)
CREATE TABLE IF NOT EXISTS public.oportunidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
  procedimento TEXT,
  valor NUMERIC(10,2) DEFAULT 0,
  probabilidade INTEGER DEFAULT 50,
  etapa TEXT DEFAULT 'avaliacao', -- avaliacao, orcamento, negociacao, aprovado, fechado, perdido
  data_previsao DATE
);

-- Tabela: movimentacoes (Financeiro)
CREATE TABLE IF NOT EXISTS public.movimentacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tipo TEXT NOT NULL, -- entrada, saida
  categoria TEXT,
  valor NUMERIC(10,2) NOT NULL,
  data DATE DEFAULT CURRENT_DATE,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  descricao TEXT,
  status TEXT DEFAULT 'pago' -- pago, pendente, vencido
);

-- Adicionar colunas se não existirem (idempotente para agendamentos)

-- Adicionar colunas se não existirem (idempotente para agendamentos)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='agendamentos' AND column_name='procedimento') THEN
        ALTER TABLE public.agendamentos ADD COLUMN procedimento TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='agendamentos' AND column_name='duracao_slots') THEN
        ALTER TABLE public.agendamentos ADD COLUMN duracao_slots INTEGER DEFAULT 2;
    END IF;
END $$;

-- 2. HABILITAR RLS
-- =============================================
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- 3. POLITICAS RLS
-- =============================================

-- Pacientes
DROP POLICY IF EXISTS "Allow all for anon" ON public.pacientes;
CREATE POLICY "Allow all for anon" ON public.pacientes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Profissionais
DROP POLICY IF EXISTS "Allow all for anon" ON public.profissionais;
CREATE POLICY "Allow all for anon" ON public.profissionais FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Agendamentos
DROP POLICY IF EXISTS "Allow all for anon" ON public.agendamentos;
CREATE POLICY "Allow all for anon" ON public.agendamentos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Oportunidades
ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON public.oportunidades;
CREATE POLICY "Allow all for anon" ON public.oportunidades FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Movimentacoes
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for anon" ON public.movimentacoes;
CREATE POLICY "Allow all for anon" ON public.movimentacoes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. DADOS DE EXEMPLO
-- =============================================
INSERT INTO public.profissionais (nome, especialidade, cor) VALUES
  ('Dra. Ana Paula', 'Clínica Geral', '#0ea5e9'),
  ('Dr. Carlos Silva', 'Dermatologia', '#8b5cf6'),
  ('Dra. Mariana Souza', 'Psicologia', '#10b981')
ON CONFLICT DO NOTHING;
