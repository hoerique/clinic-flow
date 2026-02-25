import { AppLayout } from "@/components/AppLayout";
import { BarChart2, TrendingUp, Users, Calendar, DollarSign, Download, Filter } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend,
} from "recharts";

const comparecimentoData = [
  { semana: "S1", compareceu: 32, faltou: 6, cancelou: 4 },
  { semana: "S2", compareceu: 38, faltou: 4, cancelou: 3 },
  { semana: "S3", compareceu: 29, faltou: 8, cancelou: 5 },
  { semana: "S4", compareceu: 41, faltou: 3, cancelou: 2 },
];

const conversaoData = [
  { mes: "Set", avaliados: 18, orcados: 14, fechados: 9 },
  { mes: "Out", avaliados: 22, orcados: 17, fechados: 11 },
  { mes: "Nov", avaliados: 19, orcados: 15, fechados: 12 },
  { mes: "Dez", avaliados: 25, orcados: 21, fechados: 14 },
  { mes: "Jan", avaliados: 28, orcados: 23, fechados: 15 },
];

const ticketData = [
  { mes: "Ago", ticket: 310 },
  { mes: "Set", ticket: 335 },
  { mes: "Out", ticket: 298 },
  { mes: "Nov", ticket: 355 },
  { mes: "Dez", ticket: 370 },
  { mes: "Jan", ticket: 380 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[hsl(var(--surface-1))] border border-border rounded-lg px-3 py-2 shadow-elevated">
        {label && <p className="text-xs font-semibold text-foreground mb-1">{label}</p>}
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-xs text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="opacity-80">{entry.name}:</span>
            <span className="font-semibold">{entry.value}{entry.unit || ""}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Relatorios() {
  return (
    <AppLayout
      title="Relatórios"
      subtitle="Análise estratégica de performance da clínica"
      action={
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--surface-2))] border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-all">
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      }
    >
      <div className="space-y-5 animate-fade-in">
        {/* Period filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Período:</span>
          {["7 dias", "30 dias", "3 meses", "6 meses", "Ano"].map((p, i) => (
            <button key={p} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === 1 ? "gradient-primary text-[hsl(var(--primary-foreground))]" : "bg-[hsl(var(--surface-2))] text-muted-foreground hover:text-foreground"}`}>
              {p}
            </button>
          ))}
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Taxa de Comparecimento", value: "84%", meta: "Meta: 90%", progress: 84, color: "hsl(var(--teal))" },
            { label: "Taxa de Cancelamento", value: "11%", meta: "Meta: <10%", progress: 11, color: "hsl(var(--warning))" },
            { label: "Conversão de Orçamentos", value: "65%", meta: "Meta: 70%", progress: 65, color: "hsl(var(--info))" },
            { label: "NPS da Clínica", value: "82", meta: "Excelente", progress: 82, color: "hsl(var(--success))" },
          ].map((m, i) => (
            <div key={i} className="stat-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
              <p className="text-3xl font-bold text-foreground">{m.value}</p>
              <div className="mt-2 h-1.5 rounded-full bg-[hsl(var(--surface-3))]">
                <div className="h-1.5 rounded-full" style={{ width: `${m.progress}%`, background: m.color }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">{m.meta}</p>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Comparecimento */}
          <div className="stat-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Comparecimento vs Faltas</h3>
            <p className="text-xs text-muted-foreground mb-4">Por semana — Janeiro 2026</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={comparecimentoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 36%, 16%)" />
                <XAxis dataKey="semana" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="compareceu" name="Compareceu" fill="hsl(174, 72%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="faltou" name="Faltou" fill="hsl(0, 72%, 58%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelou" name="Cancelou" fill="hsl(38, 92%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversão funil */}
          <div className="stat-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Funil de Conversão</h3>
            <p className="text-xs text-muted-foreground mb-4">Avaliados → Orçados → Fechados</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={conversaoData}>
                <defs>
                  <linearGradient id="avGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199, 95%, 55%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(199, 95%, 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="orGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174, 72%, 45%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(174, 72%, 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="feGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 36%, 16%)" />
                <XAxis dataKey="mes" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="avaliados" name="Avaliados" stroke="hsl(199, 95%, 55%)" fill="url(#avGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="orcados" name="Orçados" stroke="hsl(174, 72%, 45%)" fill="url(#orGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="fechados" name="Fechados" stroke="hsl(142, 70%, 45%)" fill="url(#feGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Ticket medio */}
          <div className="stat-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Evolução do Ticket Médio</h3>
            <p className="text-xs text-muted-foreground mb-4">Valor médio por consulta (R$)</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ticketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 36%, 16%)" />
                <XAxis dataKey="mes" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="ticket" name="Ticket Médio" stroke="hsl(174, 72%, 45%)" strokeWidth={2.5} dot={{ fill: "hsl(174, 72%, 45%)", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Insights */}
          <div className="stat-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Insights Estratégicos</h3>
            <div className="space-y-3">
              {[
                { icon: "🎯", title: "Alta taxa de faltas às segundas-feiras", desc: "34% das faltas ocorrem na segunda. Sugerimos confirmar com 48h de antecedência.", cor: "hsl(var(--destructive))" },
                { icon: "💰", title: "Implantes têm maior ticket", desc: "Procedimentos de implante representam 28% da receita com apenas 14% dos casos.", cor: "hsl(var(--success))" },
                { icon: "📱", title: "WhatsApp aumenta comparecimento", desc: "Pacientes que recebem lembrete têm 27% menos faltas.", cor: "hsl(var(--teal))" },
                { icon: "⏰", title: "38 pacientes inativos há +60 dias", desc: "Potencial de R$ 14.400 em receita com campanha de reativação.", cor: "hsl(var(--warning))" },
              ].map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[hsl(var(--surface-2))]">
                  <span className="text-lg">{insight.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{insight.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{insight.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
