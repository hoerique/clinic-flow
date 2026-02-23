import { AppLayout } from "@/components/AppLayout";
import { Search, Filter, Plus, MoreVertical, Phone, Mail, Tag, ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { usePacientes, useCreatePaciente } from "@/hooks/useSupabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const statusFunil = [
  { key: "lead", label: "Lead", color: "hsl(var(--muted-foreground))" },
  { key: "agendado", label: "Agendado", color: "hsl(var(--info))" },
  { key: "confirmado", label: "Confirmado", color: "hsl(var(--teal))" },
  { key: "em_atendimento", label: "Em Atendimento", color: "hsl(var(--warning))" },
  { key: "pos_consulta", label: "Pós-consulta", color: "hsl(var(--success))" },
  { key: "inativo", label: "Inativo", color: "hsl(var(--destructive))" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  lead: { label: "Lead", color: "text-muted-foreground", bg: "bg-[hsl(var(--surface-3))]" },
  agendado: { label: "Agendado", color: "text-[hsl(var(--info))]", bg: "bg-[hsl(var(--info)/0.12)]" },
  confirmado: { label: "Confirmado", color: "text-[hsl(var(--teal))]", bg: "bg-[hsl(var(--teal)/0.12)]" },
  em_atendimento: { label: "Em Atendimento", color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning)/0.12)]" },
  pos_consulta: { label: "Pós-consulta", color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success)/0.12)]" },
  inativo: { label: "Inativo", color: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive)/0.12)]" },
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
    status: "lead",
    tags: [] as string[],
  });

  const { data: pacientes = [], isLoading } = usePacientes();
  const createPaciente = useCreatePaciente();

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
          status: "lead",
          tags: [],
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
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4 animate-fade-in">
        {/* Funil de status */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statusFunil.map((s) => {
            const count = pacientes.filter((p: any) => p.status === s.key).length;
            return (
              <button
                key={s.key}
                onClick={() => setSelectedStatus(selectedStatus === s.key ? null : s.key)}
                className={`stat-card rounded-xl p-3 text-left transition-all ${selectedStatus === s.key ? "ring-1 ring-[hsl(var(--teal))]" : ""}`}
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
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Convênio</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden xl:table-cell">Tags</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Última Consulta</th>
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
                    const sc = statusConfig[p.status] || statusConfig.lead;
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
                          <span className="text-sm text-muted-foreground">{p.convenio}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`status-badge text-[10px] ${sc.color} ${sc.bg}`}>{sc.label}</span>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <div className="flex gap-1 flex-wrap">
                            {p.tags?.map((tag: string) => (
                              <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[hsl(var(--surface-3))] text-muted-foreground">
                                {tag}
                              </span>
                            )) || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {p.ultima_consulta ? new Date(p.ultima_consulta).toLocaleDateString("pt-BR") : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-1.5 rounded hover:bg-[hsl(var(--surface-3))] transition-colors">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
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

