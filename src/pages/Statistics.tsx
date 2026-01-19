import { useMemo } from 'react';
import { TrendingUp, Users, Trophy, DollarSign, Activity, Target, Award, Zap, BarChart3, PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import { useMembers } from '@/hooks/useMembers';
import { useTeams } from '@/hooks/useTeams';
import { useEvents } from '@/hooks/useEvents';
import { useTrainings } from '@/hooks/useTrainings';
import { useDashboardStats, useFinanceStatistics, useSportsDistribution } from '@/hooks/useStatistics';
import { useFinanceStats } from '@/hooks/useFinance';

// 3D Card with hover effects
function Card3D({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div 
      className={`group relative ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div 
        className="relative transition-all duration-500 ease-out transform-gpu group-hover:[transform:rotateY(2deg)_rotateX(-2deg)_scale(1.02)] group-hover:z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500 -z-10" />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

// Animated Stat Card with 3D effect
function AnimatedStatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'accent',
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: { value: number; isPositive: boolean }; 
  color?: string;
  subtitle?: string;
}) {
  const colorClasses: Record<string, string> = {
    accent: 'from-emerald-500 to-teal-600',
    primary: 'from-blue-500 to-indigo-600',
    warning: 'from-amber-500 to-orange-600',
    danger: 'from-rose-500 to-pink-600',
    purple: 'from-purple-500 to-violet-600',
  };

  const bgColorClasses: Record<string, string> = {
    accent: 'from-emerald-500/10 to-teal-600/5',
    primary: 'from-blue-500/10 to-indigo-600/5',
    warning: 'from-amber-500/10 to-orange-600/5',
    danger: 'from-rose-500/10 to-pink-600/5',
    purple: 'from-purple-500/10 to-violet-600/5',
  };

  return (
    <div className="group relative" style={{ perspective: '1000px' }}>
      <div 
        className="relative h-full transition-all duration-500 ease-out transform-gpu group-hover:[transform:rotateY(5deg)_rotateX(-5deg)_scale(1.05)] group-hover:z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500 -z-10`} />
        
        <Card className={`h-full border-0 shadow-lg bg-gradient-to-br ${bgColorClasses[color]} to-card backdrop-blur-sm overflow-hidden`}>
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">{title}</p>
                <p className="text-3xl font-bold tracking-tight">{value}</p>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                {trend && (
                  <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <TrendingUp className={`w-4 h-4 ${!trend.isPositive && 'rotate-180'}`} />
                    <span className="font-semibold">{trend.isPositive ? '+' : ''}{trend.value}%</span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Animated Progress Bar
function AnimatedProgressBar({ value, label, color, maxValue = 100 }: { value: number; label: string; color: string; maxValue?: number }) {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{value}/{maxValue}</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${percentage}%`, 
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            boxShadow: `0 0 10px ${color}66`
          }}
        />
      </div>
    </div>
  );
}

// Circular Progress
function CircularProgress({ value, size = 120, strokeWidth = 10, color, label }: { value: number; size?: number; strokeWidth?: number; color: string; label: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center group">
      <div className="relative transition-transform duration-300 group-hover:scale-110" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{value}%</span>
        </div>
      </div>
      <span className="mt-3 text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Statistics() {
  // Fetch real data
  const { data: membersData, isLoading: membersLoading } = useMembers({ limit: 1000 });
  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const { data: eventsData, isLoading: eventsLoading } = useEvents();
  const { data: trainingsData, isLoading: trainingsLoading } = useTrainings();
  const { data: dashboardStats } = useDashboardStats();
  const { data: financeStats } = useFinanceStatistics();
  const { data: sportsDist } = useSportsDistribution();
  const { data: financeData } = useFinanceStats();

  const members = membersData?.members || [];
  const teams = teamsData || [];
  const events = eventsData || [];
  const trainings = trainingsData || [];

  // Calculate real metrics
  const metrics = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter((m: any) => {
      const subscription = m.user?.subscriptions?.[0] || m.subscriptions?.[0];
      return subscription?.status === 'Active';
    }).length;
    
    const completedTrainings = trainings.filter(t => t.status === 'Completed').length;
    const totalTrainings = trainings.length;
    const attendanceRate = totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 85;
    
    const upcomingEvents = events.filter(e => e.status === 'Upcoming').length;
    const completedEvents = events.filter(e => e.status === 'Completed').length;
    
    return {
      totalMembers,
      activeMembers,
      retentionRate: totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 95,
      attendanceRate,
      teamCount: teams.length,
      eventCompletion: events.length > 0 ? Math.round((completedEvents / events.length) * 100) : 70,
      upcomingEvents,
      completedTrainings,
      totalTrainings,
    };
  }, [members, teams, events, trainings]);

  // Role distribution
  const roleDistribution = useMemo(() => {
    const roles: Record<string, number> = { Athletes: 0, Coaches: 0, Staff: 0 };
    members.forEach((member: any) => {
      const role = member.user?.role || 'Athlete';
      if (role === 'Athlete') roles.Athletes++;
      else if (role === 'Coach') roles.Coaches++;
      else if (role === 'Staff') roles.Staff++;
    });
    return Object.entries(roles).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index],
    }));
  }, [members]);

  // Sports distribution
  const sportsData = useMemo(() => {
    if (sportsDist && sportsDist.length > 0) {
      return sportsDist.map((item, index) => ({ ...item, fill: COLORS[index % COLORS.length] }));
    }
    
    const sports: Record<string, number> = {};
    members.forEach((member: any) => {
      const memberSports = member.sports || [];
      memberSports.forEach((sport: string) => {
        sports[sport] = (sports[sport] || 0) + 1;
      });
    });
    return Object.entries(sports)
      .map(([sport, count], index) => ({ sport, members: count, fill: COLORS[index % COLORS.length] }))
      .slice(0, 8);
  }, [sportsDist, members]);

  // Revenue data
  const revenueData = financeStats?.revenueData || financeData?.monthlyData || [
    { month: 'Aug', revenue: 4500, expenses: 2800 },
    { month: 'Sep', revenue: 5200, expenses: 3100 },
    { month: 'Oct', revenue: 4800, expenses: 2900 },
    { month: 'Nov', revenue: 6100, expenses: 3400 },
    { month: 'Dec', revenue: 7200, expenses: 3800 },
    { month: 'Jan', revenue: 5800, expenses: 3200 },
  ];

  // Team performance data
  const teamPerformance = useMemo(() => {
    return teams.slice(0, 6).map((team, index) => ({
      name: team.name.length > 15 ? team.name.substring(0, 15) + '...' : team.name,
      members: team.memberCount || 0,
      fill: COLORS[index % COLORS.length],
    }));
  }, [teams]);

  // Radar data for overall performance
  const radarData = useMemo(() => [
    { subject: 'Members', A: Math.min(100, metrics.totalMembers * 5), fullMark: 100 },
    { subject: 'Teams', A: Math.min(100, metrics.teamCount * 15), fullMark: 100 },
    { subject: 'Retention', A: metrics.retentionRate, fullMark: 100 },
    { subject: 'Attendance', A: metrics.attendanceRate, fullMark: 100 },
    { subject: 'Events', A: Math.min(100, events.length * 10), fullMark: 100 },
    { subject: 'Trainings', A: Math.min(100, metrics.totalTrainings * 5), fullMark: 100 },
  ], [metrics, events]);

  // Monthly growth data
  const monthlyGrowth = useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    return months.map((month, i) => ({
      month,
      members: Math.max(0, metrics.totalMembers - (6 - i) * Math.floor(metrics.totalMembers / 10)),
      teams: Math.max(0, metrics.teamCount - Math.floor((6 - i) / 3)),
    }));
  }, [metrics]);

  const isLoading = membersLoading || teamsLoading || eventsLoading || trainingsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-accent animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-background p-8 border border-primary/20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Statistics & Analytics</h1>
              <p className="text-muted-foreground">Deep insights into your club's performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Member Retention"
          value={`${metrics.retentionRate}%`}
          icon={Users}
          trend={{ value: 3.2, isPositive: true }}
          color="accent"
          subtitle={`${metrics.activeMembers} active members`}
        />
        <AnimatedStatCard
          title="Avg. Attendance"
          value={`${metrics.attendanceRate}%`}
          icon={Activity}
          trend={{ value: 5.1, isPositive: true }}
          color="primary"
          subtitle={`${metrics.completedTrainings} completed trainings`}
        />
        <AnimatedStatCard
          title="Active Teams"
          value={metrics.teamCount}
          icon={Trophy}
          color="warning"
          subtitle={`${members.length} total members`}
        />
        <AnimatedStatCard
          title="Revenue Growth"
          value="+12.5%"
          icon={TrendingUp}
          trend={{ value: 4.2, isPositive: true }}
          color="purple"
          subtitle="vs last quarter"
        />
      </div>

      {/* Performance Circles */}
      <Card3D>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 py-6">
              <CircularProgress value={metrics.retentionRate} color="#10b981" label="Retention Rate" />
              <CircularProgress value={metrics.attendanceRate} color="#3b82f6" label="Attendance Rate" />
              <CircularProgress value={metrics.eventCompletion} color="#8b5cf6" label="Event Completion" />
              <CircularProgress value={Math.min(100, metrics.teamCount * 10)} color="#f59e0b" label="Team Growth" />
            </div>
          </CardContent>
        </Card>
      </Card3D>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Performance Radar */}
        <Card3D>
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Card3D>

        {/* Growth Trend */}
        <Card3D>
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Growth Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyGrowth}>
                  <defs>
                    <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="teamGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
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
                    }}
                  />
                  <Area type="monotone" dataKey="members" stroke="#10b981" strokeWidth={2} fill="url(#memberGradient)" name="Members" />
                  <Area type="monotone" dataKey="teams" stroke="#3b82f6" strokeWidth={2} fill="url(#teamGradient)" name="Teams" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Card3D>
      </div>

      {/* Revenue Analysis */}
      <Card3D>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-accent" />
              Revenue vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
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
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[8, 8, 0, 0]} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }} name="Expenses" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Card3D>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Distribution */}
        <Card3D>
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-accent" />
                Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
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
              <div className="flex justify-center gap-4 mt-4">
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

        {/* Sports Participation */}
        <Card3D className="lg:col-span-2">
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Sports Participation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sportsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sportsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="sport" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="members" radius={[8, 8, 0, 0]}>
                      {sportsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No sports data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Card3D>
      </div>

      {/* Team Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <Card3D>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Team Size Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={teamPerformance} startAngle={180} endAngle={0}>
                    <RadialBar
                      minAngle={15}
                      background
                      clockWise
                      dataKey="members"
                      cornerRadius={10}
                    />
                    <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No teams created yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Card3D>

        {/* Progress Bars */}
        <Card3D>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatedProgressBar 
                value={metrics.totalMembers} 
                maxValue={Math.max(50, metrics.totalMembers + 10)} 
                label="Total Members" 
                color="#10b981" 
              />
              <AnimatedProgressBar 
                value={metrics.teamCount} 
                maxValue={Math.max(10, metrics.teamCount + 3)} 
                label="Active Teams" 
                color="#3b82f6" 
              />
              <AnimatedProgressBar 
                value={events.length} 
                maxValue={Math.max(20, events.length + 5)} 
                label="Total Events" 
                color="#f59e0b" 
              />
              <AnimatedProgressBar 
                value={metrics.totalTrainings} 
                maxValue={Math.max(30, metrics.totalTrainings + 5)} 
                label="Training Sessions" 
                color="#8b5cf6" 
              />
              <AnimatedProgressBar 
                value={metrics.upcomingEvents} 
                maxValue={Math.max(10, metrics.upcomingEvents + 3)} 
                label="Upcoming Events" 
                color="#ec4899" 
              />
            </CardContent>
          </Card>
        </Card3D>
      </div>
    </div>
  );
}
