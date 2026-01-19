import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

// Types
export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  type: 'Membership' | 'Training' | 'Event' | 'Equipment';
  method: 'Card' | 'Cash' | 'BankTransfer';
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Salary {
  id: string;
  userId: string;
  amount: number;
  month: string;
  type: 'Player' | 'Coach' | 'Staff' | 'Manager';
  status: 'Paid' | 'Pending' | 'Overdue';
  paidDate: string | null;
  bonus: number;
  deductions: number;
  notes: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string | null;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Pending';
  tier: 'Gold' | 'Silver' | 'Bronze';
}

export interface FinanceStats {
  revenue: {
    total: number;
    monthly: number;
    pending: number;
    overdue: number;
  };
  salaries: {
    total: number;
    pending: number;
    monthlyPaid: number;
  };
  expenses: {
    total: number;
    monthly: number;
  };
  sponsorships: {
    activeCount: number;
    totalAmount: number;
  };
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
    salaries: number;
  }>;
}

// Finance Stats
export function useFinanceStats() {
  return useQuery<FinanceStats>({
    queryKey: ['finance', 'stats'],
    queryFn: async () => {
      const response = await api.get('/finance/stats');
      return response.data.data;
    },
  });
}

// Payments
export function usePayments(filters?: { status?: string; type?: string }) {
  return useQuery<Payment[]>({
    queryKey: ['finance', 'payments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      params.append('limit', '100');
      
      const response = await api.get(`/finance/payments?${params.toString()}`);
      return response.data.data;
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Payment, 'id' | 'member'>) => {
      const response = await api.post('/finance/payments', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Payment> & { id: string }) => {
      const response = await api.put(`/finance/payments/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/finance/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

// Salaries
export function useSalaries(filters?: { type?: string; status?: string; month?: string }) {
  return useQuery<Salary[]>({
    queryKey: ['finance', 'salaries', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.month) params.append('month', filters.month);
      params.append('limit', '100');
      
      const response = await api.get(`/finance/salaries?${params.toString()}`);
      return response.data.data;
    },
  });
}

export function useCreateSalary() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Salary, 'id' | 'user' | 'paidDate'> & { updateMemberSalary?: boolean }) => {
      const response = await api.post('/finance/salaries', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['members'] }); // Refresh members to get updated baseSalary
    },
  });
}

export function useUpdateSalary() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Salary> & { id: string; updateMemberSalary?: boolean }) => {
      const response = await api.put(`/finance/salaries/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['members'] }); // Refresh members to get updated baseSalary
    },
  });
}

export function useDeleteSalary() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/finance/salaries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

// Expenses
export function useExpenses(filters?: { category?: string }) {
  return useQuery<Expense[]>({
    queryKey: ['finance', 'expenses', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      params.append('limit', '100');
      
      const response = await api.get(`/finance/expenses?${params.toString()}`);
      return response.data.data;
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Expense, 'id'>) => {
      const response = await api.post('/finance/expenses', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Expense> & { id: string }) => {
      const response = await api.put(`/finance/expenses/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/finance/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

// Sponsors
export function useSponsors(filters?: { status?: string; tier?: string }) {
  return useQuery<Sponsor[]>({
    queryKey: ['finance', 'sponsors', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.tier) params.append('tier', filters.tier);
      
      const response = await api.get(`/finance/sponsors?${params.toString()}`);
      return response.data.data;
    },
  });
}

export function useCreateSponsor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Sponsor, 'id'>) => {
      const response = await api.post('/finance/sponsors', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useUpdateSponsor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Sponsor> & { id: string }) => {
      const response = await api.put(`/finance/sponsors/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useDeleteSponsor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/finance/sponsors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}
