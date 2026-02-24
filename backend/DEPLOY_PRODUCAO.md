# Guia de Implantação em Produção (VPS) 🌐

Para deixar seu sistema rodando 24h por dia, o caminho mais profissional é usar uma VPS (Virtual Private Server).

## 1. Requisitos na VPS
- **Docker** e **Docker Compose** instalados.
- Um domínio ou IP fixo.

## 2. Passo a Passo de Deploy
1. **Copie os arquivos** (ou use git clone) para a sua VPS.
2. **Configure o `.env`**: Na VPS, crie o arquivo `.env` com todas as chaves (Supabase, OpenAI, etc.).
3. **Suba os containers**:
   ```bash
   docker-compose up -d --build
   ```
   *O parâmetro `-d` garante que rode em background.*

## 3. Configure o Link no Supabase
Com o backend rodando na VPS, sua URL não será mais o localhost do ngrok, mas sim o IP/Domínio da VPS:
`http://IP-DA-SUA-VPS:8000`

No terminal:
```bash
supabase secrets set BACKEND_URL=http://IP-DA-SUA-VPS:8000
```

## 4. Próximos Níveis (Opcional)
- **Nginx & SSL (HTTPS)**: Para maior segurança, coloque um Nginx na frente com Certbot (SSL gratuito).
- **Vercel (Frontend)**: O frontend pode ser hospedado na Vercel (grátis) e apontar para esse backend na VPS.

---
Seu sistema agora está pronto para escalar e atender pacientes a qualquer hora! 🚀
