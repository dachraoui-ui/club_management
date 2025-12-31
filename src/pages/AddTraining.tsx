import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateTraining } from '@/hooks/useTrainings';
import { useMembers } from '@/hooks/useMembers';
import { useTeams } from '@/hooks/useTeams';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';

interface TrainingFormData {
  title: string;
  date: string;
  time: string;
  duration: string;
  discipline: string;
  coachId: string;
  location: string;
  maxCapacity: number;
  notes?: string;
}

// Duration options
const DURATION_OPTIONS = [
  '30 min',
  '45 min',
  '1 hour',
  '1.5 hours',
  '2 hours',
  '2.5 hours',
  '3 hours',
];

export default function AddTraining() {
  const navigate = useNavigate();
  
  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<TrainingFormData>({
    defaultValues: {
      title: '',
      date: '',
      time: '',
      duration: '',
      discipline: '',
      coachId: '',
      location: '',
      maxCapacity: 20,
      notes: '',
    },
  });

  const selectedDiscipline = watch('discipline');

  const createTraining = useCreateTraining();
  const { data: membersData } = useMembers({ limit: 1000 });
  const { data: teamsData } = useTeams();

  // Get all coaches with their sports/disciplines
  const allCoaches = useMemo(() => {
    return (membersData || [])
      .filter((member) => member.user?.role === 'Coach')
      .map((member) => ({
        id: member.user?.id || member.id,
        name: `${member.user?.firstName || member.firstName} ${member.user?.lastName || member.lastName}`,
        email: member.user?.email || member.email,
        sports: member.sports || [],
        teamDiscipline: member.team?.discipline,
      }));
  }, [membersData]);

  // Get unique disciplines that have coaches (from teams)
  const availableDisciplines = useMemo(() => {
    const disciplinesWithCoaches = new Set<string>();
    
    // Get disciplines from teams that have coaches
    (teamsData || []).forEach((team) => {
      if (team.coach && team.discipline) {
        disciplinesWithCoaches.add(team.discipline);
      }
    });

    // Also check coaches' sports array
    allCoaches.forEach((coach) => {
      coach.sports.forEach((sport) => {
        disciplinesWithCoaches.add(sport);
      });
      if (coach.teamDiscipline) {
        disciplinesWithCoaches.add(coach.teamDiscipline);
      }
    });

    return Array.from(disciplinesWithCoaches).sort();
  }, [teamsData, allCoaches]);

  // Filter coaches by selected discipline
  const filteredCoaches = useMemo(() => {
    if (!selectedDiscipline) return [];
    
    // First, get coaches from teams with this discipline
    const coachesFromTeams = (teamsData || [])
      .filter((team) => team.discipline?.toLowerCase() === selectedDiscipline.toLowerCase() && team.coach)
      .map((team) => ({
        id: team.coach.id,
        name: `${team.coach.firstName} ${team.coach.lastName}`,
        email: team.coach.email,
      }));

    // Also get coaches whose sports include this discipline
    const coachesFromSports = allCoaches.filter((coach) => {
      const matchesSports = coach.sports.some(
        (sport) => sport.toLowerCase() === selectedDiscipline.toLowerCase()
      );
      const matchesTeam = coach.teamDiscipline?.toLowerCase() === selectedDiscipline.toLowerCase();
      return matchesSports || matchesTeam;
    });

    // Combine and deduplicate
    const allFilteredCoaches = [...coachesFromTeams];
    coachesFromSports.forEach((coach) => {
      if (!allFilteredCoaches.some((c) => c.id === coach.id)) {
        allFilteredCoaches.push({
          id: coach.id,
          name: coach.name,
          email: coach.email,
        });
      }
    });

    return allFilteredCoaches;
  }, [allCoaches, teamsData, selectedDiscipline]);

  // Get members for the selected discipline
  const membersInDiscipline = useMemo(() => {
    if (!selectedDiscipline) return [];
    
    return (membersData || []).filter((member) => {
      // Exclude coaches
      if (member.user?.role === 'Coach') return false;
      
      const matchesSports = member.sports?.some(
        (sport) => sport.toLowerCase() === selectedDiscipline.toLowerCase()
      );
      const matchesTeam = member.team?.discipline?.toLowerCase() === selectedDiscipline.toLowerCase();
      return matchesSports || matchesTeam;
    });
  }, [membersData, selectedDiscipline]);

  const canCreateTraining = selectedDiscipline && filteredCoaches.length > 0;

  const onSubmit = async (data: TrainingFormData) => {
    if (!canCreateTraining) {
      toast.error('Cannot create training: No coaches available for this discipline');
      return;
    }

    try {
      await createTraining.mutateAsync({
        title: data.title,
        date: data.date,
        time: data.time,
        duration: data.duration,
        discipline: data.discipline,
        coachId: data.coachId,
        location: data.location,
        maxCapacity: Number(data.maxCapacity),
        notes: data.notes || undefined,
      });
      toast.success('Training session scheduled successfully!');
      reset();
      navigate('/trainings');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create training session');
    }
  };

  const formatDisciplineName = (discipline: string) => {
    if (discipline === 'MartialArts') return 'Martial Arts';
    if (discipline === 'TableTennis') return 'Table Tennis';
    return discipline;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/trainings')}
          className="hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Schedule Training</h2>
          <p className="text-muted-foreground">Create a new training session</p>
        </div>
      </div>

      {/* No disciplines available warning */}
      {availableDisciplines.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No disciplines with coaches available. Please assign coaches to teams first before creating training sessions.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Training Details</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Training Title *</Label>
                <Input
                  id="title"
                  placeholder="Morning Practice Session"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discipline">Sport Discipline *</Label>
                  <Controller
                    name="discipline"
                    control={control}
                    rules={{ required: 'Discipline is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(value) => {
                        field.onChange(value);
                        // Reset coach when discipline changes
                        setValue('coachId', '');
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDisciplines.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No disciplines with coaches available
                            </div>
                          ) : (
                            availableDisciplines.map((discipline) => (
                              <SelectItem key={discipline} value={discipline}>
                                {formatDisciplineName(discipline)}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.discipline && <p className="text-sm text-destructive">{errors.discipline.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coachId">Coach *</Label>
                  <Controller
                    name="coachId"
                    control={control}
                    rules={{ required: 'Coach is required' }}
                    render={({ field }) => (
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={!selectedDiscipline}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !selectedDiscipline 
                              ? "Select discipline first" 
                              : filteredCoaches.length === 0 
                                ? "No coaches available" 
                                : "Select a coach"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCoaches.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No coaches available for this discipline
                            </div>
                          ) : (
                            filteredCoaches.map((coach) => (
                              <SelectItem key={coach.id} value={coach.id}>
                                {coach.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.coachId && <p className="text-sm text-destructive">{errors.coachId.message}</p>}
                </div>
              </div>

              {/* Info about available members */}
              {selectedDiscipline && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  <strong>{formatDisciplineName(selectedDiscipline)}:</strong>{' '}
                  {filteredCoaches.length} coach{filteredCoaches.length !== 1 ? 'es' : ''} and{' '}
                  {membersInDiscipline.length} member{membersInDiscipline.length !== 1 ? 's' : ''} available
                </div>
              )}

              {/* Warning if no coaches */}
              {selectedDiscipline && filteredCoaches.length === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No coaches available for {formatDisciplineName(selectedDiscipline)}. 
                    Please assign a coach to this discipline first.
                  </AlertDescription>
                </Alert>
              )}
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
                  <Label htmlFor="duration">Duration *</Label>
                  <Controller
                    name="duration"
                    control={control}
                    rules={{ required: 'Duration is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((duration) => (
                            <SelectItem key={duration} value={duration}>
                              {duration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
                </div>
              </div>
            </div>

            {/* Location & Capacity */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Location & Capacity</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Main Training Field"
                    {...register('location', { required: 'Location is required' })}
                  />
                  {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">Max Capacity *</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    min="1"
                    placeholder="20"
                    {...register('maxCapacity', { 
                      required: 'Max capacity is required',
                      min: { value: 1, message: 'Capacity must be at least 1' }
                    })}
                  />
                  {errors.maxCapacity && <p className="text-sm text-destructive">{errors.maxCapacity.message}</p>}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Additional Notes</h3>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Training focus, equipment needed, special instructions..."
                  className="min-h-[100px]"
                  {...register('notes')}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/trainings')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90"
                disabled={createTraining.isPending || !canCreateTraining}
              >
                {createTraining.isPending ? 'Scheduling...' : 'Schedule Training'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
