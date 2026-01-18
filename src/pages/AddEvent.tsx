import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCreateEvent, useRegisterForEvent } from '@/hooks/useEvents';
import { useMembers } from '@/hooks/useMembers';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';

import { Event } from '@/types/api';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: Event['type'];
  capacity: number;
}

const EVENT_TYPES = ['Tournament', 'Competition', 'Workshop', 'Social'];

export default function AddEvent() {
  const navigate = useNavigate();
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, control, formState: { errors }, reset, watch } = useForm<EventFormData>({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      type: 'Tournament',
      capacity: 50,
    },
  });

  const capacity = watch('capacity');

  const createEvent = useCreateEvent();
  const registerForEvent = useRegisterForEvent();
  const { data: membersData } = useMembers({ limit: 1000 });

  // Helper to get member name - check both direct props and nested user object
  const getMemberName = (member: { firstName?: string; lastName?: string; user?: { firstName?: string; lastName?: string } }) => {
    const firstName = member.user?.firstName || member.firstName || 'Unknown';
    const lastName = member.user?.lastName || member.lastName || '';
    return { firstName, lastName };
  };

  const getMemberEmail = (member: { email?: string; user?: { email?: string } }) => {
    return member.user?.email || member.email || '';
  };

  const getMemberId = (member: { id: string; user?: { id?: string } }) => {
    return member.user?.id || member.id;
  };

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split('T')[0];

  // Available members (not selected)
  const members = useMemo(() => membersData?.members || [], [membersData?.members]);
  const availableMembers = useMemo(() => {
    return members.filter((member) => {
      const memberId = getMemberId(member);
      return !selectedParticipants.includes(memberId);
    });
  }, [members, selectedParticipants]);

  // Filter by search
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return availableMembers;
    const term = searchTerm.toLowerCase();
    return availableMembers.filter((member) => {
      const { firstName, lastName } = getMemberName(member);
      const email = getMemberEmail(member);
      return (
        firstName.toLowerCase().includes(term) ||
        lastName.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term)
      );
    });
  }, [availableMembers, searchTerm]);

  // Selected member details
  const selectedMemberDetails = useMemo(() => {
    return members.filter((member) => {
      const memberId = getMemberId(member);
      return selectedParticipants.includes(memberId);
    });
  }, [members, selectedParticipants]);

  const addParticipant = (memberId: string) => {
    if (selectedParticipants.length >= capacity) {
      toast.error('Event capacity reached');
      return;
    }
    setSelectedParticipants((prev) => [...prev, memberId]);
  };

  const removeParticipant = (memberId: string) => {
    setSelectedParticipants((prev) => prev.filter((id) => id !== memberId));
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      const createdEvent = await createEvent.mutateAsync({
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        type: data.type,
        capacity: Number(data.capacity),
      });

      // Register selected participants
      for (const userId of selectedParticipants) {
        try {
          await registerForEvent.mutateAsync({ eventId: createdEvent.id, userId });
        } catch (err) {
          console.error('Failed to register participant:', err);
        }
      }

      toast.success('Event created successfully!');
      reset();
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
          <p className="text-muted-foreground">Add a new club event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  placeholder="Enter event title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Enter event description"
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Event Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Event type is required' }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  {...register('capacity', {
                    required: 'Capacity is required',
                    min: { value: 1, message: 'Minimum capacity is 1' },
                  })}
                  className={errors.capacity ? 'border-red-500' : ''}
                />
                {errors.capacity && (
                  <p className="text-sm text-red-500">{errors.capacity.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date & Location */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Date & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  {...register('date', { required: 'Date is required' })}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  {...register('time', { required: 'Time is required' })}
                  className={errors.time ? 'border-red-500' : ''}
                />
                {errors.time && (
                  <p className="text-sm text-red-500">{errors.time.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  {...register('location', { required: 'Location is required' })}
                  placeholder="Enter location"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pre-register Participants */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              Pre-register Participants ({selectedParticipants.length}/{capacity})
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setParticipantDialogOpen(true)}
              disabled={selectedParticipants.length >= capacity}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            {selectedMemberDetails.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No participants pre-registered. You can add them now or after creating the event.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedMemberDetails.map((member) => {
                  const { firstName, lastName } = getMemberName(member);
                  const memberId = getMemberId(member);
                  
                  return (
                    <div
                      key={memberId}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-blue-600 text-white">
                          {firstName[0] || '?'}{lastName[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{firstName} {lastName}</span>
                      <button
                        type="button"
                        onClick={() => removeParticipant(memberId)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/events')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createEvent.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {createEvent.isPending ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>

      {/* Add Participant Dialog */}
      <Dialog open={participantDialogOpen} onOpenChange={setParticipantDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
            <DialogDescription>
              Select members to pre-register for this event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredMembers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No available members found
                </p>
              ) : (
                filteredMembers.map((member) => {
                  const { firstName, lastName } = getMemberName(member);
                  const email = getMemberEmail(member);
                  const memberId = getMemberId(member);
                  
                  return (
                    <div
                      key={memberId}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors"
                      onClick={() => {
                        addParticipant(memberId);
                        setSearchTerm('');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-blue-600 text-white">
                            {firstName[0] || '?'}{lastName[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {firstName} {lastName}
                          </p>
                          <p className="text-xs text-gray-500">{email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100">
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
