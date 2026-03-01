import { AppLayout } from "@/components/AppLayout";
import { MessageSquare, Plus, Play, Pause, Cpu, Settings2, Trash2, Users, Tag, CheckCircle2, Search, Send, User, Loader2, Copy, MoreVertical, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AgentModal } from "@/components/AgentModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSendWhatsApp, useLeads, useUpdatePaciente, useMessages } from "@/hooks/useSupabase";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";

export default function Automacoes() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { data: leads = [] } = useLeads();
  const updatePaciente = useUpdatePaciente();
  const sendWhatsApp = useSendWhatsApp();
  const [agents, setAgents] = useState<any[]>([]);
  const [allMensagens, setAllMensagens] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [manualMessage, setManualMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"agentes" | "chat" | "dados_lead">("chat");
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tagInput, setTagInput] = useState<{ [key: string]: string }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory = [], isLoading: loadingHistory } = useMessages(selectedContact || undefined);

  useEffect(() => {
    const chatParam = searchParams.get("chat");
    if (chatParam) {
      setSelectedContact(chatParam);
      setActiveTab("chat");
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAgents();
    fetchMessages();

    const channel = supabase
      .channel('messages_changes_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens'
        },
        (payload) => {
          setAllMensagens((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    const leadsChannel = supabase
      .channel('leads_changes_realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'pacientes'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["leads"] });
          queryClient.invalidateQueries({ queryKey: ["pacientes"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(leadsChannel);
    };
  }, [queryClient]);

  const [lastContact, setLastContact] = useState("");
  useEffect(() => {
    if (selectedContact && selectedContact !== lastContact) {
      setTimeout(scrollToBottom, 100);
      setLastContact(selectedContact);
    }
  }, [selectedContact, chatHistory.length]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("mensagens")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllMensagens(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar mensagens:", error.message);
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("ai_agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar agentes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const parseMessageContent = (content: any) => {
    if (!content) return "";

    let parsed = content;
    if (typeof content === 'string') {
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        return content;
      }
    }

    if (parsed && typeof parsed === 'object') {
      // Prioridade para texto human/ai
      if (parsed.human || parsed.ai) {
        const text = parsed.human || parsed.ai;
        return typeof text === 'object' ? parseMessageContent(text) : String(text);
      }

      // Detecção de mídia do WhatsApp (Wazap)
      if (parsed.mimetype || parsed.URL || parsed.directPath || parsed.fileLength) {
        if (parsed.mimetype?.includes('audio') || parsed.seconds || parsed.PTT) return "🎵 Áudio";
        if (parsed.mimetype?.includes('image')) return "📷 Imagem";
        if (parsed.mimetype?.includes('video')) return "🎥 Vídeo";
        if (parsed.mimetype?.includes('sticker')) return "✨ Figurinha";
        if (parsed.mimetype?.includes('document') || parsed.filename) return `📄 ${parsed.filename || "Documento"}`;
        return "📁 Arquivo/Mídia";
      }

      // Se for um array de mensagens (comum em históricos complexos)
      if (Array.isArray(parsed)) {
        return parsed.map(p => parseMessageContent(p)).join(" ");
      }

      // Fallback seguro: nunca retornar o objeto puro para o React
      return "⚠️ Mensagem de sistema ou mídia";
    }

    return String(parsed);
  };

  const handleSendManualMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualMessage.trim() || sending || !selectedContact) return;

    setSending(true);
    try {
      await sendWhatsApp.mutateAsync({
        numero_wa: selectedContact,
        corpo: manualMessage
      });
      setManualMessage("");
      toast.success("Mensagem enviada!");
      fetchMessages();
    } catch (error: any) {
      toast.error("Erro ao enviar mensagem: " + error.message);
    } finally {
      setSending(false);
    }
  };

  const toggleAgentStatus = async (agent: any) => {
    try {
      const { error } = await (supabase as any)
        .from("ai_agents")
        .update({ ativo: !agent.ativo })
        .eq("id", agent.id);

      if (error) throw error;
      fetchAgents();
    } catch (error: any) {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  };

  // Process unique contacts from messages AND leads
  const contacts = Array.from(new Set([
    ...allMensagens.map(m => m.numero_wa?.split('@')[0]),
    ...leads.map(l => l.telefone)
  ]))
    .filter(Boolean)
    .map(number => {
      const lastMsg = allMensagens.find(m => m.numero_wa?.includes(number));
      const lead = leads.find(l => l.telefone === number);
      return {
        number,
        name: lead?.nome || lastMsg?.paciente_nome || number,
        lastMessage: lastMsg?.corpo || "",
        time: lastMsg?.created_at || lead?.created_at || "",
        isLead: lead?.status === 'lead',
        tags: lead?.tags || []
      };
    })
    .filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.number.includes(searchTerm)
    )
    .sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

  return (
    <AppLayout
      title="WhatsApp & Automações"
      subtitle="Gerencie fluxos e agentes inteligentes de comunicação"
      action={
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectedAgent(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-teal"
          >
            <Plus className="w-4 h-4" />
            Novo Agente de IA
          </button>
        </div>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[hsl(var(--surface-2))] p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("agentes")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "agentes" ? "gradient-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Agentes de IA
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "chat" ? "gradient-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Conversas
          </button>
          <button
            onClick={() => setActiveTab("dados_lead")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "dados_lead" ? "gradient-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Users className="w-3.5 h-3.5" />
            Dados Lead
          </button>
        </div>

        {activeTab === "agentes" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-in">
            {loading ? (
              <div className="col-span-full h-40 flex items-center justify-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando agentes...</div>
            ) : agents.length === 0 ? (
              <div className="col-span-full h-60 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-2xl text-muted-foreground bg-[hsl(var(--surface-1))/0.3]">
                <Cpu className="w-12 h-12 mb-4 opacity-10" />
                <p className="font-medium">Nenhum agente configurado.</p>
                <button onClick={() => setIsModalOpen(true)} className="text-[hsl(var(--teal))] font-bold hover:underline mt-2">Criar primeiro agente</button>
              </div>
            ) : agents.map((agent) => (
              <div key={agent.id} className="stat-card rounded-2xl p-6 border border-border/40 hover:scale-[1.02] transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[hsl(var(--teal)/0.12)] ring-1 ring-[hsl(var(--teal)/0.2)]">
                    <Cpu className="w-6 h-6 text-[hsl(var(--teal))]" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleAgentStatus(agent)}
                      className={`p-2 rounded-lg transition-colors ${agent.ativo ? "bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))]" : "bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.2)]"}`}
                      title={agent.ativo ? "Pausar" : "Ativar"}
                    >
                      {agent.ativo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setSelectedAgent(agent); setIsModalOpen(true); }} className="p-2 rounded-lg bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))]" title="Configurar">
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-foreground text-base">{agent.nome}</h4>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{agent.objetivo_agente}</p>
                <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                  <Badge variant={agent.ativo ? "outline" : "secondary"} className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold ${agent.ativo ? "border-[hsl(var(--success))] text-[hsl(var(--success))] bg-[hsl(var(--success)/0.05)]" : ""}`}>
                    {agent.ativo ? "SISTEMA ATIVO" : "EM PAUSA"}
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{agent.tom_de_comunicacao}</span>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "chat" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-border/60 rounded-2xl overflow-hidden bg-[#111b21] h-[calc(100vh-280px)] min-h-[600px] shadow-2xl animate-fade-in ring-1 ring-white/5">
            {/* Sidebar - Contacts */}
            <div className={`${selectedContact ? "hidden lg:flex" : "flex"} lg:col-span-4 border-r border-white/5 flex flex-col bg-[#111b21] h-full`}>
              <div className="p-3 bg-[#202c33] flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#374248] flex items-center justify-center">
                  <User className="w-6 h-6 text-[#8696a0]" />
                </div>
                <div className="flex items-center gap-5 px-2">
                  <button className="text-[#8696a0] hover:text-[#e9edef]"><Users className="w-5 h-5" /></button>
                  <button className="text-[#8696a0] hover:text-[#e9edef]"><MessageSquare className="w-5 h-5" /></button>
                  <button className="text-[#8696a0] hover:text-[#e9edef]"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="p-2 bg-[#111b21]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696a0]" />
                  <input
                    className="w-full bg-[#202c33] border-none rounded-lg pl-10 pr-4 py-1.5 text-sm text-[#e9edef] placeholder:text-[#8696a0] focus:ring-0 focus:outline-none"
                    placeholder="Pesquisar ou começar uma nova conversa"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#111b21]">
                {contacts.length === 0 ? (
                  <div className="p-10 text-center text-[#8696a0] text-sm italic">Nenhuma conversa encontrada</div>
                ) : contacts.map((contact) => (
                  <button
                    key={contact.number}
                    onClick={() => setSelectedContact(contact.number || "")}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-[#202c33] transition-all text-left relative group border-b border-white/[0.03] ${selectedContact === contact.number ? "bg-[#2a3942]" : ""}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#374248] flex items-center justify-center text-muted-foreground font-bold flex-shrink-0 relative overflow-hidden ring-1 ring-white/5">
                      <User className="w-7 h-7 text-[#8696a0] opacity-60" />
                      {contact.isLead && <div className="absolute top-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]" />}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[16px] font-normal text-[#e9edef] truncate leading-tight">{contact.name}</p>
                        <span className={`text-[11px] font-normal ${selectedContact === contact.number ? "text-[#00a884]" : "text-[#8696a0]"}`}>
                          {contact.time ? new Date(contact.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[13px] text-[#8696a0] truncate leading-tight flex-1">
                          {parseMessageContent(contact.lastMessage)}
                        </p>
                        <div className="flex gap-1">
                          {contact.tags.slice(0, 1).map((t: string) => (
                            <span key={t} className="text-[9px] bg-[#202c33] text-[#00a884] px-1.5 py-0.5 rounded-md font-bold uppercase ring-1 ring-[#00a884]/20">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${!selectedContact && "hidden lg:flex"} lg:col-span-8 flex flex-col bg-[#0b141a] relative h-full border-l border-white/5 overflow-hidden`}>
              {selectedContact.length > 0 ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 border-b border-border bg-[#202c33] flex items-center justify-between shadow-md z-10">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedContact("")}
                        className="lg:hidden text-[#8696a0] hover:text-[#e9edef] p-1"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="w-10 h-10 rounded-full bg-[hsl(var(--surface-3))] flex items-center justify-center text-muted-foreground ring-1 ring-white/5 overflow-hidden">
                        <User className="w-5 h-5 opacity-40" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-[#e9edef] truncate">{contacts.find(c => c.number === selectedContact)?.name || selectedContact}</p>
                        <p className="text-[11px] text-[hsl(var(--success))] truncate font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))] animate-pulse" /> online
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hidden md:flex h-7 text-[9px] font-bold border-white/10 text-[#8696a0] hover:text-[#e9edef] hover:bg-white/5"
                        onClick={() => window.location.href = `/pacientes?telefone=${selectedContact}`}
                      >
                        PRONTUÁRIO
                      </Button>
                      <button className="text-[#8696a0] hover:text-[#e9edef] transition-colors p-1">
                        <Search className="w-5 h-5" />
                      </button>
                      <button className="text-[#8696a0] hover:text-[#e9edef] transition-colors rotate-90">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-[#0b141a] custom-scrollbar relative">
                    {/* WhatsApp Background Overlay */}
                    <div className="absolute inset-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-[0.08] invert-[0.9] pointer-events-none" />

                    {loadingHistory ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs uppercase tracking-widest animate-pulse z-10 relative">Sincronizando conversa...</div>
                    ) : chatHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 opacity-30 z-10 relative">
                        <MessageSquare className="w-16 h-16" />
                        <p className="text-sm font-bold">Nenhuma mensagem registrada</p>
                      </div>
                    ) : chatHistory.map((m: any) => {
                      const isOutgoing = m.tipo === "saida";
                      const text = parseMessageContent(m.corpo);

                      return (
                        <div key={m.id} className={`flex w-full mb-1 z-10 relative ${isOutgoing ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] md:max-w-[65%] px-3 py-1.5 shadow-md text-[14.2px] relative
                              ${isOutgoing
                              ? "bg-[#005c4b] text-[#e9edef] rounded-l-lg rounded-br-lg"
                              : "bg-[#202c33] text-[#e9edef] rounded-r-lg rounded-bl-lg"
                            }`}
                          >
                            {/* Tail */}
                            <div className={`absolute top-0 w-2 h-2.5 
                                ${isOutgoing
                                ? "-right-1.5 bg-[#005c4b] [clip-path:polygon(0_0,0_100%,100%_0)]"
                                : "-left-1.5 bg-[#202c33] [clip-path:polygon(100%_0,100%_100%,0_0)]"
                              }`}
                            />

                            <p className="leading-[1.45] whitespace-pre-wrap">{text}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-[10px] text-[#8696a0] font-normal">
                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isOutgoing && (
                                <div className="flex ml-0.5 scale-75">
                                  <CheckCircle2 className="w-3 h-3 text-[#53bdeb] fill-[#53bdeb]/10" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input area */}
                  <div className="p-3 bg-[#202c33] border-t border-border/10 flex items-center gap-3 z-10 transition-all">
                    <button className="text-[#8696a0] hover:text-[#e9edef] p-1">
                      <Plus className="w-6 h-6" />
                    </button>
                    <div className="flex-1">
                      <form onSubmit={handleSendManualMessage} className="flex items-center gap-3">
                        <textarea
                          className="w-full bg-[#2a3942] border-none rounded-lg px-4 py-2.5 text-[14px] text-[#e9edef] placeholder:text-[#8696a0] focus:ring-0 focus:outline-none resize-none max-h-32 transition-all"
                          placeholder="Mensagem"
                          rows={1}
                          value={manualMessage}
                          onChange={(e) => setManualMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendManualMessage();
                            }
                          }}
                          disabled={sending}
                        />
                        <button
                          type="submit"
                          disabled={sending || !manualMessage.trim()}
                          className="text-[#8696a0] hover:text-[#e9edef] transition-all disabled:opacity-30 disabled:scale-100 active:scale-95 flex-shrink-0 p-1"
                        >
                          {sending ? <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--teal))]" /> : <Send className="w-6 h-6" />}
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-[hsl(var(--surface-1))] p-10">
                  <div className="w-24 h-24 rounded-3xl bg-[hsl(var(--surface-2))] flex items-center justify-center mb-6 shadow-inner rotate-3">
                    <MessageSquare className="w-12 h-12 text-[hsl(var(--teal))] opacity-20 -rotate-3" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Central de Atendimento</h3>
                  <p className="text-sm max-w-sm text-center mt-3 leading-relaxed">
                    Selecione uma conversa ou lead na lateral esquerda para iniciar o atendimento manual via WhatsApp.
                  </p>
                  <Badge variant="outline" className="mt-8 border-border text-[9px] uppercase tracking-widest font-bold">Wazap API Connection Status: Stable</Badge>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "dados_lead" ? (
          <div className="bg-[hsl(var(--surface-1))] border border-border rounded-2xl overflow-hidden shadow-sm animate-fade-in">
            <div className="p-6 border-b border-border bg-[hsl(var(--surface-2))/0.3]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Relatório de Leads</h3>
                  <p className="text-xs text-muted-foreground">Listagem organizada de todos os contatos capturados pelo WhatsApp</p>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    className="w-full bg-[hsl(var(--surface-1))] border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[hsl(var(--teal))] focus:outline-none"
                    placeholder="Filtrar por nome ou número..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-[hsl(var(--surface-2))/0.5]">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-r border-border/50">Nome do Lead</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-r border-border/50">WhatsApp</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-r border-border/50 whitespace-nowrap">Tags / Interesse</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {contacts
                    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.number.includes(searchTerm))
                    .map((contact) => {
                      const leadId = leads.find(l => l.telefone === contact.number)?.id;
                      const leadData = leads.find(l => l.telefone === contact.number);

                      return (
                        <tr key={contact.number} className="hover:bg-[hsl(var(--surface-2))] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[hsl(var(--teal)/0.1)] flex items-center justify-center text-[hsl(var(--teal))] font-bold text-xs flex-shrink-0">
                                {contact.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">{contact.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-r border-border/50">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-mono">{contact.number}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(contact.number);
                                  toast.success("Número copiado!");
                                }}
                                className="p-1 rounded hover:bg-[hsl(var(--surface-3))] text-muted-foreground transition-colors group-hover:block hidden"
                                title="Copiar número"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5 min-h-[32px] max-w-[200px]">
                              {contact.tags.map((tag: string) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-[10px] group-hover:bg-[hsl(var(--teal)/0.2)] group-hover:text-[hsl(var(--teal))] border-none cursor-default"
                                >
                                  {tag.toUpperCase()}
                                  {leadId && (
                                    <button
                                      onClick={() => {
                                        const newTags = contact.tags.filter((t: string) => t !== tag);
                                        updatePaciente.mutate({ id: leadId, tags: newTags });
                                      }}
                                      className="ml-1.5 hover:text-red-500 transition-colors"
                                    >
                                      &times;
                                    </button>
                                  )}
                                </Badge>
                              ))}
                              {leadId && (
                                <input
                                  placeholder="+"
                                  className="bg-transparent border-none outline-none text-[10px] text-muted-foreground font-bold w-6"
                                  value={tagInput[leadId] || ""}
                                  onChange={(e) => setTagInput({ ...tagInput, [leadId]: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && tagInput[leadId]?.trim()) {
                                      const newTags = Array.from(new Set([...(contact.tags || []), tagInput[leadId].trim()]));
                                      updatePaciente.mutate({ id: leadId, tags: newTags });
                                      setTagInput({ ...tagInput, [leadId]: "" });
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] font-bold gap-1.5 hover:bg-[hsl(var(--teal)/0.1)] hover:text-[hsl(var(--teal))] border-border"
                                onClick={() => {
                                  setSelectedContact(contact.number);
                                  setActiveTab("chat");
                                }}
                              >
                                <MessageSquare className="w-3 h-3" /> VER CHAT
                              </Button>
                              {!contact.isLead ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-[10px] font-bold gap-1.5 hover:bg-[hsl(var(--warning)/0.1)] hover:text-[hsl(var(--warning))] border-border"
                                  onClick={async () => {
                                    try {
                                      // Primero capturar como lead se desejar registrar na base, 
                                      // ou apenas redirecionar com os dados
                                      const { data, error } = await supabase
                                        .from('pacientes')
                                        .insert({
                                          nome: contact.name,
                                          telefone: contact.number,
                                          status: 'lead'
                                        })
                                        .select()
                                        .single();

                                      if (error) throw error;
                                      queryClient.invalidateQueries({ queryKey: ["leads"] });

                                      // Redirecionar para pacientes com os dados para preencher o agendamento
                                      window.location.href = `/pacientes?nome=${encodeURIComponent(contact.name)}&telefone=${encodeURIComponent(contact.number)}&novo=true`;
                                    } catch (err: any) {
                                      toast.error("Erro ao processar: " + err.message);
                                    }
                                  }}
                                >
                                  <CheckCircle2 className="w-3 h-3" /> AGENDADO
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-[10px] font-bold gap-1.5 hover:bg-[hsl(var(--success)/0.1)] hover:text-[hsl(var(--success))] border-border"
                                  onClick={() => {
                                    window.location.href = `/pacientes?nome=${encodeURIComponent(contact.name)}&telefone=${encodeURIComponent(contact.number)}&novo=true`;
                                  }}
                                >
                                  <CheckCircle2 className="w-3 h-3" /> AGENDADO
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {contacts.length === 0 && (
                <div className="p-20 text-center text-muted-foreground italic">Nenhum contato capturado no momento</div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAgents}
        agent={selectedAgent}
      />
    </AppLayout>
  );
}
