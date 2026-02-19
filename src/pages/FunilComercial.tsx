import { AppLayout } from "@/components/AppLayout";
import { Plus, MoreVertical, DollarSign, Calendar, TrendingUp, User } from "lucide-react";

const etapas = [
  { key: "avaliacao", label: "Avaliação Realizada", color: "hsl(var(--info))", count: 4, valor: "R$ 28.500" },
  { key: "orcamento", label: "Orçamento Enviado", color: "hsl(174, 72%, 45%)", count: 6, valor: "R$ 54.200" },
  { key: "negociacao", label: "Em Negociação", color: "hsl(var(--warning))", count: 3, valor: "R$ 31.000" },
  { key: "aprovado", label: "Aprovado", color: "hsl(var(--success))", count: 5, valor: "R$ 47.800" },
  { key: "fechado", label: "Fechado", color: "hsl(142, 70%, 45%)", count: 8, valor: "R$ 72.400" },
  { key: "perdido", label: "Perdido", color: "hsl(var(--destructive))", count: 2, valor: "R$ 18.000" },
];

const oportunidades: Record<string, Array<{
  id: number; paciente: string; proc: string; valor: string;
  prob: number; data: string; prof: string;
}>> = {
  avaliacao: [
    { id: 1, paciente: "Marina Dias", proc: "Implante Total", valor: "R$ 12.000", prob: 40, data: "28/02", prof: "Dr. Anderson" },
    { id: 2, paciente: "Carlos Pinto", proc: "Ortodontia + Estética", valor: "R$ 8.500", prob: 55, data: "01/03", prof: "Dra. Beatriz" },
    { id: 3, paciente: "Luísa Teixeira", proc: "Clareamento LED", valor: "R$ 1.800", prob: 70, data: "25/02", prof: "Dr. Carlos" },
    { id: 4, paciente: "Márcio Souza", proc: "Prótese Dentária", valor: "R$ 6.200", prob: 35, data: "05/03", prof: "Dr. Anderson" },
  ],
  orcamento: [
    { id: 5, paciente: "Priscila Rocha", proc: "Implante + Coroa", valor: "R$ 9.800", prob: 60, data: "22/02", prof: "Dra. Beatriz" },
    { id: 6, paciente: "Fernando Melo", proc: "Ortodontia Clear", valor: "R$ 7.200", prob: 75, data: "28/02", prof: "Dr. Carlos" },
    { id: 7, paciente: "Amanda Torres", proc: "Facetas Porcelana", valor: "R$ 14.000", prob: 50, data: "03/03", prof: "Dr. Anderson" },
    { id: 8, paciente: "Bruno Alves", proc: "Enxerto Ósseo", valor: "R$ 11.500", prob: 40, data: "10/03", prof: "Dra. Beatriz" },
    { id: 9, paciente: "Renata Lima", proc: "Clareamento + Resina", valor: "R$ 3.200", prob: 80, data: "20/02", prof: "Dr. Carlos" },
    { id: 10, paciente: "Gustavo Neves", proc: "Implante Unitário", valor: "R$ 8.500", prob: 65, data: "27/02", prof: "Dr. Anderson" },
  ],
  negociacao: [
    { id: 11, paciente: "Claudia Fonseca", proc: "Implantes Múltiplos", valor: "R$ 18.000", prob: 55, data: "15/03", prof: "Dra. Beatriz" },
    { id: 12, paciente: "Eduardo Ramos", proc: "Ortodontia Adulto", valor: "R$ 6.500", prob: 70, data: "28/02", prof: "Dr. Carlos" },
    { id: 13, paciente: "Patrícia Silva", proc: "Facetas + Clareamento", valor: "R$ 6.500", prob: 60, data: "05/03", prof: "Dr. Anderson" },
  ],
  aprovado: [
    { id: 14, paciente: "Rodrigo Castro", proc: "Prótese Total", valor: "R$ 15.000", prob: 90, data: "20/02", prof: "Dra. Beatriz" },
    { id: 15, paciente: "Juliana Barros", proc: "Facetas Porcelana", valor: "R$ 12.800", prob: 95, data: "19/02", prof: "Dr. Carlos" },
    { id: 16, paciente: "Marcos Cunha", proc: "Implante + Coroa", valor: "R$ 9.500", prob: 90, data: "22/02", prof: "Dr. Anderson" },
    { id: 17, paciente: "Sônia Gomes", proc: "Ortodontia Clear", valor: "R$ 7.200", prob: 85, data: "25/02", prof: "Dra. Beatriz" },
    { id: 18, paciente: "André Ribeiro", proc: "Enxerto + Implante", valor: "R$ 3.300", prob: 90, data: "18/02", prof: "Dr. Carlos" },
  ],
  fechado: [
    { id: 19, paciente: "Vera Cruz", proc: "Prótese Total", valor: "R$ 14.000", prob: 100, data: "15/02", prof: "Dr. Anderson" },
    { id: 20, paciente: "Henrique Lopes", proc: "Implantes", valor: "R$ 18.000", prob: 100, data: "14/02", prof: "Dra. Beatriz" },
    { id: 21, paciente: "Cláudio Dias", proc: "Ortodontia", valor: "R$ 6.800", prob: 100, data: "12/02", prof: "Dr. Carlos" },
  ],
  perdido: [
    { id: 22, paciente: "Paulo Machado", proc: "Implante Total", valor: "R$ 11.000", prob: 0, data: "10/02", prof: "Dr. Anderson" },
    { id: 23, paciente: "Miriam Santos", proc: "Facetas", valor: "R$ 7.000", prob: 0, data: "08/02", prof: "Dra. Beatriz" },
  ],
};

