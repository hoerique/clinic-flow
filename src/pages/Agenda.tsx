import { AppLayout } from "@/components/AppLayout";
import { ChevronLeft, ChevronRight, Plus, Clock, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAgendamentos, useProfissionais, usePacientes, useCreateAgendamento } from "@/hooks/useSupabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import React from "react";

const horasdia = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

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

export default function Agenda() {
  const [selectedProf, setSelectedProf] = useState<number | null>(null);
  const [view, setView] = useState<"dia" | "semana">("dia");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAgendamento, setNewAgendamento] = useState({
    paciente_id: "",
    profissional_id: "",
    procedimento: "",
    data_hora: new Date().toISOString(),
    duracao_slots: 2,
    hora: "08:00", // Auxiliar field
  });

  const { data: agendamentos = [], isLoading: loadingApts } = useAgendamentos();
  const { data: profissionais = [], isLoading: loadingProfs } = useProfissionais();
  const { data: pacientes = [] } = usePacientes();
  const createAgendamento = useCreateAgendamento();

  const agendamentosFiltrados = agendamentos.filter(
    (a: any) => selectedProf === null || a.profissional_id === selectedProf
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Construct date string with chosen hour
      const date = new Date();
      const [h, m] = newAgendamento.hora.split(":");
      date.setHours(parseInt(h), parseInt(m), 0, 0);

      await createAgendamento.mutateAsync({
        paciente_id: parseInt(newAgendamento.paciente_id),
        profissional_id: parseInt(newAgendamento.profissional_id),
        procedimento: newAgendamento.procedimento,
        data_hora: date.toISOString(),
        duracao_slots: newAgendamento.duracao_slots,
      });

      toast.success("Agendamento criado com sucesso!");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao criar agendamento");
    }
  };

  const hoje = new Date();

  return (
    <AppLayout
      title="Agenda"
      subtitle="Visualize e gerencie os agendamentos"
      action={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 gradient-primary text-[hsl(var(--primary-foreground))] hover:opacity-90 shadow-teal">
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[hsl(var(--surface-1))] border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">NOVO AGENDAMENTO</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Paciente</Label>
                <Select onValueChange={(v) => setNewAgendamento({ ...newAgendamento, paciente_id: v })}>
                  <SelectTrigger className="bg-[hsl(var(--surface-2))] border-border text-foreground">
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--surface-1))] border-border">
                    {pacientes.map((p: any) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Profissional</Label>
                <Select onValueChange={(v) => setNewAgendamento({ ...newAgendamento, profissional_id: v })}>
                  <SelectTrigger className="bg-[hsl(var(--surface-2))] border-border text-foreground">
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--surface-1))] border-border">
                    {profissionais.map((p: any) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Procedimento</Label>
                  <Input
                    required
                    value={newAgendamento.procedimento}
                    onChange={(e) => setNewAgendamento({ ...newAgendamento, procedimento: e.target.value })}
                    placeholder="Ex: Limpeza"
                    className="bg-[hsl(var(--surface-2))] border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Hora</Label>
                  <Select onValueChange={(v) => setNewAgendamento({ ...newAgendamento, hora: v })}>
                    <SelectTrigger className="bg-[hsl(var(--surface-2))] border-border text-foreground">
                      <SelectValue placeholder="08:00" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(var(--surface-1))] border-border">
                      {horasdia.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createAgendamento.isPending}
                  className="gradient-primary text-[hsl(var(--primary-foreground))] w-full"
                >
                  {createAgendamento.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirmar Agendamento
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4 animate-fade-in">
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
              <Button variant="outline" size="icon" className="h-8 w-8 bg-[hsl(var(--surface-2))] border-border">
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </Button>
              <span className="text-sm font-semibold text-foreground">
                {hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-[hsl(var(--surface-2))] border-border">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedProf(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedProf === null ? "gradient-primary text-[hsl(var(--primary-foreground))]" : "bg-[hsl(var(--surface-2))] text-muted-foreground hover:text-foreground"}`}
            >
              Todos
            </button>
            {profissionais.map((p: any) => (
              <button
                key={p.id}
                onClick={() => setSelectedProf(selectedProf === p.id ? null : p.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedProf === p.id ? "ring-1" : "bg-[hsl(var(--surface-2))] text-muted-foreground hover:text-foreground"}`}
                style={selectedProf === p.id ? { ringColor: p.cor, color: p.cor, background: `${p.cor}1A` } : {}}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: p.cor }} />
                {p.nome}
              </button>
            ))}
          </div>
        </div>

        <div className="stat-card rounded-xl overflow-hidden border border-border">
          <div className="flex">
            <div className="w-16 flex-shrink-0 border-r border-border bg-[hsl(var(--surface-2)/0.3)]">
              <div className="h-12 border-b border-border" />
              {horasdia.map((hora) => (
                <div key={hora} className="h-14 border-b border-border/50 px-2 flex items-start pt-1">
                  <span className="text-[10px] font-mono text-muted-foreground">{hora}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-1 overflow-x-auto">
              {(selectedProf ? profissionais.filter((p: any) => p.id === selectedProf) : profissionais).map((prof: any) => {
                const profApts = agendamentosFiltrados.filter((a: any) => a.profissional_id === prof.id);
                return (
                  <div key={prof.id} className="flex-1 min-w-[200px] border-r border-border last:border-r-0">
                    <div className="h-12 border-b border-border flex items-center justify-center gap-2 px-3 sticky top-0 bg-[hsl(var(--surface-1))] z-10">
                      <div className="w-2 h-2 rounded-full" style={{ background: prof.cor }} />
                      <span className="text-xs font-semibold text-foreground truncate">{prof.nome}</span>
                    </div>
                    <div className="relative">
                      {horasdia.map((hora) => (
                        <div key={hora} className="h-14 border-b border-border/30 hover:bg-[hsl(var(--surface-2)/0.5)] transition-colors cursor-pointer" />
                      ))}
                      <div className="absolute inset-0 pointer-events-none">
                        {profApts.map((apt: any, idx: number) => {
                          const aptDate = new Date(apt.data_hora);
                          const aptHora = `${aptDate.getHours().toString().padStart(2, '0')}:${aptDate.getMinutes().toString().padStart(2, '0')}`;
                          const horaIdx = horasdia.indexOf(aptHora);
                          if (horaIdx === -1) return null;
                          const top = horaIdx * 56;
                          const height = (apt.duracao_slots || 2) * 56 - 4;
                          return (
                            <div
                              key={idx}
                              className={`absolute left-1 right-1 rounded-lg border-l-2 p-2 pointer-events-auto cursor-pointer ${statusColor[apt.status] || statusColor.agendado}`}
                              style={{ top: top + 2, height, borderLeftColor: prof.cor }}
                            >
                              <p className={`text-[10px] font-bold truncate ${statusText[apt.status] || statusText.agendado}`}>{apt.pacientes?.nome || apt.paciente_nome}</p>
                              <p className="text-[9px] text-muted-foreground truncate">{apt.procedimento}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock className="w-2 h-2 text-muted-foreground" />
                                <span className="text-[9px] text-muted-foreground">{aptHora}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              {profissionais.length === 0 && !loadingProfs && (
                <div className="flex-1 p-10 text-center text-muted-foreground">
                  Nenhum profissional cadastrado.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Agendado", count: agendamentos.filter((a: any) => a.status === 'agendado' || !a.status).length, color: "hsl(var(--info))" },
            { label: "Confirmado", count: agendamentos.filter((a: any) => a.status === 'confirmado').length, color: "hsl(var(--teal))" },
            { label: "Realizado", count: agendamentos.filter((a: any) => a.status === 'realizado').length, color: "hsl(var(--success))" },
            { label: "Faltou", count: agendamentos.filter((a: any) => a.status === 'faltou').length, color: "hsl(var(--destructive))" },
            { label: "Lista de Espera", count: 0, color: "hsl(var(--warning))" },
          ].map((s) => (
            <div key={s.label} className="stat-card rounded-xl p-3 text-center border border-border">
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.count}</p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

