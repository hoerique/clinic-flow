import { AppLayout } from "@/components/AppLayout";
import { MessageSquare, Plus, Play, Pause, Clock, Users, Check, Zap, ChevronRight } from "lucide-react";

const fluxos = [
  {
    id: 1,
    nome: "Confirmação 24h antes",
    descricao: "Envia mensagem 24h antes da consulta pedindo confirmação",
    ativo: true,
    disparos: 142,
    taxa: 89,
    cor: "hsl(var(--teal))",
    icone: Clock,
    gatilho: "Consulta agendada",
    acoes: ["Enviar WhatsApp 24h antes", "Aguardar confirmação", "Se não confirmar: ligar"],
  },
  {
    id: 2,
    nome: "Lembrete 2h antes",
    descricao: "Lembrete com endereço da clínica 2 horas antes",
    ativo: true,
    disparos: 138,
    taxa: 94,
    cor: "hsl(var(--info))",
    icone: MessageSquare,
    gatilho: "Consulta confirmada",
    acoes: ["Enviar localização", "Enviar horário", "Oferecer reagendamento"],
  },
  {
    id: 3,
    nome: "Pós-consulta",
    descricao: "Mensagem de acompanhamento após atendimento",
    ativo: true,
    disparos: 89,
    taxa: 72,
    cor: "hsl(var(--success))",
    icone: Check,
    gatilho: "Consulta realizada",
    acoes: ["Perguntar sobre experiência", "Solicitar avaliação Google", "Agendar próxima consulta"],
  },
  {
    id: 4,
    nome: "Recuperação de Inativos",
    descricao: "Reativa pacientes sem consulta há mais de 60 dias",
    ativo: false,
    disparos: 34,
    taxa: 28,
    cor: "hsl(var(--warning))",
    icone: Users,
    gatilho: "+60 dias sem consulta",
    acoes: ["Enviar oferta especial", "Aguardar 3 dias", "Enviar WhatsApp 2ª vez"],
  },
  {
    id: 5,
    nome: "Recuperação de Cancelamentos",
    descricao: "Tenta reagendar pacientes que cancelaram",
    ativo: true,
    disparos: 21,
    taxa: 45,
    cor: "hsl(var(--destructive))",
    icone: Zap,
    gatilho: "Consulta cancelada",
    acoes: ["Enviar mensagem em 2h", "Oferecer horários disponíveis", "Se aceitar: reagendar"],
  },
];

const mensagens = [
  { hora: "09:15", paciente: "Maria Silva", msg: "Confirmado ✅", tipo: "entrada" },
  { hora: "09:18", paciente: "Sistema", msg: "Perfeito, Maria! Te esperamos às 14h. Endereço: Rua das Flores, 123.", tipo: "saida" },
  { hora: "10:02", paciente: "João Santos", msg: "Vou precisar cancelar 😔", tipo: "entrada" },
  { hora: "10:02", paciente: "Sistema", msg: "Tudo bem João! Podemos reagendar? Temos horários na quinta e sexta.", tipo: "saida" },
  { hora: "10:45", paciente: "Ana Costa", msg: "Quero marcar uma avaliação", tipo: "entrada" },
  { hora: "10:45", paciente: "Sistema", msg: "Olá Ana! Que ótimo! Qual dia seria melhor para você?", tipo: "saida" },
];

export default function Automacoes() {
  return (
    <AppLayout
      title="WhatsApp & Automações"
      subtitle="Gerencie fluxos automáticos de comunicação"
      action={
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-opacity shadow-teal">
          <Plus className="w-4 h-4" />
          Novo Fluxo
        </button>
      }
    >
      <div className="space-y-4 animate-fade-in">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Mensagens hoje", value: "47", color: "hsl(var(--teal))" },
            { label: "Taxa de leitura", value: "94%", color: "hsl(var(--success))" },
            { label: "Fluxos ativos", value: "4", color: "hsl(var(--info))" },
            { label: "Créditos restantes", value: "32/100", color: "hsl(var(--warning))" },
          ].map((s, i) => (
            <div key={i} className="stat-card rounded-xl p-4">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Fluxos */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Fluxos de Automação</h3>
            {fluxos.map((fluxo) => {
              const Icon = fluxo.icone;
              return (
                <div key={fluxo.id} className="stat-card rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${fluxo.cor}1A` }}>
                      <Icon className="w-4.5 h-4.5" style={{ color: fluxo.cor, width: 18, height: 18 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{fluxo.nome}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${fluxo.ativo ? "text-[hsl(var(--success))] bg-[hsl(var(--success)/0.12)]" : "text-muted-foreground bg-[hsl(var(--surface-3))]"}`}>
                            {fluxo.ativo ? "ATIVO" : "PAUSADO"}
                          </span>
                          <button className="p-1.5 rounded-lg bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors">
                            {fluxo.ativo ? <Pause className="w-3.5 h-3.5 text-muted-foreground" /> : <Play className="w-3.5 h-3.5 text-muted-foreground" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{fluxo.descricao}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{fluxo.disparos}</span> disparos
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Taxa resposta: <span className="font-semibold" style={{ color: fluxo.cor }}>{fluxo.taxa}%</span>
                        </span>
                      </div>
                      {/* Flow steps */}
                      <div className="flex items-center gap-1 mt-3 flex-wrap">
                        <span className="text-[10px] font-semibold text-muted-foreground px-2 py-1 rounded bg-[hsl(var(--surface-3))]">
                          {fluxo.gatilho}
                        </span>
                        {fluxo.acoes.map((acao, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                            <span className="text-[10px] text-muted-foreground px-2 py-1 rounded bg-[hsl(var(--surface-2))]">{acao}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat preview */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">Conversas Recentes</h3>
            <div className="stat-card rounded-xl overflow-hidden">
              <div className="p-3 border-b border-border bg-[hsl(var(--teal)/0.08)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] pulse-teal" />
                  <span className="text-xs font-semibold text-[hsl(var(--teal))]">WhatsApp Business Conectado</span>
                </div>
              </div>
              <div className="p-4 space-y-3 h-80 overflow-y-auto">
                {mensagens.map((m, i) => (
                  <div key={i} className={`flex ${m.tipo === "saida" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 ${m.tipo === "saida" ? "bg-[hsl(var(--teal)/0.15)] rounded-tr-sm" : "bg-[hsl(var(--surface-2))] rounded-tl-sm"}`}>
                      <p className={`text-[10px] font-bold mb-0.5 ${m.tipo === "saida" ? "text-[hsl(var(--teal))]" : "text-muted-foreground"}`}>
                        {m.paciente}
                      </p>
                      <p className="text-xs text-foreground">{m.msg}</p>
                      <p className="text-[9px] text-muted-foreground mt-1 text-right">{m.hora}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2 bg-[hsl(var(--surface-2))] rounded-lg px-3 py-2">
                  <input className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" placeholder="Digite uma mensagem manual..." />
                  <button className="text-[hsl(var(--teal))]">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
