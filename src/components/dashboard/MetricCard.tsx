import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'bg-card',
  primary: 'bg-primary/5 border-primary/20',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-orange-50 border-orange-200',
  danger: 'bg-red-50 border-red-200',
};

const iconVariantStyles = {
  default: 'bg-secondary text-primary',
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-orange-100 text-orange-600',
  danger: 'bg-red-100 text-red-600',
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-5 border shadow-card hover:shadow-card-hover transition-shadow',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-xs font-medium mt-1',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg',
            iconVariantStyles[variant]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
