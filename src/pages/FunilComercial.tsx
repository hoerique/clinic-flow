import { AppLayout } from "@/components/AppLayout";
import { Plus, MoreVertical, DollarSign, Calendar, TrendingUp, User, Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useOportunidades, usePacientes, useProfissionais, useCreateOportunidade, useUpdateOportunidade, useDeleteOportunidade } from "@/hooks/useSupabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const etapas = [
  { key: "avaliacao", label: "Avaliação Realizada", color: "hsl(var(--info))" },
  { key: "orcamento", label: "Orçamento Enviado", color: "hsl(174, 72%, 45%)" },
  { key: "negociacao", label: "Em Negociação", color: "hsl(var(--warning))" },
  { key: "aprovado", label: "Aprovado", color: "hsl(var(--success))" },
  { key: "fechado", label: "Fechado", color: "hsl(142, 70%, 45%)" },
  { key: "perdido", label: "Perdido", color: "hsl(var(--destructive))" },
];

function ProbBar({ value }: { value: number }) {
  const color = value >= 75 ? "hsl(var(--success))" : value >= 50 ? "hsl(var(--teal))" : value >= 25 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--surface-3))]">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[10px] font-bold" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function FunilComercial() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOportunidade, setNewOportunidade] = useState({
    paciente_id: "",
    profissional_id: "",
    procedimento: "",
    valor: "",
    probabilidade: 50,
    etapa: "avaliacao",
    data_previsao: "",
  });

  const { data: oportunidades = [], isLoading } = useOportunidades();
  const { data: pacientes = [] } = usePacientes();
  const { data: profissionais = [] } = useProfissionais();
  const createOportunidade = useCreateOportunidade();
  const updateOportunidade = useUpdateOportunidade();
  const deleteOportunidade = useDeleteOportunidade();

  const handleMove = async (id: string, newEtapa: string) => {
    try {
      await updateOportunidade.mutateAsync({ id, etapa: newEtapa });
      toast.success("Oportunidade movida!");
    } catch (error) {
      toast.error("Erro ao mover oportunidade");
    }
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("oportunidadeId", id);
    e.dataTransfer.effectAllowed = "move";
    // Adiciona classe para feedback visual no card sendo arrastado
    const target = e.target as HTMLElement;
    target.style.opacity = "0.5";
  };

  const onDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = "1";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = async (e: React.DragEvent, newEtapa: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("oportunidadeId");
    if (id) {
      handleMove(id, newEtapa);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta oportunidade?")) return;
    try {
      await deleteOportunidade.mutateAsync(id);
      toast.success("Oportunidade excluída!");
    } catch (error) {
      toast.error("Erro ao excluir oportunidade");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newOportunidade,
        valor: parseFloat(newOportunidade.valor),
        profissional_id: newOportunidade.profissional_id === "" ? null : newOportunidade.profissional_id,
        data_previsao: newOportunidade.data_previsao === "" ? null : newOportunidade.data_previsao,
      };

      await createOportunidade.mutateAsync(payload);
      toast.success("Oportunidade cadastrada com sucesso!");
      setIsDialogOpen(false);
      setNewOportunidade({
        paciente_id: "",
        profissional_id: "",
        procedimento: "",
        valor: "",
        probabilidade: 50,
        etapa: "avaliacao",
        data_previsao: "",
      });
    } catch (error) {
      toast.error("Erro ao cadastrar oportunidade");
    }
  };

  const totalValorFechado = oportunidades
    .filter((o: any) => o.etapa === "fechado")
    .reduce((acc, o) => acc + (o.valor || 0), 0);

  const totalPipeline = oportunidades
    .filter((o: any) => o.etapa !== "perdido" && o.etapa !== "fechado")
    .reduce((acc, o) => acc + (o.valor || 0), 0);

  const taxaConversao = oportunidades.length > 0
    ? Math.round((oportunidades.filter((o: any) => o.etapa === "fechado").length / oportunidades.length) * 100)
    : 0;

  return (
    <AppLayout
      title="Funil Comercial"
      subtitle={`${oportunidades.length} oportunidades registradas`}
      action={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 gradient-primary text-[hsl(var(--primary-foreground))] hover:opacity-90 shadow-teal">
              <Plus className="w-4 h-4" />
              Nova Oportunidade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[hsl(var(--surface-1))] border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground text-center uppercase">NOVA OPORTUNIDADE</DialogTitle>
              <DialogDescription className="sr-only">Cadastre uma nova oportunidade de venda no sistema.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Paciente</Label>
                <Select required onValueChange={(v) => setNewOportunidade({ ...newOportunidade, paciente_id: v })}>
                  <SelectTrigger className="bg-[hsl(var(--surface-2))] border-border text-foreground">
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--surface-1))] border-border">
                    {pacientes.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Procedimento</Label>
                <Input
                  required
                  value={newOportunidade.procedimento}
                  onChange={(e) => setNewOportunidade({ ...newOportunidade, procedimento: e.target.value })}
                  placeholder="Ex: Implante dentário"
                  className="bg-[hsl(var(--surface-2))] border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Profissional Responsável</Label>
                <Select onValueChange={(v) => setNewOportunidade({ ...newOportunidade, profissional_id: v })}>
                  <SelectTrigger className="bg-[hsl(var(--surface-2))] border-border text-foreground">
                    <SelectValue placeholder="Selecione o profissional (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--surface-1))] border-border">
                    {profissionais.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Valor (R$)</Label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={newOportunidade.valor}
                    onChange={(e) => setNewOportunidade({ ...newOportunidade, valor: e.target.value })}
                    placeholder="0.00"
                    className="bg-[hsl(var(--surface-2))] border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Data Previsão</Label>
                  <Input
                    type="date"
                    value={newOportunidade.data_previsao}
                    onChange={(e) => setNewOportunidade({ ...newOportunidade, data_previsao: e.target.value })}
                    className="bg-[hsl(var(--surface-2))] border-border text-foreground"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createOportunidade.isPending}
                  className="gradient-primary text-[hsl(var(--primary-foreground))] w-full flex items-center justify-center gap-2"
                >
                  {createOportunidade.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Salvar Oportunidade"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4 animate-fade-in">
        {/* Summary bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--teal)/0.12)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[hsl(var(--teal))]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pipeline Total</p>
              <p className="text-xl font-bold text-foreground">
                R$ {totalPipeline.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="stat-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--success)/0.12)] flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[hsl(var(--success))]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fechado este mês</p>
              <p className="text-xl font-bold text-foreground">
                R$ {totalValorFechado.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="stat-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--warning)/0.12)] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[hsl(var(--warning))]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
              <p className="text-xl font-bold text-foreground">{taxaConversao}%</p>
            </div>
          </div>
        </div>

        {/* Kanban */}
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {isLoading ? (
            <div className="w-full py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--teal))]" />
              <p className="mt-2 text-sm text-muted-foreground">Carregando funil...</p>
            </div>
          ) : (
            etapas.map((etapa) => {
              const cards = oportunidades.filter((o: any) => o.etapa === etapa.key);
              const totalEtapa = cards.reduce((acc, o) => acc + (o.valor || 0), 0);

              return (
                <div key={etapa.key} className="flex-shrink-0 w-72">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: etapa.color }} />
                      <span className="text-xs font-bold text-foreground">{etapa.label}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-[hsl(var(--surface-3))] text-muted-foreground">
                        {cards.length}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      R$ {(totalEtapa / 1000).toFixed(1)}k
                    </span>
                  </div>

                  <div
                    className="space-y-2.5 min-h-[400px] rounded-xl transition-colors duration-200"
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, etapa.key)}
                  >
                    {cards.map((o: any) => (
                      <div
                        key={o.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, o.id)}
                        onDragEnd={onDragEnd}
                        className="kanban-card rounded-xl p-4 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate"><span>{o.pacientes?.nome || "Paciente"}</span></p>
                            <p className="text-xs text-muted-foreground truncate"><span>{o.procedimento}</span></p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--surface-3))] flex-shrink-0">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[hsl(var(--surface-1))] border-border">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  const phone = o.pacientes?.telefone;
                                  if (phone) navigate(`/automacoes?chat=${phone}`);
                                  else toast.error("Paciente sem telefone cadastrado");
                                }}
                                className="text-xs text-[hsl(var(--teal))] font-bold gap-2"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Conversar no WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-bold">Mover para:</DropdownMenuLabel>
                              {etapas.map((e) => (
                                <DropdownMenuItem
                                  key={e.key}
                                  disabled={e.key === o.etapa}
                                  onClick={() => handleMove(o.id, e.key)}
                                  className="text-xs"
                                >
                                  {e.label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-xs text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
                                onClick={() => handleDelete(o.id)}
                              >
                                Excluir Oportunidade
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <ProbBar value={o.probabilidade} />

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-bold" style={{ color: etapa.color }}>
                            R$ {o.valor?.toLocaleString('pt-BR')}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                            <Calendar className="w-3 h-3" />
                            <span>{o.data_previsao ? new Date(o.data_previsao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : "--/--"}</span>
                          </div>
                        </div>

                        {o.profissionais?.nome && (
                          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/50">
                            <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                              <span className="text-[8px] font-bold text-[hsl(var(--primary-foreground))]">
                                {o.profissionais.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground truncate">{o.profissionais.nome}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    <button className="w-full py-3 rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground hover:border-[hsl(var(--teal)/0.4)] hover:text-[hsl(var(--teal))] hover:bg-[hsl(var(--teal)/0.02)] transition-all flex items-center justify-center gap-1.5 font-medium">
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
