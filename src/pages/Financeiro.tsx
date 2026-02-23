import { AppLayout } from "@/components/AppLayout";
import { DollarSign, TrendingUp, AlertCircle, CreditCard, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useMovimentacoes } from "@/hooks/useSupabase";
import { Loader2 } from "lucide-react";

const faturamentoMensal = [
  { mes: "Ago", receita: 42000, despesas: 28000 },
  { mes: "Set", receita: 51000, despesas: 31000 },
  { mes: "Out", receita: 47000, despesas: 29000 },
  { mes: "Nov", receita: 58000, despesas: 34000 },
  { mes: "Dez", receita: 62000, despesas: 38000 },
  { mes: "Jan", receita: 71400, despesas: 41000 },
];

const pagamentos = [
  { id: 1, paciente: "Maria Silva", proc: "Ortodontia", valor: "R$ 1.800", forma: "Cartão", parcelas: "3x", data: "18/01/2026", status: "pago" },
  { id: 2, paciente: "João Santos", proc: "Implante", valor: "R$ 4.500", forma: "PIX", parcelas: "1x", data: "17/01/2026", status: "pago" },
  { id: 3, paciente: "Ana Costa", proc: "Clareamento", valor: "R$ 900", forma: "Cartão", parcelas: "2x", data: "16/01/2026", status: "pendente" },
  { id: 4, paciente: "Pedro Mendes", proc: "Prótese", valor: "R$ 3.200", forma: "Boleto", parcelas: "6x", data: "15/01/2026", status: "vencido" },
  { id: 5, paciente: "Carla Lima", proc: "Facetas", valor: "R$ 8.400", forma: "Cartão", parcelas: "12x", data: "14/01/2026", status: "pago" },
  { id: 6, paciente: "Lucas Rocha", proc: "Limpeza", valor: "R$ 250", forma: "Dinheiro", parcelas: "1x", data: "13/01/2026", status: "pago" },
  { id: 7, paciente: "Fernanda Nunes", proc: "Ortodontia", valor: "R$ 7.200", forma: "Cartão", parcelas: "18x", data: "12/01/2026", status: "pendente" },
];

const profFaturamento = [
  { prof: "Dr. Anderson", valor: 31400, cor: "hsl(174, 72%, 45%)" },
  { prof: "Dra. Beatriz", valor: 24800, cor: "hsl(199, 95%, 55%)" },
  { prof: "Dr. Carlos", valor: 15200, cor: "hsl(38, 92%, 55%)" },
];

