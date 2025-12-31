// Mock Data for Sport Club Management System

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  membershipType: 'Basic' | 'Premium' | 'Elite';
  status: 'Active' | 'Inactive' | 'Pending';
  sports: string[];
  joinDate: string;
  avatar?: string;
  address: string;
  emergencyContact: string;
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  coach: string;
  memberCount: number;
  wins: number;
  losses: number;
  draws: number;
  nextMatch?: string;
  logo?: string;
}

export interface Training {
  id: string;
  title: string;
  team: string;
  coach: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  attendees: number;
  maxCapacity: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
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
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  type: 'Membership' | 'Training' | 'Event' | 'Equipment';
  method: 'Card' | 'Cash' | 'Bank Transfer';
}

export interface Sponsor {
  id: string;
  name: string;
  logo?: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Pending';
  tier: 'Gold' | 'Silver' | 'Bronze';
}

export const members: Member[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1 234 567 8901',
    dateOfBirth: '1990-05-15',
    membershipType: 'Premium',
    status: 'Active',
    sports: ['Football', 'Basketball'],
    joinDate: '2023-01-15',
    address: '123 Main St, City',
    emergencyContact: '+1 234 567 8902',
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 234 567 8903',
    dateOfBirth: '1995-08-22',
    membershipType: 'Elite',
    status: 'Active',
    sports: ['Tennis', 'Swimming'],
    joinDate: '2022-06-10',
    address: '456 Oak Ave, Town',
    emergencyContact: '+1 234 567 8904',
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Williams',
    email: 'mike.w@email.com',
    phone: '+1 234 567 8905',
    dateOfBirth: '1988-12-03',
    membershipType: 'Basic',
    status: 'Active',
    sports: ['Football'],
    joinDate: '2023-09-01',
    address: '789 Pine Rd, Village',
    emergencyContact: '+1 234 567 8906',
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.b@email.com',
    phone: '+1 234 567 8907',
    dateOfBirth: '1992-03-28',
    membershipType: 'Premium',
    status: 'Inactive',
    sports: ['Basketball', 'Volleyball'],
    joinDate: '2021-11-20',
    address: '321 Elm St, City',
    emergencyContact: '+1 234 567 8908',
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Lee',
    email: 'david.lee@email.com',
    phone: '+1 234 567 8909',
    dateOfBirth: '1997-07-14',
    membershipType: 'Elite',
    status: 'Active',
    sports: ['Swimming', 'Tennis', 'Running'],
    joinDate: '2022-03-05',
    address: '654 Maple Dr, Town',
    emergencyContact: '+1 234 567 8910',
  },
  {
    id: '6',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.a@email.com',
    phone: '+1 234 567 8911',
    dateOfBirth: '1994-11-09',
    membershipType: 'Premium',
    status: 'Pending',
    sports: ['Yoga', 'Pilates'],
    joinDate: '2024-01-10',
    address: '987 Cedar Ln, Village',
    emergencyContact: '+1 234 567 8912',
  },
];

export const teams: Team[] = [
  {
    id: '1',
    name: 'Thunder FC',
    sport: 'Football',
    coach: 'Coach Martinez',
    memberCount: 22,
    wins: 12,
    losses: 3,
    draws: 5,
    nextMatch: '2024-02-15',
  },
  {
    id: '2',
    name: 'Storm Basketball',
    sport: 'Basketball',
    coach: 'Coach Thompson',
    memberCount: 15,
    wins: 18,
    losses: 6,
    draws: 0,
    nextMatch: '2024-02-12',
  },
  {
    id: '3',
    name: 'Aqua Swimmers',
    sport: 'Swimming',
    coach: 'Coach Chen',
    memberCount: 20,
    wins: 8,
    losses: 2,
    draws: 0,
    nextMatch: '2024-02-20',
  },
  {
    id: '4',
    name: 'Tennis Aces',
    sport: 'Tennis',
    coach: 'Coach Williams',
    memberCount: 12,
    wins: 15,
    losses: 5,
    draws: 0,
    nextMatch: '2024-02-18',
  },
  {
    id: '5',
    name: 'Volleyball Stars',
    sport: 'Volleyball',
    coach: 'Coach Garcia',
    memberCount: 14,
    wins: 10,
    losses: 4,
    draws: 0,
    nextMatch: '2024-02-22',
  },
];

export const trainings: Training[] = [
  {
    id: '1',
    title: 'Football Practice',
    team: 'Thunder FC',
    coach: 'Coach Martinez',
    date: '2024-02-10',
    time: '09:00',
    duration: '2 hours',
    location: 'Main Field',
    attendees: 18,
    maxCapacity: 25,
    status: 'Scheduled',
  },
  {
    id: '2',
    title: 'Basketball Drills',
    team: 'Storm Basketball',
    coach: 'Coach Thompson',
    date: '2024-02-10',
    time: '14:00',
    duration: '1.5 hours',
    location: 'Indoor Court A',
    attendees: 12,
    maxCapacity: 15,
    status: 'Scheduled',
  },
  {
    id: '3',
    title: 'Swimming Technique',
    team: 'Aqua Swimmers',
    coach: 'Coach Chen',
    date: '2024-02-11',
    time: '07:00',
    duration: '1 hour',
    location: 'Olympic Pool',
    attendees: 16,
    maxCapacity: 20,
    status: 'Scheduled',
  },
  {
    id: '4',
    title: 'Tennis Singles Training',
    team: 'Tennis Aces',
    coach: 'Coach Williams',
    date: '2024-02-11',
    time: '10:00',
    duration: '2 hours',
    location: 'Tennis Courts 1-4',
    attendees: 8,
    maxCapacity: 12,
    status: 'Scheduled',
  },
  {
    id: '5',
    title: 'Volleyball Team Practice',
    team: 'Volleyball Stars',
    coach: 'Coach Garcia',
    date: '2024-02-12',
    time: '16:00',
    duration: '1.5 hours',
    location: 'Indoor Court B',
    attendees: 14,
    maxCapacity: 14,
    status: 'Scheduled',
  },
  {
    id: '6',
    title: 'Football Tactics Session',
    team: 'Thunder FC',
    coach: 'Coach Martinez',
    date: '2024-02-08',
    time: '09:00',
    duration: '2 hours',
    location: 'Main Field',
    attendees: 22,
    maxCapacity: 25,
    status: 'Completed',
  },
];

