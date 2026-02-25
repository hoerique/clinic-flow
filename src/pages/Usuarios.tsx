import { AppLayout } from "@/components/AppLayout";
import { Plus, Shield, Edit, Trash2, Lock, X, Phone, Briefcase, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const perfis = [
  {
    nome: "Administrador",
    descricao: "Acesso total ao sistema, relatórios e configurações",
    usuarios: 0,
    cor: "hsl(var(--teal))",
    permissoes: ["Dashboard", "Pacientes", "Agenda", "Financeiro", "Relatórios", "Usuários", "Configurações"],
  },
  {
    nome: "Recepcionista",
    descricao: "Agenda, pacientes e comunicações básicas",
    usuarios: 0,
    cor: "hsl(var(--info))",
    permissoes: ["Dashboard (básico)", "Pacientes", "Agenda", "Automações"],
  },
  {
    nome: "Profissional",
    descricao: "Visualiza agenda própria e prontuários",
    usuarios: 0,
    cor: "hsl(var(--warning))",
    permissoes: ["Agenda (própria)", "Pacientes (próprios)", "Financeiro (próprio)"],
  },
];

const perfilCor: Record<string, string> = {
  Administrador: "text-[hsl(var(--teal))] bg-[hsl(var(--teal)/0.12)]",
  Recepcionista: "text-[hsl(var(--info))] bg-[hsl(var(--info)/0.12)]",
  Profissional: "text-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.12)]",
  Usuario: "text-muted-foreground bg-[hsl(var(--surface-3))]",
};

export default function Usuarios() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteNome, setInviteNome] = useState("");
  const [invitePerfil, setInvitePerfil] = useState("Recepcionista");

  // Campos extras para Profissionais
  const [especialidade, setEspecialidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cor, setCor] = useState("#0ea5e9");

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      // Busca profissionais para mostrar na tabela (já que são os mais importantes para a agenda)
      const { data: profissionais, error: profError } = await supabase
        .from('profissionais')
        .select('*');

      if (profError) throw profError;

      // Busca perfis para complementar a lista
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');

      if (profileError) throw profileError;

      // Combinar os dados (simulando uma lista unificada para o CRM)
      const combined = (profissionais || []).map(p => ({
        id: p.id,
        nome: p.nome,
        email: p.email,
        perfil: "Profissional",
        status: p.ativo ? "ativo" : "inativo",
        created_at: p.created_at,
        especialidade: p.especialidade,
        telefone: p.telefone,
        cor: p.cor
      }));

      const otherProfiles = (profiles || []).filter(pr => !combined.some(c => c.id === pr.id)).map(pr => ({
        ...pr,
        status: pr.status || 'ativo'
      }));

      setUsers([...combined, ...otherProfiles]);

    } catch (error: any) {
      toast({
        title: "Erro ao buscar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Cadastrar na tabela de profissionais diretamente no Supabase
      if (invitePerfil === "Profissional") {
        const { error: profError } = await supabase
          .from('profissionais')
          .insert({
            nome: inviteNome,
            email: inviteEmail,
            especialidade: especialidade,
            telefone: telefone,
            cor: cor,
            ativo: true
          });

        if (profError) throw profError;
      }

      // 2. Criar um registro em profiles se não for profissional ou como fallback
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          nome: inviteNome,
          email: inviteEmail,
          perfil: invitePerfil,
          status: 'ativo'
        });

      // 3. Criar um convite para o login (auth)
      const { error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          email: inviteEmail,
          role: invitePerfil,
          status: 'pendente',
          metadata: {
            nome: inviteNome,
            especialidade,
            telefone,
            cor
          }
        });

      toast({
        title: "Sucesso!",
        description: `${inviteNome} foi cadastrado como ${invitePerfil}.`,
      });

      setShowInviteModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // Atualizar profissional se o perfil for/era profissional
      if (invitePerfil === "Profissional" || editingUser.perfil === "Profissional") {
        const { error: profError } = await supabase
          .from('profissionais')
          .upsert({
            id: editingUser.id,
            nome: inviteNome,
            email: inviteEmail,
            especialidade: especialidade,
            telefone: telefone,
            cor: cor,
            ativo: editingUser.status === 'ativo'
          });

        if (profError) throw profError;
      }

      // Atualizar profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome: inviteNome,
          perfil: invitePerfil,
          status: editingUser.status
        })
        .eq('id', editingUser.id);

      toast({
        title: "Atualizado!",
        description: "Os dados foram salvos com sucesso.",
      });

      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setInviteNome(user.nome || "");
    setInviteEmail(user.email || "");
    setInvitePerfil(user.perfil || "Recepcionista");
    setEspecialidade(user.especialidade || "");
    setTelefone(user.telefone || "");
    setCor(user.cor || "#0ea5e9");
    setShowEditModal(true);
  };

  const toggleStatus = async (user: any) => {
    const newStatus = user.status === 'ativo' ? 'inativo' : 'ativo';
    try {
      if (user.perfil === "Profissional") {
        await supabase
          .from('profissionais')
          .update({ ativo: newStatus === 'ativo' })
          .eq('id', user.id);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', user.id);

      fetchData();
      toast({
        title: "Status alterado",
        description: `Usuário ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao marcar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setInviteEmail("");
    setInviteNome("");
    setInvitePerfil("Recepcionista");
    setEspecialidade("");
    setTelefone("");
    setCor("#0ea5e9");
    setEditingUser(null);
  };

  const perfisComContagem = perfis.map(p => ({
    ...p,
    usuarios: users.filter(u => u.perfil === p.nome).length
  }));

  return (
    <AppLayout
      title="Usuários & Perfis"
      subtitle="Gerencie acessos e permissões da equipe"
      action={
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-opacity shadow-teal"
        >
          <Plus className="w-4 h-4" />
          Convidar Usuário
        </button>
      }
    >
      <div className="space-y-6 animate-fade-in">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Perfis de Acesso</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {perfisComContagem.map((perfil) => (
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
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Usuários e Profissionais</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[hsl(var(--surface-3))] px-3 py-1.5 rounded-lg">
              <Lock className="w-3.5 h-3.5" />
              Equipe da Clínica: {users.length}/10 usuários
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  {["Nome", "Email", "Perfil", "Status", "Cadastro", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">Carregando...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhum registro encontrado.</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-[hsl(var(--surface-2))] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-[hsl(var(--primary-foreground))] text-xs font-bold">
                          {u.nome ? u.nome.split(" ").map((n: any) => n[0]).slice(0, 2).join("") : "U"}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{u.nome}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`status-badge ${perfilCor[u.perfil] || perfilCor.Usuario}`}>{u.perfil}</span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleStatus(u)}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                      >
                        <div className={`w-2 h-2 rounded-full ${u.status === "ativo" ? "bg-[hsl(var(--success))]" : "bg-muted-foreground"}`} />
                        <span className={`text-xs font-medium ${u.status === "ativo" ? "text-[hsl(var(--success))]" : "text-muted-foreground"}`}>{u.status === "ativo" ? "Ativo" : "Inativo"}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded hover:bg-[hsl(var(--surface-3))] transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-[hsl(var(--surface-1))] border border-border rounded-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Novo Membro da Equipe</h2>
              <button onClick={() => { setShowInviteModal(false); resetForm(); }} className="p-1 rounded-lg hover:bg-[hsl(var(--surface-3))] transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">Nome Completo</label>
                <input required value={inviteNome} onChange={(e) => setInviteNome(e.target.value)} className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-[hsl(var(--teal))]" placeholder="Dr. Nome Exemplo" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">Email</label>
                <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-[hsl(var(--teal))]" placeholder="exemplo@clinica.com" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">Perfil</label>
                <select value={invitePerfil} onChange={(e) => setInvitePerfil(e.target.value)} className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-[hsl(var(--teal))]">
                  <option value="Administrador">Administrador</option>
                  <option value="Recepcionista">Recepcionista</option>
                  <option value="Profissional">Profissional</option>
                </select>
              </div>

              {invitePerfil === "Profissional" && (
                <div className="space-y-4 p-4 bg-[hsl(var(--surface-2))] rounded-xl border border-dashed border-border animate-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3" /> Especialidade</label>
                    <input value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} className="w-full bg-[hsl(var(--surface-1))] border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-[hsl(var(--teal))]" placeholder="Ex: Dentista" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Telefone</label>
                    <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full bg-[hsl(var(--surface-1))] border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-[hsl(var(--teal))]" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Palette className="w-3 h-3" /> Cor na Agenda</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer overflow-hidden" />
                      <span className="text-xs font-mono text-muted-foreground uppercase">{cor}</span>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-3 mt-4 rounded-xl gradient-primary text-white font-bold shadow-teal hover:opacity-90 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Cadastrar no Supabase
              </button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-[hsl(var(--surface-1))] border border-border rounded-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Editar Membro da Equipe</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="p-1 rounded-lg hover:bg-[hsl(var(--surface-3))] transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">Nome Completo</label>
                <input required value={inviteNome} onChange={(e) => setInviteNome(e.target.value)} className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-[hsl(var(--teal))]" placeholder="Dr. Nome Exemplo" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">Email (apenas leitura)</label>
                <input type="email" readOnly value={inviteEmail} className="w-full bg-[hsl(var(--surface-3))] border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground cursor-not-allowed" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider">Perfil</label>
                <select value={invitePerfil} onChange={(e) => setInvitePerfil(e.target.value)} className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-[hsl(var(--teal))]">
                  <option value="Administrador">Administrador</option>
                  <option value="Recepcionista">Recepcionista</option>
                  <option value="Profissional">Profissional</option>
                </select>
              </div>

              {invitePerfil === "Profissional" && (
                <div className="space-y-4 p-4 bg-[hsl(var(--surface-2))] rounded-xl border border-dashed border-border animate-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3" /> Especialidade</label>
                    <input value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} className="w-full bg-[hsl(var(--surface-1))] border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-[hsl(var(--teal))]" placeholder="Ex: Dentista" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Telefone</label>
                    <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full bg-[hsl(var(--surface-1))] border border-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-[hsl(var(--teal))]" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Palette className="w-3 h-3" /> Cor na Agenda</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer overflow-hidden" />
                      <span className="text-xs font-mono text-muted-foreground uppercase">{cor}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} className="flex-1 py-3 rounded-xl border border-border text-foreground font-bold hover:bg-[hsl(var(--surface-2))] transition-all">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl gradient-primary text-white font-bold shadow-teal hover:opacity-90 transition-all">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
