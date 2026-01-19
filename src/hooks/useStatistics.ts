import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export interface DashboardStats {
  totalMembers: number;
  activeTeams: number;
  upcomingTrainings: number;
  eventsThisMonth: number;
  monthlyRevenue: number;
  memberGrowth: number;
  revenueGrowth: number;
}

export interface FinanceStats {
  revenueData: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
  paymentStatusBreakdown: Array<{
    status: string;
    count: number;
  }>;
}

export interface MembershipDistribution {
  name: string;
  value: number;
}

export interface SportsDistribution {
  sport: string;
  members: number;
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['stats', 'dashboard'],
    queryFn: async () => {
      try {
        const response = await api.get('/stats/dashboard');
        return response.data.data;
      } catch (error) {
        // Return default values if API fails
        return {
          totalMembers: 0,
          activeTeams: 0,
          upcomingTrainings: 0,
          eventsThisMonth: 0,
          monthlyRevenue: 0,
          memberGrowth: 0,
          revenueGrowth: 0,
        };
      }
    },
  });
};

export const useFinanceStatistics = () => {
  return useQuery<FinanceStats>({
    queryKey: ['stats', 'finance'],
    queryFn: async () => {
      try {
        const response = await api.get('/stats/finance');
        return response.data.data;
      } catch (error) {
        return {
          revenueData: [],
          paymentStatusBreakdown: [],
        };
      }
    },
  });
};

export const useMembershipDistribution = () => {
  return useQuery<MembershipDistribution[]>({
    queryKey: ['stats', 'membership-distribution'],
    queryFn: async () => {
      try {
        const response = await api.get('/stats/membership');
        return response.data.data;
      } catch (error) {
        return [];
      }
    },
  });
};

export const useSportsDistribution = () => {
  return useQuery<SportsDistribution[]>({
    queryKey: ['stats', 'sports-distribution'],
    queryFn: async () => {
      try {
        const response = await api.get('/stats/sports');
        return response.data.data;
      } catch (error) {
        return [];
      }
    },
  });
};
