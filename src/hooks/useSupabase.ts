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
