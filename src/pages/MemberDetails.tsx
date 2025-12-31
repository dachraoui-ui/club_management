import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, User, Shield, Edit, 
  Trash2, Save, X, Ruler, Weight, Target, AlertCircle, Users, Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMember, useUpdateMember, useDeleteMember } from '@/hooks/useMembers';
import { useTeams } from '@/hooks/useTeams';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';

interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  membershipType: 'Basic' | 'Premium' | 'Elite';
  teamId?: string;
  weight?: number;
  height?: number;
  strongPoint?: string;
  weakPoint?: string;
  sports: string[];
  speciality?: string;
}

// Sports speciality options
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

export default function MemberDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: member, isLoading, error } = useMember(id!);
  const { data: teamsData } = useTeams();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();
  const teams = teamsData || [];

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<MemberFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      emergencyContact: '',
      membershipType: 'Basic',
      teamId: undefined,
      weight: undefined,
      height: undefined,
      strongPoint: '',
      weakPoint: '',
      sports: [],
      speciality: undefined,
    },
  });

  // Reset form when member data loads (using useEffect to prevent infinite loop)
  useEffect(() => {
    if (member && !isEditMode) {
      reset({
        firstName: member.user?.firstName || member.firstName || '',
        lastName: member.user?.lastName || member.lastName || '',
        email: member.user?.email || member.email || '',
        phone: member.user?.phone || member.phone || '',
        dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
        address: member.address || '',
        emergencyContact: member.emergencyContact || '',
        membershipType: member.user?.subscriptions?.[0]?.type || member.membershipType || 'Basic',
        teamId: member.teamId || undefined,
        weight: member.weight || undefined,
        height: member.height || undefined,
        strongPoint: member.strongPoint || '',
        weakPoint: member.weakPoint || '',
        sports: member.sports || [],
        speciality: member.speciality || undefined,
      });
    }
  }, [member, isEditMode, reset]);

  const onSubmit = async (data: MemberFormData) => {
    if (!id) return;

    try {
      await updateMember.mutateAsync({
        id,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth || undefined,
          address: data.address || undefined,
          emergencyContact: data.emergencyContact || undefined,
          teamId: data.teamId && data.teamId !== 'none' ? data.teamId : undefined,
          weight: data.weight || undefined,
          height: data.height || undefined,
          strongPoint: data.strongPoint || undefined,
          weakPoint: data.weakPoint || undefined,
          speciality: data.speciality || undefined,
        },
      });
      toast.success('Member updated successfully!');
      setIsEditMode(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update member');
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteMember.mutateAsync(id);
      toast.success('Member deleted successfully!');
      navigate('/members');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete member');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading member details...</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-muted-foreground mb-4">Member not found</p>
        <Button asChild variant="link">
          <Link to="/members">Back to Members</Link>
        </Button>
      </div>
    );
  }

  const memberData = member.user || member;
  const subscription = member.user?.subscriptions?.[0];
  const status = subscription?.status || 'Active';
  const membershipType = subscription?.type || member.membershipType || 'Basic';
  const sports = member.sports || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/members">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Members
          </Link>
        </Button>
        <div className="flex gap-2">
          {!isEditMode ? (
            <>
              <Button 
                onClick={() => setIsEditMode(true)}
                className="bg-accent hover:bg-accent/90"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsEditMode(false);
                  reset();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit(onSubmit)}
                className="bg-accent hover:bg-accent/90"
                disabled={updateMember.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMember.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            {!isEditMode ? (
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {memberData.firstName?.[0]}{memberData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-bold">{memberData.firstName} {memberData.lastName}</h2>
                <StatusBadge status={status} className="mt-2" />
                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  membershipType === 'Elite' ? 'bg-accent/10 text-accent' :
                  membershipType === 'Premium' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {membershipType} Member
                </span>

                <div className="w-full mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{memberData.email}</span>
                  </div>
                  {memberData.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{memberData.phone}</span>
                    </div>
                  )}
                  {member.address && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{member.address}</span>
                    </div>
                  )}
                  {member.dateOfBirth && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(member.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  )}
                  {member.joinDate && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {member.emergencyContact && (
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span>{member.emergencyContact}</span>
                    </div>
                  )}
                  {member.team && (
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{member.team.name} ({member.team.discipline})</span>
                    </div>
                  )}
                  {member.speciality && (
                    <div className="flex items-center gap-3 text-sm">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {member.speciality === 'MartialArts' ? 'Martial Arts' : 
                         member.speciality === 'TableTennis' ? 'Table Tennis' : 
                         member.speciality}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name *</Label>
                  <Input 
                    id="edit-firstName"
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name *</Label>
                  <Input 
                    id="edit-lastName"
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input 
                    id="edit-email"
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone (8 digits) *</Label>
                  <Input 
                    id="edit-phone"
                    maxLength={8}
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^\d{8}$/,
                        message: 'Phone must be exactly 8 digits'
                      }
                    })}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dateOfBirth">Date of Birth (min 5 years)</Label>
                  <Input 
                    id="edit-dateOfBirth"
                    type="date"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0]}
                    {...register('dateOfBirth', {
                      validate: (value) => {
                        if (!value) return true;
                        const birthDate = new Date(value);
                        const today = new Date();
                        const age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();
                        const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age;
                        return actualAge >= 5 || 'Member must be at least 5 years old';
                      }
                    })}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Input id="edit-address" {...register('address')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-emergencyContact">Emergency Contact (8 digits)</Label>
                  <Input 
                    id="edit-emergencyContact"
                    maxLength={8}
                    {...register('emergencyContact', {
                      pattern: {
                        value: /^\d{8}$/,
                        message: 'Emergency contact must be exactly 8 digits'
                      }
                    })}
                  />
                  {errors.emergencyContact && <p className="text-sm text-destructive">{errors.emergencyContact.message}</p>}
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Physical Stats */}
          {!isEditMode ? (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-accent" />
                  Physical Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {member.weight && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Weight className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="font-semibold">{member.weight} kg</p>
                      </div>
                    </div>
                  )}
                  {member.height && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Ruler className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Height</p>
                        <p className="font-semibold">{member.height} cm</p>
                      </div>
                    </div>
                  )}
                  {member.strongPoint && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Target className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Strong Point</p>
                        <p className="font-semibold">{member.strongPoint}</p>
                      </div>
                    </div>
                  )}
                  {member.weakPoint && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Weak Point</p>
                        <p className="font-semibold">{member.weakPoint}</p>
                      </div>
                    </div>
                  )}
                </div>
                {!member.weight && !member.height && !member.strongPoint && !member.weakPoint && (
                  <p className="text-muted-foreground text-center py-4">No physical stats recorded</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Physical Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-weight">Weight (kg)</Label>
                    <Input 
                      id="edit-weight"
                      type="number"
                      step="0.1"
                      min="0"
                      {...register('weight', {
                        valueAsNumber: true,
                        min: { value: 0, message: 'Weight must be positive' }
                      })}
                    />
                    {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-height">Height (cm)</Label>
                    <Input 
                      id="edit-height"
                      type="number"
                      step="0.1"
                      min="0"
                      {...register('height', {
                        valueAsNumber: true,
                        min: { value: 0, message: 'Height must be positive' }
                      })}
                    />
                    {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-strongPoint">Strong Point</Label>
                    <Input id="edit-strongPoint" {...register('strongPoint')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-weakPoint">Weak Point</Label>
                    <Input id="edit-weakPoint" {...register('weakPoint')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-team">Team</Label>
                  <Controller
                    name="teamId"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        value={field.value ? field.value : undefined} 
                        onValueChange={(value) => {
                          if (value === 'none') {
                            field.onChange(undefined);
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name} ({team.discipline})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-speciality">Sport Speciality</Label>
                  <Controller
                    name="speciality"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        value={field.value || undefined} 
                        onValueChange={(value) => {
                          if (value === 'none') {
                            field.onChange(undefined);
                          } else {
                            field.onChange(value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sports */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Sports & Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sports.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sports.map((sport, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No sports assigned</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Beautiful Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-destructive" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Delete Member?</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Are you sure you want to delete
                <span className="font-semibold text-foreground"> {memberData.firstName} {memberData.lastName}</span>?
              </DialogDescription>
              <div className="mt-4 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. This will permanently delete the member and all associated data including:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 text-left list-disc list-inside space-y-1">
                  <li>Member profile</li>
                  <li>Subscription records</li>
                  <li>Payment history</li>
                  <li>Training attendance</li>
                </ul>
              </div>
            </DialogHeader>
            <DialogFooter className="w-full mt-6 gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1"
                disabled={deleteMember.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex-1"
                disabled={deleteMember.isPending}
              >
                {deleteMember.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Member
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
