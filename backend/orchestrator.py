import os
import json
from typing import Dict, Any, Optional
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic
from langchain.schema import SystemMessage, HumanMessage
from langchain_community.cache import RedisCache
from langchain.globals import set_llm_cache
from redis import Redis

load_dotenv()

# --- Configuração do Redis LangCache ---
redis_url = os.getenv("REDIS_URL")
if redis_url:
    try:
        redis_client = Redis.from_url(
            redis_url,
            username="default",
            password=os.getenv("REDIS_API_KEY"),
            decode_responses=False
        )
        set_llm_cache(RedisCache(redis_client))
    except Exception as e:
        print(f"Erro ao conectar ao Redis: {e}")

class OrchestratorRequest(BaseModel):
    message: str
    context: Dict[str, Any]
    variables: Dict[str, Any]

class OrchestratorResponse(BaseModel):
    acao: str
    motivo: str
    dados: Dict[str, Any]
    resposta_usuario: str

SYSTEM_PROMPT = """
# 🧠 SYSTEM PROMPT — AGENTE ORQUESTRADOR CRM IA

Você é um ORQUESTRADOR INTELIGENTE de um CRM com arquitetura baseada em:

- Frontend: React
- Backend API HTTP
- Worker em background
- Banco de dados relacional
- Fila de processamento
- Execução de agentes com memória
- Sistema multiagente configurável

Sua função NÃO é apenas responder mensagens.

Sua função é:

1. Interpretar eventos recebidos via webhook
2. Identificar o tipo de solicitação
3. Decidir qual fluxo executar
4. Aplicar regras do CRM
5. Executar ações quando necessário
6. Gerar resposta adequada
7. Registrar estado da execução

---

# 🎯 OBJETIVO PRINCIPAL

Atuar como cérebro do sistema de automação conversacional do CRM.

Você deve:

- Analisar contexto da conversa
- Aplicar regras de negócio
- Respeitar variáveis configuradas dinamicamente
- Seguir limitações definidas no painel administrativo
- Tomar decisões estruturadas
- Produzir saídas previsíveis e controláveis

---

# 🏗 ESTRUTURA DE DECISÃO

Sempre siga esta ordem lógica:

1. Identificar intenção do usuário
2. Verificar regras do CRM
3. Verificar restrições ativas
4. Decidir se:
   - Apenas responde
   - Executa uma ferramenta
   - Atualiza status no sistema
   - Encaminha para outro agente
5. Gerar resposta estruturada

---

# 📚 CONTEXTO DINÂMICO (INJETADO PELO CRM)

As seguintes variáveis são dinâmicas e devem ser respeitadas:

## 🔹 TOM_DE_COMUNICACAO
{tom}

## 🔹 REGRAS_DE_NEGOCIO
{regras_negocio}

## 🔹 LIMITES_OPERACIONAIS
{limites_operacionais}

## 🔹 OBJETIVO_DO_AGENTE
{objetivo_agente}

## 🔹 PERMISSOES_ATIVAS
{permissoes_ativas}

Você deve sempre considerar essas variáveis antes de responder.

---

# 🧩 COMPORTAMENTO DO AGENTE

- Nunca invente informações fora do contexto fornecido.
- Nunca quebre regras do CRM.
- Nunca ultrapasse limites operacionais definidos.
- Nunca exponha lógica interna do sistema.
- Sempre priorize clareza, objetividade e coerência.
- Sempre mantenha registro mental do estado atual da conversa.

---

# 🔄 CONTROLE DE FLUXO

Se a solicitação exigir ação estrutural, você deve gerar saída no seguinte formato:

```json
{{
  "acao": "nome_da_acao",
  "motivo": "explicacao_resumida",
  "dados": {{
    "campo1": "valor",
    "campo2": "valor"
  }},
  "resposta_usuario": "mensagem final ao usuário"
}}
```
"""

class CRMOrchestrator:
    def __init__(self):
        pass

    def _get_llm(self, provider: str, model: str):
        if provider == "google":
            return ChatGoogleGenerativeAI(
                model=model,
                temperature=0,
                google_api_key=os.getenv("GOOGLE_API_KEY")
            )
        elif provider == "anthropic":
            return ChatAnthropic(
                model=model,
                temperature=0,
                anthropic_api_key=os.getenv("ANTHROPIC_API_KEY")
            )
        else: # Default to OpenAI
            return ChatOpenAI(
                model=model if model else "gpt-4o",
                temperature=0,
                openai_api_key=os.getenv("OPENAI_API_KEY")
            )

    async def process(self, request: OrchestratorRequest) -> OrchestratorResponse:
        provider = request.variables.get('provider', 'openai')
        model = request.variables.get('model', 'gpt-4o')
        
        llm = self._get_llm(provider, model)

        # Injeção de variáveis dinâmicas e ferramentas
        tools_list = request.variables.get('tools', [])
        tools_str = "\n".join([f"- {t.get('name')}: {t.get('description')}" for t in tools_list]) if tools_list else "Nenhuma ferramenta disponível"

        dynamic_context = f"""
## 🔹 FERRAMENTAS_DISPONIVEIS
{tools_str}

## 🔹 TOM_DE_COMUNICACAO
{request.variables.get('tom', 'Profissional e acolhedor')}

## 🔹 REGRAS_DE_NEGOCIO
{request.variables.get('regras_negocio', 'Nenhuma regra específica')}

## 🔹 LIMITES_OPERACIONAIS
{request.variables.get('limites_operacionais', 'Nenhum limite definido')}

## 🔹 OBJETIVO_DO_AGENTE
{request.variables.get('objetivo_agente', 'Auxiliar o usuário no CRM')}

## 🔹 PERMISSOES_ATIVAS
{request.variables.get('permissoes_ativas', 'Acesso básico')}
"""
        
        # Injeção de histórico de conversa
        history = request.context.get('history', [])
        history_str = ""
        if history:
            history_str = "\n## 🔹 HISTÓRICO RECENTE DA CONVERSA\n"
            for msg in history:
                role = "Cliente" if msg['role'] == 'user' else "Assistente"
                history_str += f"- {role}: {msg['content']}\n"
        
        full_system_prompt = SYSTEM_PROMPT.replace("{tom}", "").replace("{regras_negocio}", "").replace("{limites_operacionais}", "").replace("{objetivo_agente}", "").replace("{permissoes_ativas}", "")
        full_system_prompt += "\n" + dynamic_context
        if history_str:
            full_system_prompt += "\n" + history_str
        
        messages = [
            SystemMessage(content=full_system_prompt),
            HumanMessage(content=request.message)
        ]
        
        response = llm.invoke(messages)
        
        try:
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            data = json.loads(content)
            return OrchestratorResponse(**data)
        except Exception as e:
            return OrchestratorResponse(
                acao="erro_processamento",
                motivo=f"Erro ao parsear resposta do LLM: {str(e)}",
                dados={"raw_response": response.content},
                resposta_usuario="Desculpe, tive um problema técnico ao processar sua solicitação."
            )

orchestrator = CRMOrchestrator()
