import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'Active' | 'Inactive' | 'Pending' | 'Paid' | 'Overdue' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled' | 'Scheduled' | 'Expired' | 'Gold' | 'Silver' | 'Bronze';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  Active: 'bg-success/10 text-success border-success/20',
  Inactive: 'bg-muted text-muted-foreground border-muted',
  Pending: 'bg-warning/10 text-warning border-warning/20',
  Paid: 'bg-success/10 text-success border-success/20',
  Overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  Upcoming: 'bg-primary/10 text-primary border-primary/20',
  Ongoing: 'bg-accent/10 text-accent border-accent/20',
  Completed: 'bg-muted text-muted-foreground border-muted',
  Cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  Scheduled: 'bg-primary/10 text-primary border-primary/20',
  Expired: 'bg-muted text-muted-foreground border-muted',
  Gold: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  Silver: 'bg-gray-400/10 text-gray-600 border-gray-400/20',
  Bronze: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-medium', statusStyles[status], className)}>
      {status}
    </Badge>
  );
}