function ProbBar({ value }: { value: number }) {
  const color = value >= 75 ? "hsl(var(--success))" : value >= 50 ? "hsl(var(--teal))" : value >= 25 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--surface-3))]">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[10px] font-bold" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function FunilComercial() {
  const totalGeral = etapas.slice(0, 5).reduce((acc, e) => acc + (oportunidades[e.key]?.length || 0), 0);

  return (
    <AppLayout
      title="Funil Comercial"
      subtitle={`${totalGeral} oportunidades em andamento`}
      action={
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-[hsl(var(--primary-foreground))] text-sm font-semibold hover:opacity-90 transition-opacity shadow-teal">
          <Plus className="w-4 h-4" />
          Nova Oportunidade
        </button>
      }
    >
      <div className="space-y-4 animate-fade-in">
        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--teal)/0.12)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[hsl(var(--teal))]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pipeline Total</p>
              <p className="text-xl font-bold text-foreground">R$ 234k</p>
            </div>
          </div>
          <div className="stat-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--success)/0.12)] flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[hsl(var(--success))]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fechado este mês</p>
              <p className="text-xl font-bold text-foreground">R$ 72.4k</p>
            </div>
          </div>
          <div className="stat-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--warning)/0.12)] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[hsl(var(--warning))]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
              <p className="text-xl font-bold text-foreground">65%</p>
            </div>
          </div>
        </div>

        {/* Kanban */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {etapas.map((etapa) => {
            const cards = oportunidades[etapa.key] || [];
            const totalValor = cards.reduce((sum, c) => {
              const v = parseFloat(c.valor.replace("R$ ", "").replace(".", "").replace(",", "."));
              return sum + v;
            }, 0);

            return (
              <div key={etapa.key} className="flex-shrink-0 w-72">
                {/* Column header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: etapa.color }} />
                    <span className="text-xs font-bold text-foreground">{etapa.label}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[hsl(var(--surface-3))] text-muted-foreground">
                      {cards.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: etapa.color }}>
                    R$ {(totalValor / 1000).toFixed(0)}k
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {cards.map((card) => (
                    <div key={card.id} className="kanban-card rounded-xl p-3 cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{card.paciente}</p>
                          <p className="text-xs text-muted-foreground">{card.proc}</p>
                        </div>
                        <button className="p-1 rounded hover:bg-[hsl(var(--surface-3))]">
                          <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                      <ProbBar value={card.prob} />
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-sm font-bold" style={{ color: etapa.color }}>{card.valor}</span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {card.data}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="w-4 h-4 rounded-full gradient-primary flex items-center justify-center">
                          <span className="text-[8px] font-bold text-[hsl(var(--primary-foreground))]">
                            {card.prof.split(" ").map(n => n[0]).slice(0, 2).join("")}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{card.prof}</span>
                      </div>
                    </div>
                  ))}

                  {/* Add card button */}
                  <button className="w-full py-2.5 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:border-[hsl(var(--teal)/0.3)] hover:text-[hsl(var(--teal))] transition-all flex items-center justify-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
