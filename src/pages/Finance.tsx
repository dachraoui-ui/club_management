import { useState, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, CreditCard, Building2, Filter, 
  Plus, Users, Edit, Trash2, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { SearchInput } from '@/components/SearchInput';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';
import {
  useFinanceStats,
  usePayments,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
  useSalaries,
  useCreateSalary,
  useUpdateSalary,
  useDeleteSalary,
  useExpenses,
  useCreateExpense,
  useDeleteExpense,
  useSponsors,
  useCreateSponsor,
  useUpdateSponsor,
  useDeleteSponsor,
  type Payment,
  type Salary,
  type Sponsor,
} from '@/hooks/useFinance';
import { useMembers } from '@/hooks/useMembers';

// Sport categories for filtering
const SPORT_CATEGORIES = [
  'All Sports',
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

export default function Finance() {
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [salaryTypeFilter, setSalaryTypeFilter] = useState<string>('all');
  const [salaryStatusFilter, setSalaryStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Member selection states
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [sportCategoryFilter, setSportCategoryFilter] = useState('All Sports');
  
  // Dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);
  
  // Edit states
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

  // Data hooks
  const { data: stats, isLoading: statsLoading } = useFinanceStats();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const { data: salaries = [], isLoading: salariesLoading } = useSalaries();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: sponsors = [], isLoading: sponsorsLoading } = useSponsors();
  const { data: membersData } = useMembers();
  const members = membersData?.members || [];

  // Filter members by sport category and search query
  const filteredMembers = useMemo(() => {
    return members.filter((member: any) => {
      const fullName = `${member.user?.firstName || ''} ${member.user?.lastName || ''}`.toLowerCase();
      const matchesSearch = !memberSearchQuery || fullName.includes(memberSearchQuery.toLowerCase());
      const matchesSport = sportCategoryFilter === 'All Sports' || member.speciality === sportCategoryFilter;
      return matchesSearch && matchesSport;
    });
  }, [members, memberSearchQuery, sportCategoryFilter]);

  // Mutations
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();
  const createSalary = useCreateSalary();
  const updateSalary = useUpdateSalary();
  const deleteSalary = useDeleteSalary();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();
  const createSponsor = useCreateSponsor();
  const updateSponsor = useUpdateSponsor();
  const deleteSponsor = useDeleteSponsor();

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    memberId: '',
    amount: '',
    type: 'Salary' as 'Salary' | 'Training' | 'Event' | 'Equipment',
    method: 'BankTransfer' as 'Card' | 'Cash' | 'BankTransfer',
    status: 'Pending' as 'Paid' | 'Pending' | 'Overdue',
    date: new Date().toISOString().split('T')[0],
  });

  const [salaryForm, setSalaryForm] = useState({
    userId: '',
    amount: '',
    type: 'Player' as 'Player' | 'Coach' | 'Staff' | 'Manager',
    status: 'Pending' as 'Paid' | 'Pending' | 'Overdue',
    month: new Date().toISOString().slice(0, 7),
    bonus: '0',
    deductions: '0',
    notes: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'Equipment',
    date: new Date().toISOString().split('T')[0],
  });

  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    amount: '',
    tier: 'Bronze' as 'Gold' | 'Silver' | 'Bronze',
    status: 'Pending' as 'Active' | 'Pending' | 'Expired',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Filter functions
  const filteredPayments = payments.filter((payment) => {
    const memberName = `${payment.member?.firstName || ''} ${payment.member?.lastName || ''}`.toLowerCase();
    const matchesSearch = memberName.includes(searchQuery.toLowerCase());
    const matchesFilter = paymentFilter === 'all' || payment.status === paymentFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredSalaries = salaries.filter((salary) => {
    const userName = `${salary.user?.firstName || ''} ${salary.user?.lastName || ''}`.toLowerCase();
    const matchesSearch = userName.includes(searchQuery.toLowerCase());
    const matchesType = salaryTypeFilter === 'all' || salary.type === salaryTypeFilter;
    const matchesStatus = salaryStatusFilter === 'all' || salary.status === salaryStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Reset member search when dialog opens
  const resetMemberSearch = () => {
    setMemberSearchQuery('');
    setSportCategoryFilter('All Sports');
  };

  // Handlers
  const handleCreatePayment = async () => {
    try {
      await createPayment.mutateAsync({
        memberId: paymentForm.memberId,
        amount: parseFloat(paymentForm.amount),
        type: paymentForm.type,
        method: paymentForm.method,
        status: paymentForm.status,
        date: paymentForm.date,
      });
      toast.success('Payment recorded successfully');
      setPaymentDialogOpen(false);
      resetPaymentForm();
    } catch {
      toast.error('Failed to record payment');
    }
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;
    try {
      await updatePayment.mutateAsync({
        id: editingPayment.id,
        status: paymentForm.status,
        amount: parseFloat(paymentForm.amount),
      });
      toast.success('Payment updated successfully');
      setPaymentDialogOpen(false);
      setEditingPayment(null);
      resetPaymentForm();
    } catch {
      toast.error('Failed to update payment');
    }
  };

  const handleCreateSalary = async () => {
    try {
      await createSalary.mutateAsync({
        userId: salaryForm.userId,
        amount: parseFloat(salaryForm.amount),
        type: salaryForm.type,
        status: salaryForm.status,
        month: `${salaryForm.month}-01`,
        bonus: parseFloat(salaryForm.bonus) || 0,
        deductions: parseFloat(salaryForm.deductions) || 0,
        notes: salaryForm.notes || null,
      });
      toast.success('Salary recorded successfully');
      setSalaryDialogOpen(false);
      resetSalaryForm();
    } catch {
      toast.error('Failed to record salary');
    }
  };

  const handleUpdateSalary = async () => {
    if (!editingSalary) return;
    try {
      await updateSalary.mutateAsync({
        id: editingSalary.id,
        status: salaryForm.status,
        amount: parseFloat(salaryForm.amount),
        bonus: parseFloat(salaryForm.bonus) || 0,
        deductions: parseFloat(salaryForm.deductions) || 0,
        notes: salaryForm.notes || null,
      });
      toast.success('Salary updated successfully');
      setSalaryDialogOpen(false);
      setEditingSalary(null);
      resetSalaryForm();
    } catch {
      toast.error('Failed to update salary');
    }
  };

  const handleCreateExpense = async () => {
    try {
      await createExpense.mutateAsync({
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        date: expenseForm.date,
      });
      toast.success('Expense recorded successfully');
      setExpenseDialogOpen(false);
      resetExpenseForm();
    } catch {
      toast.error('Failed to record expense');
    }
  };

  const handleCreateSponsor = async () => {
    try {
      await createSponsor.mutateAsync({
        name: sponsorForm.name,
        amount: parseFloat(sponsorForm.amount),
        tier: sponsorForm.tier,
        status: sponsorForm.status,
        startDate: sponsorForm.startDate,
        endDate: sponsorForm.endDate,
        logo: null,
      });
      toast.success('Sponsor added successfully');
      setSponsorDialogOpen(false);
      resetSponsorForm();
    } catch {
      toast.error('Failed to add sponsor');
    }
  };

  const handleUpdateSponsor = async () => {
    if (!editingSponsor) return;
    try {
      await updateSponsor.mutateAsync({
        id: editingSponsor.id,
        name: sponsorForm.name,
        amount: parseFloat(sponsorForm.amount),
        tier: sponsorForm.tier,
        status: sponsorForm.status,
        startDate: sponsorForm.startDate,
        endDate: sponsorForm.endDate,
      });
      toast.success('Sponsor updated successfully');
      setSponsorDialogOpen(false);
      setEditingSponsor(null);
      resetSponsorForm();
    } catch {
      toast.error('Failed to update sponsor');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      switch (deleteTarget.type) {
        case 'payment':
          await deletePayment.mutateAsync(deleteTarget.id);
          break;
        case 'salary':
          await deleteSalary.mutateAsync(deleteTarget.id);
          break;
        case 'expense':
          await deleteExpense.mutateAsync(deleteTarget.id);
          break;
        case 'sponsor':
          await deleteSponsor.mutateAsync(deleteTarget.id);
          break;
      }
      toast.success(`${deleteTarget.type} deleted successfully`);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch {
      toast.error(`Failed to delete ${deleteTarget.type}`);
    }
  };

  // Reset functions
  const resetPaymentForm = () => {
    setPaymentForm({
      memberId: '',
      amount: '',
      type: 'Salary',
      method: 'BankTransfer',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    });
    resetMemberSearch();
  };

  const resetSalaryForm = () => {
    setSalaryForm({
      userId: '',
      amount: '',
      type: 'Player',
      status: 'Pending',
      month: new Date().toISOString().slice(0, 7),
      bonus: '0',
      deductions: '0',
      notes: '',
    });
    resetMemberSearch();
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '',
      amount: '',
      category: 'Equipment',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const resetSponsorForm = () => {
    setSponsorForm({
      name: '',
      amount: '',
      tier: 'Bronze',
      status: 'Pending',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  // Edit handlers
  const openEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      memberId: payment.memberId,
      amount: payment.amount.toString(),
      type: payment.type === 'Membership' ? 'Salary' : payment.type as any,
      method: payment.method,
      status: payment.status,
      date: new Date(payment.date).toISOString().split('T')[0],
    });
    setPaymentDialogOpen(true);
  };

  const openEditSalary = (salary: Salary) => {
    setEditingSalary(salary);
    setSalaryForm({
      userId: salary.userId,
      amount: salary.amount.toString(),
      type: salary.type,
      status: salary.status,
      month: new Date(salary.month).toISOString().slice(0, 7),
      bonus: (salary.bonus || 0).toString(),
      deductions: (salary.deductions || 0).toString(),
      notes: salary.notes || '',
    });
    setSalaryDialogOpen(true);
  };

  const openEditSponsor = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setSponsorForm({
      name: sponsor.name,
      amount: sponsor.amount.toString(),
      tier: sponsor.tier,
      status: sponsor.status,
      startDate: new Date(sponsor.startDate).toISOString().split('T')[0],
      endDate: new Date(sponsor.endDate).toISOString().split('T')[0],
    });
    setSponsorDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMonth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  // Get selected member name for display
  const getSelectedMemberName = (userId: string) => {
    const member = members.find((m: any) => m.userId === userId);
    if (member) {
      return `${member.user?.firstName || ''} ${member.user?.lastName || ''}`;
    }
    return '';
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Member Selection Component (reusable)
  const MemberSelector = ({ 
    value, 
    onChange, 
    label = "Select Member" 
  }: { 
    value: string; 
    onChange: (v: string) => void;
    label?: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {/* Sport Category Filter */}
        <Select value={sportCategoryFilter} onValueChange={setSportCategoryFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by Sport" />
          </SelectTrigger>
          <SelectContent>
            {SPORT_CATEGORIES.map((sport) => (
              <SelectItem key={sport} value={sport}>
                {sport}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={memberSearchQuery}
            onChange={(e) => setMemberSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Member List */}
        <ScrollArea className="h-[200px] border rounded-md">
          <div className="p-2 space-y-1">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No members found
              </div>
            ) : (
              filteredMembers.map((member: any) => (
                <div
                  key={member.userId}
                  onClick={() => onChange(member.userId)}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                    value === member.userId 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-secondary'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.user?.firstName} {member.user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.speciality || 'No sport'} • {member.user?.role || 'Athlete'}
                    </p>
                  </div>
                  {member.baseSalary && (
                    <span className="text-xs font-medium text-green-600">
                      ${member.baseSalary.toLocaleString()}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        {/* Selected Display */}
        {value && (
          <div className="text-sm text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{getSelectedMemberName(value)}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Finance</h2>
          <p className="text-muted-foreground">Manage payments, salaries, expenses, and sponsorships</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setPaymentDialogOpen(true)} className="bg-accent hover:bg-accent/90">
            <DollarSign className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.revenue.total || 0).toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
          variant="accent"
        />
        <StatCard
          title="Pending Payments"
          value={`$${(stats?.revenue.pending || 0).toLocaleString()}`}
          icon={CreditCard}
        />
        <StatCard
          title="Salaries Pending"
          value={`$${(stats?.salaries.pending || 0).toLocaleString()}`}
          icon={Users}
        />
        <StatCard
          title="Monthly Expenses"
          value={`$${(stats?.expenses.monthly || 0).toLocaleString()}`}
          icon={TrendingDown}
        />
        <StatCard
          title="Sponsorships"
          value={`$${(stats?.sponsorships.totalAmount || 0).toLocaleString()}`}
          icon={Building2}
          variant="primary"
        />
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Revenue vs Expenses (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.monthlyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="hsl(var(--destructive))"
                fill="hsl(var(--destructive))"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="salaries">Salaries</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search payments..."
              className="flex-1 max-w-md"
            />
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Payments</CardTitle>
              <Button size="sm" onClick={() => setPaymentDialogOpen(true)} className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment
              </Button>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No payments found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.member?.firstName} {payment.member?.lastName}
                        </TableCell>
                        <TableCell>{payment.type}</TableCell>
                        <TableCell className="font-semibold">${payment.amount.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditPayment(payment)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setDeleteTarget({ 
                                type: 'payment', 
                                id: payment.id, 
                                name: `${payment.member?.firstName}'s payment` 
                              });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salaries Tab */}
        <TabsContent value="salaries" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search salaries..."
              className="flex-1 max-w-md"
            />
            <Select value={salaryTypeFilter} onValueChange={setSalaryTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Player">Player</SelectItem>
                <SelectItem value="Coach">Coach</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            <Select value={salaryStatusFilter} onValueChange={setSalaryStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Salary Records</CardTitle>
              <Button size="sm" onClick={() => setSalaryDialogOpen(true)} className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Salary
              </Button>
            </CardHeader>
            <CardContent>
              {salariesLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredSalaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No salary records found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Base Salary</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSalaries.map((salary) => {
                      const net = salary.amount + (salary.bonus || 0) - (salary.deductions || 0);
                      return (
                        <TableRow key={salary.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {salary.user?.firstName?.[0]}{salary.user?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p>{salary.user?.firstName} {salary.user?.lastName}</p>
                                <p className="text-xs text-muted-foreground">{salary.user?.role}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={salary.type} />
                          </TableCell>
                          <TableCell>{formatMonth(salary.month)}</TableCell>
                          <TableCell>${salary.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-green-600">+${(salary.bonus || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-red-600">-${(salary.deductions || 0).toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">${net.toLocaleString()}</TableCell>
                          <TableCell>
                            <StatusBadge status={salary.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEditSalary(salary)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setDeleteTarget({ 
                                  type: 'salary', 
                                  id: salary.id, 
                                  name: `${salary.user?.firstName}'s salary` 
                                });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Expense Records</CardTitle>
              <Button size="sm" onClick={() => setExpenseDialogOpen(true)} className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No expenses found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>
                          <StatusBadge status={expense.category} />
                        </TableCell>
                        <TableCell className="font-semibold text-red-600">
                          -${expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setDeleteTarget({ 
                                type: 'expense', 
                                id: expense.id, 
                                name: expense.description 
                              });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sponsors Tab */}
        <TabsContent value="sponsors" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setSponsorDialogOpen(true)} className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Sponsor
            </Button>
          </div>
          
          {sponsorsLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : sponsors.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sponsors yet</h3>
                <p className="text-muted-foreground mb-4">Add your first sponsor to get started</p>
                <Button onClick={() => setSponsorDialogOpen(true)} className="bg-accent hover:bg-accent/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sponsor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsors.map((sponsor) => (
                <Card key={sponsor.id} className="border-0 shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={sponsor.tier} />
                        <Button variant="ghost" size="icon" onClick={() => openEditSponsor(sponsor)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setDeleteTarget({ type: 'sponsor', id: sponsor.id, name: sponsor.name });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{sponsor.name}</h3>
                      <StatusBadge status={sponsor.status} className="mt-1" />
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-2xl font-bold text-accent">${sponsor.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Annual sponsorship</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Start: {formatDate(sponsor.startDate)}</p>
                      <p>End: {formatDate(sponsor.endDate)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={(open) => {
        setPaymentDialogOpen(open);
        if (!open) {
          setEditingPayment(null);
          resetPaymentForm();
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPayment ? 'Edit Payment' : 'Record Payment'}</DialogTitle>
            <DialogDescription>
              {editingPayment ? 'Update payment details' : 'Record a salary payment to a member'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editingPayment && (
              <MemberSelector
                value={paymentForm.memberId}
                onChange={(v) => setPaymentForm({ ...paymentForm, memberId: v })}
                label="Select Member to Pay"
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={paymentForm.type} onValueChange={(v: 'Salary' | 'Training' | 'Event' | 'Equipment') => setPaymentForm({ ...paymentForm, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salary">Salary</SelectItem>
                    <SelectItem value="Training">Training Bonus</SelectItem>
                    <SelectItem value="Event">Event Bonus</SelectItem>
                    <SelectItem value="Equipment">Equipment Allowance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={paymentForm.method} onValueChange={(v: 'Card' | 'Cash' | 'BankTransfer') => setPaymentForm({ ...paymentForm, method: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={paymentForm.status} onValueChange={(v: 'Paid' | 'Pending' | 'Overdue') => setPaymentForm({ ...paymentForm, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={editingPayment ? handleUpdatePayment : handleCreatePayment}
              disabled={createPayment.isPending || updatePayment.isPending || (!editingPayment && !paymentForm.memberId)}
              className="bg-accent hover:bg-accent/90"
            >
              {editingPayment ? 'Update' : 'Record'} Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Salary Dialog */}
      <Dialog open={salaryDialogOpen} onOpenChange={(open) => {
        setSalaryDialogOpen(open);
        if (!open) {
          setEditingSalary(null);
          resetSalaryForm();
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSalary ? 'Edit Salary' : 'Add Salary Record'}</DialogTitle>
            <DialogDescription>
              {editingSalary ? 'Update salary details' : 'Record monthly salary for an employee'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editingSalary && (
              <MemberSelector
                value={salaryForm.userId}
                onChange={(v) => setSalaryForm({ ...salaryForm, userId: v })}
                label="Select Employee"
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={salaryForm.type} onValueChange={(v: 'Player' | 'Coach' | 'Staff' | 'Manager') => setSalaryForm({ ...salaryForm, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Player">Player</SelectItem>
                    <SelectItem value="Coach">Coach</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Month</Label>
                <Input
                  type="month"
                  value={salaryForm.month}
                  onChange={(e) => setSalaryForm({ ...salaryForm, month: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Base Salary</Label>
                <Input
                  type="number"
                  value={salaryForm.amount}
                  onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Bonus</Label>
                <Input
                  type="number"
                  value={salaryForm.bonus}
                  onChange={(e) => setSalaryForm({ ...salaryForm, bonus: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Deductions</Label>
                <Input
                  type="number"
                  value={salaryForm.deductions}
                  onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={salaryForm.status} onValueChange={(v: 'Paid' | 'Pending' | 'Overdue') => setSalaryForm({ ...salaryForm, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                value={salaryForm.notes}
                onChange={(e) => setSalaryForm({ ...salaryForm, notes: e.target.value })}
                placeholder="Any additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSalaryDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={editingSalary ? handleUpdateSalary : handleCreateSalary}
              disabled={createSalary.isPending || updateSalary.isPending || (!editingSalary && !salaryForm.userId)}
              className="bg-accent hover:bg-accent/90"
            >
              {editingSalary ? 'Update' : 'Record'} Salary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={expenseDialogOpen} onOpenChange={(open) => {
        setExpenseDialogOpen(open);
        if (!open) resetExpenseForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
            <DialogDescription>Add a new expense record</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="Expense description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={expenseForm.category} onValueChange={(v) => setExpenseForm({ ...expenseForm, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Facility">Facility</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateExpense}
              disabled={createExpense.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              Record Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sponsor Dialog */}
      <Dialog open={sponsorDialogOpen} onOpenChange={(open) => {
        setSponsorDialogOpen(open);
        if (!open) {
          setEditingSponsor(null);
          resetSponsorForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSponsor ? 'Edit Sponsor' : 'Add Sponsor'}</DialogTitle>
            <DialogDescription>
              {editingSponsor ? 'Update sponsor details' : 'Add a new sponsorship deal'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sponsor Name</Label>
              <Input
                value={sponsorForm.name}
                onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                placeholder="Company name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (Annual)</Label>
                <Input
                  type="number"
                  value={sponsorForm.amount}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={sponsorForm.tier} onValueChange={(v: 'Gold' | 'Silver' | 'Bronze') => setSponsorForm({ ...sponsorForm, tier: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={sponsorForm.startDate}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={sponsorForm.endDate}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={sponsorForm.status} onValueChange={(v: 'Active' | 'Pending' | 'Expired') => setSponsorForm({ ...sponsorForm, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSponsorDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={editingSponsor ? handleUpdateSponsor : handleCreateSponsor}
              disabled={createSponsor.isPending || updateSponsor.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              {editingSponsor ? 'Update' : 'Add'} Sponsor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deletePayment.isPending || deleteSalary.isPending || deleteExpense.isPending || deleteSponsor.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
