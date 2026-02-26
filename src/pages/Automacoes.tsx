import { AppLayout } from "@/components/AppLayout";
import { MessageSquare, Plus, Play, Pause, Cpu, Settings2, Trash2, Users, Tag, CheckCircle2, Search, Send, User, Loader2 } from "lucide-react";
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
  const [agents, setAgents] = useState<any[]>([]);
  const [allMensagens, setAllMensagens] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [manualMessage, setManualMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"agentes" | "chat" | "dados_lead">("chat");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagInput, setTagInput] = useState<{ [key: string]: string }>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: leads = [] } = useLeads();
  const { data: chatHistory = [], isLoading: loadingHistory } = useMessages(selectedContact || undefined);
  const updatePaciente = useUpdatePaciente();
  const sendWhatsApp = useSendWhatsApp();

  // URL Deep Link
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

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

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

  // Process unique contacts from messages
  const contacts = Array.from(new Set(allMensagens.map(m => m.numero_wa)))
    .map(number => {
      const lastMsg = allMensagens.find(m => m.numero_wa === number);
      const lead = leads.find(l => l.telefone === number);
      return {
        number,
        name: lead?.nome || lastMsg?.paciente_nome || number,
        lastMessage: lastMsg?.corpo || "",
        time: lastMsg?.created_at || "",
        isLead: lead?.status === 'lead',
        tags: lead?.tags || []
      };
    })
    .filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.number.includes(searchTerm)
    );

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full h-40 flex items-center justify-center text-muted-foreground">Carregando agentes...</div>
            ) : agents.length === 0 ? (
              <div className="col-span-full h-40 flex flex-col items-center justify-center border border-dashed border-border rounded-xl text-muted-foreground">
                <p>Nenhum agente configurado.</p>
                <button onClick={() => setIsModalOpen(true)} className="text-[hsl(var(--teal))] font-bold hover:underline mt-2">Criar primeiro agente</button>
              </div>
            ) : agents.map((agent) => (
              <div key={agent.id} className="stat-card rounded-xl p-5 border border-border/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[hsl(var(--teal)/0.1)]">
                    <Cpu className="w-5 h-5 text-[hsl(var(--teal))]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleAgentStatus(agent)} className="p-1.5 rounded-lg bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))]">
                      {agent.ativo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-[hsl(var(--success))]" />}
                    </button>
                    <button onClick={() => { setSelectedAgent(agent); setIsModalOpen(true); }} className="p-1.5 rounded-lg bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))]">
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-foreground">{agent.nome}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{agent.objetivo_agente}</p>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                  <Badge variant={agent.ativo ? "outline" : "secondary"} className={`text-[10px] uppercase ${agent.ativo ? "border-[hsl(var(--success))] text-[hsl(var(--success))]" : ""}`}>
                    {agent.ativo ? "Ativo" : "Pausado"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{agent.tom_de_comunicacao}</span>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "chat" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-border rounded-2xl overflow-hidden bg-[hsl(var(--surface-1))] h-[700px] shadow-sm animate-fade-in">
            {/* Sidebar - Contacts */}
            <div className="lg:col-span-4 border-r border-border flex flex-col bg-[hsl(var(--surface-1))]">
              <div className="p-4 border-b border-border bg-[hsl(var(--surface-2))/0.3]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    className="w-full bg-[hsl(var(--surface-1))] border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-[hsl(var(--teal))] focus:outline-none"
                    placeholder="Buscar conversa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {contacts.length === 0 ? (
                  <div className="p-10 text-center text-muted-foreground text-sm italic">Nenhuma conversa encontrada</div>
                ) : contacts.map((contact) => (
                  <button
                    key={contact.number}
                    onClick={() => setSelectedContact(contact.number)}
                    className={`w-full p-4 flex items-start gap-3 border-b border-border/50 hover:bg-[hsl(var(--surface-2))] transition-colors text-left ${selectedContact === contact.number ? "bg-[hsl(var(--teal)/0.08)] border-l-4 border-l-[hsl(var(--teal))]" : ""}`}
                  >
                    <div className="w-11 h-11 rounded-full bg-[hsl(var(--teal)/0.12)] flex items-center justify-center text-[hsl(var(--teal))] font-bold flex-shrink-0 relative">
                      {contact.name.substring(0, 2).toUpperCase()}
                      {contact.isLead && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[hsl(var(--warning))] rounded-full border-2 border-[hsl(var(--surface-1))]" title="Novo Lead" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground truncate">{contact.name}</p>
                        <span className="text-[9px] text-muted-foreground font-medium">
                          {contact.time ? new Date(contact.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate italic mt-0.5">{contact.lastMessage}</p>
                      <div className="flex gap-1 mt-1.5">
                        {contact.tags.slice(0, 2).map((t: string) => (
                          <span key={t} className="text-[8px] bg-[hsl(var(--surface-3))] px-1.5 py-0.5 rounded-full text-muted-foreground font-bold">{t.toUpperCase()}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-8 flex flex-col bg-[hsl(var(--surface-2))/0.2] relative">
              {selectedContact ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border bg-[hsl(var(--surface-1))] flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[hsl(var(--teal)/0.12)] flex items-center justify-center text-[hsl(var(--teal))] font-bold">
                        {contacts.find(c => c.number === selectedContact)?.name.substring(0, 2).toUpperCase() || "WA"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{contacts.find(c => c.number === selectedContact)?.name || selectedContact}</p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Atendimento Ativo</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold border-border gap-1.5 hover:bg-[hsl(var(--teal)/0.1)]">
                        <User className="w-3 h-3" /> VER PRONTUÁRIO
                      </Button>
                    </div>
                  </div>

                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-5 custom-scrollbar">
                    {loadingHistory ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs uppercase tracking-widest animate-pulse">Sincronizando conversa...</div>
                    ) : chatHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 opacity-30">
                        <MessageSquare className="w-16 h-16" />
                        <p className="text-sm font-bold">Nenhuma mensagem registrada</p>
                      </div>
                    ) : chatHistory.map((m: any) => (
                      <div key={m.id} className={`flex ${m.tipo === "saida" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-md text-sm ${m.tipo === "saida" ? "bg-[hsl(var(--teal))] text-white rounded-tr-sm" : "bg-[hsl(var(--surface-1))] text-foreground rounded-tl-sm border border-border/30"}`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.corpo}</p>
                          <div className="flex items-center justify-end gap-1.5 mt-1.5 opacity-60">
                            <span className="text-[9px] font-bold uppercase">
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input area */}
                  <div className="p-4 bg-[hsl(var(--surface-1))] border-t border-border shadow-2xl">
                    <form onSubmit={handleSendManualMessage} className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <textarea
                          className="w-full bg-[hsl(var(--surface-2))] border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[hsl(var(--teal))] focus:outline-none resize-none max-h-32 transition-all"
                          placeholder="Escreva sua mensagem aqui..."
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
                      </div>
                      <button
                        type="submit"
                        disabled={sending || !manualMessage.trim()}
                        className="w-12 h-12 rounded-2xl gradient-primary text-white flex items-center justify-center disabled:opacity-50 transition-all active:scale-90 shadow-teal hover:rotate-6 flex-shrink-0"
                      >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      </button>
                    </form>
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
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome do Lead</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">WhatsApp</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags / Interesse</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {leads
                    .filter(l => l.nome.toLowerCase().includes(searchTerm.toLowerCase()) || l.telefone.includes(searchTerm))
                    .map((lead) => (
                      <tr key={lead.id} className="hover:bg-[hsl(var(--surface-2))] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[hsl(var(--teal)/0.1)] flex items-center justify-center text-[hsl(var(--teal))] font-bold text-xs">
                              {lead.nome.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-foreground">{lead.nome}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground font-mono">{lead.telefone}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                            {(lead.tags || []).map((tag: string) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[10px] group-hover:bg-[hsl(var(--teal)/0.2)] group-hover:text-[hsl(var(--teal))] border-none cursor-default"
                              >
                                {tag.toUpperCase()}
                                <button
                                  onClick={() => {
                                    const newTags = lead.tags.filter((t: string) => t !== tag);
                                    updatePaciente.mutate({ id: lead.id, tags: newTags });
                                  }}
                                  className="ml-1.5 hover:text-red-500 transition-colors"
                                >
                                  &times;
                                </button>
                              </Badge>
                            ))}
                            <input
                              placeholder="Add tag..."
                              className="bg-transparent border-none outline-none text-[10px] text-muted-foreground italic w-16"
                              value={tagInput[lead.id] || ""}
                              onChange={(e) => setTagInput({ ...tagInput, [lead.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && tagInput[lead.id]?.trim()) {
                                  const newTags = Array.from(new Set([...(lead.tags || []), tagInput[lead.id].trim()]));
                                  updatePaciente.mutate({ id: lead.id, tags: newTags });
                                  setTagInput({ ...tagInput, [lead.id]: "" });
                                }
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] font-bold gap-1.5 hover:bg-[hsl(var(--teal)/0.1)] hover:text-[hsl(var(--teal))] border-border"
                              onClick={() => {
                                setSelectedContact(lead.telefone);
                                setActiveTab("chat");
                              }}
                            >
                              <MessageSquare className="w-3 h-3" /> VER CHAT
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] font-bold gap-1.5 hover:bg-[hsl(var(--success)/0.1)] hover:text-[hsl(var(--success))] border-border"
                              onClick={() => updatePaciente.mutate({ id: lead.id, status: 'paciente' })}
                            >
                              <CheckCircle2 className="w-3 h-3" /> CONVERTER
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {leads.length === 0 && (
                <div className="p-20 text-center text-muted-foreground italic">Nenhum lead registrado no momento</div>
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
