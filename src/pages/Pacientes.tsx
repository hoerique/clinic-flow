import { AppLayout } from "@/components/AppLayout";
import { Search, Filter, Plus, MoreVertical, Phone, Mail, Tag, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { usePacientes, useCreatePaciente, useDeletePaciente, useProfissionais, useUpdatePaciente } from "@/hooks/useSupabase";
import { useSearchParams } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const statusFunil = [
  { key: "total", label: "Pacientes", color: "hsl(var(--teal))" },
  { key: "agendado", label: "Agendado", color: "hsl(var(--info))" },
  { key: "confirmado", label: "Confirmado", color: "hsl(var(--teal))" },
  { key: "realizado", label: "Realizado", color: "hsl(var(--success))" },
  { key: "faltou", label: "Faltou", color: "hsl(var(--destructive))" },
  { key: "cancelado", label: "Cancelado", color: "hsl(var(--warning))" },
  { key: "lista_espera", label: "Lista de Espera", color: "hsl(var(--warning))" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  agendado: { label: "Agendado", color: "text-[hsl(var(--info))]", bg: "bg-[hsl(var(--info)/0.12)]" },
  confirmado: { label: "Confirmado", color: "text-[hsl(var(--teal))]", bg: "bg-[hsl(var(--teal)/0.12)]" },
  realizado: { label: "Realizado", color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success)/0.12)]" },
  faltou: { label: "Faltou", color: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive)/0.12)]" },
  cancelado: { label: "Cancelado", color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning)/0.12)]" },
  lista_espera: { label: "Lista de Espera", color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning)/0.12)]" },
  lead: { label: "Lead", color: "text-muted-foreground", bg: "bg-[hsl(var(--surface-3))]" },
};

