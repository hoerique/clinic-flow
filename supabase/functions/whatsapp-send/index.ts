import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('APP_URL')
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('APP_SERVICE_ROLE')

        console.log('Environment Check:', {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseServiceRoleKey
        })

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            throw new Error(`Missing environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseServiceRoleKey}`)
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

        const { numero_wa, corpo } = await req.json()

        if (!numero_wa || !corpo) {
            console.error('Missing numero_wa or corpo:', { numero_wa, corpo })
            throw new Error('Missing numero_wa or corpo')
        }

        // 1. Get API configs
        const { data: config, error: configError } = await supabase
            .from('api_configs')
            .select('whatsapp_url, whatsapp_instance, uzapi_token')
            .eq('id', 1)
            .single()

        if (configError || !config) {
            console.error('Config Error:', configError)
            throw new Error('Failed to fetch WhatsApp configuration: ' + (configError?.message || 'Not found'))
        }

        if (!config.whatsapp_url || !config.whatsapp_instance || !config.uzapi_token) {
            console.error('Incomplete Config:', config)
            throw new Error('WhatsApp configuration is incomplete (URL, Instance or Token missing)')
        }

        // Limpar número WhatsApp (remover caracteres especiais)
        const numeroLimpo = numero_wa.replace(/\D/g, '')
        console.log('Número formatado:', numeroLimpo)

        // 2. Send message via UZAPI
        // Ensure no double slashes and trim whitespace
        const baseUrl = config.whatsapp_url.trim().replace(/\/$/, '')
        const instanceId = config.whatsapp_instance.trim()
        const url = `${baseUrl}/message/sendText/${instanceId}`

        console.log('Enviando para:', url)

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.uzapi_token.trim()
            },
            body: JSON.stringify({
                number: numeroLimpo,
                text: corpo
            })
        })

        let result
        try {
            result = await response.json()
        } catch (e) {
            const text = await response.text()
            console.error('Failed to parse UZAPI response as JSON:', text)
            throw new Error(`UZAPI API responded with status ${response.status}: ${text.substring(0, 100)}`)
        }

        if (!response.ok) {
            console.error('UZAPI API Error:', result)
            throw new Error(result.message || result.error || 'Failed to send message via UZAPI')
        }

        // 3. Try to find paciente_id to link the message
        const { data: paciente } = await supabase
            .from('pacientes')
            .select('id')
            .eq('telefone', numero_wa)
            .maybeSingle()

        // 4. Save message to database
        const { error: insertError } = await supabase.from('mensagens').insert({
            numero_wa: numero_wa,
            corpo: corpo,
            tipo: 'saida',
            created_at: new Date().toISOString(),
            processado: true,
            paciente_id: paciente?.id || null
        })

        if (insertError) {
            console.error('Database Insert Error:', insertError)
        }

        return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Function Error:', error.message)
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})