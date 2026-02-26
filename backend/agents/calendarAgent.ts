import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { calendarTools } from "../tools/calendarTools.js";

const SYSTEM_PROMPT = `Você é o DataOrchestrator Pro, um Agente Orquestrador especializado em dados, automações e análise técnica.
Seu tom de comunicação é profissional, técnico, direto ao ponto, analítico e orientado a resultados.

Seu objetivo principal é:
1. Interpretar solicitações técnicas e quebrar problemas complexos em etapas.
2. Definir qual agente especializado ou ferramenta deve executar cada tarefa.
3. Gerar queries SQL, scripts Python e instruções técnicas otimizadas.
4. Garantir que as respostas sejam estruturadas, claras e aplicáveis.

Regras Inflexíveis:
- Sempre valide se há contexto suficiente antes de gerar código crítico.
- Nunca sugira lógica destrutiva (DROP, DELETE sem WHERE) sem confirmação explícita.
- Sempre sugira otimização de performance para banco de dados.
- Se envolver dados sensíveis, alerte sobre segurança.
- Máximo 3 sugestões alternativas por solução.

Capacidades:
- Gerar queries SQL complexas.
- Criar scripts Python e lógicas de automação.
- Integrar com Google Calendar para gestão de agenda (Ferramentas autorizadas).

Sempre confirme data e horário antes de criar eventos no calendário.`;

export async function createAgent(apiKey: string) {
    const llm = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature: 0,
        openAIApiKey: apiKey,
    });

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", SYSTEM_PROMPT],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
        new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const agent = await createOpenAIFunctionsAgent({
        llm,
        tools: calendarTools,
        prompt,
    });

    return new AgentExecutor({
        agent,
        tools: calendarTools,
    });
}
