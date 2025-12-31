import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'accent' | 'primary';
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, variant = 'default', className }: StatCardProps) {
  const variants = {
    default: 'bg-card',
    accent: 'bg-gradient-to-br from-accent to-accent/80 text-accent-foreground',
    primary: 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
  };

  const iconVariants = {
    default: 'bg-secondary text-primary',
    accent: 'bg-white/20 text-accent-foreground',
    primary: 'bg-white/20 text-primary-foreground',
  };

  const trendTextVariant = variant === 'default' ? '' : 'text-white/80';

  return (
    <Card className={cn('card-hover border-0 shadow-md', variants[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={cn('text-sm font-medium', variant === 'default' ? 'text-muted-foreground' : 'opacity-80')}>
              {title}
            </p>
            <p className="text-3xl font-bold animate-count">{value}</p>
            {trend && (
              <p className={cn('text-sm', trendTextVariant, trend.isPositive ? 'text-success' : 'text-destructive')}>
                {trend.isPositive ? '+' : ''}{trend.value}% from last month
              </p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', iconVariants[variant])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
