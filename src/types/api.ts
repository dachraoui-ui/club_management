export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Member {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  dateOfBirth?: string;
  baseSalary?: number;
  status?: 'Active' | 'Inactive' | 'Pending';
  sports?: string[];
  speciality?: string;
  joinDate?: string;
  address?: string;
  emergencyContact?: string;
  weight?: number;
  height?: number;
  strongPoint?: string;
  weakPoint?: string;
  teamId?: string;
  photo?: string;
  team?: {
    id: string;
    name: string;
    discipline: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    subscriptions?: Array<{
      id: string;
      type: string;
      status: string;
      startDate: string;
      endDate: string;
      price: number;
    }>;
  };
  subscriptions?: Array<{
    id: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    price: number;
  }>;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'Tournament' | 'Workshop' | 'Social' | 'Competition';
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  image?: string;
  participants?: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  discipline: string;
  photo?: string;
  coach: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
  };
  memberCount: number;
  members?: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role?: string;
    };
  }>;
}

export interface Training {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  discipline: string;
  location: string;
  maxCapacity: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  attendees: number;
  coachId: string;
  coach: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  attendance?: Array<{
    id: string;
    athleteId: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
    athlete: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

