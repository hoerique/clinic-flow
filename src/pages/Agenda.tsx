import { AppLayout } from "@/components/AppLayout";
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { useState } from "react";

const profissionais = [
  { id: 1, nome: "Dr. Anderson", cor: "hsl(174, 72%, 45%)" },
  { id: 2, nome: "Dra. Beatriz", cor: "hsl(199, 95%, 55%)" },
  { id: 3, nome: "Dr. Carlos", cor: "hsl(38, 92%, 55%)" },
];

const horasdia = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

const agendamentos = [
  { hora: "08:00", profId: 1, paciente: "Maria Silva", proc: "Limpeza", duracao: 2, status: "realizado" },
  { hora: "09:00", profId: 1, paciente: "João Santos", proc: "Ortodontia", duracao: 3, status: "confirmado" },
  { hora: "10:30", profId: 1, paciente: "Ana Costa", proc: "Clareamento", duracao: 2, status: "agendado" },
  { hora: "14:00", profId: 1, paciente: "Carla Lima", proc: "Implante", duracao: 4, status: "faltou" },
  { hora: "08:30", profId: 2, paciente: "Pedro Mendes", proc: "Avaliação", duracao: 1, status: "confirmado" },
  { hora: "10:00", profId: 2, paciente: "Lucas Rocha", proc: "Limpeza", duracao: 2, status: "agendado" },
  { hora: "14:00", profId: 2, paciente: "Fernanda Nunes", proc: "Ortodontia", duracao: 3, status: "agendado" },
  { hora: "08:00", profId: 3, paciente: "Ricardo Bento", proc: "Implante", duracao: 5, status: "realizado" },
  { hora: "11:00", profId: 3, paciente: "Paula Santos", proc: "Clareamento", duracao: 2, status: "confirmado" },
  { hora: "15:00", profId: 3, paciente: "Roberto Lima", proc: "Consulta", duracao: 1, status: "agendado" },
];

const statusColor: Record<string, string> = {
  realizado: "border-[hsl(var(--success))] bg-[hsl(var(--success)/0.12)]",
  confirmado: "border-[hsl(var(--teal))] bg-[hsl(var(--teal)/0.12)]",
  agendado: "border-[hsl(var(--info))] bg-[hsl(var(--info)/0.12)]",
  faltou: "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.12)]",
  cancelado: "border-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.12)]",
};

const statusText: Record<string, string> = {
  realizado: "text-[hsl(var(--success))]",
  confirmado: "text-[hsl(var(--teal))]",
  agendado: "text-[hsl(var(--info))]",
  faltou: "text-[hsl(var(--destructive))]",
  cancelado: "text-[hsl(var(--warning))]",
};

const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const hoje = new Date();
const diaHojeIdx = hoje.getDay() === 0 ? 6 : hoje.getDay() - 1;

export default function Agenda() {
  const [selectedProf, setSelectedProf] = useState<number | null>(null);
  const [view, setView] = useState<"dia" | "semana">("dia");

  const agendamentosFiltrados = agendamentos.filter(
    (a) => selectedProf === null || a.profId === selectedProf
  );

  return (
    <AppLayout
      title="Agenda"
      subtitle="Visualize e gerencie os agendamentos"
      action={
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-opacity shadow-teal">
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      }
    >
      <div className="space-y-4 animate-fade-in">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[hsl(var(--surface-2))] rounded-lg p-1">
              {["dia", "semana"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as "dia" | "semana")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${view === v ? "gradient-primary text-[hsl(var(--primary-foreground))]" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg bg-[hsl(var(--surface-2))] border border-border hover:border-[hsl(var(--teal)/0.3)] transition-all">
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <span className="text-sm font-semibold text-foreground">
                {hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </span>
              <button className="p-1.5 rounded-lg bg-[hsl(var(--surface-2))] border border-border hover:border-[hsl(var(--teal)/0.3)] transition-all">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[hsl(var(--teal))] bg-[hsl(var(--teal)/0.1)] hover:bg-[hsl(var(--teal)/0.15)] transition-colors">
                Hoje
              </button>
            </div>
          </div>

          {/* Profissionais filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedProf(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedProf === null ? "gradient-primary text-[hsl(var(--primary-foreground))]" : "bg-[hsl(var(--surface-2))] text-muted-foreground hover:text-foreground"}`}
            >
              Todos
            </button>
            {profissionais.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProf(selectedProf === p.id ? null : p.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedProf === p.id ? "border" : "bg-[hsl(var(--surface-2))] text-muted-foreground hover:text-foreground"}`}
                style={selectedProf === p.id ? { borderColor: p.cor, color: p.cor, background: `${p.cor}1A` } : {}}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: p.cor }} />
                {p.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="stat-card rounded-xl overflow-hidden">
          <div className="flex">
            {/* Time column */}
            <div className="w-16 flex-shrink-0 border-r border-border">
              <div className="h-12 border-b border-border" />
              {horasdia.map((hora) => (
                <div key={hora} className="h-14 border-b border-border/50 px-2 flex items-start pt-1">
                  <span className="text-[10px] font-mono text-muted-foreground">{hora}</span>
                </div>
              ))}
            </div>

            {/* Profissionais columns */}
            {(selectedProf ? profissionais.filter(p => p.id === selectedProf) : profissionais).map((prof) => {
              const profApts = agendamentosFiltrados.filter((a) => a.profId === prof.id);
              return (
                <div key={prof.id} className="flex-1 border-r border-border last:border-r-0 min-w-0">
                  {/* Header */}
                  <div className="h-12 border-b border-border flex items-center justify-center gap-2 px-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: prof.cor }} />
                    <span className="text-xs font-semibold text-foreground truncate">{prof.nome}</span>
                  </div>
                  {/* Time slots */}
                  <div className="relative">
                    {horasdia.map((hora) => (
                      <div key={hora} className="h-14 border-b border-border/30 hover:bg-[hsl(var(--surface-2)/0.5)] transition-colors cursor-pointer" />
                    ))}
                    {/* Appointments overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {profApts.map((apt, idx) => {
                        const horaIdx = horasdia.indexOf(apt.hora);
                        if (horaIdx === -1) return null;
                        const top = horaIdx * 56;
                        const height = apt.duracao * 56 - 4;
                        return (
                          <div
                            key={idx}
                            className={`absolute left-1 right-1 rounded-lg border-l-2 p-2 pointer-events-auto cursor-pointer ${statusColor[apt.status]}`}
                            style={{ top: top + 2, height, borderLeftColor: prof.cor }}
                          >
                            <p className={`text-xs font-bold truncate ${statusText[apt.status]}`}>{apt.paciente}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{apt.proc}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">{apt.hora}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Agendado", count: 4, color: "hsl(var(--info))" },
            { label: "Confirmado", count: 3, color: "hsl(var(--teal))" },
            { label: "Realizado", count: 2, color: "hsl(var(--success))" },
            { label: "Faltou", count: 1, color: "hsl(var(--destructive))" },
            { label: "Lista de Espera", count: 2, color: "hsl(var(--warning))" },
          ].map((s) => (
            <div key={s.label} className="stat-card rounded-xl p-3 text-center">
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
