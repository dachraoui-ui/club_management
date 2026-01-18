import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Member } from '@/types/api';

interface MembersFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  speciality?: string;
}

interface MembersResponse {
  members: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useMembers = (filters: MembersFilters = {}) => {
  return useQuery({
    queryKey: ['members', filters],
    queryFn: async () => {
      const params = { ...filters, limit: filters.limit || 100 };
      const response = await api.get('/members', { params });
      // API returns { data: members[], pagination }
      return {
        members: response.data.data as Member[],
        pagination: response.data.pagination,
      } as MembersResponse;
    },
  });
};

export const useMember = (id: string) => {
  return useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      const response = await api.get(`/members/${id}`);
      return response.data.data as Member;
    },
    enabled: !!id,
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberData: any) => api.post('/members', memberData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/members/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', variables.id] });
    },
  });
};

export const useUpdateMemberStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/members/${id}/status`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', variables.id] });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/members/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

