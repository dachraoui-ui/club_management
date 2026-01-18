import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SearchInput } from '@/components/SearchInput';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMembers, useDeleteMember, useUpdateMemberStatus } from '@/hooks/useMembers';
import { toast } from 'sonner';

export default function Members() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');

  // Fetch all members without search filter for client-side filtering
  const filters = {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    speciality: sportFilter !== 'all' ? sportFilter : undefined,
  };

  const { data: membersData, isLoading } = useMembers(filters);
  const deleteMember = useDeleteMember();
  const updateMemberStatus = useUpdateMemberStatus();

  const members = membersData?.members || [];
  const filteredMembers = members.filter((member) => {
    const memberData = member.user || member;
    // Subscriptions are nested under user, not directly on member
    const subscription = member.user?.subscriptions?.[0] || member.subscriptions?.[0];
    const status = subscription?.status || 'Active';
    const speciality = member.speciality || '';
    
    // Client-side search filtering for instant results
    const matchesSearch = !searchQuery || 
      (memberData.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       memberData.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       memberData.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       memberData.phone?.includes(searchQuery));
    
    return (
      matchesSearch &&
      (!statusFilter || statusFilter === 'all' || status === statusFilter) &&
      (!sportFilter || sportFilter === 'all' || speciality === sportFilter)
    );
  });


  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
      await deleteMember.mutateAsync(id);
      toast.success('Member deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete member');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateMemberStatus.mutateAsync({ id, status });
      toast.success('Member status updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Members</h2>
          <p className="text-muted-foreground">Manage your club members</p>
        </div>
        <Link to="/members/new">
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search members..."
              className="flex-1"
            />
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Tennis">Tennis</SelectItem>
                  <SelectItem value="Swimming">Swimming</SelectItem>
                  <SelectItem value="Volleyball">Volleyball</SelectItem>
                  <SelectItem value="Handball">Handball</SelectItem>
                  <SelectItem value="Athletics">Athletics</SelectItem>
                  <SelectItem value="Gymnastics">Gymnastics</SelectItem>
                  <SelectItem value="Boxing">Boxing</SelectItem>
                  <SelectItem value="Judo">Judo</SelectItem>
                  <SelectItem value="Karate">Karate</SelectItem>
                  <SelectItem value="Taekwondo">Taekwondo</SelectItem>
                  <SelectItem value="Wrestling">Wrestling</SelectItem>
                  <SelectItem value="Cycling">Cycling</SelectItem>
                  <SelectItem value="Rugby">Rugby</SelectItem>
                  <SelectItem value="Hockey">Hockey</SelectItem>
                  <SelectItem value="Badminton">Badminton</SelectItem>
                  <SelectItem value="TableTennis">Table Tennis</SelectItem>
                  <SelectItem value="Golf">Golf</SelectItem>
                  <SelectItem value="Fencing">Fencing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>All Members ({filteredMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No members found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Speciality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => {
                  const memberData = member.user || member;
                  // Subscriptions are nested under user
                  const subscription = member.user?.subscriptions?.[0] || member.subscriptions?.[0];
                  const status = subscription?.status || 'Active';
                  const baseSalary = member.baseSalary || 0;
                  const role = memberData.role || 'Athlete';
                  const speciality = member.speciality || '-';
                  const joinDate = member.joinDate || new Date().toISOString().split('T')[0];

                  return (
                    <TableRow key={member.id} className="hover:bg-secondary/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {member.photo && (
                              <AvatarImage 
                                src={member.photo} 
                                alt={`${memberData.firstName} ${memberData.lastName}`}
                                className="object-cover"
                              />
                            )}
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {memberData.firstName?.[0] || ''}{memberData.lastName?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{memberData.firstName} {memberData.lastName}</p>
                            <p className="text-sm text-muted-foreground">{memberData.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{memberData.phone || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          role === 'Admin' || role === 'Manager' ? 'bg-red-500/10 text-red-600' :
                          role === 'Coach' ? 'bg-blue-500/10 text-blue-600' :
                          role === 'Staff' ? 'bg-green-500/10 text-green-600' :
                          'bg-purple-500/10 text-purple-600'
                        }`}>
                          {role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          baseSalary >= 5000 ? 'bg-accent/10 text-accent' :
                          baseSalary >= 2000 ? 'bg-primary/10 text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {baseSalary > 0 ? `$${baseSalary.toLocaleString()}` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-secondary rounded text-xs">
                          {speciality}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={status} 
                          onValueChange={(newStatus) => handleStatusChange(member.id, newStatus)}
                        >
                          <SelectTrigger className="w-[110px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{new Date(joinDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/members/${member.id}`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(member.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
