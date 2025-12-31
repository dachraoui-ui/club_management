import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCreateEvent, useRegisterForEvent } from '@/hooks/useEvents';
import { useMembers } from '@/hooks/useMembers';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { Member } from '@/types/api';

interface EventFormData {
  title: string;
  description: string;
  type: 'Tournament' | 'Workshop' | 'Social' | 'Competition';
  date: string;
  time: string;
  location: string;
  capacity: number;
}

// Event type options
const EVENT_TYPE_OPTIONS = [
  { value: 'Tournament', label: 'Tournament' },
  { value: 'Competition', label: 'Competition' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Social', label: 'Social' },
];

export default function AddEvent() {
  const navigate = useNavigate();
  const [selectedParticipants, setSelectedParticipants] = useState<Member[]>([]);
  const [isParticipantDialogOpen, setIsParticipantDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<EventFormData>({
    defaultValues: {
      title: '',
      description: '',
      type: 'Tournament',
      date: '',
      time: '',
      location: '',
      capacity: 50,
    },
  });

  const createEvent = useCreateEvent();
  const registerForEvent = useRegisterForEvent();
  const { data: membersData } = useMembers({ limit: 1000 });

  // Filter members for selection (exclude already selected)
  const availableMembers = useMemo(() => {
    const members = membersData || [];
    return members.filter(
      (member) => !selectedParticipants.some((p) => p.id === member.id)
    );
  }, [membersData, selectedParticipants]);

  // Filter by search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return availableMembers;
    const term = searchTerm.toLowerCase();
    return availableMembers.filter(
      (member) =>
        member.firstName.toLowerCase().includes(term) ||
        member.lastName.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term)
    );
  }, [availableMembers, searchTerm]);

  const addParticipant = (member: Member) => {
    setSelectedParticipants((prev) => [...prev, member]);
  };

  const removeParticipant = (memberId: string) => {
    setSelectedParticipants((prev) => prev.filter((p) => p.id !== memberId));
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      // Format date properly for backend
      const eventDate = new Date(data.date);
      eventDate.setHours(parseInt(data.time.split(':')[0]), parseInt(data.time.split(':')[1]));
      
      const result = await createEvent.mutateAsync({
        title: data.title,
        description: data.description,
        type: data.type,
        date: eventDate.toISOString(),
        time: data.time,
        location: data.location,
        capacity: Number(data.capacity),
        status: 'Upcoming',
      });

      // Register selected participants
      const eventId = result.data?.data?.id || result.data?.id;
      if (eventId && selectedParticipants.length > 0) {
        for (const participant of selectedParticipants) {
          try {
            await registerForEvent.mutateAsync({
              eventId,
              userId: participant.user?.id || participant.id,
            });
          } catch (err) {
            console.error(`Failed to register participant ${participant.id}:`, err);
          }
        }
      }

      toast.success('Event created successfully!');
      reset();
      setSelectedParticipants([]);
      navigate('/events');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/events')}
          className="hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Create Event</h2>
          <p className="text-muted-foreground">Schedule a new event for your club</p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Event Details</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="Annual Championship Tournament"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event, what participants can expect..."
                  className="min-h-[100px]"
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
                    rules={{ required: 'Type is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPE_OPTIONS.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Main Stadium"
                    {...register('location', { required: 'Location is required' })}
                  />
                  {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Schedule</h3>

              <div className="grid grid-cols-3 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    placeholder="50"
                    {...register('capacity', { 
                      required: 'Capacity is required',
                      min: { value: 1, message: 'Capacity must be at least 1' }
                    })}
                  />
                  {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Participants</h3>
                <Dialog open={isParticipantDialogOpen} onOpenChange={setIsParticipantDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Participants
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Add Participants</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="max-h-[400px] overflow-y-auto space-y-2">
                        {filteredMembers.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">
                            No members found
                          </p>
                        ) : (
                          filteredMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-3 rounded-lg border hover:bg-secondary/50 cursor-pointer"
                              onClick={() => {
                                addParticipant(member);
                                setSearchTerm('');
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {member.firstName[0]}{member.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">
                                    {member.firstName} {member.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                              </div>
                              <Button type="button" variant="ghost" size="sm">
                                <UserPlus className="w-4 h-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {selectedParticipants.length === 0 ? (
                <div className="text-center py-8 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">No participants added yet</p>
                  <p className="text-sm text-muted-foreground">Click "Add Participants" to select members</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedParticipants.length} participant{selectedParticipants.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedParticipants.map((participant) => (
                      <Badge
                        key={participant.id}
                        variant="secondary"
                        className="flex items-center gap-2 py-1 px-3"
                      >
                        <span>{participant.firstName} {participant.lastName}</span>
                        <button
                          type="button"
                          onClick={() => removeParticipant(participant.id)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/events')}
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
        </CardContent>
      </Card>
    </div>
  );
}
