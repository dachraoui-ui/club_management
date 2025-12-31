import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchInput } from '@/components/SearchInput';
import { StatusBadge } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { useEvents, useCreateEvent } from '@/hooks/useEvents';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';

const eventTypeColors: Record<string, string> = {
  Tournament: 'bg-accent/10 text-accent',
  Competition: 'bg-primary/10 text-primary',
  Workshop: 'bg-warning/10 text-warning',
  Social: 'bg-chart-4/10 text-chart-4',
};

interface EventFormData {
  title: string;
  description: string;
  type: 'Tournament' | 'Workshop' | 'Social' | 'Competition';
  date: string;
  time: string;
  location: string;
  capacity: number;
}

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      type: 'Tournament',
    },
  });

  const filters = {
    type: typeFilter !== 'all' ? typeFilter : undefined,
  };

  const { data: eventsData, isLoading } = useEvents(filters);
  const createEvent = useCreateEvent();

  const events = eventsData || [];
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const upcomingEvents = filteredEvents.filter((e) => e.status === 'Upcoming' || e.status === 'Ongoing');
  const completedEvents = filteredEvents.filter((e) => e.status === 'Completed');

  const onSubmit = async (data: EventFormData) => {
    try {
      // Format date properly for backend
      const eventDate = new Date(data.date);
      eventDate.setHours(parseInt(data.time.split(':')[0]), parseInt(data.time.split(':')[1]));
      
      await createEvent.mutateAsync({
        title: data.title,
        description: data.description,
        type: data.type,
        date: eventDate.toISOString(),
        time: data.time,
        location: data.location,
        capacity: Number(data.capacity),
        status: 'Upcoming',
      });
      toast.success('Event created successfully!');
      reset();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Events</h2>
          <p className="text-muted-foreground">Organize and manage club events</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input 
                  id="title" 
                  placeholder="Annual Sports Day" 
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the event..." 
                  rows={3}
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Event Type *</Label>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: 'Event type is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tournament">Tournament</SelectItem>
                          <SelectItem value="Competition">Competition</SelectItem>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                          <SelectItem value="Social">Social</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input 
                    id="capacity" 
                    type="number" 
                    placeholder="100" 
                    {...register('capacity', { 
                      required: 'Capacity is required',
                      min: { value: 1, message: 'Capacity must be at least 1' }
                    })}
                  />
                  {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    {...register('date', { required: 'Date is required' })}
                  />
                  {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input 
                    id="time" 
                    type="time" 
                    {...register('time', { required: 'Time is required' })}
                  />
                  {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input 
                  id="location" 
                  placeholder="Main Sports Complex" 
                  {...register('location', { required: 'Location is required' })}
                />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    reset();
                    setIsCreateDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-accent hover:bg-accent/90"
                  disabled={createEvent.isPending}
                >
                  {createEvent.isPending ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search events..."
          className="flex-1 max-w-md"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Tournament">Tournament</SelectItem>
            <SelectItem value="Competition">Competition</SelectItem>
            <SelectItem value="Workshop">Workshop</SelectItem>
            <SelectItem value="Social">Social</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Upcoming Events */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Upcoming Events ({upcomingEvents.length})</h3>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming events
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="border-0 shadow-md card-hover h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${eventTypeColors[event.type] || 'bg-muted'}`}>
                        {event.type}
                      </span>
                      <StatusBadge status={event.status} />
                    </div>
                    <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{event.registered || 0}/{event.capacity}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {Math.round(((event.registered || 0) / event.capacity) * 100)}% full
                        </span>
                      </div>
                      <Progress value={((event.registered || 0) / event.capacity) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Completed Events */}
      {completedEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Past Events ({completedEvents.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedEvents.map((event) => (
              <Card key={event.id} className="border-0 shadow-md opacity-75">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${eventTypeColors[event.type] || 'bg-muted'}`}>
                      {event.type}
                    </span>
                    <StatusBadge status={event.status} />
                  </div>
                  <CardTitle className="text-lg mt-2">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm mt-2">{event.registered || 0} participants</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
