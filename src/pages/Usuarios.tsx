import { AppLayout } from "@/components/AppLayout";
import { Plus, Shield, User, Eye, Edit, Trash2, MoreVertical, Lock } from "lucide-react";

const perfis = [
  {
    nome: "Administrador",
    descricao: "Acesso total ao sistema, relatórios e configurações",
    usuarios: 1,
    cor: "hsl(var(--teal))",
    permissoes: ["Dashboard", "Pacientes", "Agenda", "Financeiro", "Relatórios", "Usuários", "Configurações"],
  },
  {
    nome: "Recepcionista",
    descricao: "Agenda, pacientes e comunicações básicas",
    usuarios: 2,
    cor: "hsl(var(--info))",
    permissoes: ["Dashboard (básico)", "Pacientes", "Agenda", "Automações"],
  },
  {
    nome: "Profissional",
    descricao: "Visualiza agenda própria e prontuários",
    usuarios: 3,
    cor: "hsl(var(--warning))",
    permissoes: ["Agenda (própria)", "Pacientes (próprios)", "Financeiro (próprio)"],
  },
];

const usuarios = [
  { id: 1, nome: "Dr. Anderson Lima", email: "anderson@clinica.com", perfil: "Administrador", status: "ativo", ultimoAcesso: "Hoje, 09:42" },
  { id: 2, nome: "Júlia Recepção", email: "julia@clinica.com", perfil: "Recepcionista", status: "ativo", ultimoAcesso: "Hoje, 08:15" },
  { id: 3, nome: "Dra. Beatriz Santos", email: "beatriz@clinica.com", perfil: "Profissional", status: "ativo", ultimoAcesso: "Ontem, 18:30" },
  { id: 4, nome: "Dr. Carlos Mendes", email: "carlos@clinica.com", perfil: "Profissional", status: "ativo", ultimoAcesso: "Hoje, 10:00" },
  { id: 5, nome: "Ana Auxiliar", email: "ana@clinica.com", perfil: "Recepcionista", status: "inativo", ultimoAcesso: "05/01/2026" },
  { id: 6, nome: "Pedro Assistente", email: "pedro@clinica.com", perfil: "Profissional", status: "ativo", ultimoAcesso: "Ontem, 15:20" },
];

const perfilCor: Record<string, string> = {
  Administrador: "text-[hsl(var(--teal))] bg-[hsl(var(--teal)/0.12)]",
  Recepcionista: "text-[hsl(var(--info))] bg-[hsl(var(--info)/0.12)]",
  Profissional: "text-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.12)]",
};

export default function Usuarios() {
  return (
    <AppLayout
      title="Usuários & Perfis"
      subtitle="Gerencie acessos e permissões da equipe"
      action={
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-opacity shadow-teal">
          <Plus className="w-4 h-4" />
          Convidar Usuário
        </button>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Perfis de acesso */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Perfis de Acesso</h3>
          <div className="grid grid-cols-3 gap-4">
            {perfis.map((perfil) => (
              <div key={perfil.nome} className="stat-card rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${perfil.cor}1A` }}>
                    <Shield className="w-5 h-5" style={{ color: perfil.cor }} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{perfil.usuarios} usuário{perfil.usuarios !== 1 ? "s" : ""}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{perfil.nome}</p>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">{perfil.descricao}</p>
                <div className="space-y-1.5">
                  {perfil.permissoes.map((perm) => (
                    <div key={perm} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: perfil.cor }} />
                      <span className="text-[11px] text-muted-foreground">{perm}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full py-1.5 rounded-lg text-xs font-medium bg-[hsl(var(--surface-3))] text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--surface-2))] transition-colors">
                  Editar Permissões
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Users table */}
        <div className="stat-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Usuários da Clínica</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[hsl(var(--surface-3))] px-3 py-1.5 rounded-lg">
              <Lock className="w-3.5 h-3.5" />
              Plano Professional: 6/10 usuários
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {["Usuário", "Email", "Perfil", "Status", "Último Acesso", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-border/30 hover:bg-[hsl(var(--surface-2))] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                        <span className="text-xs font-bold text-[hsl(var(--primary-foreground))]">
                          {u.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{u.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`status-badge ${perfilCor[u.perfil]}`}>{u.perfil}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${u.status === "ativo" ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--muted-foreground))]"}`} />
                      <span className={`text-xs font-medium ${u.status === "ativo" ? "text-[hsl(var(--success))]" : "text-muted-foreground"}`}>
                        {u.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{u.ultimoAcesso}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-[hsl(var(--surface-3))] transition-colors">
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-[hsl(var(--destructive)/0.1)] transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--destructive)/0.6)]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
