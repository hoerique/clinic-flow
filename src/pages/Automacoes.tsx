import { AppLayout } from "@/components/AppLayout";
import { MessageSquare, Plus, Play, Pause, Cpu, Settings2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AgentModal } from "@/components/AgentModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";



export default function Automacoes() {
  const [agents, setAgents] = useState<any[]>([]);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens'
        },
        (payload) => {
          setMensagens((prev) => [payload.new, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("mensagens")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setMensagens(data || []);
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

  const handleEditAgent = (agent: any) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };

  const handleNewAgent = () => {
    setSelectedAgent(null);
    setIsModalOpen(true);
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agente?")) return;

    try {
      const { error } = await (supabase as any).from("ai_agents").delete().eq("id", id);
      if (error) throw error;
      toast.success("Agente excluído com sucesso!");
      fetchAgents();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  const toggleAgentStatus = async (agent: any) => {
    try {
      const { error } = await (supabase.from("ai_agents") as any)
        .update({ ativo: !agent.ativo })
        .eq("id", agent.id);

      if (error) throw error;
      fetchAgents();
    } catch (error: any) {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  };

  return (
    <AppLayout
      title="WhatsApp & Automações"
      subtitle="Gerencie fluxos e agentes inteligentes de comunicação"
      action={
        <div className="flex gap-2">
          <button
            onClick={handleNewAgent}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-teal"
          >
            <Plus className="w-4 h-4" />
            Novo Agente de IA
          </button>
        </div>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Mensagens hoje", value: "47", color: "hsl(var(--teal))" },
            { label: "Taxa de leitura", value: "94%", color: "hsl(var(--success))" },
            { label: "Agentes ativos", value: agents.filter(a => a.ativo).length.toString(), color: "hsl(var(--info))" },
            { label: "Créditos restantes", value: "32/100", color: "hsl(var(--warning))" },
          ].map((s, i) => (
            <div key={i} className="stat-card rounded-xl p-4">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Agentes de IA */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[hsl(var(--teal))]" />
                Agentes Orquestradores de IA
              </h3>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Carregando agentes...</div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8 bg-[hsl(var(--surface-2))] rounded-xl border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">Nenhum agente configurado.</p>
                  <button
                    onClick={handleNewAgent}
                    className="mt-2 text-xs text-[hsl(var(--teal))] font-semibold hover:underline"
                  >
                    Criar meu primeiro agente
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {agents.map((agent) => (
                    <div key={agent.id} className="stat-card rounded-xl p-4 border border-border/50 hover:border-[hsl(var(--teal)/0.3)] transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[hsl(var(--teal)/0.1)]">
                          <Cpu className="w-4.5 h-4.5 text-[hsl(var(--teal))]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">{agent.nome}</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${agent.ativo ? "text-[hsl(var(--success))] bg-[hsl(var(--success)/0.12)]" : "text-muted-foreground bg-[hsl(var(--surface-3))]"}`}>
                                {agent.ativo ? "ATIVO" : "PAUSADO"}
                              </span>
                              <button
                                onClick={() => toggleAgentStatus(agent)}
                                className="p-1.5 rounded-lg bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors"
                              >
                                {agent.ativo ? <Pause className="w-3.5 h-3.5 text-muted-foreground" /> : <Play className="w-3.5 h-3.5 text-muted-foreground" />}
                              </button>
                              <button
                                onClick={() => handleEditAgent(agent)}
                                className="p-1.5 rounded-lg bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors"
                              >
                                <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                              <button
                                onClick={() => handleDeleteAgent(agent.id)}
                                className="p-1.5 rounded-lg bg-[hsl(var(--surface-2))] hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{agent.objetivo_agente}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-[hsl(var(--surface-2))]">
                              {agent.tools?.length || 0} ferramentas
                            </span>
                            <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-[hsl(var(--surface-2))]">
                              {agent.tom_de_comunicacao || "Tom padrão"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


          </div>

          {/* Chat preview */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[hsl(var(--teal))]" />
              Conversas em Tempo Real
            </h3>
            <div className="stat-card rounded-xl overflow-hidden border border-border/50">
              <div className="p-3 border-b border-border bg-[hsl(var(--teal)/0.08)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] pulse-teal" />
                  <span className="text-xs font-semibold text-[hsl(var(--teal))]">Wazap API Conectada</span>
                </div>
              </div>
              <div className="p-4 space-y-3 h-[420px] overflow-y-auto flex flex-col-reverse">
                {mensagens.map((m, i) => (
                  <div key={m.id || i} className={`flex ${m.tipo === "saida" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 ${m.tipo === "saida" ? "bg-[hsl(var(--teal)/0.15)] rounded-tr-sm" : "bg-[hsl(var(--surface-2))] rounded-tl-sm"}`}>
                      <p className={`text-[10px] font-bold mb-0.5 ${m.tipo === "saida" ? "text-[hsl(var(--teal))]" : "text-muted-foreground"}`}>
                        {m.tipo === "saida" ? "Sistema" : (m.paciente_nome || m.numero_wa)}
                      </p>
                      <p className="text-xs text-foreground">{m.corpo}</p>
                      <p className="text-[9px] text-muted-foreground mt-1 text-right">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2 bg-[hsl(var(--surface-2))] rounded-lg px-3 py-2">
                  <input className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" placeholder="Intervir manualmente..." />
                  <button className="text-[hsl(var(--teal))]">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
