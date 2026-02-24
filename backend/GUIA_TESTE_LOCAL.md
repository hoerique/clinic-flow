# Guia de Teste Local — CRM IA + WhatsApp 🚀

Como você está rodando o backend em **localhost**, a Supabase Edge Function (que está na nuvem) não consegue "enxergar" o seu computador diretamente. Para resolver isso e testar agora mesmo, siga estes passos:

## 1. Exponha seu Localhost com o ngrok
Se não tiver o [ngrok](https://ngrok.com/) instalado, baixe-o. Ele criará um "tunel" seguro para o seu backend.

No terminal, rode:
```bash
ngrok http 8000
```

Ele vai gerar um link parecido com: `https://abcd-123.ngrok-free.app`

## 2. Configure a Variável na Supabase
Agora você precisa dizer para a Supabase enviar as mensagens para esse link do ngrok.

No terminal (onde você tem o Supabase CLI configurado):
```bash
supabase secrets set BACKEND_URL=https://abcd-123.ngrok-free.app
```
*(Substitua pela URL que o ngrok gerou)*

## 3. Certifique-se que o Backend está Ativo
No seu computador, rode o backend:
```bash
cd backend
python main.py
```

---

## O que vai acontecer agora?
1. O cliente manda mensagem no WhatsApp.
2. A **Skysolution/Uazapi** envia para a **Supabase Edge Function**.
3. A Edge Function salva no banco (isso já está funcionando como vi no seu print!).
4. A Edge Function envia os dados para o seu **link do ngrok**.
5. O seu **main.py** local recebe, busca o histórico de 10 mensagens, pergunta para a IA e manda a resposta de volta via WhatsApp.

### "Devo subir para Vercel ou VPS?"
Sim! Para o sistema ficar 24h online sem depender do seu computador ligado, o ideal é:
- **VPS (Recomendado)**: Como você usa Python/FastAPI, uma VPS barata (DigitalOcean, Linode) é o ideal.
- **Vercel**: Funciona bem para o Frontend, mas para o Backend FastAPI você precisa configurar como Serverless Functions (o que às vezes tem limites de tempo de execução para IAs).

Se precisar de ajuda para subir o Docker na VPS, me avise!
