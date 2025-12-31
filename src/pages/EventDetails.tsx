import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Edit, Share2, UserPlus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEvent, useDeleteEvent, useRegisterForEvent, useUnregisterFromEvent } from '@/hooks/useEvents';
import { useMembers } from '@/hooks/useMembers';
import { toast } from 'sonner';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: event, isLoading, error } = useEvent(id!);
  const deleteEvent = useDeleteEvent();
  const registerForEvent = useRegisterForEvent();
  const unregisterFromEvent = useUnregisterFromEvent();
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

  const getMemberInitials = (member: { firstName?: string; lastName?: string; user?: { firstName?: string; lastName?: string } }) => {
    const { firstName, lastName } = getMemberName(member);
    return `${firstName[0] || '?'}${lastName[0] || '?'}`;
  };

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync(id!);
      toast.success('Event deleted successfully!');
      navigate('/events');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleRegister = async (userId: string) => {
    try {
      await registerForEvent.mutateAsync({ eventId: id!, userId });
      toast.success('Participant registered successfully!');
      setSearchTerm('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to register participant');
    }
  };

  const handleUnregister = async (userId: string) => {
    try {
      await unregisterFromEvent.mutateAsync({ eventId: id!, userId });
      toast.success('Participant unregistered successfully!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to unregister participant');
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
        <Button asChild variant="link" className="mt-2">
          <Link to="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  const capacityPercentage = (event.registered / event.capacity) * 100;
  const participantUserIds = event.participants?.map((p) => p.userId) || [];
  
  // Get available members (not registered) - check both user.id and member.id
  const availableMembers = (membersData || []).filter((member) => {
    const memberId = member.user?.id || member.id;
    return !participantUserIds.includes(memberId);
  });

  // Filter by search - search in both direct props and user object
  const filteredMembers = availableMembers.filter((member) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const { firstName, lastName } = getMemberName(member);
    const email = getMemberEmail(member);
    return (
      firstName.toLowerCase().includes(term) ||
      lastName.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
        <div className="bg-sidebar p-8 text-sidebar-foreground">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-sidebar-accent text-sidebar-accent-foreground">
                {event.type}
              </span>
              <h1 className="text-3xl font-bold mt-3">{event.title}</h1>
              <p className="text-sidebar-foreground/80 mt-2 max-w-2xl">{event.description}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                className="bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 border-0 font-medium"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/80 border-0 font-medium"
                onClick={() => navigate(`/events/${id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/80 border-0 font-medium"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-sidebar-accent/10 border border-sidebar-accent/20">
              <Calendar className="w-5 h-5 text-sidebar-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium text-foreground">{formatDate(event.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-sidebar-accent/10 border border-sidebar-accent/20">
              <Clock className="w-5 h-5 text-sidebar-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium text-foreground">{event.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-sidebar-accent/10 border border-sidebar-accent/20">
              <MapPin className="w-5 h-5 text-sidebar-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-sidebar-accent/10 border border-sidebar-accent/20">
              <Users className="w-5 h-5 text-sidebar-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="font-medium text-foreground">{event.registered}/{event.capacity}</p>
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
              <p className="text-4xl font-bold text-sidebar-primary">{event.registered}</p>
              <p className="text-muted-foreground">of {event.capacity} spots filled</p>
            </div>
            <Progress value={capacityPercentage} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {event.capacity - event.registered} spots remaining
              </span>
              <StatusBadge status={event.status} />
            </div>
            
            {event.status === 'Upcoming' && event.registered < event.capacity && (
              <Button 
                className="w-full bg-sidebar-primary hover:bg-sidebar-primary/80 text-sidebar-primary-foreground font-medium"
                onClick={() => setRegisterDialogOpen(true)}
              >
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
          </CardHeader>
          <CardContent>
            {event.participants && event.participants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {event.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border"
                  >
                    <Avatar>
                      <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                        {participant.user?.firstName?.[0] || '?'}{participant.user?.lastName?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {participant.user?.firstName || 'Unknown'} {participant.user?.lastName || ''}
                      </p>
                      <p className="text-sm text-gray-500">{participant.user?.email || ''}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleUnregister(participant.userId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No participants registered yet</p>
                {event.status === 'Upcoming' && (
                  <Button 
                    variant="outline" 
                    className="mt-4 border-sidebar-primary/30 text-sidebar-primary hover:bg-sidebar-primary/10"
                    onClick={() => setRegisterDialogOpen(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add First Participant
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
              {event.registered > 0 && (
                <span className="block mt-2 text-red-500 font-medium">
                  Warning: This event has {event.registered} registered participant(s).
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
            >
              {deleteEvent.isPending ? 'Deleting...' : 'Delete Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register Participant Dialog */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Register Participant</DialogTitle>
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
                  const initials = getMemberInitials(member);
                  
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-sidebar-accent/10 hover:border-sidebar-primary/30 cursor-pointer transition-colors"
                      onClick={() => handleRegister(member.user?.id || member.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-sidebar-primary text-sidebar-primary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {firstName} {lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-sidebar-primary hover:text-sidebar-primary hover:bg-sidebar-accent/20">
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
