import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
    chat?: {
        phone?: string
        name?: string
    }
    message?: {
        text?: string
        content?: string
        sender_pn?: string
        senderName?: string
        messageTimestamp?: number
    }
    from?: string
    text?: string
    pushName?: string
    timestamp?: number
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. VALIDAR VARIÁVEIS DE AMBIENTE
        const appUrl = Deno.env.get('APP_URL')
        const appServiceRole = Deno.env.get('APP_SERVICE_ROLE')

        if (!appUrl || !appServiceRole) {
            console.error("❌ ERRO CRÍTICO - Variáveis não configuradas:")
            console.error(`   APP_URL: ${appUrl ? '✅ Configurada' : '❌ FALTANDO'}`)
            console.error(`   APP_SERVICE_ROLE: ${appServiceRole ? '✅ Configurada' : '❌ FALTANDO'}`)

            return new Response(JSON.stringify({
                status: "error",
                message: "Variáveis de ambiente não configuradas",
                debug: {
                    hasAppUrl: !!appUrl,
                    hasAppServiceRole: !!appServiceRole
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            })
        }

        console.log(`✅ Variáveis configuradas:`)
        console.log(`   APP_URL: ${appUrl}`)
        console.log(`   APP_SERVICE_ROLE: ${appServiceRole.substring(0, 20)}...`)

        // 2. CRIAR CLIENTE SUPABASE
        const supabase = createClient(appUrl, appServiceRole)

        // 3. PARSEAR WEBHOOK
        const data: WhatsAppMessage = await req.json()
        console.log("📨 Webhook recebido")

        const from = data.chat?.phone || data.message?.sender_pn || data.from || ""
        const text = data.message?.text || data.message?.content || data.text || ""
        const pushName = data.chat?.name || data.message?.senderName || data.pushName || ""
        const timestamp = data.message?.messageTimestamp || Date.now()

        if (!from || !text) {
            console.warn("⚠️ Dados insuficientes na mensagem")
            return new Response(JSON.stringify({
                status: "ignored",
                reason: "No message content"
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        const cleanNumber = from.replace(/\D/g, '')
        const messageDate = new Date(timestamp)
        const dataHora = messageDate.toISOString()

        console.log(`📱 Número: ${cleanNumber}`)
        console.log(`📝 Mensagem: "${text.substring(0, 50)}..."`)

        // 4. VERIFICAR/CRIAR LEAD
        console.log(`🔍 Verificando lead para: ${cleanNumber}`)

        let pacienteId = null

        // Buscar paciente por telefone
        const { data: existingPacientes, error: searchError } = await supabase
            .from('pacientes')
            .select('id, nome')
            .eq('telefone', cleanNumber)
            .limit(1)

        if (searchError) {
            console.error("❌ Erro ao buscar paciente:", searchError)
        }

        if (existingPacientes && existingPacientes.length > 0) {
            pacienteId = existingPacientes[0].id
            console.log(`✅ Paciente existente encontrado: ${existingPacientes[0].nome} (${pacienteId})`)
        } else {
            // Criar novo lead
            console.log("🆕 Criando novo lead...")
            const { data: newLead, error: createError } = await supabase
                .from('pacientes')
                .insert({
                    nome: pushName || `Whatsapp ${cleanNumber.slice(-4)}`,
                    telefone: cleanNumber,
                    status: 'lead',
                    created_at: new Date().toISOString()
                })
                .select()
                .single()

            if (createError) {
                console.error("❌ Erro ao criar lead:", createError)
            } else {
                pacienteId = newLead.id
                console.log(`✅ Novo lead criado: ${pacienteId}`)
            }
        }

        // 5. SALVAR MENSAGEM NO BANCO
        console.log("💾 Tentando salvar mensagem no Supabase...")

        const { data: insertedData, error: insertError } = await supabase
            .from('mensagens')
            .insert({
                numero_wa: cleanNumber,
                corpo: text,
                tipo: 'entrada',
                paciente_nome: pushName || 'Unknown',
                paciente_id: pacienteId, // Link original patient/lead
                created_at: dataHora,
                processado: false,
            })
            .select()

        if (insertError) {
            console.error("❌ Erro ao salvar mensagem:", insertError)
            throw insertError
        }

        if (!insertedData || insertedData.length === 0) {
            throw new Error("Nenhum dado retornado do banco")
        }

        const messageId = insertedData[0].id
        console.log(`✅ Mensagem salva com ID: ${messageId}`)

        // 5. CHAMAR BACKEND (opcional)
        const backendUrl = Deno.env.get('BACKEND_URL')
        let aiTriggered = false

        if (backendUrl) {
            try {
                console.log(`🚀 Chamando: ${backendUrl}/ai/orchestrate-webhook`)

                const response = await fetch(`${backendUrl}/ai/orchestrate-webhook`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        numero_wa: cleanNumber,
                        corpo: text,
                        paciente_nome: pushName || 'Unknown',
                        message_id: messageId,
                        timestamp: dataHora
                    })
                })

                if (response.ok) {
                    console.log(`✅ IA disparada com sucesso`)
                    aiTriggered = true
                } else {
                    console.warn(`⚠️ Backend respondeu com ${response.status}`)
                }
            } catch (fetchError) {
                console.warn(`⚠️ Erro ao chamar backend (não crítico):`, fetchError.message)
            }
        } else {
            console.log("ℹ️ BACKEND_URL não configurada - IA não será disparada")
        }

        // 6. RESPONDER AO WEBHOOK
        return new Response(JSON.stringify({
            status: "success",
            message: `Mensagem de ${cleanNumber} salva`,
            message_id: messageId,
            ai_triggered: aiTriggered
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("❌ Erro geral:", error.message)

        return new Response(JSON.stringify({
            status: "error",
            error: error.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})