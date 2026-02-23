import { AppLayout } from "@/components/AppLayout";
import {
  Users, Calendar, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle, XCircle, AlertCircle, Activity, Plus, Loader2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { usePacientes, useAgendamentos, useOportunidades } from "@/hooks/useSupabase";

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
  const { data: pacientes = [], isLoading: loadingPacientes } = usePacientes();
  const { data: agendamentos = [], isLoading: loadingAgendamentos } = useAgendamentos();
  const { data: oportunidades = [], isLoading: loadingOportunidades } = useOportunidades();

  const totalPacientes = pacientes.length;

  // Agendamentos hoje
  const hoje = new Date().toISOString().split('T')[0];
  const agendamentosHoje = agendamentos.filter((a: any) => a.data_hora.startsWith(hoje));
  const confirmados = agendamentosHoje.filter((a: any) => a.status === 'confirmado').length;
  const faltas = agendamentosHoje.filter((a: any) => a.status === 'faltou').length;

  // KPIs Financeiros
  const fechados = oportunidades.filter((o: any) => o.etapa === "fechado");
  const receitaTotal = fechados.reduce((acc, o) => acc + (o.valor || 0), 0);
  const ticketMedio = fechados.length > 0 ? receitaTotal / fechados.length : 0;

  // Taxa de comparecimento (histórica)
  const totalConcluidos = agendamentos.filter((a: any) => a.status === 'realizado').length;
  const totalFaltas = agendamentos.filter((a: any) => a.status === 'faltou').length;
  const taxaComparecimento = (totalConcluidos + totalFaltas) > 0
    ? Math.round((totalConcluidos / (totalConcluidos + totalFaltas)) * 100)
    : 0;

  // Orçamentos
  const orcamentosEnviados = oportunidades.length;
  const taxaConversao = oportunidades.length > 0
    ? Math.round((fechados.length / oportunidades.length) * 100)
    : 0;

  const kpis = [
    {
      label: "Total Pacientes",
      value: totalPacientes.toString(),
      sub: "Base de dados atualizada",
      trend: "neutral",
      icon: Users,
      color: "teal",
    },
    {
      label: "Receita Total",
      value: `R$ ${(receitaTotal / 1000).toFixed(1)}k`,
      sub: `${fechados.length} vendas fechadas`,
      trend: "up",
      icon: DollarSign,
      color: "success",
    },
    {
      label: "Taxa de Comparecimento",
      value: `${taxaComparecimento}%`,
      sub: `${totalConcluidos} realizados vs ${totalFaltas} faltas`,
      trend: taxaComparecimento > 80 ? "up" : "down",
      icon: CheckCircle,
      color: "warning",
    },
    {
      label: "Ticket Médio",
      value: `R$ ${ticketMedio.toFixed(0)}`,
      sub: "Baseado em vendas fechadas",
      trend: "up",
      icon: TrendingUp,
      color: "info",
    },
    {
      label: "Oportunidades",
      value: orcamentosEnviados.toString(),
      sub: `Taxa conversão: ${taxaConversao}%`,
      trend: "up",
      icon: Activity,
      color: "teal",
    },
    {
      label: "Agenda Hoje",
      value: agendamentosHoje.length.toString(),
      sub: `${confirmados} confirmados, ${faltas} faltas`,
      trend: "neutral",
      icon: Calendar,
      color: "info",
    },
  ];

  // Agrupar procedimentos para o gráfico de pizza
  const procedimentosMap = agendamentos.reduce((acc: any, apt: any) => {
    const proc = apt.procedimento || "Outros";
    acc[proc] = (acc[proc] || 0) + 1;
    return acc;
  }, {});

  const procColors = ["#2DD4BF", "#38BDF8", "#818CF8", "#FB923C", "#4ADE80"];
  const dynamicProcedimentosData = Object.entries(procedimentosMap)
    .map(([name, count], i) => ({
      name,
      value: Math.round(((count as number) / agendamentos.length) * 100),
      color: procColors[i % procColors.length]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const displayProcedimentosData = dynamicProcedimentosData.length > 0
    ? dynamicProcedimentosData
    : procedimentosData;

  // Gráfico de Receita (Simplificado: usa o mês atual)
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'short' });
  const displayRevenueData = receitaTotal > 0
    ? [{ mes: currentMonth, receita: receitaTotal, meta: 50000 }]
    : revenueData;

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
                {(loadingPacientes || loadingAgendamentos || loadingOportunidades) && (kpi.label === "Total Pacientes" || kpi.label === "Agenda Hoje" || kpi.label === "Receita Total") ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                )}
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
              <AreaChart data={displayRevenueData}>
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
                <Pie data={displayProcedimentosData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {displayProcedimentosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Participação"]} contentStyle={{ background: "hsl(222, 44%, 10%)", border: "1px solid hsl(222, 36%, 16%)", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {displayProcedimentosData.map((item) => (
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
              {loadingAgendamentos ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : agendamentosHoje.length === 0 ? (
                <p className="text-sm text-center py-10 text-muted-foreground">Nenhum agendamento para hoje.</p>
              ) : (
                agendamentosHoje.slice(0, 6).map((apt: any, i: number) => {
                  const aptDate = new Date(apt.data_hora);
                  const aptHora = `${aptDate.getHours().toString().padStart(2, '0')}:${aptDate.getMinutes().toString().padStart(2, '0')}`;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors">
                      <span className="text-xs font-mono font-bold text-muted-foreground w-12 flex-shrink-0">{aptHora}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{apt.pacientes?.nome || apt.paciente_nome}</p>
                        <p className="text-xs text-muted-foreground">{apt.procedimento}</p>
                      </div>
                      <span className={`status-badge text-[9px] ${statusColors[apt.status] || statusColors.agendado}`}>
                        {statusLabels[apt.status] || statusLabels.agendado}
                      </span>
                    </div>
                  );
                })
              )}
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
                    <p className="text-xs font-semibold text-foreground">{faltas} faltas registradas</p>
                    <p className="text-[10px] text-muted-foreground">Disparar recuperação automática</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[hsl(var(--warning)/0.1)] border border-[hsl(var(--warning)/0.2)]">
                  <AlertCircle className="w-4 h-4 text-[hsl(var(--warning))] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Acompanhamento pendente</p>
                    <p className="text-[10px] text-muted-foreground">Pacientes aguardando retorno</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Pacientes Totais</h3>
              <p className="text-2xl font-bold text-foreground">{totalPacientes}</p>
              <p className="text-xs text-muted-foreground">cadastrados no sistema</p>
              <button className="mt-3 w-full py-2 rounded-lg text-xs font-semibold gradient-primary text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity">
                Ver todos os pacientes
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

