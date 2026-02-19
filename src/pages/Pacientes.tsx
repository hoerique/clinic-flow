import { AppLayout } from "@/components/AppLayout";
import { Search, Filter, Plus, MoreVertical, Phone, Mail, Tag, ChevronDown } from "lucide-react";
import { useState } from "react";

const statusFunil = [
  { key: "lead", label: "Lead", color: "hsl(var(--muted-foreground))" },
  { key: "agendado", label: "Agendado", color: "hsl(var(--info))" },
  { key: "confirmado", label: "Confirmado", color: "hsl(var(--teal))" },
  { key: "em_atendimento", label: "Em Atendimento", color: "hsl(var(--warning))" },
  { key: "pos_consulta", label: "Pós-consulta", color: "hsl(var(--success))" },
  { key: "inativo", label: "Inativo", color: "hsl(var(--destructive))" },
];

const tags = ["Ortodontia", "Implante", "Plano Saúde", "Particular", "Urgência", "VIP", "Inativo"];

const pacientes = [
  { id: 1, nome: "Maria Silva Santos", cpf: "123.456.789-00", telefone: "(11) 99876-5432", email: "maria@email.com", convenio: "Unimed", status: "confirmado", tags: ["Ortodontia", "VIP"], ultimaConsulta: "15/01/2026", valor: "R$ 1.800" },
  { id: 2, nome: "João Carlos Oliveira", cpf: "987.654.321-00", telefone: "(11) 91234-5678", email: "joao@email.com", convenio: "Particular", status: "agendado", tags: ["Implante"], ultimaConsulta: "20/01/2026", valor: "R$ 4.500" },
  { id: 3, nome: "Ana Beatriz Costa", cpf: "456.789.123-00", telefone: "(11) 98765-4321", email: "ana@email.com", convenio: "Amil", status: "lead", tags: ["Plano Saúde"], ultimaConsulta: "—", valor: "R$ 0" },
  { id: 4, nome: "Pedro Henrique Mendes", cpf: "321.654.987-00", telefone: "(11) 97654-3210", email: "pedro@email.com", convenio: "Particular", status: "pos_consulta", tags: ["Ortodontia"], ultimaConsulta: "10/01/2026", valor: "R$ 2.200" },
  { id: 5, nome: "Carla Fernanda Lima", cpf: "654.321.098-00", telefone: "(11) 96543-2109", email: "carla@email.com", convenio: "SulAmérica", status: "inativo", tags: ["Inativo"], ultimaConsulta: "05/10/2025", valor: "R$ 900" },
  { id: 6, nome: "Lucas Eduardo Rocha", cpf: "789.012.345-00", telefone: "(11) 95432-1098", email: "lucas@email.com", convenio: "Particular", status: "em_atendimento", tags: ["Urgência", "Implante"], ultimaConsulta: "Hoje", valor: "R$ 6.000" },
  { id: 7, nome: "Fernanda Alves Nunes", cpf: "012.345.678-00", telefone: "(11) 94321-0987", email: "fernanda@email.com", convenio: "Bradesco Saúde", status: "confirmado", tags: ["VIP"], ultimaConsulta: "18/01/2026", valor: "R$ 3.500" },
  { id: 8, nome: "Ricardo Bento Carvalho", cpf: "345.678.901-00", telefone: "(11) 93210-9876", email: "ricardo@email.com", convenio: "Particular", status: "agendado", tags: ["Ortodontia", "Plano Saúde"], ultimaConsulta: "12/12/2025", valor: "R$ 1.200" },
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

  const filtered = pacientes.filter((p) => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.cpf.includes(search) || p.telefone.includes(search);
    const matchStatus = selectedStatus ? p.status === selectedStatus : true;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout
      title="Pacientes"
      subtitle={`${pacientes.length} pacientes cadastrados`}
      action={
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-opacity shadow-teal">
          <Plus className="w-4 h-4" />
          Novo Paciente
        </button>
      }
    >
      <div className="space-y-4 animate-fade-in">
        {/* Funil de status */}
        <div className="grid grid-cols-6 gap-3">
          {statusFunil.map((s) => {
            const count = pacientes.filter((p) => p.status === s.key).length;
            return (
              <button
                key={s.key}
                onClick={() => setSelectedStatus(selectedStatus === s.key ? null : s.key)}
                className={`stat-card rounded-xl p-3 text-left transition-all ${selectedStatus === s.key ? "border-[hsl(var(--teal))]" : ""}`}
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
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] focus:border-[hsl(var(--teal))]"
              placeholder="Buscar por nome, CPF, telefone..."
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(var(--surface-2))] border border-border text-sm text-muted-foreground hover:text-foreground hover:border-[hsl(var(--teal)/0.3)] transition-all">
            <Filter className="w-4 h-4" />
            Filtros
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Table */}
        <div className="stat-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Paciente</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Contato</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Convênio</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden xl:table-cell">Tags</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Última Consulta</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden xl:table-cell">Valor Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const sc = statusConfig[p.status];
                  return (
                    <tr key={p.id} className={`border-b border-border/50 hover:bg-[hsl(var(--surface-2))] transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-[hsl(var(--surface-1)/0.5)]"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-[hsl(var(--primary-foreground))]">
                              {p.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{p.nome}</p>
                            <p className="text-xs text-muted-foreground">{p.cpf}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {p.telefone}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {p.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">{p.convenio}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${sc.color} ${sc.bg}`}>{sc.label}</span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {p.tags.map((tag) => (
                            <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[hsl(var(--surface-3))] text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">{p.ultimaConsulta}</span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-sm font-semibold text-[hsl(var(--teal))]">{p.valor}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1.5 rounded hover:bg-[hsl(var(--surface-3))] transition-colors">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
