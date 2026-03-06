import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Timer,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { differenceInDays, parseISO, intervalToDuration } from 'date-fns';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertItem, DashboardMetrics } from '@/types/app';
import { useAuth } from '@/contexts/AuthContext';

interface AlertRow {
  id: string;
  type: AlertItem['type'];
  title: string;
  description: string;
  created_at: string;
  priority: AlertItem['priority'];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPrepared: 0,
    submittedToInstitution: 0,
    pendingReview: 0,
    approved: 0,
    revisionNeeded: 0,
    deadlineDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
  });

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.department?.id) {
        setAlerts([]);
        setMetrics((prev) => ({
          ...prev,
          totalPrepared: 0,
          submittedToInstitution: 0,
          pendingReview: 0,
          approved: 0,
          revisionNeeded: 0,
        }));
        return;
      }

      const [{ data: psData }, { data: alertData }] = await Promise.all([
        supabase
          .from('problem_statements')
          .select('status')
          .eq('department_id', user.department.id)
          .order('last_updated', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('problem_statement_alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const mappedAlerts: AlertItem[] = ((alertData ?? []) as AlertRow[]).map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        timestamp: a.created_at,
        priority: a.priority,
      }));

      setAlerts(mappedAlerts);

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
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Overview of your department's problem statement activity
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
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

        <div className="w-full">
          <AlertsPanel alerts={alerts} />
        </div>
      </div>
    </DashboardLayout>
  );
}
