import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Timer,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardMetrics } from '@/types/app';
import { useAuth } from '@/contexts/AuthContext';
import { useSubmissionWindow } from '@/hooks/useSubmissionWindow';

export default function DashboardPage() {
  const { user } = useAuth();
  const submissionWindow = useSubmissionWindow();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPrepared: 0,
    pendingReview: 0,
    approved: 0,
    revisionNeeded: 0,
    deadlineDate: '',
  });

  useEffect(() => {
    const loadDashboard = async () => {
      if (submissionWindow.isBeforeWindow) {
        return;
      }

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
  }, [submissionWindow.isBeforeWindow, user?.department?.id]);

  const closesAt = submissionWindow.closeAtIso ? new Date(submissionWindow.closeAtIso) : null;
  const unlockAt = submissionWindow.unlockAtIso ? new Date(submissionWindow.unlockAtIso) : null;
  const closesAtDate = closesAt ? closesAt.toLocaleDateString() : 'Not configured';
  const unlockAtDate = unlockAt ? unlockAt.toLocaleDateString() : 'Not configured';

  const deadlineCardTitle = submissionWindow.isClosed
    ? 'Submission Window'
    : submissionWindow.isBeforeWindow
      ? 'Unlock Date'
      : 'Close Date';
  const deadlineCardValue = submissionWindow.isClosed
    ? 'Closed'
    : submissionWindow.isBeforeWindow
      ? unlockAtDate
      : closesAtDate;
  const deadlineCardSubtitle = submissionWindow.isClosed
    ? `CLOSED ON ${closesAtDate}`
    : 'SUBMISSION WINDOW';

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        {submissionWindow.isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading submission window...
          </div>
        ) : submissionWindow.fetchError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            Failed to load contest settings: {submissionWindow.fetchError}
          </div>
        ) : submissionWindow.isBeforeWindow ? (
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Dashboard Locked</h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Department dashboard unlocks when the submission window opens.
            </p>
            <div className="mt-5 inline-flex rounded-lg bg-primary px-4 py-3 text-primary-foreground">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-90">Opens In</p>
                <p className="text-lg sm:text-xl font-semibold">{submissionWindow.unlockCountdown}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>Unlocks at: {submissionWindow.unlockLabel}</p>
              <p>Closes at: {submissionWindow.closeLabel}</p>
            </div>
          </section>
        ) : (
          <>
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
              title={deadlineCardTitle}
              value={deadlineCardValue}
              subtitle={deadlineCardSubtitle}
              icon={Timer}
              variant={submissionWindow.isClosed || submissionWindow.isNearingClose ? 'danger' : 'default'}
            />
          </div>
        </section>
        <div className="h-2 sm:h-3" />
        <div className="text-xs text-muted-foreground">
          Statuses are refreshed from your department problem statements.
        </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
