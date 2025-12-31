import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, Calendar, User, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { useTeam, useDeleteTeam } from '@/hooks/useTeams';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { useState } from 'react';

const sportIcons: Record<string, string> = {
  Football: '⚽',
  Basketball: '🏀',
  Swimming: '🏊',
  Tennis: '🎾',
  Volleyball: '🏐',
};

export default function TeamDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: team, isLoading, error } = useTeam(id!);
  const deleteTeam = useDeleteTeam();

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteTeam.mutateAsync(id);
      toast.success('Team deleted successfully!');
      navigate('/teams');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading team details...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-muted-foreground mb-4">Team not found</p>
        <Button asChild variant="link">
          <Link to="/teams">Back to Teams</Link>
        </Button>
      </div>
    );
  }

  const teamMembers = (team.members || []).filter((m: any) => m.user?.role === 'Athlete');
  const teamStaff = (team.members || []).filter((m: any) => m.user?.role === 'Staff');
  const teamCoaches = (team.members || []).filter((m: any) => m.user?.role === 'Coach');
  const totalMembers =
    team.memberCount ?? teamMembers.length + teamStaff.length + teamCoaches.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link to="/teams">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Link>
      </Button>

      {/* Team Header */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="gradient-hero p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="w-20 h-20 rounded-2xl">
              {team.photo && (
                <AvatarImage 
                  src={team.photo} 
                  alt={team.name}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-white/20 backdrop-blur text-4xl">
                {sportIcons[team.discipline] || team.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <p className="text-white/80 mt-1">{team.discipline} • {totalMembers} Members</p>
              {team.coach && (
                <div className="flex items-center gap-2 mt-2">
                  <User className="w-4 h-4" />
                  <span>Coach: {team.coach?.firstName} {team.coach?.lastName}</span>
                </div>
              )}
              {!team.coach && (
                <div className="flex items-center gap-2 mt-2 text-white/60">
                  <User className="w-4 h-4" />
                  <span>No coach assigned</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => navigate(`/teams/${id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="secondary" 
                className="bg-red-500/20 hover:bg-red-500/30 text-white border-0"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-3xl font-bold text-primary">{teamMembers.length}</p>
              <p className="text-sm text-muted-foreground">Athletes</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-3xl font-bold text-success">{teamStaff.length}</p>
              <p className="text-sm text-muted-foreground">Staff</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-3xl font-bold text-foreground">{teamCoaches.length}</p>
              <p className="text-sm text-muted-foreground">Coaches</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-accent/10">
              <p className="text-3xl font-bold text-accent">{totalMembers}</p>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Athletes */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Athletes ({teamMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamMembers.length > 0 ? (
              teamMembers.map((member: any) => (
                <Link
                  key={member.id}
                  to={`/members/${member.user?.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{member.user?.firstName} {member.user?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No athletes assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Team Staff */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              Staff ({teamStaff.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamStaff.length > 0 ? (
              teamStaff.map((staffMember: any) => (
                <Link
                  key={staffMember.id}
                  to={`/members/${staffMember.user?.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <Avatar>
                    <AvatarFallback className="bg-success text-white">
                      {staffMember.user?.firstName?.[0]}{staffMember.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{staffMember.user?.firstName} {staffMember.user?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{staffMember.user?.email}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No staff assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Team Coaches */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Coaches ({teamCoaches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamCoaches.length > 0 ? (
              teamCoaches.map((coach: any) => (
                <Link
                  key={coach.id}
                  to={`/members/${coach.user?.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {coach.user?.firstName?.[0]}{coach.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{coach.user?.firstName} {coach.user?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{coach.user?.email}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No coaches assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-destructive" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Delete Team?</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Are you sure you want to delete
                <span className="font-semibold text-foreground"> {team.name}</span>?
              </DialogDescription>
              <div className="mt-4 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. This will permanently delete the team and all associated data.
                </p>
              </div>
            </DialogHeader>
            <DialogFooter className="w-full mt-6 gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1"
                disabled={deleteTeam.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex-1"
                disabled={deleteTeam.isPending}
              >
                {deleteTeam.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Team
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
