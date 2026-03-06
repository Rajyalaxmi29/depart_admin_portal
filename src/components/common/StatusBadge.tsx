import { cn } from '@/lib/utils';

export type PSStatus = 'pending_review' | 'approved' | 'revision_needed';

interface StatusBadgeProps {
  status: PSStatus;
}

const statusConfig: Record<PSStatus, { label: string; className: string }> = {
  pending_review: {
    label: 'Pending Approval',
    className: 'bg-yellow-100 text-yellow-700',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700',
  },
  revision_needed: {
    label: 'Revision Needed',
    className: 'bg-orange-100 text-orange-700',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
