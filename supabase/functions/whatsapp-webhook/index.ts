import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('APP_URL') ?? '',
            Deno.env.get('APP_SERVICE_ROLE') ?? ''
        )

        const data = await req.json()
        console.log("Webhook received:", JSON.stringify(data, null, 2))

        // 1. Extrair dados da mensagem (Formato Uazapi)
        const from = data.chat?.phone || data.message?.sender_pn || data.from || ""
        const text = data.message?.text || data.message?.content || data.text || ""
        const pushName = data.chat?.name || data.message?.senderName || data.pushName || ""
        const timestamp = data.message?.messageTimestamp || Date.now()

        if (!from || !text) {
            return new Response(JSON.stringify({ status: "ignored", reason: "No message content" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 2. Limpar número de telefone
        const cleanNumber = from.replace(/\D/g, '')

        // 3. Converter timestamp para data/hora
        const messageDate = new Date(timestamp)
        const dataHora = messageDate.toISOString()

        console.log(`📱 Salvando: ${cleanNumber} às ${dataHora}`)

        // 4. Salvar na tabela mensagens COM AS COLUNAS CORRETAS
        const { data: insertedData, error: insertError } = await supabase
            .from('mensagens')
            .insert({
                numero_wa: cleanNumber,
                corpo: text,
                tipo: 'entrada',
                paciente_nome: pushName,
                created_at: dataHora,
            })
            .select()

        if (insertError) {
            console.error("❌ Error inserting message:", insertError)
            throw insertError
        }

        console.log("✅ Message saved successfully:", insertedData)

        // 5. Chamar o Orquestrador de IA (Node.js na Vercel)
        const backendUrl = Deno.env.get('BACKEND_URL')

        if (backendUrl) {
            try {
                // Notifica o backend para processar a resposta do agente
                await fetch(`${backendUrl}/ai/orchestrate-webhook`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        numero_wa: cleanNumber,
                        corpo: text,
                        paciente_nome: pushName
                    })
                })
                console.log(`🚀 Gatilho enviado para o backend: ${backendUrl}`)
            } catch (e) {
                console.error("⚠️ Erro ao chamar orquestrador de IA:", e)
            }
        } else {
            console.warn("⚠️ BACKEND_URL não configurado nos Secrets do Supabase.")
        }

        return new Response(JSON.stringify({
            status: "success",
            message: `Message from ${cleanNumber} saved`,
            timestamp: dataHora
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("❌ Webhook error:", error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})