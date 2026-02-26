import { Router } from 'express';
import { createAgent } from '../agents/calendarAgent.js';
import { getConversationHistory, saveMessage } from '../memory/persistentMemory.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';
import { getApiConfigs } from '../services/configService.js';
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const router = Router();

// Endpoint chamado pela Supabase Function após salvar a mensagem
router.post('/orchestrate-webhook', async (req, res) => {
    console.log('📥 Recebido gatilho de orquestração:', JSON.stringify(req.body, null, 2));
    const { numero_wa, corpo, paciente_nome } = req.body;

    if (!numero_wa || !corpo) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        // 0. Buscar Configurações de API do Supabase
        const configs = await getApiConfigs();
        if (!configs || !configs.openai_key) {
            console.error('❌ OpenAI Key não encontrada na tabela api_configs');
            return res.status(500).json({ error: 'API Configuration missing' });
        }

        console.log(`🤖 Orquestrando resposta para: ${numero_wa}`);

        // 1. Recuperar Histórico Real da tabela 'mensagens'
        const historyData = await getConversationHistory(numero_wa);
        const history = historyData.map((m: any) =>
            m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
        );

        // 2. Executar Agente DataOrchestrator Pro com a chave dinâmica
        const agent = await createAgent(configs.openai_key);
        const result = await agent.invoke({
            input: corpo,
            chat_history: history,
        });

        const aiResponse = result.output;

        // 3. Enviar Resposta via Uzapi (Push)
        const pushSent = await sendWhatsAppMessage(numero_wa, aiResponse);

        if (pushSent) {
            // 4. Salvar resposta no Supabase como 'saida'
            await saveMessage(numero_wa, 'assistant', aiResponse, paciente_nome);
            res.json({ status: 'success', response: aiResponse });
        } else {
            res.status(500).json({ error: 'Failed to send WhatsApp message' });
        }

    } catch (error) {
        console.error('Orchestration Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
