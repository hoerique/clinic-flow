import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useNotificationObserver() {
    const [preferences, setPreferences] = useState<any>(null);

    useEffect(() => {
        const fetchPreferences = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await (supabase as any)
                .from('profiles')
                .select('notification_preferences')
                .eq('id', user.id)
                .single();

            if (data?.notification_preferences) {
                setPreferences(data.notification_preferences);
            }
        };

        fetchPreferences();

        // In a real app, we might want to subscribe to profile changes to update preferences in real-time
        const profileSubscription = supabase
            .channel('profile-changes')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles'
            }, (payload: any) => {
                if (payload.new.notification_preferences) {
                    setPreferences(payload.new.notification_preferences);
                }
            })
            .subscribe();

        return () => {
            profileSubscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!preferences) return;

        // Periodic checks (Placeholder for background tasks)
        const checkScheduledTasks = async () => {
            const now = new Date();

            // Weekly Report (Every Monday)
            if (now.getDay() === 1 && preferences.weekly_report) {
                toast.info("Relatório Semanal", {
                    description: "Seu resumo de desempenho da semana já está disponível!",
                });
            }

            // Empty Schedule Reminder (Check if tomorrow is empty)
            if (preferences.empty_schedule) {
                const tomorrow = new Date();
                tomorrow.setDate(now.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                const nextDay = new Date(tomorrow);
                nextDay.setDate(tomorrow.getDate() + 1);

                const { data } = await (supabase as any)
                    .from('agendamentos')
                    .select('id')
                    .gte('data_hora', tomorrow.toISOString())
                    .lt('data_hora', nextDay.toISOString());

                if (!data || data.length === 0) {
                    toast.warning("Agenda Vazia", {
                        description: "Você ainda não tem agendamentos para amanhã.",
                    });
                }
            }
        };

        checkScheduledTasks();

        const channel = supabase
            .channel('realtime-notifications')
            // Listen for appointment changes
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'agendamentos'
            }, async (payload: any) => {
                if (payload.eventType === 'UPDATE') {
                    const oldStatus = payload.old.status;
                    const newStatus = payload.new.status;

                    if (newStatus === 'confirmado' && oldStatus !== 'confirmado' && preferences.appointment_confirmation) {
                        toast.success("Consulta Confirmada!", {
                            description: "Um paciente acabou de confirmar um agendamento.",
                        });
                    }

                    if (newStatus === 'cancelado' && oldStatus !== 'cancelado' && preferences.appointment_cancellation) {
                        toast.error("Consulta Cancelada!", {
                            description: "Um agendamento foi cancelado em tempo real.",
                        });
                    }
                }
            })
            // Listen for new patients
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'pacientes'
            }, (payload: any) => {
                if (preferences.new_patient) {
                    toast.info("Novo Paciente!", {
                        description: `${payload.new.nome} acaba de ser cadastrado no sistema.`,
                    });
                }
            })
            // Listen for financial items
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'movimentacoes'
            }, (payload: any) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    if (payload.new.status === 'pendente' && preferences.overdue_payment) {
                        toast.warning("Inadimplência Detectada!", {
                            description: `Pagamento de R$ ${payload.new.valor} está pendente.`,
                        });
                    }
                }
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [preferences]);
}
