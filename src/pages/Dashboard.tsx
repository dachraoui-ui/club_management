import { useMemo } from 'react';
import { Users, Trophy, Calendar, CalendarDays, DollarSign, TrendingUp, UserPlus, Plus, Zap, Award, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { useMembers } from '@/hooks/useMembers';
import { useTeams } from '@/hooks/useTeams';
import { useEvents } from '@/hooks/useEvents';
import { useTrainings } from '@/hooks/useTrainings';
import { useDashboardStats, useFinanceStatistics } from '@/hooks/useStatistics';
import { useFinanceStats } from '@/hooks/useFinance';
import { Member } from '@/types/api';

// 3D Card Component with tilt effect
function Card3D({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div 
      className={`group relative ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div 
        className="relative transition-all duration-500 ease-out transform-gpu group-hover:scale-[1.02]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}

// Animated 3D Stat Card
function Stat3DCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'accent',
  delay = 0 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: { value: number; isPositive: boolean }; 
  color?: string;
  delay?: number;
}) {
  const colorClasses: Record<string, string> = {
    accent: 'from-emerald-500 to-teal-600',
    primary: 'from-blue-500 to-indigo-600',
    warning: 'from-amber-500 to-orange-600',
    danger: 'from-rose-500 to-pink-600',
    purple: 'from-purple-500 to-violet-600',
  };

  return (
    <div 
      className="group relative animate-fade-in"
      style={{ 
        perspective: '1000px',
        animationDelay: `${delay}ms`,
      }}
    >
      <div 
        className="relative h-full transition-all duration-500 ease-out transform-gpu group-hover:[transform:rotateY(5deg)_rotateX(-5deg)_scale(1.05)] group-hover:z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 3D Shadow/Depth effect */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500 -z-10`}
          style={{ transform: 'translateZ(-20px) scale(0.95)' }}
        />
        
        {/* Main card */}
        <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          </div>
          
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">{title}</p>
                <p className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {value}
                </p>
                {trend && (
                  <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <TrendingUp className={`w-4 h-4 ${!trend.isPositive && 'rotate-180'}`} />
                    <span className="font-semibold">{trend.isPositive ? '+' : ''}{trend.value}%</span>
                    <span className="text-muted-foreground text-xs">vs last month</span>
                  </div>
                )}
              </div>
              <div 
                className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
                style={{ transform: 'translateZ(20px)' }}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Animated Ring Progress
function RingProgress({ value, label, color }: { value: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/20"
          />
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{value}%</span>
        </div>
      </div>
      <span className="mt-2 text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

// COLORS for charts
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  // Fetch real data
  const { data: membersData, isLoading: membersLoading } = useMembers({ limit: 1000 });
  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const { data: eventsData, isLoading: eventsLoading } = useEvents();
  const { data: trainingsData, isLoading: trainingsLoading } = useTrainings();
  const { data: dashboardStats } = useDashboardStats();
  const { data: financeStats } = useFinanceStatistics();
  const { data: financeData } = useFinanceStats();

  // Calculate real stats - wrap in useMemo to prevent dependency warnings
  const members = useMemo(() => membersData?.members || [], [membersData?.members]);
  const teams = useMemo(() => teamsData || [], [teamsData]);
  const events = useMemo(() => eventsData || [], [eventsData]);
  const trainings = useMemo(() => trainingsData || [], [trainingsData]);

  const stats = useMemo(() => ({
    totalMembers: dashboardStats?.totalMembers || members.length,
    activeTeams: dashboardStats?.activeTeams || teams.length,
    upcomingTrainings: dashboardStats?.upcomingTrainings || trainings.filter(t => t.status === 'Scheduled').length,
    eventsThisMonth: dashboardStats?.eventsThisMonth || events.filter(e => e.status === 'Upcoming').length,
    monthlyRevenue: dashboardStats?.monthlyRevenue || financeData?.revenue?.monthly || 0,
    memberGrowth: dashboardStats?.memberGrowth || 12.5,
    revenueGrowth: dashboardStats?.revenueGrowth || 8.3,
  }), [dashboardStats, members, teams, trainings, events, financeData]);

  // Calculate role distribution
  const roleDistribution = useMemo(() => {
    const roles: Record<string, number> = { Athletes: 0, Coaches: 0, Staff: 0 };
    members.forEach((member: Member) => {
      const role = member.user?.role || member.role || 'Athlete';
      if (role === 'Athlete') roles.Athletes++;
      else if (role === 'Coach') roles.Coaches++;
      else if (role === 'Staff') roles.Staff++;
    });
    return [
      { name: 'Athletes', value: roles.Athletes, color: COLORS[0] },
      { name: 'Coaches', value: roles.Coaches, color: COLORS[1] },
      { name: 'Staff', value: roles.Staff, color: COLORS[2] },
    ];
  }, [members]);

  // Get revenue data
  const revenueData = financeStats?.revenueData || financeData?.monthlyData || [
    { month: 'Aug', revenue: 0, expenses: 0 },
    { month: 'Sep', revenue: 0, expenses: 0 },
    { month: 'Oct', revenue: 0, expenses: 0 },
    { month: 'Nov', revenue: 0, expenses: 0 },
    { month: 'Dec', revenue: 0, expenses: 0 },
    { month: 'Jan', revenue: 0, expenses: 0 },
  ];

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    const totalTrainings = trainings.length;
    const completedTrainings = trainings.filter(t => t.status === 'Completed').length;
    const attendanceRate = totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 85;
    
    return {
      attendanceRate,
      teamActivity: teams.length > 0 ? Math.min(95, 70 + teams.length * 5) : 75,
      memberEngagement: members.length > 0 ? Math.min(90, 60 + members.length * 2) : 70,
    };
  }, [trainings, teams, members]);

  // Upcoming items
  const upcomingTrainings = trainings.filter(t => t.status === 'Scheduled').slice(0, 3);
  const upcomingEvents = events.filter(e => e.status === 'Upcoming').slice(0, 3);

  // Radial bar data for team performance
  const teamPerformanceData = teams.slice(0, 5).map((team, index) => ({
    name: team.name,
    members: team.memberCount || 0,
    fill: COLORS[index % COLORS.length],
  }));

  const isLoading = membersLoading || teamsLoading || eventsLoading || trainingsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-6 h-6 text-accent animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section with 3D effect */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/10 via-primary/5 to-background p-8 border border-accent/20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-xl">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/50 bg-clip-text">
                  Welcome back, Admin!
                </h1>
                <p className="text-muted-foreground">Here's your club's performance at a glance</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-gradient-to-r from-accent to-emerald-600 hover:from-accent/90 hover:to-emerald-600/90 shadow-lg shadow-accent/25 transition-all hover:shadow-xl hover:shadow-accent/30 hover:scale-105">
              <Link to="/members/new">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-accent/50 hover:bg-accent/10 transition-all hover:scale-105">
              <Link to="/events/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="relative mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Members', value: stats.totalMembers, icon: Users },
            { label: 'Teams', value: stats.activeTeams, icon: Trophy },
            { label: 'Trainings', value: stats.upcomingTrainings, icon: Calendar },
            { label: 'Events', value: stats.eventsThisMonth, icon: CalendarDays },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
              <item.icon className="w-5 h-5 text-accent" />
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat3DCard
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
          trend={{ value: stats.memberGrowth, isPositive: stats.memberGrowth >= 0 }}
          color="accent"
          delay={0}
        />
        <Stat3DCard
          title="Active Teams"
          value={stats.activeTeams}
          icon={Trophy}
          color="primary"
          delay={100}
        />
        <Stat3DCard
          title="Upcoming Trainings"
          value={stats.upcomingTrainings}
          icon={Calendar}
          color="warning"
          delay={200}
        />
        <Stat3DCard
          title="Events This Month"
          value={stats.eventsThisMonth}
          icon={CalendarDays}
          color="purple"
          delay={300}
        />
        <Stat3DCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: stats.revenueGrowth, isPositive: stats.revenueGrowth >= 0 }}
          color="accent"
          delay={400}
        />
      </div>

      {/* Performance Rings */}
      <Card3D>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-12 py-4">
              <RingProgress value={performanceMetrics.attendanceRate} label="Attendance Rate" color="#10b981" />
              <RingProgress value={performanceMetrics.teamActivity} label="Team Activity" color="#3b82f6" />
              <RingProgress value={performanceMetrics.memberEngagement} label="Member Engagement" color="#8b5cf6" />
            </div>
          </CardContent>
        </Card>
      </Card3D>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card3D className="lg:col-span-2">
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="expenses" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Card3D>

        {/* Role Distribution */}
        <Card3D>
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle>Team Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {roleDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Card3D>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 gap-6">
        {/* Team Size Comparison */}
        <Card3D>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamPerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={teamPerformanceData}>
                    <RadialBar
                      background
                      dataKey="members"
                      cornerRadius={10}
                    />
                    <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No teams created yet
                </div>
              )}
            </CardContent>
          </Card>
        </Card3D>
      </div>

      {/* Upcoming Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Trainings */}
        <Card3D>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                Upcoming Trainings
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="hover:bg-accent/10">
                <Link to="/trainings">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTrainings.length > 0 ? upcomingTrainings.map((training) => (
                <div key={training.id} className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-secondary/50 to-secondary/30 hover:from-accent/10 hover:to-accent/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-accent/20">
                  <div>
                    <p className="font-medium group-hover:text-accent transition-colors">{training.title}</p>
                    <p className="text-sm text-muted-foreground">{training.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(training.date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">{training.time}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming trainings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </Card3D>

        {/* Upcoming Events */}
        <Card3D>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-accent" />
                Upcoming Events
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="hover:bg-accent/10">
                <Link to="/events">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
                <div key={event.id} className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-secondary/50 to-secondary/30 hover:from-accent/10 hover:to-accent/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-accent/20">
                  <div>
                    <p className="font-medium group-hover:text-accent transition-colors">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={event.status} />
                    <p className="text-xs text-muted-foreground mt-1">{event.registered}/{event.capacity} registered</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>
        </Card3D>
      </div>

      {/* Recent Activity Timeline */}
      <Card3D>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-primary to-purple-500" />
              
              <div className="space-y-6">
                {members.slice(0, 4).map((member: Member) => (
                  <div key={member.id} className="relative flex items-start gap-4 pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-2 w-4 h-4 rounded-full bg-gradient-to-br from-accent to-primary border-2 border-background shadow-lg" />
                    
                    <div className="flex-1 p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New member joined</p>
                          <p className="text-sm text-muted-foreground">
                            {member.user?.firstName || member.firstName} {member.user?.lastName || member.lastName}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </Card3D>
    </div>
  );
}
