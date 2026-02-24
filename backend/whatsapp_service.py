import httpx
import os
from typing import Optional, Dict, Any

class WhatsAppService:
    def __init__(self):
        # Estes serão carregados dinamicamente no momento do envio para garantir que pegamos as configs mais recentes do DB
        self.api_url = None
        self.token = None
        self.instance = None

    async def _load_configs(self):
        """
        Carrega as configurações da API do WhatsApp do Supabase (id=1)
        """
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        async with httpx.AsyncClient() as client:
            headers = {
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}"
            }
            # O Supabase REST API endpoint para api_configs
            url = f"{supabase_url}/rest/v1/api_configs?id=eq.1&select=*"
            response = await client.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data:
                    config = data[0]
                    self.api_url = config.get("whatsapp_url")
                    self.instance = config.get("whatsapp_instance")
                    # Tenta pegar o token do novo campo uzapi_token, se não houver usa a env var
                    self.token = config.get("uzapi_token") or os.getenv("UAZAPI_TOKEN")

    async def send_text(
        self, 
        number: str, 
        text: str, 
        link_preview: bool = True,
        delay: int = 1000
    ) -> Dict[str, Any]:
        """
        Envia uma mensagem de texto via Uazapi
        """
        await self._load_configs()
        
        if not self.api_url or not self.instance:
            return {"status": "error", "message": "Configurações de WhatsApp não encontradas"}

        # Formato padrão SkySolution/Uazapi: /message/sendText?instance=ID
        url = f"{self.api_url}/message/sendText?instance={self.instance}"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
        
        payload = {
            "number": number,
            "text": text,
            "linkPreview": link_preview,
            "delay": delay
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                return response.json()
            except Exception as e:
                return {"status": "error", "message": str(e)}

whatsapp_service = WhatsAppService()
