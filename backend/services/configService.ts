import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getApiConfigs() {
    const { data, error } = await supabase
        .from('api_configs')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        console.error('Error fetching API configs:', error);
        return null;
    }
    return data;
}
