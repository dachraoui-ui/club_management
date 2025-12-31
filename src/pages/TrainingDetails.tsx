import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, User, Edit, CheckCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { useTraining, useDeleteTraining, useMarkAttendance } from '@/hooks/useTrainings';
import { useMembers } from '@/hooks/useMembers';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TrainingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<string>('Present');

  const { data: training, isLoading, error } = useTraining(id!);
  const deleteTraining = useDeleteTraining();
  const markAttendance = useMarkAttendance();
  const { data: membersData } = useMembers({ limit: 1000 });

  // Get athletes for attendance marking
  const athletes = (membersData || [])
    .filter((member) => member.user?.role === 'Athlete')
    .map((member) => ({
      id: member.user?.id || member.id,
      name: `${member.user?.firstName || member.firstName} ${member.user?.lastName || member.lastName}`,
      email: member.user?.email || member.email,
    }));

  // Filter out athletes already in attendance
  const attendedAthleteIds = (training?.attendance || []).map((a) => a.athleteId);
  const availableAthletes = athletes.filter((a) => !attendedAthleteIds.includes(a.id));

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteTraining.mutateAsync(id);
      toast.success('Training deleted successfully!');
      navigate('/trainings');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete training');
    }
  };

  const handleMarkAttendance = async () => {
    if (!id || !selectedAthlete) return;
    try {
      await markAttendance.mutateAsync({
        trainingId: id,
        athleteId: selectedAthlete,
        status: attendanceStatus,
      });
      toast.success('Attendance marked successfully!');
      setAttendanceDialogOpen(false);
      setSelectedAthlete('');
      setAttendanceStatus('Present');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading training details...</p>
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Training not found</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/trainings">Back to Trainings</Link>
        </Button>
      </div>
    );
  }

  const attendancePercentage = training.maxCapacity > 0 
    ? (training.attendees / training.maxCapacity) * 100 
    : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
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
        <Link to="/trainings">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trainings
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{training.title}</CardTitle>
              <p className="text-muted-foreground mt-1">{training.discipline}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={training.status} />
              <Button variant="outline" size="sm" onClick={() => navigate(`/trainings/${id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                <Calendar className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(training.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                <Clock className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{training.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                <MapPin className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{training.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                <User className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Coach</p>
                  <p className="font-medium">
                    {training.coach ? `${training.coach.firstName} ${training.coach.lastName}` : 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="p-4 rounded-lg bg-accent/10">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <span className="font-medium">Duration: {training.duration}</span>
              </div>
            </div>

            {/* Notes */}
            {training.notes && (
              <div>
                <h3 className="font-semibold mb-2">Training Notes</h3>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground">{training.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold">{training.attendees}</p>
              <p className="text-muted-foreground">of {training.maxCapacity} spots filled</p>
            </div>
            <Progress value={attendancePercentage} className="h-3" />
            <p className="text-sm text-center text-muted-foreground">
              {training.maxCapacity - training.attendees} spots remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Participants List */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Participants ({training.attendees})</CardTitle>
          {training.status === 'Scheduled' && availableAthletes.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setAttendanceDialogOpen(true)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {training.attendance && training.attendance.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {training.attendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {record.athlete.firstName[0]}{record.athlete.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{record.athlete.firstName} {record.athlete.lastName}</p>
                    <p className="text-sm text-muted-foreground">{record.athlete.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.status === 'Present' ? 'bg-green-500/10 text-green-600' :
                    record.status === 'Late' ? 'bg-yellow-500/10 text-yellow-600' :
                    record.status === 'Excused' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No participants yet</p>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Training</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{training.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTraining.isPending}>
              {deleteTraining.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Attendance Dialog */}
      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>
              Select an athlete and their attendance status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Athlete</label>
              <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an athlete" />
                </SelectTrigger>
                <SelectContent>
                  {availableAthletes.map((athlete) => (
                    <SelectItem key={athlete.id} value={athlete.id}>
                      {athlete.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={attendanceStatus} onValueChange={setAttendanceStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Excused">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMarkAttendance} 
              disabled={!selectedAthlete || markAttendance.isPending}
            >
              {markAttendance.isPending ? 'Saving...' : 'Mark Attendance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
