import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePacientes() {
  return useQuery({
    queryKey: ["pacientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pacientes")
        .select(`
          *,
          profissionais (nome)
        `)
        .neq("status", "lead")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pacientes")
        .select(`
          *,
          profissionais (nome)
        `)
        .eq("status", "lead")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePaciente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPaciente: any) => {
      const { data, error } = await supabase
        .from("pacientes")
        .insert([newPaciente])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
    },
  });
}

export function useUpdatePaciente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string;[key: string]: any }) => {
      const { data, error } = await supabase
        .from("pacientes")
        .update(updates)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useProfissionais() {
  return useQuery({
    queryKey: ["profissionais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateAgendamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string;[key: string]: any }) => {
      const { data, error } = await supabase
        .from("agendamentos")
        .update(updates)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
    },
  });
}

export function useDeleteAgendamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("agendamentos")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
    },
  });
}

export function useAgendamentos() {
  return useQuery({
    queryKey: ["agendamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select(`
          *,
          pacientes (nome),
          profissionais (nome, cor)
        `);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAgendamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newAgendamento: any) => {
      const { data, error } = await supabase
        .from("agendamentos")
        .insert([newAgendamento])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
    },
  });
}

export function useOportunidades() {
  return useQuery({
    queryKey: ["oportunidades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oportunidades")
        .select(`
          *,
          pacientes (nome),
          profissionais (nome)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateOportunidade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOportunidade: any) => {
      const { data, error } = await supabase
        .from("oportunidades")
        .insert([newOportunidade])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
    },
  });
}

export function useUpdateOportunidade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string;[key: string]: any }) => {
      const { data, error } = await supabase
        .from("oportunidades")
        .update(updates)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
    },
  });
}
export function useDeleteOportunidade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("oportunidades")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
    },
  });
}

export function useMovimentacoes() {
  return useQuery({
    queryKey: ["movimentacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movimentacoes")
        .select(`
          *,
          pacientes (nome)
        `)
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateMovimentacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newMov: any) => {
      const { data, error } = await supabase
        .from("movimentacoes")
        .insert([newMov])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimentacoes"] });
    },
  });
}

export function useMessages(numero_wa?: string) {
  return useQuery({
    queryKey: ["messages", numero_wa],
    queryFn: async () => {
      if (!numero_wa) return [];
      const { data, error } = await (supabase as any)
        .from("mensagens")
        .select("*")
        .eq("numero_wa", numero_wa)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!numero_wa,
  });
}

export function useSendWhatsApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ numero_wa, corpo }: { numero_wa: string; corpo: string }) => {
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: { numero_wa, corpo },
      });

      if (error) {
        console.error('Erro na Edge Function whatsapp-send:', error);
        // Tenta extrair a mensagem de erro do corpo da resposta se disponível
        const errorMsg = (error as any).context?.message || error.message || "Erro desconhecido na função";
        throw new Error(errorMsg);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mensagens"] });
    },
  });
}
export function useDeletePaciente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pacientes")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
