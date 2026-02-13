import { cn } from '@/lib/utils';

export type PSStatus = 'draft' | 'submitted' | 'pending_review' | 'approved' | 'revision_needed';

interface StatusBadgeProps {
  status: PSStatus;
}

const statusConfig: Record<PSStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-blue-100 text-blue-700',
  },
  pending_review: {
    label: 'Submitted / Pending Approval',
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