const statusPag: Record<string, { label: string; color: string; bg: string }> = {
  pago: { label: "Pago", color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success)/0.12)]" },
  pendente: { label: "Pendente", color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning)/0.12)]" },
  vencido: { label: "Vencido", color: "text-[hsl(var(--destructive))]", bg: "bg-[hsl(var(--destructive)/0.12)]" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[hsl(var(--surface-1))] border border-border rounded-lg px-3 py-2 shadow-elevated">
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: R$ {(entry.value / 1000).toFixed(1)}k
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Financeiro() {
  const { data: movimentacoes = [], isLoading } = useMovimentacoes();

  const receitas = movimentacoes.filter(m => m.tipo === 'entrada');
  const despesas = movimentacoes.filter(m => m.tipo === 'saida');

  const totalReceita = receitas.reduce((acc, m) => acc + (m.valor || 0), 0);
  const totalDespesa = despesas.reduce((acc, m) => acc + (m.valor || 0), 0);
  const lucroLiquido = totalReceita - totalDespesa;

  const inadimplencia = movimentacoes
    .filter(m => m.status === 'pendente' || m.status === 'vencido')
    .reduce((acc, m) => acc + (m.valor || 0), 0);

  const kpis = [
    { label: "Receita Total", value: `R$ ${(totalReceita / 1000).toFixed(1)}k`, trend: "+10%", up: true, icon: DollarSign, color: "teal" },
    { label: "Lucro Líquido", value: `R$ ${(lucroLiquido / 1000).toFixed(1)}k`, trend: "+12%", up: true, icon: TrendingUp, color: "success" },
    { label: "Ticket Médio", value: `R$ ${receitas.length > 0 ? (totalReceita / receitas.length).toFixed(0) : 0}`, trend: "+5%", up: true, icon: CreditCard, color: "info" },
    { label: "Inadimplência", value: `R$ ${(inadimplencia / 1000).toFixed(1)}k`, trend: "-2%", up: false, icon: AlertCircle, color: "destructive" },
  ];

  // Agrupar por mês para o gráfico (Simplificado para o mês atual)
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'short' });
  const dynamicFaturamentoData = [{
    mes: currentMonth,
    receita: totalReceita,
    despesas: totalDespesa
  }];

  const displayFaturamentoData = totalReceita > 0 || totalDespesa > 0
    ? dynamicFaturamentoData
    : faturamentoMensal;
  return (
    <AppLayout
      title="Financeiro"
      subtitle="Controle de receitas, despesas e inadimplência"
      action={
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--surface-2))] border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-[hsl(var(--teal)/0.3)] transition-all">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </button>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            const colorMap: Record<string, string> = {
              teal: "hsl(var(--teal))", success: "hsl(var(--success))",
              info: "hsl(var(--info))", destructive: "hsl(var(--destructive))",
            };
            const color = colorMap[kpi.color];
            return (
              <div key={i} className="stat-card rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}1A` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-bold ${kpi.up ? "text-[hsl(var(--success))]" : "text-[hsl(var(--destructive))]"}`}>
                    {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.trend}
                  </span>
                </div>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue vs Expense */}
          <div className="lg:col-span-2 stat-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Receita vs Despesas</h3>
                <p className="text-xs text-muted-foreground">Últimos 6 meses (R$)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded-full bg-[hsl(var(--teal))]" />
                  <span className="text-xs text-muted-foreground">Receita</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded-full bg-[hsl(var(--destructive))]" />
                  <span className="text-xs text-muted-foreground">Despesas</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={faturamentoMensal} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 36%, 16%)" />
                <XAxis dataKey="mes" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="receita" name="Receita" fill="hsl(174, 72%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="hsl(0, 72%, 58%)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Prof ranking */}
          <div className="stat-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Faturamento por Profissional</h3>
            <p className="text-xs text-muted-foreground mb-4">Janeiro 2026</p>
            <div className="space-y-4">
              {profFaturamento.map((p, i) => (
                <div key={p.prof}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">#{i + 1}</span>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-[hsl(var(--primary-foreground))]" style={{ background: p.cor }}>
                        {p.prof.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-xs font-semibold text-foreground">{p.prof}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: p.cor }}>
                      R$ {(p.valor / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[hsl(var(--surface-3))]">
                    <div className="h-2 rounded-full" style={{ width: `${(p.valor / 31400) * 100}%`, background: p.cor }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-sm font-bold text-[hsl(var(--teal))]">R$ {(totalReceita / 1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payments table */}
        <div className="stat-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Lançamentos Recentes</h3>
            <button className="text-xs text-[hsl(var(--teal))] font-medium hover:underline">Ver todos →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  {["Paciente", "Procedimento", "Valor", "Forma", "Parcelas", "Data", "Status"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : movimentacoes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      Nenhum lançamento registrado.
                    </td>
                  </tr>
                ) : (
                  movimentacoes.slice(0, 10).map((m: any) => {
                    const sc = statusPag[m.status || 'pago'];
                    return (
                      <tr key={m.id} className="border-b border-border/30 hover:bg-[hsl(var(--surface-2))] transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">{m.pacientes?.nome || "—"}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{m.categoria || m.tipo}</td>
                        <td className={`px-4 py-3 text-sm font-bold ${m.tipo === 'entrada' ? 'text-[hsl(var(--teal))]' : 'text-[hsl(var(--destructive))]'}`}>
                          {m.tipo === 'entrada' ? '+' : '-'} R$ {m.valor?.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">—</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">1x</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(m.data).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3">
                          <span className={`status-badge ${sc.color} ${sc.bg}`}>{sc.label}</span>
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
