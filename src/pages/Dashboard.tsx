import { Users, Trophy, Calendar, CalendarDays, DollarSign, TrendingUp, UserPlus, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { dashboardStats, revenueData, membershipData, sportsDistribution, trainings, events } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const upcomingTrainings = trainings.filter(t => t.status === 'Scheduled').slice(0, 3);
  const upcomingEvents = events.filter(e => e.status === 'Upcoming').slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back, Admin!</h2>
          <p className="text-muted-foreground">Here's what's happening with your club today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/members">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Link>
          </Button>
          <Button asChild className="bg-accent hover:bg-accent/90">
            <Link to="/events">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Members"
          value={dashboardStats.totalMembers}
          icon={Users}
          trend={{ value: dashboardStats.memberGrowth, isPositive: true }}
        />
        <StatCard
          title="Active Teams"
          value={dashboardStats.activeTeams}
          icon={Trophy}
          variant="primary"
        />
        <StatCard
          title="Upcoming Trainings"
          value={dashboardStats.upcomingTrainings}
          icon={Calendar}
        />
        <StatCard
          title="Events This Month"
          value={dashboardStats.eventsThisMonth}
          icon={CalendarDays}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${dashboardStats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: dashboardStats.revenueGrowth, isPositive: true }}
          variant="accent"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Membership Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Membership Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={membershipData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {membershipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {membershipData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sports Distribution & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sports Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Members by Sport</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sportsDistribution}>
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
                <Line type="monotone" dataKey="members" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: 'New member registration', user: 'Lisa Anderson', time: '2 hours ago', type: 'member' },
              { action: 'Payment received', user: 'David Lee - $50', time: '4 hours ago', type: 'payment' },
              { action: 'Training completed', user: 'Thunder FC Practice', time: '6 hours ago', type: 'training' },
              { action: 'Event registration', user: 'Annual Sports Day +12', time: '8 hours ago', type: 'event' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Trainings */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Trainings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/trainings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTrainings.map((training) => (
              <div key={training.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div>
                  <p className="font-medium">{training.title}</p>
                  <p className="text-sm text-muted-foreground">{training.team} • {training.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{training.date}</p>
                  <p className="text-xs text-muted-foreground">{training.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Events</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/events">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={event.status} />
                  <p className="text-xs text-muted-foreground mt-1">{event.registered}/{event.capacity} registered</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
