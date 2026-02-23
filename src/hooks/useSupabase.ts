import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePacientes() {
  return useQuery({
    queryKey: ["pacientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .order("nome");
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
