import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Team } from '@/types/api';

export const useTeams = () => {
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await api.get('/teams');
      return response.data.data as Team[];
    },
  });
};

export const useTeam = (id: string) => {
  return useQuery<Team>({
    queryKey: ['team', id],
    queryFn: async () => {
      const response = await api.get(`/teams/${id}`);
      return response.data.data as Team;
    },
    enabled: !!id,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamData: any) => api.post('/teams', teamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/teams/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', variables.id] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/teams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useCoaches = () => {
  return useQuery({
    queryKey: ['coaches'],
    queryFn: async () => {
      const response = await api.get('/members', { 
        params: { 
          limit: 1000,
          // We'll filter coaches on the frontend or create a coaches endpoint
        } 
      });
      // Filter for coaches - we need to get users with Coach role
      // For now, let's create a simple endpoint or filter
      return [];
    },
    enabled: false, // Disable for now, we'll create a proper endpoint
  });
};

