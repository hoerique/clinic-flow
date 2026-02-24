import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Save, Plus, Trash2, Bot, Settings2, ShieldCheck, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tool {
    name: string;
    description: string;
}

interface AgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    agent?: any;
}

const PROVIDERS = [
    { id: "openai", name: "OpenAI" },
    { id: "google", name: "Google (Gemini)" },
    { id: "anthropic", name: "Anthropic (Claude)" },
];

const MODELS: Record<string, { id: string; name: string }[]> = {
    openai: [
        // 🏆 Topo de linha
        { id: "gpt-5.2-pro", name: "🏆 GPT-5.2 Pro (Ponta/Precisão - ~$168/M)" },
        { id: "gpt-5.2", name: "🏆 GPT-5.2 (Agentes/Programação - ~$14/M)" },
        { id: "gpt-5-pro", name: "🏆 GPT-5 Pro (Precisão Extra - ~$120/M)" },
        { id: "gpt-5", name: "🏆 GPT-5 (Geração Avançada - ~$10/M)" },

        // ⚙️ Intermediários
        { id: "gpt-4o", name: "⚙️ GPT-4o (Multimodal/Equilibrado - ~$10/M)" },
        { id: "gpt-4.1", name: "⚙️ GPT-4.1 (Melhoria do GPT-4 - ~$8/M)" },

        // 📉 Leves / Custo-eficientes
        { id: "gpt-5-mini", name: "📉 GPT-5 Mini (Barato/Funcional - ~$2/M)" },
        { id: "gpt-4.1-mini", name: "📉 GPT-4.1 Mini (Custo-benefício - ~$1.60/M)" },
        { id: "gpt-4o-mini", name: "📉 GPT-4o Mini (Muito Rápido - ~$0.60/M)" },
        { id: "gpt-5-nano", name: "📉 GPT-5 Nano (Simples/Econômico - ~$0.40/M)" },
        { id: "gpt-4.1-nano", name: "📉 GPT-4.1 Nano (Light/Simples - ~$0.40/M)" },
    ],
    google: [
        // 🚀 Geração 3.0 e 3.1
        { id: "gemini-3.1-pro", name: "💎 Gemini 3.1 Pro (Web/Otimizado - Topo)" },
        { id: "gemini-3-pro", name: "💎 Gemini 3 Pro (Especialistas)" },
        { id: "gemini-3-deep-think", name: "💎 Gemini 3 Deep Think (Pensamento Profundo)" },
        { id: "gemini-3-flash", name: "⚡ Gemini 3 Flash (Velocidade/Eficiência)" },

        // 🚀 Geração 2.5
        { id: "gemini-2.5-pro", name: "💎 Gemini 2.5 Pro (Raciocínio Avançado)" },
        { id: "gemini-2.5-flash", name: "⚡ Gemini 2.5 Flash (Agentes Autônomos)" },
        { id: "gemini-2.5-flash-lite", name: "⚡ Gemini 2.5 Flash-Lite (Processamento em Massa)" },

        // 🚀 Geração 2.0
        { id: "gemini-2.0-pro", name: "💎 Gemini 2.0 Pro (Processamento Pesado)" },
        { id: "gemini-2.0-flash", name: "⚡ Gemini 2.0 Flash (Multimodal/Ação)" },
        { id: "gemini-2.0-flash-lite", name: "⚡ Gemini 2.0 Flash-Lite (Custo-benefício)" },

        // 🚀 Geração 1.5
        { id: "gemini-1.5-pro", name: "💎 Gemini 1.5 Pro (Contexto Massivo)" },
        { id: "gemini-1.5-flash", name: "⚡ Gemini 1.5 Flash (Rápido/Eficiente)" },
        { id: "gemini-1.5-flash-8b", name: "⚡ Gemini 1.5 Flash-8B (Econômico)" },

        // 🎨 Multimídia e Especializados
        { id: "veo-3.1", name: "🎬 Veo 3.1 (Geração de Vídeo Realista)" },
        { id: "lyria-3", name: "🎵 Lyria 3 (Criação Musical/Vocais)" },
        { id: "gemini-3-pro-image", name: "🖼️ Gemini 3 Pro Image (Renderização Superior)" },
        { id: "gemini-2.5-flash-image", name: "🖼️ Gemini 2.5 Flash Image (Edição de Alta Fidelidade)" }
    ],
    anthropic: [
        { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet (Equilibrado)" },
        { id: "claude-3-opus-20240229", name: "Claude 3 Opus (Poderoso)" },
        { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku (Compacto)" },
    ],
};

export function AgentModal({ isOpen, onClose, onSuccess, agent }: AgentModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: agent?.nome || "",
        objetivo_agente: agent?.objetivo_agente || "",
        tom_de_comunicacao: agent?.tom_de_comunicacao || "",
        regras_de_negocio: agent?.regras_de_negocio || "",
        limites_operacionais: agent?.limites_operacionais || "",
        permissoes_ativas: agent?.permissoes_ativas || "",
        provider: agent?.provider || "openai",
        model: agent?.model || "gpt-4o",
    });

    const [tools, setTools] = useState<Tool[]>(agent?.tools || []);

    // Sincroniza o estado interno quando o agente muda (ex: ao clicar em editar)
    useEffect(() => {
        if (isOpen) {
            setFormData({
                nome: agent?.nome || "",
                objetivo_agente: agent?.objetivo_agente || "",
                tom_de_comunicacao: agent?.tom_de_comunicacao || "",
                regras_de_negocio: agent?.regras_de_negocio || "",
                limites_operacionais: agent?.limites_operacionais || "",
                permissoes_ativas: agent?.permissoes_ativas || "",
                provider: agent?.provider || "openai",
                model: agent?.model || "gpt-4o",
            });
            setTools(agent?.tools || []);
        }
    }, [agent, isOpen]);

    // Atualiza o modelo padrão quando o provedor muda (apenas para novos agentes)
    useEffect(() => {
        if (!agent && formData.provider) {
            setFormData(prev => ({
                ...prev,
                model: MODELS[formData.provider][0].id
            }));
        }
    }, [formData.provider, agent]);

    const handleSave = async () => {
        if (!formData.nome || !formData.objetivo_agente) {
            toast.error("Nome e Objetivo são obrigatórios");
            return;
        }

        setLoading(true);
        try {
            const dataToSave = {
                ...formData,
                tools,
                updated_at: new Date().toISOString(),
            };

            if (agent?.id) {
                const { error: updateError } = await (supabase.from("ai_agents") as any)
                    .update(dataToSave)
                    .eq("id", agent.id);
                if (updateError) throw updateError;
                toast.success("Agente atualizado com sucesso!");
            } else {
                const { error: insertError } = await (supabase.from("ai_agents") as any)
                    .insert([dataToSave]);
                if (insertError) throw insertError;
                toast.success("Agente criado com sucesso!");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error("Erro ao salvar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const addTool = () => {
        setTools([...tools, { name: "", description: "" }]);
    };

    const removeTool = (index: number) => {
        setTools(tools.filter((_, i) => i !== index));
    };

    const updateTool = (index: number, field: keyof Tool, value: string) => {
        const newTools = [...tools];
        newTools[index][field] = value;
        setTools(newTools);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Cpu className="w-6 h-6 text-[hsl(var(--teal))]" />
                        {agent ? "Configurar Agente de IA" : "Criar Novo Agente Orquestrador"}
                    </DialogTitle>
                    <DialogDescription>
                        Defina a personalidade, o cérebro (LLM) e as ferramentas que o seu agente utilizará.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 py-4">
                    {/* Seção 1: Identificação e Personalidade */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                            <Bot className="w-4 h-4" />
                            Identificação e Personalidade
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do Agente</Label>
                                <Input
                                    id="nome"
                                    placeholder="Ex: Assistente de Recepção"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tom">Tom de Comunicação</Label>
                                <Input
                                    id="tom"
                                    placeholder="Ex: Profissional, acolhedor e direto"
                                    value={formData.tom_de_comunicacao}
                                    onChange={(e) => setFormData({ ...formData, tom_de_comunicacao: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="objetivo">Objetivo Principal (Instrução Mestra)</Label>
                            <Textarea
                                id="objetivo"
                                className="min-h-[100px]"
                                placeholder="Descreva exatamente o que este agente deve fazer. Ex: Seu objetivo é agendar consultas para pacientes novos, verificando a disponibilidade no sistema..."
                                value={formData.objetivo_agente}
                                onChange={(e) => setFormData({ ...formData, objetivo_agente: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Seção 2: Cérebro da IA */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                            <Zap className="w-4 h-4" />
                            Cérebro e Modelo de IA
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Provedor (LLM)</Label>
                                <Select
                                    value={formData.provider}
                                    onValueChange={(value) => setFormData({ ...formData, provider: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o provedor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROVIDERS.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Modelo Específico</Label>
                                <Select
                                    value={formData.model}
                                    onValueChange={(value) => setFormData({ ...formData, model: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o modelo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MODELS[formData.provider]?.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Seção 3: Regras e Operação */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4" />
                            Regras e Limites de Operação
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="regras">Regras de Negócio Inflexíveis</Label>
                                <Textarea
                                    id="regras"
                                    placeholder="Ex: Nunca dê descontos em procedimentos estéticos. Sempre peça o CPF antes de finalizar."
                                    value={formData.regras_de_negocio}
                                    onChange={(e) => setFormData({ ...formData, regras_de_negocio: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="limites">Restrições e Limites</Label>
                                    <Input
                                        id="limites"
                                        placeholder="Ex: Max 3 reagendamentos semanais"
                                        value={formData.limites_operacionais}
                                        onChange={(e) => setFormData({ ...formData, limites_operacionais: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="permissoes">Capacidades Autorizadas</Label>
                                    <Input
                                        id="permissoes"
                                        placeholder="Ex: Consultar preços, Ver agenda"
                                        value={formData.permissoes_ativas}
                                        onChange={(e) => setFormData({ ...formData, permissoes_ativas: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção 4: Ferramentas (Tools) */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                <Settings2 className="w-4 h-4" />
                                Ferramenta de Ação (Tools)
                            </h3>
                            <Button type="button" variant="outline" size="sm" onClick={addTool} className="gap-2 border-dashed">
                                <Plus className="w-4 h-4" />
                                Adicionar Tool
                            </Button>
                        </div>

                        {tools.length === 0 && (
                            <div className="text-center py-6 bg-[hsl(var(--surface-2))] rounded-lg border border-dashed border-border">
                                <p className="text-xs text-muted-foreground uppercase font-semibold">Nenhuma ferramenta de ação configurada</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                            {tools.map((tool, index) => (
                                <div key={index} className="flex gap-2 items-start bg-[hsl(var(--surface-2))] p-4 rounded-xl border border-border shadow-sm">
                                    <div className="flex-1 space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nome da Função</Label>
                                            <Input
                                                placeholder="Ex: get_appointment_slots"
                                                value={tool.name}
                                                onChange={(e) => updateTool(index, "name", e.target.value)}
                                                className="bg-background h-8 text-sm font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Descrição (Para a IA)</Label>
                                            <Input
                                                placeholder="Ex: Busca horários livres para uma data específica"
                                                value={tool.description}
                                                onChange={(e) => updateTool(index, "description", e.target.value)}
                                                className="bg-background h-8 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeTool(index)} className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-6 border-t border-border">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="px-6">
                        Descartar
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="gradient-primary text-white shadow-teal px-8">
                        {loading ? (
                            "Salvando Agente..."
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {agent ? "Salvar Alterações" : "Criar Agente"}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
