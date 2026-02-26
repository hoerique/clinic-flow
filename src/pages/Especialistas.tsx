import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, MessageSquare, User, Bot, Trash2, Edit, Send, Search, Sparkles, FileText, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { extractTextFromPDF } from "@/lib/pdf-utils";

interface Especialista {
    id: string;
    nome: string;
    area_especialidade: string;
    prompt_sistema: string;
    descricao: string;
    foto_url: string;
    documento_url?: string;
    conhecimento_base?: string;
}

export default function Especialistas() {

    const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEspecialista, setSelectedEspecialista] = useState<Especialista | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        nome: "",
        area_especialidade: "",
        prompt_sistema: "",
        descricao: "",
        documento_url: "",
        conhecimento_base: "",
    });

    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Chat state
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        fetchEspecialistas();
    }, []);

    const fetchEspecialistas = async () => {
        setLoading(true);
        const { data, error } = await (supabase.from("especialistas") as any)
            .select("*")
            .eq("ativo", true)
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Erro ao carregar especialistas");
        } else {
            setEspecialistas(data || []);
        }
        setLoading(false);
    };

    const handleFileUpload = async (file: File) => {
        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from('specialist-documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('specialist-documents')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error: any) {
            toast.error("Erro no upload do arquivo: " + error.message);
            return null;
        } finally {
            setUploading(false);
        }
    };
    const handleSave = async () => {
        if (!formData.nome || !formData.prompt_sistema) {
            toast.error("Nome e Instruções são obrigatórios");
            return;
        }

        try {
            setLoading(true);
            let finalDocUrl = formData.documento_url;
            let extractedText = formData.conhecimento_base;
            let embedding: number[] | null = null;

            if (selectedFile) {
                // 1. Upload do arquivo
                const uploadedUrl = await handleFileUpload(selectedFile);
                if (uploadedUrl) {
                    finalDocUrl = uploadedUrl;
                }

                // 2. Extração de texto para RAG
                try {
                    toast.info("Extraindo conhecimento do PDF...");
                    const text = await extractTextFromPDF(selectedFile);
                    extractedText = text;
                    toast.success("Conhecimento extraído com sucesso!");
                } catch (err) {
                    console.error("Erro na extração:", err);
                    toast.error("Não foi possível processar o conhecimento do PDF.");
                }
            }

            const payload = {
                ...formData,
                documento_url: finalDocUrl,
                conhecimento_base: extractedText,
            };

            if (selectedEspecialista && selectedEspecialista.id) {
                const { error } = await (supabase.from("especialistas") as any)
                    .update(payload)
                    .eq("id", selectedEspecialista.id);
                if (error) throw error;
                toast.success("Especialista atualizado!");
            } else {
                const { error } = await (supabase.from("especialistas") as any)
                    .insert([payload]);
                if (error) throw error;
                toast.success("Especialista criado!");
            }
            setIsModalOpen(false);
            setSelectedFile(null);
            fetchEspecialistas();
        } catch (e: any) {
            toast.error("Erro ao salvar: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este especialista permanentemente do banco de dados?")) return;

        try {
            // 1. Get specialist to see if there's a document to delete
            const { data: specialist, error: fetchError } = await supabase
                .from("especialistas")
                .select("documento_url")
                .eq("id", id)
                .single();

            if (fetchError) throw fetchError;

            // 2. Delete file from storage if it exists
            if (specialist?.documento_url) {
                const filePath = specialist.documento_url.split('/').pop();
                if (filePath) {
                    const { error: storageError } = await supabase.storage
                        .from("specialist-documents")
                        .remove([filePath]);

                    if (storageError) {
                        console.error("Erro ao excluir arquivo do storage:", storageError);
                        // We proceed anyway to delete the record, or we could stop.
                        // Let's just log it.
                    }
                }
            }

            // 3. Delete record from database
            const { error: deleteError } = await (supabase.from("especialistas") as any)
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;

            toast.success("Especialista removido definitivamente");
            fetchEspecialistas();
        } catch (error: any) {
            console.error("Erro ao excluir:", error);
            toast.error("Erro ao excluir: " + error.message);
        }
    };

    const openChat = (especialista: Especialista) => {
        setSelectedEspecialista(especialista);
        setMessages([
            { role: 'assistant', content: `Olá! Eu sou ${especialista.nome}, especialista em ${especialista.area_especialidade}. Como posso te ajudar hoje?` }
        ]);
        setIsChatOpen(true);
    };

    const handleSendMessage = async () => {
        if (!input.trim() || !selectedEspecialista || chatLoading) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setChatLoading(true);

        try {
            // Aqui simulamos a chamada para o backend com o contexto do especialista
            // Em uma implementação real, passaríamos o prompt_sistema para o backend
            const response = await fetch('http://localhost:3000/ai/orchestrate-webhook', { // Exemplo de endpoint existente
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    corpo: input,
                    numero_wa: "chat-web",
                    prompt_customizado: selectedEspecialista.prompt_sistema // O backend precisaria aceitar isso
                }),
            });

            // Simulação de resposta enquanto o backend não está 100% integrado com prompts dinâmicos por aqui
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Sou o clone de ${selectedEspecialista.nome}. Entendi sua pergunta sobre "${input}". No momento esta é uma demonstração da interface.`
                }]);
                setChatLoading(false);
            }, 1000);

        } catch (error) {
            toast.error("Erro na conexão com a IA");
            setChatLoading(false);
        }
    };

    return (
        <AppLayout title="Crie seu Especialista" subtitle="Gerencie seus clones de IA treinados com bases reais">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Buscar especialista..." className="pl-9" />
                    </div>
                    <Button onClick={() => {
                        setSelectedEspecialista(null);
                        setFormData({
                            nome: "",
                            area_especialidade: "",
                            prompt_sistema: "",
                            descricao: "",
                            documento_url: "",
                            conhecimento_base: ""
                        });
                        setSelectedFile(null);
                        setIsModalOpen(true);
                    }} className="gradient-primary text-white gap-2">
                        <Plus className="w-4 h-4" />
                        Criar Novo Clone
                    </Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {especialistas.map((esp) => (
                            <Card key={esp.id} className="stat-card overflow-hidden group">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-teal">
                                            {esp.nome.charAt(0)}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                                setSelectedEspecialista(esp);
                                                setFormData({
                                                    nome: esp.nome,
                                                    area_especialidade: esp.area_especialidade,
                                                    prompt_sistema: esp.prompt_sistema,
                                                    descricao: esp.descricao,
                                                    documento_url: esp.documento_url || "",
                                                });
                                                setSelectedFile(null);
                                                setIsModalOpen(true);
                                            }}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(esp.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="mt-4 text-lg">{esp.nome}</CardTitle>
                                    <Badge variant="secondary" className="w-fit">{esp.area_especialidade}</Badge>
                                </CardHeader>
                                <CardContent className="py-2">
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {esp.descricao || "Sem descrição definida."}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-4">
                                    <Button className="w-full gap-2 gradient-primary text-white" onClick={() => openChat(esp)}>
                                        <MessageSquare className="w-4 h-4" />
                                        Conversar com o Clone
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Criação / Edição */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{selectedEspecialista ? "Editar Clone" : "Criar Novo Especialista"}</DialogTitle>
                        <DialogDescription>
                            Defina a personalidade e o conhecimento base para o seu clone de IA.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome do Especialista</Label>
                                <Input
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Ex: Pedro Sobral"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Área de Atuação</Label>
                                <Input
                                    value={formData.area_especialidade}
                                    onChange={e => setFormData({ ...formData, area_especialidade: e.target.value })}
                                    placeholder="Ex: Gestão de Tráfego"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição Curta</Label>
                            <Input
                                value={formData.descricao}
                                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                placeholder="Ex: Clone treinado com todas as lives do Subido..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                Instruções Mestra (Prompt do Sistema)
                                <Sparkles className="w-3 h-3 text-teal-400" />
                            </Label>
                            <Textarea
                                value={formData.prompt_sistema}
                                onChange={e => setFormData({ ...formData, prompt_sistema: e.target.value })}
                                className="min-h-[150px]"
                                placeholder="Você é Pedro Sobral... seu conhecimento vem de... seu tom de voz deve ser..."
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                Base de Conhecimento (PDF para RAG)
                                <FileText className="w-3 h-3 text-teal-400" />
                            </Label>

                            {formData.documento_url && !selectedFile && (
                                <div className="flex items-center justify-between p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-teal-400" />
                                        <span className="text-xs font-medium text-teal-100 truncate max-w-[200px]">
                                            Documento já vinculado
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[10px] uppercase font-bold text-teal-400 hover:text-teal-300"
                                        onClick={() => setFormData({ ...formData, documento_url: "" })}
                                    >
                                        Remover
                                    </Button>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${selectedFile ? 'border-teal-500 bg-teal-500/5' : 'border-border hover:border-teal-500/50'
                                    }`}>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.type !== 'application/pdf') {
                                                    toast.error("Por favor, suba apenas arquivos PDF.");
                                                    return;
                                                }
                                                setSelectedFile(file);
                                            }
                                        }}
                                    />
                                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                                        {selectedFile ? (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-teal-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{selectedFile.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">PDF selecionado para upload</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedFile(null);
                                                    }}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                    <Upload className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Clique ou arraste o PDF para treinar seu especialista</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase mt-1">Apenas PDF (máx 10MB)</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={handleSave}
                            className="gradient-primary text-white"
                            disabled={loading || uploading}
                        >
                            {loading || uploading ? "Salvando..." : "Salvar Especialista"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Chat flutuante estilo ChatGPT */}
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                    <DialogTitle className="sr-only">Chat com {selectedEspecialista?.nome}</DialogTitle>
                    <DialogDescription className="sr-only">Interface de conversa com o especialista selecionado.</DialogDescription>
                    <div className="bg-[hsl(var(--surface-1))] border-b border-border p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                                {selectedEspecialista?.nome.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">{selectedEspecialista?.nome}</h3>
                                <p className="text-[10px] text-teal-400 font-medium uppercase tracking-widest">Clone de IA Ativo</p>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl flex gap-3 ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground shadow-lg'
                                        : 'bg-[hsl(var(--surface-2))] text-foreground border border-border'
                                        }`}>
                                        {msg.role === 'assistant' ? <Bot className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <User className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold opacity-60 uppercase tracking-tighter">
                                                {msg.role === 'user' ? 'Você' : selectedEspecialista?.nome}
                                            </p>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-[hsl(var(--surface-2))] p-4 rounded-2xl border border-border flex items-center gap-3">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 bg-[hsl(var(--surface-1))] border-t border-border">
                        <div className="relative">
                            <Textarea
                                placeholder={`Mensagem para ${selectedEspecialista?.nome}...`}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                className="pr-12 min-h-[50px] max-h-[150px] resize-none bg-[hsl(var(--surface-2))] border-none focus-visible:ring-1 focus-visible:ring-teal-400"
                            />
                            <Button
                                size="sm"
                                className="absolute right-1.5 bottom-1.5 h-8 w-8 rounded-lg gradient-primary text-white p-0"
                                onClick={handleSendMessage}
                                disabled={!input.trim() || chatLoading}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-widest font-medium opacity-50">
                            Clones podem cometer erros. Verifique informações importantes.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
