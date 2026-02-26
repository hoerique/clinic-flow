import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function saveMessage(numeroWa: string, role: 'user' | 'assistant', content: string, pushName: string = '') {
    const { error } = await supabase
        .from('mensagens')
        .insert([{
            numero_wa: numeroWa,
            corpo: content,
            tipo: role === 'user' ? 'entrada' : 'saida',
            paciente_nome: pushName
        }]);

    if (error) console.error('Error saving message to Supabase:', error);
}

export async function getConversationHistory(numeroWa: string) {
    const { data, error } = await supabase
        .from('mensagens')
        .select('corpo, tipo')
        .eq('numero_wa', numeroWa)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching history:', error);
        return [];
    }

    // Retornar na ordem correta (mais antiga para mais recente)
    return data.reverse().map(m => ({
        role: m.tipo === 'entrada' ? 'user' : 'assistant',
        content: m.corpo
    }));
}
