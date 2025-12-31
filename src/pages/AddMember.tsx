import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCreateMember } from '@/hooks/useMembers';
import { useTeams } from '@/hooks/useTeams';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';

interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'Athlete' | 'Coach' | 'Staff';
  dateOfBirth: string;
  membershipType: 'Basic' | 'Premium' | 'Elite';
  address: string;
  emergencyContact: string;
  sports: string[];
  speciality?: string;
  teamId?: string;
  weight?: number;
  height?: number;
  strongPoint?: string;
  weakPoint?: string;
  // Coach specific
  specialties?: string;
  certifications?: string;
  experienceYears?: number;
  // Staff specific
  department?: string;
  position?: string;
  hireDate?: string;
  // Photo
  photo?: string;
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

export default function AddMember() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: teamsData } = useTeams();
  const createMember = useCreateMember();
  const teams = teamsData || [];

  const { register, handleSubmit, reset, control, formState: { errors }, watch } = useForm<MemberFormData>({
    defaultValues: {
      role: 'Athlete',
      membershipType: 'Basic',
    },
  });

  const selectedRole = watch('role');

  // Reset tab when role changes with smooth transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveTab('personal');
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedRole]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast.error('Image size must be less than 1MB');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: MemberFormData) => {
    try {
      await createMember.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        dateOfBirth: data.dateOfBirth || undefined,
        address: data.address || undefined,
        emergencyContact: data.emergencyContact || undefined,
        sports: data.sports || [],
        speciality: data.speciality || undefined,
        membershipType: data.role === 'Athlete' ? data.membershipType : undefined,
        teamId: data.teamId && data.teamId !== 'none' ? data.teamId : undefined,
        weight: data.weight || undefined,
        height: data.height || undefined,
        strongPoint: data.strongPoint || undefined,
        weakPoint: data.weakPoint || undefined,
        // Coach specific
        specialties: data.specialties || undefined,
        certifications: data.certifications || undefined,
        experienceYears: data.experienceYears || undefined,
        // Staff specific
        department: data.department || undefined,
        position: data.position || undefined,
        hireDate: data.hireDate || undefined,
        // Photo
        photo: photoPreview || undefined,
        password: 'defaultPassword123',
      });
      toast.success('Member created successfully!');
      reset();
      setPhotoPreview(null);
      navigate('/members');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create member');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/members')}
          className="hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Add New Member</h2>
          <p className="text-muted-foreground">Create a new member profile</p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="transition-all duration-500 ease-in-out">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList 
                  className="grid w-full bg-gradient-to-r from-primary/10 via-primary/10 to-primary/10 transition-all duration-500 ease-in-out shadow-sm mb-6" 
                  style={{ 
                    gridTemplateColumns: selectedRole === 'Athlete' ? 'repeat(4, 1fr)' : selectedRole === 'Coach' ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                  }}
                >
                  <TabsTrigger 
                    value="personal"
                    className="transition-all duration-300 ease-in-out data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] hover:bg-primary/20 hover:scale-[1.01] rounded-md"
                  >
                    Personal Info
                  </TabsTrigger>
                  {selectedRole === 'Athlete' && (
                    <>
                      <TabsTrigger 
                        value="membership"
                        className="transition-all duration-300 ease-in-out data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] hover:bg-primary/20 hover:scale-[1.01] rounded-md"
                      >
                        Membership
                      </TabsTrigger>
                      <TabsTrigger 
                        value="physical"
                        className="transition-all duration-300 ease-in-out data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] hover:bg-primary/20 hover:scale-[1.01] rounded-md"
                      >
                        Physical
                      </TabsTrigger>
                      <TabsTrigger 
                        value="performance"
                        className="transition-all duration-300 ease-in-out data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] hover:bg-primary/20 hover:scale-[1.01] rounded-md"
                      >
                        Performance
                      </TabsTrigger>
                    </>
                  )}
                  {selectedRole === 'Coach' && (
                    <TabsTrigger 
                      value="coach"
                      className="transition-all duration-300 ease-in-out data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] hover:bg-primary/20 hover:scale-[1.01] rounded-md"
                    >
                      Coach Info
                    </TabsTrigger>
                  )}
                  {selectedRole === 'Staff' && (
                    <TabsTrigger 
                      value="staff"
                      className="transition-all duration-300 ease-in-out data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] hover:bg-primary/20 hover:scale-[1.01] rounded-md"
                    >
                      Staff Info
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <div className="min-h-[600px] pb-6">
                  {/* Personal Information Tab */}
                  <TabsContent 
                    value="personal" 
                    className="space-y-4 mt-0 animate-in fade-in-0 slide-in-from-right-4 duration-500"
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Basic Information</h3>
                        <p className="text-sm text-muted-foreground">Personal details and contact information</p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input 
                            id="firstName" 
                            placeholder="John" 
                            {...register('firstName', { required: 'First name is required' })}
                          />
                          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input 
                            id="lastName" 
                            placeholder="Smith" 
                            {...register('lastName', { required: 'Last name is required' })}
                          />
                          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="john@example.com" 
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
                          <Label htmlFor="phone">Phone (8 digits) *</Label>
                          <Input 
                            id="phone" 
                            placeholder="12345678" 
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
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role">Role *</Label>
                          <Controller
                            name="role"
                            control={control}
                            rules={{ required: 'Role is required' }}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Athlete">Athlete</SelectItem>
                                  <SelectItem value="Coach">Coach</SelectItem>
                                  <SelectItem value="Staff">Staff</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input 
                            id="address" 
                            placeholder="123 Main St, City" 
                            {...register('address')}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="photo">Member Photo</Label>
                        <div className="space-y-3">
                          {photoPreview ? (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-input">
                              <img
                                src={photoPreview}
                                alt="Member preview"
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6"
                                onClick={removePhoto}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-input flex items-center justify-center bg-muted/50">
                              <div className="text-center space-y-2">
                                <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">No photo</p>
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              size="sm"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {photoPreview ? 'Change Photo' : 'Upload Photo'}
                            </Button>
                            {photoPreview && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={removePhoto}
                                size="sm"
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
                            Supported formats: JPG, PNG, GIF. Max size: 1MB
                          </p>
                        </div>
                      </div>
                      {selectedRole === 'Athlete' && (
                        <div className="space-y-4 pt-2">
                          <Separator />
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">Personal Details</h3>
                            <p className="text-sm text-muted-foreground">Additional personal information</p>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="dob">Date of Birth (min 5 years)</Label>
                              <Input 
                                id="dob" 
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
                              <Label htmlFor="emergency">Emergency Contact (8 digits)</Label>
                              <Input 
                                id="emergency" 
                                placeholder="12345678" 
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
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Membership Tab - Athletes only */}
                  {selectedRole === 'Athlete' && (
                    <TabsContent 
                      value="membership" 
                      className="space-y-4 mt-0 animate-in fade-in-0 slide-in-from-right-4 duration-500"
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">Membership & Team</h3>
                          <p className="text-sm text-muted-foreground">Membership details and team assignment</p>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="membership">Membership Type *</Label>
                            <Controller
                              name="membershipType"
                              control={control}
                              rules={{ required: 'Membership type is required' }}
                              render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Basic">Basic</SelectItem>
                                    <SelectItem value="Premium">Premium</SelectItem>
                                    <SelectItem value="Elite">Elite</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.membershipType && <p className="text-sm text-destructive">{errors.membershipType.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="team">Team</Label>
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
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="speciality">Sport Speciality</Label>
                          <Controller
                            name="speciality"
                            control={control}
                            render={({ field }) => (
                              <Select 
                                value={field.value || undefined} 
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sport speciality (optional)" />
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
                          <p className="text-xs text-muted-foreground">
                            Primary sport this member specializes in
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {/* Physical Attributes Tab - Athletes only */}
                  {selectedRole === 'Athlete' && (
                    <TabsContent 
                      value="physical" 
                      className="space-y-4 mt-0 animate-in fade-in-0 slide-in-from-right-4 duration-500"
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">Physical Attributes</h3>
                          <p className="text-sm text-muted-foreground">Physical measurements</p>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input 
                              id="weight" 
                              type="number" 
                              step="0.1"
                              min="0"
                              placeholder="70.5" 
                              {...register('weight', {
                                valueAsNumber: true,
                                min: {
                                  value: 0,
                                  message: 'Weight must be positive'
                                }
                              })}
                            />
                            {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input 
                              id="height" 
                              type="number" 
                              step="0.1"
                              min="0"
                              placeholder="175.0" 
                              {...register('height', {
                                valueAsNumber: true,
                                min: {
                                  value: 0,
                                  message: 'Height must be positive'
                                }
                              })}
                            />
                            {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {/* Performance Tab - Athletes only */}
                  {selectedRole === 'Athlete' && (
                    <TabsContent 
                      value="performance" 
                      className="space-y-4 mt-0 animate-in fade-in-0 slide-in-from-right-4 duration-500"
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">Performance Notes</h3>
                          <p className="text-sm text-muted-foreground">Athlete strengths and areas for improvement</p>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="strongPoint">Strong Point</Label>
                            <Input 
                              id="strongPoint" 
                              placeholder="Speed, Endurance, etc." 
                              {...register('strongPoint')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weakPoint">Weak Point</Label>
                            <Input 
                              id="weakPoint" 
                              placeholder="Flexibility, Strength, etc." 
                              {...register('weakPoint')}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {/* Coach Information Tab */}
                  {selectedRole === 'Coach' && (
                    <TabsContent 
                      value="coach" 
                      className="space-y-4 mt-0 animate-in fade-in-0 slide-in-from-right-4 duration-500"
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">Coach Information</h3>
                          <p className="text-sm text-muted-foreground">Coaching qualifications and experience</p>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label htmlFor="speciality">Sport Speciality</Label>
                          <Controller
                            name="speciality"
                            control={control}
                            render={({ field }) => (
                              <Select 
                                value={field.value || undefined} 
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select primary sport (optional)" />
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
                          <p className="text-xs text-muted-foreground">
                            Primary sport this coach specializes in
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="specialties">Additional Specialties</Label>
                            <Input 
                              id="specialties" 
                              placeholder="Football, Basketball, etc." 
                              {...register('specialties')}
                            />
                            <p className="text-xs text-muted-foreground">Other sports/disciplines (comma-separated)</p>
                            {errors.specialties && <p className="text-sm text-destructive">{errors.specialties.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="experienceYears">Years of Experience</Label>
                            <Input 
                              id="experienceYears" 
                              type="number" 
                              min="0"
                              placeholder="5" 
                              {...register('experienceYears', {
                                valueAsNumber: true,
                                min: {
                                  value: 0,
                                  message: 'Experience must be positive'
                                }
                              })}
                            />
                            {errors.experienceYears && <p className="text-sm text-destructive">{errors.experienceYears.message}</p>}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="certifications">Certifications</Label>
                          <Textarea 
                            id="certifications" 
                            placeholder="UEFA License, National Coaching Certificate, etc." 
                            rows={3}
                            {...register('certifications')}
                          />
                          <p className="text-xs text-muted-foreground">List any coaching certifications or licenses</p>
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {/* Staff Information Tab */}
                  {selectedRole === 'Staff' && (
                    <TabsContent 
                      value="staff" 
                      className="space-y-4 mt-0 animate-in fade-in-0 slide-in-from-right-4 duration-500"
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">Staff Information</h3>
                          <p className="text-sm text-muted-foreground">Employment details and position</p>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label htmlFor="speciality">Sport Speciality</Label>
                          <Controller
                            name="speciality"
                            control={control}
                            render={({ field }) => (
                              <Select 
                                value={field.value || undefined} 
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sport area (optional)" />
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
                          <p className="text-xs text-muted-foreground">
                            Sport area this staff member works with
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input 
                              id="department" 
                              placeholder="Administration, Maintenance, etc." 
                              {...register('department')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="position">Position</Label>
                            <Input 
                              id="position" 
                              placeholder="Manager, Secretary, etc." 
                              {...register('position')}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hireDate">Hire Date</Label>
                          <Input 
                            id="hireDate" 
                            type="date" 
                            {...register('hireDate')}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </div>
              </Tabs>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/members')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-accent hover:bg-accent/90"
                disabled={createMember.isPending}
              >
                {createMember.isPending ? 'Creating...' : 'Add Member'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

