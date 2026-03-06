import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Timer,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { differenceInDays, parseISO, intervalToDuration } from 'date-fns';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardMetrics } from '@/types/app';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPrepared: 0,
    pendingReview: 0,
    approved: 0,
    revisionNeeded: 0,
    deadlineDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
  });

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.department?.id) {
        setMetrics((prev) => ({
          ...prev,
          totalPrepared: 0,
          pendingReview: 0,
          approved: 0,
          revisionNeeded: 0,
        }));
        return;
      }

      const { data: psData } = await supabase
        .from('problem_statements')
        .select('status')
        .eq('department_id', user.department.id)
        .order('last_updated', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      const statusRows = (psData ?? []) as Array<{ status?: string | null }>;
      const normalizedStatuses = statusRows.map((ps) => {
        if (ps.status === 'approved' || ps.status === 'revision_needed') return ps.status;
        return 'pending_review';
      });
      const totalPrepared = statusRows.length;
      const pendingReview = normalizedStatuses.filter((status) => status === 'pending_review').length;
      const approved = normalizedStatuses.filter((status) => status === 'approved').length;
      const revisionNeeded = normalizedStatuses.filter((status) => status === 'revision_needed').length;

      setMetrics((prev) => ({
        ...prev,
        totalPrepared,
        pendingReview,
        approved,
        revisionNeeded,
      }));
    };

    void loadDashboard();
  }, [user?.department?.id]);

  const deadlineDate = parseISO(metrics.deadlineDate);
  const now = new Date();
  const isPast = deadlineDate < now;
  const daysLeft = differenceInDays(deadlineDate, now);
  const isClose = !isPast && daysLeft < 3;
  const rawDuration = intervalToDuration({ start: isPast ? deadlineDate : now, end: isPast ? now : deadlineDate });
  const formattedDeadline = `${rawDuration.days ?? 0}d ${String(rawDuration.hours ?? 0).padStart(2, '0')}h ${String(
    rawDuration.minutes ?? 0
  ).padStart(2, '0')}m`;

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5">
            Overview of your department's problem statement activity
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-card/40 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Performance Snapshot</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <MetricCard title="Total Prepared" value={metrics.totalPrepared} icon={FileText} />
            <MetricCard title="Pending Review" value={metrics.pendingReview} icon={Clock} variant="warning" />
            <MetricCard title="Approved" value={metrics.approved} icon={CheckCircle} variant="success" />
            <MetricCard title="Revision Needed" value={metrics.revisionNeeded} icon={AlertTriangle} variant="danger" />
            <MetricCard
              title="Days Left"
              value={formattedDeadline}
              subtitle="DEADLINE"
              icon={Timer}
              variant={isPast ? 'danger' : isClose ? 'danger' : 'default'}
            />
          </div>
        </section>
        <div className="h-2 sm:h-3" />
        <div className="text-xs text-muted-foreground">
          Statuses are refreshed from your department problem statements.
        </div>
      </div>
    </DashboardLayout>
  );
}
