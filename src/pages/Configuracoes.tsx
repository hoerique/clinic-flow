import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import {
  Building2,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Clock,
  Save,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Camera,
  Stethoscope,
} from "lucide-react";

const tabs = [
  { id: "clinica", label: "Clínica", icon: Building2 },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "plano", label: "Plano & Faturamento", icon: CreditCard },
  { id: "aparencia", label: "Aparência", icon: Palette },
];

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState("clinica");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout title="Configurações" subtitle="Gerencie as preferências da sua clínica">
      <div className="flex gap-6 h-full">
        {/* Sidebar tabs */}
        <aside className="w-56 flex-shrink-0">
          <div className="bg-[hsl(var(--surface-1))] border border-border rounded-xl overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-left border-b border-border last:border-0 ${
                    active
                      ? "bg-[hsl(var(--teal)/0.1)] text-[hsl(var(--teal))]"
                      : "text-muted-foreground hover:bg-[hsl(var(--surface-2))] hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{tab.label}</span>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "opacity-100" : "opacity-40"}`} />
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "clinica" && (
            <div className="space-y-6">
              {/* Profile picture */}
              <div className="bg-[hsl(var(--surface-1))] border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Logo da Clínica</h3>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-teal">
                      <Stethoscope className="w-9 h-9 text-white" />
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[hsl(var(--surface-3))] border border-border flex items-center justify-center hover:bg-[hsl(var(--teal)/0.2)] transition-colors">
                      <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-foreground font-medium">Clínica Sorriso Premium</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou SVG · Máximo 2MB</p>
                    <button className="mt-2 text-xs text-[hsl(var(--teal))] hover:underline font-medium">
                      Alterar logo
                    </button>
                  </div>
                </div>
              </div>

              {/* Basic info */}
              <div className="bg-[hsl(var(--surface-1))] border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-5">Informações da Clínica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome da Clínica</label>
                    <input
                      defaultValue="Clínica Sorriso Premium"
                      className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] focus:border-[hsl(var(--teal))] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">CNPJ</label>
                    <input
                      defaultValue="12.345.678/0001-99"
                      className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] focus:border-[hsl(var(--teal))] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Especialidade</label>
                    <select className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] transition-all">
                      <option>Odontologia</option>
                      <option>Estética</option>
                      <option>Fisioterapia</option>
                      <option>Psicologia</option>
                      <option>Medicina</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Telefone</label>
                    <input
                      defaultValue="(11) 99999-9999"
                      className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] focus:border-[hsl(var(--teal))] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">E-mail</label>
                    <input
                      defaultValue="contato@clinicasorriso.com.br"
                      className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] focus:border-[hsl(var(--teal))] transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Endereço</label>
                    <input
                      defaultValue="Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                      className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] focus:border-[hsl(var(--teal))] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Horário de Abertura</label>
                    <input
                      type="time"
                      defaultValue="08:00"
                      className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Horário de Fechamento</label>
                    <input
                      type="time"
                      defaultValue="18:00"
                      className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    saved
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "gradient-primary text-white shadow-teal hover:opacity-90"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {saved ? "Salvo!" : "Salvar Alterações"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "notificacoes" && (
            <div className="bg-[hsl(var(--surface-1))] border border-border rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-semibold text-foreground">Preferências de Notificação</h3>
              {[
                { label: "Confirmação de agendamento", desc: "Notificar quando um paciente confirmar consulta", active: true },
                { label: "Cancelamento de consulta", desc: "Alertar sobre cancelamentos em tempo real", active: true },
                { label: "Novo paciente cadastrado", desc: "Receber notificação de novos cadastros", active: false },
                { label: "Lembrete de agenda vazia", desc: "Avisar sobre horários sem agendamento", active: true },
                { label: "Relatório semanal", desc: "Receber resumo de desempenho toda segunda-feira", active: false },
                { label: "Inadimplência detectada", desc: "Alertar sobre pagamentos em atraso", active: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    className={`relative w-10 h-5.5 rounded-full transition-all flex-shrink-0 ${item.active ? "gradient-primary" : "bg-[hsl(var(--surface-3))]"}`}
                    style={{ height: "22px", width: "40px" }}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${item.active ? "left-5" : "left-0.5"}`}
                    />
                  </button>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold gradient-primary text-white shadow-teal hover:opacity-90 transition-all">
                  <Save className="w-4 h-4" />
                  {saved ? "Salvo!" : "Salvar"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "seguranca" && (
            <div className="space-y-5">
              <div className="bg-[hsl(var(--surface-1))] border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-5">Alterar Senha</h3>
                <div className="space-y-4 max-w-md">
                  {["Senha atual", "Nova senha", "Confirmar nova senha"].map((label) => (
                    <div key={label}>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-[hsl(var(--surface-2))] border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] focus:border-[hsl(var(--teal))] transition-all"
                      />
                    </div>
                  ))}
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold gradient-primary text-white shadow-teal hover:opacity-90 transition-all">
                    <Shield className="w-4 h-4" />
                    Atualizar senha
                  </button>
                </div>
              </div>
              <div className="bg-[hsl(var(--surface-1))] border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">Autenticação em dois fatores</h3>
                <p className="text-xs text-muted-foreground mb-4">Adicione uma camada extra de segurança à sua conta.</p>
                <button className="px-4 py-2 text-sm font-medium rounded-lg border border-[hsl(var(--teal)/0.4)] text-[hsl(var(--teal))] hover:bg-[hsl(var(--teal)/0.1)] transition-colors">
                  Ativar 2FA
                </button>
              </div>
            </div>
          )}

          {activeTab === "plano" && (
            <div className="space-y-5">
              <div className="bg-[hsl(var(--surface-1))] border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Plano Professional</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Renova em 28 dias · R$ 297/mês</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-[hsl(var(--teal)/0.15)] text-[hsl(var(--teal))]">
                    Ativo
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Usuários", used: 4, total: 10 },
                    { label: "Mensagens WhatsApp", used: 68, total: 100 },
                    { label: "Pacientes cadastrados", used: 312, total: 1000 },
                    { label: "Armazenamento", used: 2.4, total: 10, unit: "GB" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">
                          {item.used}{item.unit || ""} / {item.total}{item.unit || ""}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[hsl(var(--surface-3))]">
                        <div
                          className="h-1.5 rounded-full gradient-primary"
                          style={{ width: `${(item.used / item.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-5 w-full py-2.5 text-sm font-semibold rounded-lg gradient-primary text-white shadow-teal hover:opacity-90 transition-all">
                  Fazer upgrade para Enterprise
                </button>
              </div>
            </div>
          )}

          {activeTab === "aparencia" && (
            <div className="bg-[hsl(var(--surface-1))] border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-sm font-semibold text-foreground">Tema e Aparência</h3>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3">Modo de cores</p>
                <div className="flex gap-3">
                  {["Escuro", "Claro", "Sistema"].map((mode) => (
                    <button
                      key={mode}
                      className={`px-4 py-2 text-sm rounded-lg border font-medium transition-all ${
                        mode === "Escuro"
                          ? "border-[hsl(var(--teal))] bg-[hsl(var(--teal)/0.1)] text-[hsl(var(--teal))]"
                          : "border-border text-muted-foreground hover:border-[hsl(var(--teal)/0.4)]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3">Cor de destaque</p>
                <div className="flex gap-3">
                  {[
                    { name: "Teal (padrão)", color: "hsl(174 72% 45%)" },
                    { name: "Azul", color: "hsl(217 91% 60%)" },
                    { name: "Roxo", color: "hsl(262 83% 58%)" },
                    { name: "Verde", color: "hsl(142 71% 45%)" },
                  ].map((c) => (
                    <button
                      key={c.name}
                      title={c.name}
                      className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/40 transition-all"
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
