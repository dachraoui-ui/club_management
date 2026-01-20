import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  User, Lock, Bell, Palette, Camera, Upload, Building2, 
  RefreshCw, Check, Eye, EyeOff, Shield, Trash2,
  Sun, Moon, Monitor, Sparkles, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

// Preset color themes
const colorPresets = [
  { name: 'Ocean Blue', primary: '#1e3a5f', accent: '#10b981', sidebar: '#172a46' },
  { name: 'Royal Purple', primary: '#5b21b6', accent: '#f59e0b', sidebar: '#4c1d95' },
  { name: 'Forest Green', primary: '#166534', accent: '#eab308', sidebar: '#14532d' },
  { name: 'Crimson Red', primary: '#991b1b', accent: '#06b6d4', sidebar: '#7f1d1d' },
  { name: 'Midnight', primary: '#1f2937', accent: '#8b5cf6', sidebar: '#111827' },
  { name: 'Sunset Orange', primary: '#c2410c', accent: '#0ea5e9', sidebar: '#9a3412' },
];

export default function Settings() {
  const { settings, updateBranding, updateNotifications, updateAppearance, updateProfile } = useSettings();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState(settings.profile);
  const [brandingForm, setBrandingForm] = useState(settings.branding);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Update active tab when URL parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'branding', 'security', 'notifications', 'appearance'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setBrandingForm({ ...brandingForm, clubLogo: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setProfileForm({ ...profileForm, avatar: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile
  const handleSaveProfile = () => {
    updateProfile(profileForm);
    toast.success('Profile updated successfully!');
  };

  // Save branding
  const handleSaveBranding = () => {
    updateBranding(brandingForm);
    toast.success('Branding settings saved successfully!');
  };

  // Change password
  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await authService.changePassword(passwordForm.current, passwordForm.new);
      toast.success('Password changed successfully!');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Apply preset theme
  const applyPreset = (preset: typeof colorPresets[0]) => {
    setBrandingForm({
      ...brandingForm,
      primaryColor: preset.primary,
      accentColor: preset.accent,
      sidebarColor: preset.sidebar,
    });
  };

  // Reset profile to defaults
  const handleResetProfile = () => {
    const defaultProfile = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@sportclub.com',
      phone: '+1 234 567 8900',
      bio: '',
      avatar: null,
    };
    setProfileForm(defaultProfile);
    updateProfile(defaultProfile);
    toast.success('Profile reset to defaults');
  };

  // Reset branding to defaults
  const handleResetBranding = () => {
    const defaultBranding = {
      clubName: 'SportClub',
      clubLogo: null,
      primaryColor: '#1e3a5f',
      accentColor: '#10b981',
      sidebarColor: '#172a46',
    };
    setBrandingForm(defaultBranding);
    updateBranding(defaultBranding);
    toast.success('Branding reset to defaults');
  };

  // Reset notifications to defaults
  const handleResetNotifications = () => {
    const defaultNotifications = {
      email: true,
      push: true,
      marketing: false,
      events: true,
      payments: true,
      trainings: true,
      members: true,
    };
    updateNotifications(defaultNotifications);
    toast.success('Notifications reset to defaults');
  };

  // Reset appearance to defaults
  const handleResetAppearance = () => {
    updateAppearance({
      theme: 'light',
      sidebarCollapsed: false,
      compactMode: false,
      animationsEnabled: true,
    });
    toast.success('Appearance reset to defaults');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground">Manage your account, preferences, and club branding</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-accent/20">
                  {profileForm.avatar ? (
                    <AvatarImage src={profileForm.avatar} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {profileForm.firstName[0]}{profileForm.lastName[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button variant="outline" onClick={() => avatarInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  {profileForm.avatar && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive"
                      onClick={() => setProfileForm({ ...profileForm, avatar: null })}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <Separator />

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleResetProfile}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSaveProfile} className="bg-sidebar-primary hover:bg-sidebar-primary/80">
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Club Information */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Club Information</CardTitle>
                <CardDescription>Set your club name and logo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo */}
                <div className="space-y-4">
                  <Label>Club Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted">
                      {brandingForm.clubLogo ? (
                        <img src={brandingForm.clubLogo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                      {brandingForm.clubLogo && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive"
                          onClick={() => setBrandingForm({ ...brandingForm, clubLogo: null })}
                        >
                          Remove
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">
                        This will appear in sidebar and browser tab
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Club Name */}
                <div className="space-y-2">
                  <Label htmlFor="clubName">Club Name</Label>
                  <Input 
                    id="clubName"
                    value={brandingForm.clubName}
                    onChange={(e) => setBrandingForm({ ...brandingForm, clubName: e.target.value })}
                    placeholder="Enter your club name"
                  />
                  <p className="text-xs text-muted-foreground">This appears in the sidebar and page titles</p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleResetBranding}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={handleSaveBranding} className="bg-sidebar-primary hover:bg-sidebar-primary/80">
                    <Check className="w-4 h-4 mr-2" />
                    Save Branding
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Color Customization */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Color Scheme</CardTitle>
                <CardDescription>Customize the colors of your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Color Presets */}
                <div className="space-y-3">
                  <Label>Color Presets</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="p-2 rounded-lg border hover:border-accent transition-colors text-left"
                      >
                        <div className="flex gap-1 mb-1">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: preset.accent }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: preset.sidebar }}
                          />
                        </div>
                        <span className="text-xs font-medium">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Custom Colors */}
                <div className="space-y-4">
                  <Label>Custom Colors</Label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Primary Color</p>
                        <p className="text-xs text-muted-foreground">Main brand color</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={brandingForm.primaryColor}
                          onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                          className="w-12 h-8 p-0 border-0 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={brandingForm.primaryColor}
                          onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                          className="w-24 h-8 text-xs uppercase"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Accent Color</p>
                        <p className="text-xs text-muted-foreground">Buttons and highlights</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={brandingForm.accentColor}
                          onChange={(e) => setBrandingForm({ ...brandingForm, accentColor: e.target.value })}
                          className="w-12 h-8 p-0 border-0 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={brandingForm.accentColor}
                          onChange={(e) => setBrandingForm({ ...brandingForm, accentColor: e.target.value })}
                          className="w-24 h-8 text-xs uppercase"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Sidebar Color</p>
                        <p className="text-xs text-muted-foreground">Navigation background</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={brandingForm.sidebarColor}
                          onChange={(e) => setBrandingForm({ ...brandingForm, sidebarColor: e.target.value })}
                          className="w-12 h-8 p-0 border-0 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={brandingForm.sidebarColor}
                          onChange={(e) => setBrandingForm({ ...brandingForm, sidebarColor: e.target.value })}
                          className="w-24 h-8 text-xs uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex gap-2 p-4 rounded-lg border bg-muted/30">
                    <div 
                      className="flex-1 h-20 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: brandingForm.sidebarColor }}
                    >
                      Sidebar
                    </div>
                    <div className="flex-[2] flex flex-col gap-2">
                      <div 
                        className="flex-1 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: brandingForm.primaryColor }}
                      >
                        Primary
                      </div>
                      <div 
                        className="flex-1 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: brandingForm.accentColor }}
                      >
                        Accent
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveBranding} className="bg-sidebar-primary hover:bg-sidebar-primary/80">
                    <Check className="w-4 h-4 mr-2" />
                    Apply Colors
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input 
                      id="currentPassword" 
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="newPassword" 
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                {passwordForm.new && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Password Requirements:</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li className={passwordForm.new.length >= 8 ? 'text-green-600' : ''}>
                        {passwordForm.new.length >= 8 ? '✓' : '○'} At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(passwordForm.new) ? 'text-green-600' : ''}>
                        {/[A-Z]/.test(passwordForm.new) ? '✓' : '○'} One uppercase letter
                      </li>
                      <li className={/[0-9]/.test(passwordForm.new) ? 'text-green-600' : ''}>
                        {/[0-9]/.test(passwordForm.new) ? '✓' : '○'} One number
                      </li>
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleChangePassword} 
                    className="bg-sidebar-primary hover:bg-sidebar-primary/80"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorEnabled 
                        ? 'Your account is protected with 2FA' 
                        : 'Protect your account with two-factor authentication'}
                    </p>
                  </div>
                  <Switch 
                    checked={twoFactorEnabled}
                    onCheckedChange={(checked) => {
                      setTwoFactorEnabled(checked);
                      toast.success(checked ? '2FA enabled successfully' : '2FA disabled');
                    }}
                  />
                </div>

                {twoFactorEnabled && (
                  <Alert className="mt-4 bg-green-50 border-green-200">
                    <Shield className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Two-factor authentication is active. You'll be asked for a verification code when signing in.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: 'email', title: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'push', title: 'Push Notifications', desc: 'Receive push notifications in browser' },
                  { key: 'events', title: 'Event Reminders', desc: 'Get reminded about upcoming events' },
                  { key: 'trainings', title: 'Training Alerts', desc: 'Get notified about training sessions' },
                  { key: 'payments', title: 'Payment Alerts', desc: 'Get notified about payment activities' },
                  { key: 'members', title: 'Member Updates', desc: 'Get notified about new members' },
                  { key: 'marketing', title: 'Marketing Communications', desc: 'Receive news and promotional content' },
                ].map((item, index) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                        onCheckedChange={(checked) => 
                          updateNotifications({ [item.key]: checked })
                        }
                      />
                    </div>
                    {index < 6 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={handleResetNotifications}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Select your preferred theme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'Light', icon: Sun, preview: 'bg-white border' },
                    { value: 'dark', label: 'Dark', icon: Moon, preview: 'bg-gray-900' },
                    { value: 'system', label: 'System', icon: Monitor, preview: 'bg-gradient-to-b from-white to-gray-900' },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => updateAppearance({ theme: theme.value as 'light' | 'dark' | 'system' })}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        settings.appearance.theme === theme.value 
                          ? 'border-sidebar-primary ring-2 ring-sidebar-primary/20' 
                          : 'border-muted hover:border-sidebar-primary/50'
                      }`}
                    >
                      <div className={`h-20 rounded mb-3 ${theme.preview}`} />
                      <div className="flex items-center justify-center gap-2">
                        <theme.icon className="w-4 h-4" />
                        <span className="font-medium">{theme.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Display Options
                </CardTitle>
                <CardDescription>Customize the user interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sidebar Collapsed by Default</p>
                    <p className="text-sm text-muted-foreground">Start with sidebar collapsed</p>
                  </div>
                  <Switch 
                    checked={settings.appearance.sidebarCollapsed}
                    onCheckedChange={(checked) => updateAppearance({ sidebarCollapsed: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
                  </div>
                  <Switch 
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) => updateAppearance({ compactMode: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Animations</p>
                    <p className="text-sm text-muted-foreground">Enable smooth animations and transitions</p>
                  </div>
                  <Switch 
                    checked={settings.appearance.animationsEnabled}
                    onCheckedChange={(checked) => updateAppearance({ animationsEnabled: checked })}
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button variant="outline" onClick={handleResetAppearance}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
