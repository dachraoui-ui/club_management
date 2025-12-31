import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Edit, Share2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { events, members } from '@/data/mockData';

const eventTypeColors: Record<string, string> = {
  Tournament: 'bg-accent/10 text-accent',
  Competition: 'bg-primary/10 text-primary',
  Workshop: 'bg-warning/10 text-warning',
  Social: 'bg-chart-4/10 text-chart-4',
};

export default function EventDetails() {
  const { id } = useParams();
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Event not found</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  const registeredMembers = members.slice(0, Math.min(event.registered, members.length));
  const capacityPercentage = (event.registered / event.capacity) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link to="/events">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
      </Button>

      {/* Event Header */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="gradient-hero p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20`}>
                {event.type}
              </span>
              <h1 className="text-3xl font-bold mt-3">{event.title}</h1>
              <p className="text-white/80 mt-2 max-w-2xl">{event.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
              <Calendar className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{event.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
              <Clock className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">{event.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
              <MapPin className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
              <Users className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="font-medium">{event.registered}/{event.capacity}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Status */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Registration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-accent">{event.registered}</p>
              <p className="text-muted-foreground">of {event.capacity} spots filled</p>
            </div>
            <Progress value={capacityPercentage} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {event.capacity - event.registered} spots remaining
              </span>
              <StatusBadge status={event.status} />
            </div>
            
            {event.status === 'Upcoming' && (
              <Button className="w-full bg-accent hover:bg-accent/90">
                <UserPlus className="w-4 h-4 mr-2" />
                Register Member
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Registered Participants */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Registered Participants ({event.registered})</CardTitle>
            <Button variant="outline" size="sm">Export List</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {registeredMembers.map((member) => (
                <Link
                  key={member.id}
                  to={`/members/${member.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.firstName[0]}{member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{member.firstName} {member.lastName}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <StatusBadge status={member.status} />
                </Link>
              ))}
            </div>
            {event.registered > members.length && (
              <p className="text-center text-muted-foreground mt-4">
                +{event.registered - members.length} more participants
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
