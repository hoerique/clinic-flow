import { Plus, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useCreateAgendamento } from "@/hooks/useSupabase";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateAgendamentoModalProps {
    pacientes: any[];
    profissionais: any[];
}

export function CreateAgendamentoModal({ pacientes, profissionais }: CreateAgendamentoModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newAgendamento, setNewAgendamento] = useState({
        paciente_id: "",
        profissional_id: "",
        procedimento: "",
        data: new Date().toISOString().split('T')[0],
        hora: "08:00",
        duracao_slots: 2,
    });

    const createAgendamento = useCreateAgendamento();

    // Memoize lists to ensure stable reference during re-renders
    const memoizedPacientes = useMemo(() => pacientes, [pacientes]);
    const memoizedProfissionais = useMemo(() => profissionais, [profissionais]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAgendamento.paciente_id || !newAgendamento.profissional_id) {
            toast.error("Selecione o paciente e o profissional");
            return;
        }

        try {
            const [h, m] = newAgendamento.hora.split(":");
            const date = new Date(`${newAgendamento.data}T00:00:00`);
            date.setHours(parseInt(h), parseInt(m), 0, 0);

            await createAgendamento.mutateAsync({
                paciente_id: newAgendamento.paciente_id,
                profissional_id: newAgendamento.profissional_id,
                procedimento: newAgendamento.procedimento,
                data_hora: date.toISOString(),
                duracao_slots: newAgendamento.duracao_slots,
            });

            toast.success("Agendamento criado com sucesso!");
            setIsOpen(false);
            setNewAgendamento({
                paciente_id: "",
                profissional_id: "",
                procedimento: "",
                data: new Date().toISOString().split('T')[0],
                hora: "08:00",
                duracao_slots: 2,
            });
        } catch (error) {
            toast.error("Erro ao criar agendamento");
        }
    };

    const horasdia = useMemo(() => ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"], []);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2 gradient-primary text-white hover:opacity-90 shadow-teal">
                    <Plus className="w-4 h-4" />
                    Novo Agendamento
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[hsl(var(--surface-1))] border-border" translate="no">
                <DialogHeader>
                    <DialogTitle className="text-foreground">NOVO AGENDAMENTO</DialogTitle>
                    <DialogDescription className="sr-only">Selecione o paciente, o profissional e o horário para o novo agendamento.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Paciente</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-border bg-[hsl(var(--surface-2))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] transition-all appearance-none cursor-pointer"
                            value={newAgendamento.paciente_id}
                            onChange={(e) => setNewAgendamento({ ...newAgendamento, paciente_id: e.target.value })}
                        >
                            <option value="" disabled>Selecione o paciente</option>
                            {memoizedPacientes.map((p: any) => (
                                <option key={`p-${p.id}`} value={p.id.toString()} className="bg-[hsl(var(--surface-1))]">
                                    {p.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Profissional</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-border bg-[hsl(var(--surface-2))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] transition-all appearance-none cursor-pointer"
                            value={newAgendamento.profissional_id}
                            onChange={(e) => setNewAgendamento({ ...newAgendamento, profissional_id: e.target.value })}
                        >
                            <option value="" disabled>Selecione o profissional</option>
                            {memoizedProfissionais.map((p: any) => (
                                <option key={`prof-${p.id}`} value={p.id.toString()} className="bg-[hsl(var(--surface-1))]">
                                    {p.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Procedimento</Label>
                            <Input
                                required
                                value={newAgendamento.procedimento}
                                onChange={(e) => setNewAgendamento({ ...newAgendamento, procedimento: e.target.value })}
                                placeholder="Ex: Limpeza"
                                className="bg-[hsl(var(--surface-2))] border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Data</Label>
                            <Input
                                type="date"
                                required
                                value={newAgendamento.data}
                                onChange={(e) => setNewAgendamento({ ...newAgendamento, data: e.target.value })}
                                className="bg-[hsl(var(--surface-2))] border-border text-foreground"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Hora</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-border bg-[hsl(var(--surface-2))] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] transition-all appearance-none cursor-pointer"
                            value={newAgendamento.hora}
                            onChange={(e) => setNewAgendamento({ ...newAgendamento, hora: e.target.value })}
                        >
                            {horasdia.map((h) => (
                                <option key={`h-${h}`} value={h} className="bg-[hsl(var(--surface-1))]">
                                    {h}
                                </option>
                            ))}
                        </select>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={createAgendamento.isPending}
                            className="gradient-primary text-white w-full"
                        >
                            {createAgendamento.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirmar Agendamento
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
