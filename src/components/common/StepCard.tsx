import { LucideIcon } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface StepCardProps {
  title: string;
  description: React.ReactNode;
  icon?: LucideIcon;
  compact?: boolean;
}

export function StepCard({ title, description, icon: Icon, compact }: StepCardProps) {
  return (
    <div className={cn('bg-white rounded-lg border border-border shadow-sm p-4', compact ? 'p-3' : 'p-4')}>
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/40">
          {Icon ? <Icon className="w-5 h-5 text-muted-foreground" /> : <div />}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <div className="text-xs text-muted-foreground mt-1">{description}</div>
        </div>
      </div>
    </div>
  );
}
