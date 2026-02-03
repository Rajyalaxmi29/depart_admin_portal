import { AlertCircle, Bell, CheckCircle, MessageSquare, Clock } from 'lucide-react';
import { Alert } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AlertsPanelProps {
  alerts: Alert[];
}

const alertIcons = {
  overdue: AlertCircle,
  reminder: Clock,
  message: MessageSquare,
  approval: CheckCircle,
};

const alertStyles = {
  overdue: 'border-l-red-500 bg-red-50',
  reminder: 'border-l-yellow-500 bg-yellow-50',
  message: 'border-l-blue-500 bg-blue-50',
  approval: 'border-l-green-500 bg-green-50',
};

const iconStyles = {
  overdue: 'text-red-500',
  reminder: 'text-yellow-600',
  message: 'text-blue-500',
  approval: 'text-green-500',
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Alerts & Reminders
      </h3>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.type];
          return (
            <div
              key={alert.id}
              className={cn(
                'p-3 rounded-lg border-l-4',
                alertStyles[alert.type]
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn('w-4 h-4 mt-0.5', iconStyles[alert.type])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