export const events: Event[] = [
  {
    id: '1',
    title: 'Annual Sports Day',
    description: 'Our biggest event of the year featuring competitions across all sports.',
    type: 'Tournament',
    date: '2024-03-15',
    time: '08:00',
    location: 'Main Sports Complex',
    capacity: 500,
    registered: 342,
    status: 'Upcoming',
  },
  {
    id: '2',
    title: 'Youth Football Championship',
    description: 'Regional championship for youth football teams.',
    type: 'Competition',
    date: '2024-02-28',
    time: '10:00',
    location: 'Stadium A',
    capacity: 200,
    registered: 180,
    status: 'Upcoming',
  },
  {
    id: '3',
    title: 'Fitness Workshop',
    description: 'Learn advanced fitness techniques from professional trainers.',
    type: 'Workshop',
    date: '2024-02-20',
    time: '14:00',
    location: 'Gym Hall',
    capacity: 50,
    registered: 45,
    status: 'Upcoming',
  },
  {
    id: '4',
    title: 'Members Social Night',
    description: 'An evening of networking and fun activities for all club members.',
    type: 'Social',
    date: '2024-02-25',
    time: '18:00',
    location: 'Club House',
    capacity: 100,
    registered: 78,
    status: 'Upcoming',
  },
  {
    id: '5',
    title: 'Swimming Gala',
    description: 'Annual swimming competition with prizes for all age groups.',
    type: 'Competition',
    date: '2024-01-20',
    time: '09:00',
    location: 'Olympic Pool',
    capacity: 150,
    registered: 150,
    status: 'Completed',
  },
];

export const payments: Payment[] = [
  {
    id: '1',
    memberId: '1',
    memberName: 'John Smith',
    amount: 150,
    date: '2024-02-01',
    status: 'Paid',
    type: 'Membership',
    method: 'Card',
  },
  {
    id: '2',
    memberId: '2',
    memberName: 'Sarah Johnson',
    amount: 250,
    date: '2024-02-01',
    status: 'Paid',
    type: 'Membership',
    method: 'Bank Transfer',
  },
  {
    id: '3',
    memberId: '3',
    memberName: 'Mike Williams',
    amount: 75,
    date: '2024-02-05',
    status: 'Pending',
    type: 'Training',
    method: 'Card',
  },
  {
    id: '4',
    memberId: '4',
    memberName: 'Emily Brown',
    amount: 150,
    date: '2024-01-15',
    status: 'Overdue',
    type: 'Membership',
    method: 'Cash',
  },
  {
    id: '5',
    memberId: '5',
    memberName: 'David Lee',
    amount: 50,
    date: '2024-02-08',
    status: 'Paid',
    type: 'Event',
    method: 'Card',
  },
  {
    id: '6',
    memberId: '6',
    memberName: 'Lisa Anderson',
    amount: 100,
    date: '2024-02-10',
    status: 'Pending',
    type: 'Membership',
    method: 'Bank Transfer',
  },
];

export const sponsors: Sponsor[] = [
  {
    id: '1',
    name: 'SportTech Inc.',
    amount: 50000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'Active',
    tier: 'Gold',
  },
  {
    id: '2',
    name: 'FitLife Nutrition',
    amount: 25000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'Active',
    tier: 'Silver',
  },
  {
    id: '3',
    name: 'Urban Athletics',
    amount: 10000,
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    status: 'Active',
    tier: 'Bronze',
  },
  {
    id: '4',
    name: 'PowerGear Equipment',
    amount: 30000,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    status: 'Expired',
    tier: 'Silver',
  },
];

export const dashboardStats = {
  totalMembers: 248,
  activeTeams: 8,
  upcomingTrainings: 12,
  eventsThisMonth: 4,
  monthlyRevenue: 45680,
  memberGrowth: 12.5,
  revenueGrowth: 8.3,
};

export const revenueData = [
  { month: 'Jan', revenue: 42000, expenses: 28000 },
  { month: 'Feb', revenue: 45680, expenses: 30000 },
  { month: 'Mar', revenue: 48000, expenses: 31000 },
  { month: 'Apr', revenue: 51000, expenses: 32000 },
  { month: 'May', revenue: 49000, expenses: 29000 },
  { month: 'Jun', revenue: 53000, expenses: 33000 },
];

export const membershipData = [
  { name: 'Basic', value: 120, color: 'hsl(var(--chart-3))' },
  { name: 'Premium', value: 85, color: 'hsl(var(--chart-2))' },
  { name: 'Elite', value: 43, color: 'hsl(var(--chart-1))' },
];

export const sportsDistribution = [
  { sport: 'Football', members: 68 },
  { sport: 'Basketball', members: 52 },
  { sport: 'Swimming', members: 45 },
  { sport: 'Tennis', members: 38 },
  { sport: 'Volleyball', members: 25 },
  { sport: 'Other', members: 20 },
];

export const attendanceData = [
  { week: 'Week 1', attendance: 85 },
  { week: 'Week 2', attendance: 92 },
  { week: 'Week 3', attendance: 78 },
  { week: 'Week 4', attendance: 88 },
];
