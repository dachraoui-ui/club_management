import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Training } from '@/types/api';

interface TrainingsFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  coachId?: string;
}

export const useTrainings = (filters: TrainingsFilters = {}) => {
  return useQuery({
    queryKey: ['trainings', filters],
    queryFn: async () => {
      const response = await api.get('/trainings', { params: filters });
      return response.data.data as Training[];
    },
  });
};

export const useTraining = (id: string) => {
  return useQuery({
    queryKey: ['training', id],
    queryFn: async () => {
      const response = await api.get(`/trainings/${id}`);
      return response.data.data as Training;
    },
    enabled: !!id,
  });
};

export const useCreateTraining = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trainingData: Partial<Training>) => api.post('/trainings', trainingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
};

export const useUpdateTraining = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Training> }) =>
      api.put(`/trainings/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['training', variables.id] });
    },
  });
};

export const useDeleteTraining = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/trainings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ trainingId, athleteId, status }: { trainingId: string; athleteId: string; status: string }) =>
      api.post(`/trainings/${trainingId}/attendance`, { athleteId, status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['training', variables.trainingId] });
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
};

export const useTrainingAttendance = (trainingId: string) => {
  return useQuery({
    queryKey: ['training-attendance', trainingId],
    queryFn: async () => {
      const response = await api.get(`/trainings/${trainingId}/attendance`);
      return response.data.data;
    },
    enabled: !!trainingId,
  });
};
