import { useState, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, CreditCard, Building2, Filter, 
  Plus, Users, Edit, Trash2, Search, Wallet, PiggyBank, Receipt, 
  ArrowUpRight, ArrowDownRight, Sparkles, BadgeDollarSign, ChevronLeft, ChevronRight
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
import { Member } from '@/types/api';

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

const ITEMS_PER_PAGE = 10;

export default function Finance() {
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [salaryTypeFilter, setSalaryTypeFilter] = useState<string>('all');
  const [salaryStatusFilter, setSalaryStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [salariesPage, setSalariesPage] = useState(1);
  const [expensesPage, setExpensesPage] = useState(1);
  const [sponsorsPage, setSponsorsPage] = useState(1);
  
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
  const members = useMemo(() => membersData?.members || [], [membersData?.members]);

  // Filter members by sport category and search query
  const filteredMembers = useMemo(() => {
    return members.filter((member: Member) => {
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
    type: 'Membership' as 'Membership' | 'Training' | 'Event' | 'Equipment',
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
    updateMemberSalary: true, // Sync with member's baseSalary
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

  // Filter functions with useMemo
  const filteredPayments = useMemo(() => payments.filter((payment) => {
    const memberName = `${payment.member?.firstName || ''} ${payment.member?.lastName || ''}`.toLowerCase();
    const matchesSearch = memberName.includes(searchQuery.toLowerCase());
    const matchesFilter = paymentFilter === 'all' || payment.status === paymentFilter;
    return matchesSearch && matchesFilter;
  }), [payments, searchQuery, paymentFilter]);

  const filteredSalaries = useMemo(() => salaries.filter((salary) => {
    const userName = `${salary.user?.firstName || ''} ${salary.user?.lastName || ''}`.toLowerCase();
    const matchesSearch = userName.includes(searchQuery.toLowerCase());
    const matchesType = salaryTypeFilter === 'all' || salary.type === salaryTypeFilter;
    const matchesStatus = salaryStatusFilter === 'all' || salary.status === salaryStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  }), [salaries, searchQuery, salaryTypeFilter, salaryStatusFilter]);

  const filteredExpenses = useMemo(() => expenses, [expenses]);
  const filteredSponsors = useMemo(() => sponsors, [sponsors]);

  // Pagination calculations
  const paymentsTotalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = useMemo(() => {
    const startIndex = (paymentsPage - 1) * ITEMS_PER_PAGE;
    return filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPayments, paymentsPage]);

  const salariesTotalPages = Math.ceil(filteredSalaries.length / ITEMS_PER_PAGE);
  const paginatedSalaries = useMemo(() => {
    const startIndex = (salariesPage - 1) * ITEMS_PER_PAGE;
    return filteredSalaries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSalaries, salariesPage]);

  const expensesTotalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (expensesPage - 1) * ITEMS_PER_PAGE;
    return filteredExpenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredExpenses, expensesPage]);

  const sponsorsTotalPages = Math.ceil(filteredSponsors.length / 6); // 6 sponsors per page (2x3 grid)
  const paginatedSponsors = useMemo(() => {
    const startIndex = (sponsorsPage - 1) * 6;
    return filteredSponsors.slice(startIndex, startIndex + 6);
  }, [filteredSponsors, sponsorsPage]);

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
        updateMemberSalary: salaryForm.updateMemberSalary,
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
        updateMemberSalary: salaryForm.updateMemberSalary,
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
      type: 'Membership',
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
      updateMemberSalary: true,
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
      type: payment.type,
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
      updateMemberSalary: false, // Don't update by default when editing
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
    const member = members.find((m: Member) => m.userId === userId);
    if (member) {
      return `${member.user?.firstName || ''} ${member.user?.lastName || ''}`;
    }
    return '';
  };

  // Auto-fill salary form when selecting a member
  const handleSalaryMemberSelect = (userId: string) => {
    const member = members.find((m: Member) => m.userId === userId);
    if (member) {
      // Map user role to salary type
      const roleToSalaryType: Record<string, 'Player' | 'Coach' | 'Staff' | 'Manager'> = {
        'Athlete': 'Player',
        'Coach': 'Coach',
        'Staff': 'Staff',
        'Manager': 'Manager',
        'Admin': 'Manager',
      };
      
      const salaryType = roleToSalaryType[member.user?.role] || 'Player';
      const baseSalary = member.baseSalary ? member.baseSalary.toString() : '';
      
      setSalaryForm(prev => ({
        ...prev,
        userId,
        type: salaryType,
        amount: baseSalary,
      }));
    } else {
      setSalaryForm(prev => ({ ...prev, userId }));
    }
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
              filteredMembers.map((member: Member) => (
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
      {/* Enhanced Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 p-6 md:p-8">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        
        {/* Floating Icons */}
        <div className="absolute top-4 right-4 opacity-10">
          <DollarSign className="w-24 h-24 text-emerald-500" />
        </div>
        <div className="absolute bottom-4 right-20 opacity-10">
          <PiggyBank className="w-16 h-16 text-teal-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg text-white">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Financial Dashboard</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Finance Management</h2>
            <p className="text-muted-foreground max-w-md">Track payments, salaries, expenses, and sponsorships all in one place</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setPaymentDialogOpen(true)} 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-600/5 border border-emerald-500/20 p-5 shadow-lg hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg text-white shadow-lg shadow-emerald-500/30">
                <BadgeDollarSign className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                <span>12.5%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${(stats?.revenue.total || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Pending Payments Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/20 p-5 shadow-lg hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg text-white shadow-lg shadow-amber-500/30">
                <CreditCard className="w-5 h-5" />
              </div>
              <Sparkles className="w-4 h-4 text-amber-500/60" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Pending Payments</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">${(stats?.revenue.pending || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Salaries Pending Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-600/5 border border-blue-500/20 p-5 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white shadow-lg shadow-blue-500/30">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Salaries Pending</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${(stats?.salaries.pending || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Monthly Expenses Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-600/5 border border-rose-500/20 p-5 shadow-lg hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg text-white shadow-lg shadow-rose-500/30">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-full">
                <ArrowDownRight className="w-3 h-3" />
                <span>Expense</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Monthly Expenses</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">${(stats?.expenses.monthly || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Sponsorships Card */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/5 border border-violet-500/20 p-5 shadow-lg hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg text-white shadow-lg shadow-violet-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-1 rounded-full">
                {stats?.sponsorships.activeCount || 0} Active
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Sponsorships</p>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">${(stats?.sponsorships.totalAmount || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card className="border border-border/50 shadow-lg bg-card/30 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg text-white shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg">Revenue vs Expenses</span>
              <p className="text-sm font-normal text-muted-foreground">Last 12 months financial overview</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.monthlyData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                fill="url(#revenueGradient)"
                strokeWidth={3}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#f43f5e"
                fill="url(#expenseGradient)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-muted/30 backdrop-blur-sm border border-border/50 p-1 rounded-xl">
          <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/30">
            <CreditCard className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="salaries" className="rounded-lg data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border data-[state=active]:border-blue-500/30">
            <Users className="w-4 h-4 mr-2" />
            Salaries
          </TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400 data-[state=active]:border data-[state=active]:border-rose-500/30">
            <Receipt className="w-4 h-4 mr-2" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="rounded-lg data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400 data-[state=active]:border data-[state=active]:border-violet-500/30">
            <Building2 className="w-4 h-4 mr-2" />
            Sponsors
          </TabsTrigger>
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
              <SelectTrigger className="w-[180px] bg-card border-border/50">
                <Filter className="w-4 h-4 mr-2 text-emerald-500" />
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

          <Card className="border border-emerald-500/20 shadow-lg bg-card/30 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                Recent Payments
              </CardTitle>
              <Button size="sm" onClick={() => setPaymentDialogOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {paymentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-muted-foreground">No payments found</p>
                </div>
              ) : (
                <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
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
                    {paginatedPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-emerald-500/5 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                              {payment.member?.firstName?.[0]}{payment.member?.lastName?.[0]}
                            </div>
                            {payment.member?.firstName} {payment.member?.lastName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600">
                            {payment.type}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-emerald-600">${payment.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(payment.date)}</TableCell>
                        <TableCell>
                          <span className="text-sm">{payment.method}</span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditPayment(payment)} className="hover:bg-emerald-500/10 hover:text-emerald-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-rose-500/10"
                            onClick={() => {
                              setDeleteTarget({ 
                                type: 'payment', 
                                id: payment.id, 
                                name: `${payment.member?.firstName}'s payment` 
                              });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
              )}

              {/* Payments Pagination */}
              {paymentsTotalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t px-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {((paymentsPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(paymentsPage * ITEMS_PER_PAGE, filteredPayments.length)} of {filteredPayments.length} payments
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentsPage(p => Math.max(1, p - 1))}
                      disabled={paymentsPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: paymentsTotalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={paymentsPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setPaymentsPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentsPage(p => Math.min(paymentsTotalPages, p + 1))}
                      disabled={paymentsPage === paymentsTotalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
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
              <SelectTrigger className="w-[150px] bg-card border-border/50">
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
              <SelectTrigger className="w-[150px] bg-card border-border/50">
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

          <Card className="border border-blue-500/20 shadow-lg bg-card/30 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                Salary Records
              </CardTitle>
              <Button size="sm" onClick={() => setSalaryDialogOpen(true)} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                <Plus className="w-4 h-4 mr-2" />
                Add Salary
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {salariesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : filteredSalaries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-muted-foreground">No salary records found</p>
                </div>
              ) : (
                <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
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
                    {paginatedSalaries.map((salary) => {
                      const net = salary.amount + (salary.bonus || 0) - (salary.deductions || 0);
                      return (
                        <TableRow key={salary.id} className="hover:bg-blue-500/5 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9 border-2 border-blue-500/20">
                                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                                  {salary.user?.firstName?.[0]}{salary.user?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{salary.user?.firstName} {salary.user?.lastName}</p>
                                <p className="text-xs text-muted-foreground">{salary.user?.role}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              salary.type === 'Coach' ? 'bg-blue-500/10 text-blue-600' :
                              salary.type === 'Player' ? 'bg-indigo-500/10 text-indigo-600' :
                              salary.type === 'Manager' ? 'bg-purple-500/10 text-purple-600' :
                              'bg-slate-500/10 text-slate-600'
                            }`}>
                              {salary.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatMonth(salary.month)}</TableCell>
                          <TableCell className="font-medium">${salary.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className="text-emerald-600 font-medium">+${(salary.bonus || 0).toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-rose-500 font-medium">-${(salary.deductions || 0).toLocaleString()}</span>
                          </TableCell>
                          <TableCell className="font-bold text-blue-600">${net.toLocaleString()}</TableCell>
                          <TableCell>
                            <StatusBadge status={salary.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEditSalary(salary)} className="hover:bg-blue-500/10 hover:text-blue-600">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="hover:bg-rose-500/10"
                              onClick={() => {
                                setDeleteTarget({ 
                                  type: 'salary', 
                                  id: salary.id, 
                                  name: `${salary.user?.firstName}'s salary` 
                                });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </>
              )}
                {/* Salaries Pagination */}
                {salariesTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t px-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {((salariesPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(salariesPage * ITEMS_PER_PAGE, filteredSalaries.length)} of {filteredSalaries.length} salaries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSalariesPage(p => Math.max(1, p - 1))}
                        disabled={salariesPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: salariesTotalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={salariesPage === page ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setSalariesPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSalariesPage(p => Math.min(salariesTotalPages, p + 1))}
                        disabled={salariesPage === salariesTotalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card className="border border-rose-500/20 shadow-lg bg-card/30 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-rose-500/10 to-pink-500/10">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-500/20 rounded-lg">
                  <Receipt className="w-4 h-4 text-rose-600" />
                </div>
                Expense Records
              </CardTitle>
              <Button size="sm" onClick={() => setExpenseDialogOpen(true)} className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {expensesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-8 h-8 text-rose-500" />
                  </div>
                  <p className="text-muted-foreground mb-4">No expenses found</p>
                  <Button onClick={() => setExpenseDialogOpen(true)} variant="outline" className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Expense
                  </Button>
                </div>
              ) : (
                <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedExpenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-rose-500/5 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white">
                              <TrendingDown className="w-4 h-4" />
                            </div>
                            {expense.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600">
                            {expense.category}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-rose-600">
                          -${expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(expense.date)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-rose-500/10"
                            onClick={() => {
                              setDeleteTarget({ 
                                type: 'expense', 
                                id: expense.id, 
                                name: expense.description 
                              });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </>
              )}
                {/* Expenses Pagination */}
                {expensesTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t px-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {((expensesPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(expensesPage * ITEMS_PER_PAGE, filteredExpenses.length)} of {filteredExpenses.length} expenses
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpensesPage(p => Math.max(1, p - 1))}
                        disabled={expensesPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: expensesTotalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={expensesPage === page ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setExpensesPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpensesPage(p => Math.min(expensesTotalPages, p + 1))}
                        disabled={expensesPage === expensesTotalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sponsors Tab */}
        <TabsContent value="sponsors" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setSponsorDialogOpen(true)} className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25">
              <Plus className="w-4 h-4 mr-2" />
              Add Sponsor
            </Button>
          </div>
          
          {sponsorsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto"></div>
            </div>
          ) : sponsors.length === 0 ? (
            <Card className="border border-violet-500/20 shadow-lg bg-gradient-to-br from-violet-500/5 to-purple-500/5 overflow-hidden backdrop-blur-sm">
              <CardContent className="py-16 text-center relative">
                <div className="absolute top-4 right-4 opacity-10">
                  <Building2 className="w-32 h-32 text-violet-500" />
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/30">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">No sponsors yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Partner with sponsors to grow your club's reach and funding</p>
                <Button onClick={() => setSponsorDialogOpen(true)} className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Sponsor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedSponsors.map((sponsor) => (
                <Card key={sponsor.id} className={`border shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm ${
                  sponsor.tier === 'Gold' ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/20 hover:shadow-amber-500/20' :
                  sponsor.tier === 'Silver' ? 'bg-gradient-to-br from-slate-400/10 to-gray-500/5 border-slate-400/20 hover:shadow-slate-400/20' :
                  'bg-gradient-to-br from-amber-700/10 to-orange-800/5 border-amber-700/20 hover:shadow-amber-700/20'
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                        sponsor.tier === 'Gold' ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-400/30' :
                        sponsor.tier === 'Silver' ? 'bg-gradient-to-br from-slate-300 to-gray-400 shadow-slate-300/30' :
                        'bg-gradient-to-br from-amber-600 to-orange-700 shadow-amber-600/30'
                      }`}>
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          sponsor.tier === 'Gold' ? 'bg-amber-500/20 text-amber-600' :
                          sponsor.tier === 'Silver' ? 'bg-slate-400/20 text-slate-600' :
                          'bg-amber-700/20 text-amber-700'
                        }`}>
                          {sponsor.tier}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => openEditSponsor(sponsor)} className="hover:bg-violet-500/10 hover:text-violet-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="hover:bg-rose-500/10"
                          onClick={() => {
                            setDeleteTarget({ type: 'sponsor', id: sponsor.id, name: sponsor.name });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-bold text-xl">{sponsor.name}</h3>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        sponsor.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' :
                        sponsor.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-rose-500/10 text-rose-600'
                      }`}>
                        {sponsor.status}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-border/50">
                      <p className={`text-3xl font-bold ${
                        sponsor.tier === 'Gold' ? 'text-amber-500' :
                        sponsor.tier === 'Silver' ? 'text-slate-500' :
                        'text-amber-700'
                      }`}>${sponsor.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Annual sponsorship</p>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
                      <span>📅 {formatDate(sponsor.startDate)}</span>
                      <span>→ {formatDate(sponsor.endDate)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>

              {/* Sponsors Pagination */}
              {sponsorsTotalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((sponsorsPage - 1) * 6) + 1} to {Math.min(sponsorsPage * 6, filteredSponsors.length)} of {filteredSponsors.length} sponsors
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSponsorsPage(p => Math.max(1, p - 1))}
                      disabled={sponsorsPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: sponsorsTotalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={sponsorsPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setSponsorsPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSponsorsPage(p => Math.min(sponsorsTotalPages, p + 1))}
                      disabled={sponsorsPage === sponsorsTotalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
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
                <Select value={paymentForm.type} onValueChange={(v: 'Membership' | 'Training' | 'Event' | 'Equipment') => setPaymentForm({ ...paymentForm, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Membership">Membership</SelectItem>
                    <SelectItem value="Training">Training Fee</SelectItem>
                    <SelectItem value="Event">Event Fee</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
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
              {editingSalary ? 'Update salary details' : 'Record monthly salary for an employee (auto-fills from member base salary)'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editingSalary && (
              <MemberSelector
                value={salaryForm.userId}
                onChange={handleSalaryMemberSelect}
                label="Select Employee"
              />
            )}
            {/* Show hint when member is selected and has base salary */}
            {!editingSalary && salaryForm.userId && salaryForm.amount && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm">
                <span className="text-blue-600 dark:text-blue-400">💡 Base salary auto-filled from member profile</span>
              </div>
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
            {/* Sync with member profile option */}
            <div className="flex items-center space-x-2 p-3 bg-secondary/50 rounded-lg">
              <input
                type="checkbox"
                id="updateMemberSalary"
                checked={salaryForm.updateMemberSalary}
                onChange={(e) => setSalaryForm({ ...salaryForm, updateMemberSalary: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="updateMemberSalary" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Update member's base salary in profile
              </label>
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
