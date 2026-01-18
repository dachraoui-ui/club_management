import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useEvent, useUpdateEvent, useRegisterForEvent, useUnregisterFromEvent } from '@/hooks/useEvents';
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
  status: Event['status'];
}

const EVENT_TYPES = ['Tournament', 'Competition', 'Workshop', 'Social'];
const EVENT_STATUSES = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: event, isLoading, error } = useEvent(id!);
  const updateEvent = useUpdateEvent();
  const registerForEvent = useRegisterForEvent();
  const unregisterFromEvent = useUnregisterFromEvent();
  const { data: membersData } = useMembers({ limit: 1000 });

  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<EventFormData>({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      type: 'Tournament',
      capacity: 50,
      status: 'Upcoming',
    },
  });

  const capacity = watch('capacity');

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

  // Load event data into form
  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date);
      const dateStr = eventDate.toISOString().split('T')[0];
      
      reset({
        title: event.title,
        description: event.description,
        date: dateStr,
        time: event.time,
        location: event.location,
        type: event.type,
        capacity: event.capacity,
        status: event.status,
      });
    }
  }, [event, reset]);

  // Current participants
  const currentParticipantIds = useMemo(() => {
    return event?.participants?.map((p) => p.userId) || [];
  }, [event]);

  // Available members (not currently registered)
  const members = useMemo(() => membersData?.members || [], [membersData?.members]);
  const availableMembers = useMemo(() => {
    return members.filter((member) => {
      const memberId = getMemberId(member);
      return !currentParticipantIds.includes(memberId);
    });
  }, [members, currentParticipantIds]);

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

  const handleAddParticipant = async (userId: string) => {
    if (currentParticipantIds.length >= capacity) {
      toast.error('Event capacity reached');
      return;
    }
    try {
      await registerForEvent.mutateAsync({ eventId: id!, userId });
      toast.success('Participant added successfully!');
      setSearchTerm('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to add participant');
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    try {
      await unregisterFromEvent.mutateAsync({ eventId: id!, userId });
      toast.success('Participant removed successfully!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove participant');
    }
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      await updateEvent.mutateAsync({
        id: id!,
        data: {
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          location: data.location,
          type: data.type,
          capacity: Number(data.capacity),
          status: data.status,
        },
      });
      toast.success('Event updated successfully!');
      navigate(`/events/${id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update event');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Event not found</p>
        <Button variant="link" onClick={() => navigate('/events')} className="mt-2">
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/events/${id}`)}
          className="hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit Event</h2>
          <p className="text-muted-foreground">Update event details</p>
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
                <Label htmlFor="status">Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: 'Status is required' }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={currentParticipantIds.length || 1}
                  {...register('capacity', {
                    required: 'Capacity is required',
                    min: { 
                      value: currentParticipantIds.length || 1, 
                      message: `Minimum capacity is ${currentParticipantIds.length || 1} (current participants)` 
                    },
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

        {/* Participants */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              Participants ({event.registered}/{capacity})
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setParticipantDialogOpen(true)}
              disabled={currentParticipantIds.length >= capacity}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            {event.participants && event.participants.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {event.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-blue-600 text-white">
                        {participant.user?.firstName?.[0] || '?'}{participant.user?.lastName?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{participant.user?.firstName || 'Unknown'} {participant.user?.lastName || ''}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(participant.userId)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No participants registered yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/events/${id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateEvent.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {updateEvent.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Add Participant Dialog */}
      <Dialog open={participantDialogOpen} onOpenChange={setParticipantDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
            <DialogDescription>
              Select a member to register for this event.
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
                      onClick={() => handleAddParticipant(memberId)}
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