export default function Pacientes() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPaciente, setNewPaciente] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    convenio: "Particular",
    status: "agendado",
    tags: [] as string[],
    profissional_id: "",
    data_status: new Date().toISOString(),
    ultima_consulta: "",
  });

  const { data: pacientes = [], isLoading } = usePacientes();
  const { data: profissionais = [] } = useProfissionais();
  const createPaciente = useCreatePaciente();
  const updatePaciente = useUpdatePaciente();
  const deletePaciente = useDeletePaciente();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const nome = searchParams.get("nome");
    const telefone = searchParams.get("telefone");
    const novo = searchParams.get("novo");

    if (novo === "true") {
      setNewPaciente(prev => ({
        ...prev,
        nome: nome || "",
        telefone: telefone || "",
      }));
      setIsDialogOpen(true);
      // Limpa os parâmetros após processar
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const filtered = pacientes.filter((p: any) => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.cpf && p.cpf.includes(search)) || (p.telefone && p.telefone.includes(search));
    const matchStatus = selectedStatus ? p.status === selectedStatus : true;
    return matchSearch && matchStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Enviando novo paciente:", newPaciente);
      await createPaciente.mutateAsync(newPaciente);

      toast.success("Paciente cadastrado com sucesso!");
      setIsDialogOpen(false);

      // Pequeno delay no reset do estado para evitar flicker ou conflitos de renderização no Dialog
      setTimeout(() => {
        setNewPaciente({
          nome: "",
          cpf: "",
          telefone: "",
          email: "",
          convenio: "Particular",
          status: "agendado",
          tags: [],
          profissional_id: "",
          data_status: new Date().toISOString(),
          ultima_consulta: "",
        });
      }, 100);
    } catch (error: any) {
      console.error("Erro detalhado ao cadastrar paciente:", error);
      const errorMessage = error.message || "Erro desconhecido";
      const detail = error.details || "";
      toast.error(`Erro ao cadastrar: ${errorMessage}. ${detail}`);
    }
  };

  return (
    <AppLayout
      title="Pacientes"
      subtitle={`${pacientes.length} pacientes cadastrados`}
      action={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 gradient-primary text-[hsl(var(--primary-foreground))] hover:opacity-90 shadow-teal">
              <Plus className="w-4 h-4" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[hsl(var(--surface-1))] border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">CADASTRAR NOVO PACIENTE</DialogTitle>
              <DialogDescription className="sr-only">Preencha os dados abaixo para cadastrar um novo paciente no sistema.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-muted-foreground">Nome Completo</Label>
                <Input
                  id="nome"
                  required
                  value={newPaciente.nome}
                  onChange={(e) => setNewPaciente({ ...newPaciente, nome: e.target.value })}
                  placeholder="Ex: Maria Silva"
                  className="bg-[hsl(var(--surface-2))] border-border text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-muted-foreground">CPF</Label>
                  <Input
                    id="cpf"
                    value={newPaciente.cpf}
                    onChange={(e) => setNewPaciente({ ...newPaciente, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="bg-[hsl(var(--surface-2))] border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-muted-foreground">Telefone</Label>
                  <Input
                    id="telefone"
                    value={newPaciente.telefone}
                    onChange={(e) => setNewPaciente({ ...newPaciente, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="bg-[hsl(var(--surface-2))] border-border text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPaciente.email}
                  onChange={(e) => setNewPaciente({ ...newPaciente, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="bg-[hsl(var(--surface-2))] border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profissional" className="text-muted-foreground">Profissional Responsável</Label>
                <select
                  id="profissional"
                  className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-[hsl(var(--teal))] focus:outline-none"
                  value={newPaciente.profissional_id}
                  onChange={(e) => setNewPaciente({ ...newPaciente, profissional_id: e.target.value })}
                >
                  <option value="">Selecione um profissional...</option>
                  {profissionais.map((prof: any) => (
                    <option key={prof.id} value={prof.id}>{prof.nome}</option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createPaciente.isPending}
                  className="gradient-primary text-[hsl(var(--primary-foreground))] w-full flex items-center justify-center gap-2"
                >
                  {createPaciente.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Salvar Paciente"
                  )}
                </Button>
              </DialogFooter>
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="space-y-2">
                  <Label htmlFor="ultima_consulta" className="text-muted-foreground">Última Consulta (Manual)</Label>
                  <Input
                    id="ultima_consulta"
                    type="date"
                    value={newPaciente.ultima_consulta}
                    onChange={(e) => setNewPaciente({ ...newPaciente, ultima_consulta: e.target.value })}
                    className="bg-[hsl(var(--surface-2))] border-border text-foreground"
                  />
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4 animate-fade-in">
        {/* Funil de status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {statusFunil.map((s) => {
            const count = s.key === "total"
              ? pacientes.length
              : pacientes.filter((p: any) => p.status === s.key).length;

            return (
              <button
                key={s.key}
                onClick={() => setSelectedStatus(s.key === "total" ? null : (selectedStatus === s.key ? null : s.key))}
                className={`stat-card rounded-xl p-3 text-left transition-all ${(s.key === "total" && selectedStatus === null) || selectedStatus === s.key
                  ? "ring-1 ring-[hsl(var(--teal))]"
                  : ""
                  }`}
              >
                <p className="text-lg font-bold text-foreground">{count}</p>
                <p className="text-[11px] font-medium" style={{ color: s.color }}>{s.label}</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[hsl(var(--surface-2))] border-border pl-10 h-10"
              placeholder="Buscar por nome, CPF, telefone..."
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-[hsl(var(--surface-2))] border-border text-muted-foreground hover:text-foreground">
            <Filter className="w-4 h-4" />
            Filtros
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>

        {/* Table */}
        <div className="stat-card rounded-xl overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-[hsl(var(--surface-2)/0.5)]">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Paciente</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Contato</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Profissional</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden xl:table-cell">Data e Hora</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--teal))]" />
                      <p className="mt-2 text-sm text-muted-foreground">Carregando pacientes...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      Nenhum paciente encontrado.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p: any, i: number) => {
                    const sc = statusConfig[p.status] || statusConfig.agendado;
                    return (
                      <tr key={p.id} className={`hover:bg-[hsl(var(--surface-2))] transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-[hsl(var(--surface-1)/0.5)]"}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-[hsl(var(--primary-foreground))]">
                                {p.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{p.nome}</p>
                              <p className="text-xs text-muted-foreground">{p.cpf || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {p.telefone || "—"}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {p.email || "—"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">{(p as any).profissionais?.nome || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            className={`status-badge text-[10px] cursor-pointer appearance-none ${sc.color} ${sc.bg} border-none outline-none`}
                            value={p.status}
                            onChange={(e) => {
                              updatePaciente.mutate({
                                id: p.id,
                                status: e.target.value,
                                data_status: new Date().toISOString()
                              });
                            }}
                          >
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <option key={key} value={key} className="bg-[hsl(var(--surface-1))] text-foreground">{config.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {p.data_status ? new Date(p.data_status).toLocaleString("pt-BR", {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded hover:bg-[hsl(var(--surface-3))] transition-colors">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[hsl(var(--surface-1))] border-border">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={async () => {
                                  if (confirm("Deseja realmente excluir este paciente?")) {
                                    try {
                                      await deletePaciente.mutateAsync(p.id);
                                      toast.success("Paciente excluído com sucesso!");
                                    } catch (error: any) {
                                      toast.error("Erro ao excluir: " + error.message);
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir Paciente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

