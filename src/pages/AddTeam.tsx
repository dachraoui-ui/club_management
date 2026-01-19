import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateTeam, useTeams } from '@/hooks/useTeams';
import { useMembers } from '@/hooks/useMembers';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';

interface TeamFormData {
  name: string;
  discipline: string;
  coachId: string;
  photo?: string;
  memberIds: string[];
  staffIds: string[];
}

// Sports discipline options (same as member speciality)
const SPORT_OPTIONS = [
  'Football',
  'Basketball',
  'Tennis',
  'Swimming',
  'Volleyball',
  'Baseball',
  'Golf',
  'Boxing',
  'MartialArts',
  'Athletics',
  'Gymnastics',
  'Cycling',
  'Hockey',
  'Rugby',
  'Cricket',
  'TableTennis',
  'Badminton',
  'Handball',
  'Wrestling',
  'Judo',
];

export default function AddTeam() {
  const navigate = useNavigate();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, reset, control, formState: { errors }, setValue } = useForm<TeamFormData>({
    defaultValues: {
      name: '',
      discipline: '',
      coachId: '',
      memberIds: [],
      staffIds: [],
    },
  });

  const createTeam = useCreateTeam();
  const { data: membersData } = useMembers({ limit: 1000 });
  const { data: teamsData } = useTeams();

  // Extract members array from the response
  const members = membersData?.members || [];

  // Get IDs of coaches already assigned to teams
  const assignedCoachIds = (teamsData || []).map((team) => team.coach?.id).filter(Boolean);

  // Get coaches (users with Coach role) - exclude those already assigned to another team
  const coaches = members
    .filter((member) => member.user?.role === 'Coach')
    .filter((member) => !assignedCoachIds.includes(member.user?.id || member.id))
    .map((member) => ({
      id: member.user?.id || member.id,
      name: `${member.user?.firstName || member.firstName} ${member.user?.lastName || member.lastName}`,
      email: member.user?.email || member.email,
    }));

  // Get athletes (users with Athlete role)
  const athletes = members
    .filter((member) => member.user?.role === 'Athlete')
    .map((member) => ({
      id: member.user?.id || member.id,
      name: `${member.user?.firstName || member.firstName} ${member.user?.lastName || member.lastName}`,
      email: member.user?.email || member.email,
      speciality: member.speciality,
    }));

  // Get staff (users with Staff role)
  const staff = members
    .filter((member) => member.user?.role === 'Staff')
    .map((member) => ({
      id: member.user?.id || member.id,
      name: `${member.user?.firstName || member.firstName} ${member.user?.lastName || member.lastName}`,
      email: member.user?.email || member.email,
      speciality: member.speciality,
    }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoPreview(base64String);
        setValue('photo', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setValue('photo', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) => {
      const newSelection = prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId];
      setValue('memberIds', newSelection);
      return newSelection;
    });
  };

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaff((prev) => {
      const newSelection = prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId];
      setValue('staffIds', newSelection);
      return newSelection;
    });
  };

  const onSubmit = async (data: TeamFormData) => {
    try {
      await createTeam.mutateAsync({
        name: data.name,
        discipline: data.discipline,
        coachId: data.coachId || undefined,
        photo: data.photo || undefined,
        memberIds: selectedMembers,
        staffIds: selectedStaff,
      });
      toast.success('Team created successfully!');
      reset();
      setPhotoPreview(null);
      setSelectedMembers([]);
      setSelectedStaff([]);
      navigate('/teams');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/teams')}
          className="hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Create New Team</h2>
          <p className="text-muted-foreground">Add a new team to your club</p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    placeholder="Thunder FC"
                    {...register('name', { required: 'Team name is required' })}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discipline">Sport Discipline *</Label>
                  <Controller
                    name="discipline"
                    control={control}
                    rules={{ required: 'Discipline is required' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPORT_OPTIONS.map((sport) => (
                            <SelectItem key={sport} value={sport}>
                              {sport === 'MartialArts' ? 'Martial Arts' : 
                               sport === 'TableTennis' ? 'Table Tennis' : 
                               sport}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.discipline && <p className="text-sm text-destructive">{errors.discipline.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coachId">Team Coach (Optional)</Label>
                <Controller
                  name="coachId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a coach (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No coach assigned</SelectItem>
                        {coaches.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No available coaches (all assigned to other teams)
                          </div>
                        ) : (
                          coaches.map((coach) => (
                            <SelectItem key={coach.id} value={coach.id}>
                              {coach.name} ({coach.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {coaches.length === 0 && (
                  <p className="text-xs text-muted-foreground">All coaches are assigned to other teams</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Team Photo</Label>
                <div className="space-y-3">
                  {photoPreview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-dashed border-input">
                      <img
                        src={photoPreview}
                        alt="Team preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removePhoto}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-lg border-2 border-dashed border-input flex items-center justify-center bg-muted/50">
                      <div className="text-center space-y-2">
                        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No photo selected</p>
                        <p className="text-xs text-muted-foreground">Default image will be used</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {photoPreview ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {photoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={removePhoto}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Team Members (Athletes)</h3>
                <p className="text-sm text-muted-foreground">Select athletes to add to this team (optional)</p>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-4">
                {athletes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No athletes available
                  </p>
                ) : (
                  athletes.map((athlete) => (
                    <div
                      key={athlete.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <Checkbox
                        id={athlete.id}
                        checked={selectedMembers.includes(athlete.id)}
                        onCheckedChange={() => handleMemberToggle(athlete.id)}
                      />
                      <label
                        htmlFor={athlete.id}
                        className="flex-1 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">{athlete.name}</p>
                          <p className="text-sm text-muted-foreground">{athlete.email}</p>
                        </div>
                        {athlete.speciality && (
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                            {athlete.speciality === 'MartialArts' ? 'Martial Arts' : 
                             athlete.speciality === 'TableTennis' ? 'Table Tennis' : 
                             athlete.speciality}
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected {selectedMembers.length} athlete{selectedMembers.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Team Staff */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Team Staff</h3>
                <p className="text-sm text-muted-foreground">Select staff members to assign to this team (optional)</p>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-4">
                {staff.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No staff members available
                  </p>
                ) : (
                  staff.map((staffMember) => (
                    <div
                      key={staffMember.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <Checkbox
                        id={`staff-${staffMember.id}`}
                        checked={selectedStaff.includes(staffMember.id)}
                        onCheckedChange={() => handleStaffToggle(staffMember.id)}
                      />
                      <label
                        htmlFor={`staff-${staffMember.id}`}
                        className="flex-1 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">{staffMember.name}</p>
                          <p className="text-sm text-muted-foreground">{staffMember.email}</p>
                        </div>
                        {staffMember.speciality && (
                          <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs">
                            {staffMember.speciality === 'MartialArts' ? 'Martial Arts' : 
                             staffMember.speciality === 'TableTennis' ? 'Table Tennis' : 
                             staffMember.speciality}
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected {selectedStaff.length} staff member{selectedStaff.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/teams')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90"
                disabled={createTeam.isPending}
              >
                {createTeam.isPending ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

