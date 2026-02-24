from fastapi import FastAPI, HTTPException, Request
from orchestrator import orchestrator, OrchestratorRequest, OrchestratorResponse
from whatsapp_service import whatsapp_service
import uvicorn
import os
import json
import httpx
import re
from datetime import datetime

app = FastAPI(title="CRM IA Orchestrator API")

# Supabase Configs
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")

async def save_message_to_db(number: str, text: str, tipo: str, name: str = None):
    url = f"{SUPABASE_URL}/rest/v1/mensagens"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    payload = {
        "numero_wa": number,
        "corpo": text,
        "tipo": tipo,
        "paciente_nome": name,
        "created_at": datetime.now().isoformat()
    }
    async with httpx.AsyncClient() as client:
        await client.post(url, json=payload, headers=headers)

async def get_active_agent():
    url = f"{SUPABASE_URL}/rest/v1/ai_agents?ativo=eq.true&select=*"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code == 200:
            agents = response.json()
            return agents[0] if agents else None
    return None

async def fetch_message_history(number: str, limit: int = 10):
    """
    Busca as últimas mensagens trocadas com um número específico.
    """
    url = f"{SUPABASE_URL}/rest/v1/mensagens?numero_wa=eq.{number}&order=created_at.desc&limit={limit}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                messages = response.json()
                # Inverter para que a ordem seja cronológica (mais antiga primeiro)
                return sorted(messages, key=lambda x: x.get('created_at', ''))
            return []
        except Exception as e:
            print(f"Erro ao buscar histórico: {e}")
            return []

@app.get("/health")
async def health():
    return {"status": "ok", "service": "crm-orchestrator"}

@app.post("/orchestrate", response_model=OrchestratorResponse)
async def process_message(request: OrchestratorRequest):
    try:
        response = await orchestrator.process(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orchestrate-webhook")
async def orchestrate_webhook_forward(request: Request):
    """
    Endpoint para receber o encaminhamento da Supabase Edge Function.
    Evita redundância de salvar no banco, pois a Edge Function já salvou.
    Apenas processa a resposta da IA.
    """
    try:
        data = await request.json()
        print(f"--- [FORWARD RECEIVED] ---\n{json.dumps(data, indent=2)}")
        
        # 1. Extrair de forma resiliente os dados da mensagem
        # O Edge Function manda o objeto Uazapi original
        message_data = data.get("message", {})
        chat_data = data.get("chat", {})
        
        number = chat_data.get("phone") or message_data.get("sender_pn") or data.get("from")
        text = message_data.get("text") or message_data.get("content") or data.get("text")
        sender_name = chat_data.get("name") or message_data.get("senderName") or data.get("pushName")
        
        if not number or not text:
            print("❌ Dados incompletos no forward:", {"number": number, "text": text})
            return {"status": "ignored", "reason": "Missing number or text"}

        # Limpar o número (remover @s.whatsapp.net se houver ou qualquer caractere não numérico)
        clean_number = re.sub(r'\D', '', number.split("@")[0])

        # 2. Buscar histórico de mensagens
        history = await fetch_message_history(clean_number)
        history_formatted = [
            {"role": "user" if m.get("tipo") == "entrada" else "assistant", "content": m.get("corpo")}
            for m in history
        ]

        # 3. Buscar agente ativo
        agent = await get_active_agent()
        if not agent:
            print("⚠️ Nenhum agente ativo configurado.")
            return {"status": "no_agent"}

        # 4. Processar com o Orquestrador
        orch_request = OrchestratorRequest(
            message=text,
            context={
                "number": clean_number, 
                "name": sender_name,
                "history": history_formatted
            },
            variables={
                "provider": agent.get("provider", "openai"),
                "model": agent.get("model", "gpt-4o"),
                "tom": agent.get("tom_de_comunicacao"),
                "regras_negocio": agent.get("regras_de_negocio"),
                "objetivo_agente": agent.get("objetivo_agente"),
                "tools": agent.get("tools", [])
            }
        )
        
        orch_response = await orchestrator.process(orch_request)
        
        # 5. Salvar resposta no banco
        await save_message_to_db(clean_number, orch_response.resposta_usuario, "saida", "Sistema")

        # 6. Enviar resposta via WhatsApp
        result = await whatsapp_service.send_text(clean_number, orch_response.resposta_usuario)
        print(f"✅ Resposta enviada para {clean_number}: {orch_response.resposta_usuario[:50]}...")
        
        return {"status": "processed", "response": orch_response.resposta_usuario, "whatsapp_result": result}
    except Exception as e:
        print(f"❌ Erro no orchestrate-webhook: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.post("/webhook/wasap")
async def wasap_webhook(request: Request):
    try:
        data = await request.json()
        print(f"--- [WEBHOOK RECEIVED] ---\n{json.dumps(data, indent=2)}")
        
        # 1. Extrair dados da mensagem (Formato Uazapi)
        # O formato pode variar, mas geralmente o número vem em 'data' ou 'from'
        # e o texto em 'text' ou 'body'.
        message_data = data.get("data", data)
        number = message_data.get("from") or message_data.get("remoteJid") or message_data.get("number")
        text = message_data.get("text") or message_data.get("body") or message_data.get("message", {}).get("conversation")
        sender_name = message_data.get("pushName") or message_data.get("name")
        
        if not number or not text:
            return {"status": "ignored", "reason": "No number or text found"}

        # Limpar o número (remover @s.whatsapp.net se houver)
        clean_number = number.split("@")[0]

        # 2. Salvar mensagem de entrada no banco
        await save_message_to_db(clean_number, text, "entrada", sender_name)

        # 3. Buscar agente ativo
        agent = await get_active_agent()
        if not agent:
            print("Nenhum agente ativo encontrado para responder.")
            return {"status": "no_agent"}

        # 4. Processar com o Orquestrador
        orch_request = OrchestratorRequest(
            message=text,
            context={"number": clean_number, "name": sender_name},
            variables={
                "provider": agent.get("provider", "openai"),
                "model": agent.get("model", "gpt-4o"),
                "tom": agent.get("tom_de_comunicacao"),
                "regras_negocio": agent.get("regras_de_negocio"),
                "objetivo_agente": agent.get("objetivo_agente"),
                "tools": agent.get("tools", [])
            }
        )
        
        orch_response = await orchestrator.process(orch_request)
        
        # 5. Salvar resposta no banco
        await save_message_to_db(clean_number, orch_response.resposta_usuario, "saida", "Sistema")

        # 6. Enviar resposta via WhatsApp
        await whatsapp_service.send_text(clean_number, orch_response.resposta_usuario)
        
        return {"status": "processed", "response": orch_response.resposta_usuario}
    except Exception as e:
        print(f"Erro no processamento do webhook: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)
