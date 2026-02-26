import { getApiConfigs } from './configService.js';

export async function sendWhatsAppMessage(numeroWa: string, text: string) {
    const config = await getApiConfigs();
    if (!config || !config.whatsapp_url || !config.uzapi_token || !config.whatsapp_instance) {
        console.error('Uzapi config missing');
        return false;
    }

    const url = `${config.whatsapp_url}/message/sendText/${config.whatsapp_instance}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.uzapi_token
            },
            body: JSON.stringify({
                number: numeroWa,
                text: text
            })
        });

        const data = await response.json();
        console.log('Uzapi push response:', data);
        return response.ok;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return false;
    }
}
