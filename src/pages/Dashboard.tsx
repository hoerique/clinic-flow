import { AppLayout } from "@/components/AppLayout";
import {
  Users, Calendar, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle, XCircle, AlertCircle, Activity, Plus,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const revenueData = [
  { mes: "Ago", receita: 42000, meta: 50000 },
  { mes: "Set", receita: 51000, meta: 50000 },
  { mes: "Out", receita: 47000, meta: 55000 },
  { mes: "Nov", receita: 58000, meta: 55000 },
  { mes: "Dez", receita: 62000, meta: 60000 },
  { mes: "Jan", receita: 71000, meta: 65000 },
];

const procedimentosData = [
  { name: "Limpeza", value: 34, color: "#2DD4BF" },
  { name: "Ortodontia", value: 24, color: "#38BDF8" },
  { name: "Clareamento", value: 19, color: "#818CF8" },
  { name: "Implante", value: 14, color: "#FB923C" },
  { name: "Outros", value: 9, color: "#4ADE80" },
];

const agendaHoje = [
  { hora: "08:00", paciente: "Maria Silva", proc: "Limpeza", status: "realizado" },
  { hora: "09:00", paciente: "João Santos", proc: "Ortodontia", status: "realizado" },
  { hora: "10:30", paciente: "Ana Costa", proc: "Clareamento", status: "confirmado" },
  { hora: "11:00", paciente: "Pedro Oliveira", proc: "Consulta", status: "agendado" },
  { hora: "14:00", paciente: "Carla Lima", proc: "Implante", status: "faltou" },
  { hora: "15:30", paciente: "Lucas Mendes", proc: "Limpeza", status: "agendado" },
];

const statusColors: Record<string, string> = {
  realizado: "text-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)]",
  confirmado: "text-[hsl(var(--teal))] bg-[hsl(var(--teal)/0.1)]",
  agendado: "text-[hsl(var(--info))] bg-[hsl(var(--info)/0.1)]",
  faltou: "text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)]",
  cancelado: "text-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.1)]",
};

const statusLabels: Record<string, string> = {
  realizado: "Realizado",
  confirmado: "Confirmado",
  agendado: "Agendado",
  faltou: "Faltou",
  cancelado: "Cancelado",
};

const kpis = [
  {
    label: "Novos Pacientes",
    value: "47",
    sub: "+12% vs mês anterior",
    trend: "up",
    icon: Users,
    color: "teal",
  },
  {
    label: "Receita Mensal",
    value: "R$ 71.4k",
    sub: "+15% vs mês anterior",
    trend: "up",
    icon: DollarSign,
    color: "success",
  },
  {
    label: "Taxa de Comparecimento",
    value: "84%",
    sub: "-3% vs mês anterior",
    trend: "down",
    icon: CheckCircle,
    color: "warning",
  },
  {
    label: "Ticket Médio",
    value: "R$ 380",
    sub: "+8% vs mês anterior",
    trend: "up",
    icon: TrendingUp,
    color: "info",
  },
  {
    label: "Orçamentos Enviados",
    value: "23",
    sub: "Taxa conversão: 65%",
    trend: "up",
    icon: Activity,
    color: "teal",
  },
  {
    label: "Agenda Hoje",
    value: "18",
    sub: "4 confirmados, 2 faltaram",
    trend: "neutral",
    icon: Calendar,
    color: "info",
  },
];

const colorMap: Record<string, string> = {
  teal: "hsl(var(--teal))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  info: "hsl(var(--info))",
  destructive: "hsl(var(--destructive))",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[hsl(var(--surface-1))] border border-border rounded-lg px-3 py-2 shadow-elevated">
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === "number" && entry.name === "receita" || entry.name === "meta"
              ? `R$ ${(entry.value / 1000).toFixed(0)}k`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  return (
    <AppLayout
      title="Dashboard"
      subtitle={`Visão geral — ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
    >
      <div className="space-y-6 animate-fade-in">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            const color = colorMap[kpi.color] || colorMap.teal;
            return (
              <div key={i} className="stat-card rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}1A` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  {kpi.trend === "up" && (
                    <ArrowUpRight className="w-4 h-4 text-[hsl(var(--success))]" />
                  )}
                  {kpi.trend === "down" && (
                    <ArrowDownRight className="w-4 h-4 text-[hsl(var(--destructive))]" />
                  )}
                </div>
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs font-medium text-foreground/80 mt-0.5">{kpi.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{kpi.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 stat-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Receita Mensal</h3>
                <p className="text-xs text-muted-foreground">Receita vs Meta (R$)</p>
              </div>
              <span className="text-xs font-bold text-[hsl(var(--teal))] bg-[hsl(var(--teal)/0.1)] px-2 py-1 rounded-full">
                +15% ↑
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174, 72%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(174, 72%, 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="metaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199, 95%, 55%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(199, 95%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 36%, 16%)" />
                <XAxis dataKey="mes" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="receita" stroke="hsl(174, 72%, 45%)" fill="url(#receitaGrad)" strokeWidth={2} name="receita" />
                <Area type="monotone" dataKey="meta" stroke="hsl(199, 95%, 55%)" fill="url(#metaGrad)" strokeWidth={2} strokeDasharray="4 2" name="meta" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Procedures Pie */}
          <div className="stat-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Procedimentos</h3>
            <p className="text-xs text-muted-foreground mb-4">Top 5 este mês</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={procedimentosData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {procedimentosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Participação"]} contentStyle={{ background: "hsl(222, 44%, 10%)", border: "1px solid hsl(222, 36%, 16%)", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {procedimentosData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agenda + Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Today's schedule */}
          <div className="lg:col-span-2 stat-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Agenda de Hoje</h3>
              <button className="text-xs text-[hsl(var(--teal))] font-medium hover:underline">Ver completa →</button>
            </div>
            <div className="space-y-2">
              {agendaHoje.map((apt, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors">
                  <span className="text-xs font-mono font-bold text-muted-foreground w-12 flex-shrink-0">{apt.hora}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{apt.paciente}</p>
                    <p className="text-xs text-muted-foreground">{apt.proc}</p>
                  </div>
                  <span className={`status-badge ${statusColors[apt.status]}`}>
                    {statusLabels[apt.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-3">
            <div className="stat-card rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Alertas do Sistema</h3>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.2)]">
                  <XCircle className="w-4 h-4 text-[hsl(var(--destructive))] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">3 faltas hoje</p>
                    <p className="text-[10px] text-muted-foreground">Disparar recuperação automática</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[hsl(var(--warning)/0.1)] border border-[hsl(var(--warning)/0.2)]">
                  <AlertCircle className="w-4 h-4 text-[hsl(var(--warning))] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">5 orçamentos pendentes</p>
                    <p className="text-[10px] text-muted-foreground">Aguardando resposta há +7 dias</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[hsl(var(--teal)/0.1)] border border-[hsl(var(--teal)/0.2)]">
                  <Clock className="w-4 h-4 text-[hsl(var(--teal))] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">12 lembretes agendados</p>
                    <p className="text-[10px] text-muted-foreground">WhatsApp para amanhã</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Pacientes Inativos</h3>
              <p className="text-2xl font-bold text-foreground">38</p>
              <p className="text-xs text-muted-foreground">sem consulta há +60 dias</p>
              <button className="mt-3 w-full py-2 rounded-lg text-xs font-semibold gradient-primary text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity">
                Iniciar Campanha de Reativação
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
