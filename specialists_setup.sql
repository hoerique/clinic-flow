-- =============================================
-- CLINIC FLOW - Especialistas de IA
-- =============================================

-- Tabela: especialistas
CREATE TABLE IF NOT EXISTS public.especialistas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nome TEXT NOT NULL,
  foto_url TEXT,
  area_especialidade TEXT,
  prompt_sistema TEXT NOT NULL,
  descricao TEXT,
  documento_url TEXT,
  ativo BOOLEAN DEFAULT TRUE
);

-- Migração: Garantir que as colunas necessárias existam
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='especialistas' AND column_name='documento_url') THEN
        ALTER TABLE public.especialistas ADD COLUMN documento_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='especialistas' AND column_name='conhecimento_base') THEN
        ALTER TABLE public.especialistas ADD COLUMN conhecimento_base TEXT;
    END IF;
END $$;

-- =============================================
-- STORAGE: specialist-documents
-- =============================================

-- Criar bucket para documentos se não existir (via SQL para controle)
-- Nota: Geralmente buckets são criados via UI ou API, mas podemos definir políticas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('specialist-documents', 'specialist-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'specialist-documents');

DROP POLICY IF EXISTS "Allow Upload" ON storage.objects;
CREATE POLICY "Allow Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'specialist-documents');

DROP POLICY IF EXISTS "Allow Update" ON storage.objects;
CREATE POLICY "Allow Update" ON storage.objects FOR UPDATE USING (bucket_id = 'specialist-documents');

DROP POLICY IF EXISTS "Allow Delete" ON storage.objects;
CREATE POLICY "Allow Delete" ON storage.objects FOR DELETE USING (bucket_id = 'specialist-documents');

-- Habilitar RLS
ALTER TABLE public.especialistas ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
DROP POLICY IF EXISTS "Allow all for anon" ON public.especialistas;
CREATE POLICY "Allow all for anon" ON public.especialistas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Dados iniciais (Exemplos solicitados)
INSERT INTO public.especialistas (nome, area_especialidade, prompt_sistema, descricao) VALUES
  ('Pedro Sobral', 'Tráfego Pago', 'Você é Pedro Sobral, o maior especialista em tráfego pago do Brasil. Seu tom é direto, energético e focado em métricas. Você usa gírias de marketing digital e sempre foca em ROI e otimização de campanhas.', 'Especialista em anúncios online e estratégias de vendas.'),
  ('Thiago Finch', 'Marketing e Lifestyle', 'Você é Thiago Finch, um empreendedor de elite focado em lifestyle e marketing digital de alta conversão. Seu tom é sofisticado, ambicioso e inspirador. Você foca em liberdade, design de vida e estratégias de lançamentos milionários.', 'Especialista em lançamentos e estilo de vida de alta performance.')
ON CONFLICT DO NOTHING;
