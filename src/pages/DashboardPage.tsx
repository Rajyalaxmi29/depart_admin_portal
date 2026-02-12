import {
  FileText,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  Timer,
  Eye,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { differenceInDays, parseISO, intervalToDuration } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertItem, DashboardMetrics, ProblemStatement } from '@/types/app';
import { mapProblemStatement } from '@/lib/problemStatements';

interface AlertRow {
  id: string;
  type: AlertItem['type'];
  title: string;
  description: string;
  created_at: string;
  priority: AlertItem['priority'];
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
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
      const [{ data: psData }, { data: alertData }] = await Promise.all([
        supabase
          .from('problem_statements')
          .select('*')
          .order('last_updated', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('problem_statement_alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const mappedPS = (psData ?? []).map(mapProblemStatement);
      const mappedAlerts: AlertItem[] = ((alertData ?? []) as AlertRow[]).map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        timestamp: a.created_at,
        priority: a.priority,
      }));

      setProblemStatements(mappedPS);
      setAlerts(mappedAlerts);

      const totalPrepared = mappedPS.length;
      const submittedToInstitution = mappedPS.filter((ps) => ['submitted', 'pending_review', 'approved', 'revision_needed'].includes(ps.status)).length;
      const pendingReview = mappedPS.filter((ps) => ps.status === 'pending_review').length;
      const approved = mappedPS.filter((ps) => ps.status === 'approved').length;
      const revisionNeeded = mappedPS.filter((ps) => ps.status === 'revision_needed').length;

      setMetrics((prev) => ({
        ...prev,
        totalPrepared,
        submittedToInstitution,
        pendingReview,
        approved,
        revisionNeeded,
      }));
    };

    void loadDashboard();
  }, []);

  const deadlineDate = parseISO(metrics.deadlineDate);
  const now = new Date();
  const isPast = deadlineDate < now;
  const daysLeft = differenceInDays(deadlineDate, now);
  const isClose = !isPast && daysLeft < 3;
  const rawDuration = intervalToDuration({ start: isPast ? deadlineDate : now, end: isPast ? now : deadlineDate });
  const formattedDeadline = `${rawDuration.days ?? 0}d ${String(rawDuration.hours ?? 0).padStart(2, '0')}h ${String(
    rawDuration.minutes ?? 0
  ).padStart(2, '0')}m`;

  const recentPS = useMemo(() => problemStatements.slice(0, 5), [problemStatements]);

  const columns = [
    {
      key: 'id',
      header: 'PS ID & Title',
      render: (ps: ProblemStatement) => (
        <div className="min-w-[150px]">
          <p className="text-xs text-muted-foreground">{ps.psCode}</p>
          <p className="font-medium text-foreground truncate">{ps.title}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category / Track',
      hideOnMobile: true,
      render: (ps: ProblemStatement) => (
        <div>
          <p className="font-medium text-foreground">{ps.category}</p>
          <p className="text-xs text-muted-foreground">{ps.theme}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (ps: ProblemStatement) => <StatusBadge status={ps.status} />,
    },
    {
      key: 'lastUpdated',
      header: 'Last Updated',
      hideOnMobile: true,
      render: (ps: ProblemStatement) => new Date(ps.lastUpdated).toLocaleDateString(),
    },
    {
      key: 'assignedSpoc',
      header: 'Assigned SPOC',
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/problem-statements')}
          className="text-primary hover:text-primary/80"
        >
          <Eye className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">View</span>
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Overview of your department's problem statement activity
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard title="Total Prepared" value={metrics.totalPrepared} icon={FileText} />
          <MetricCard title="Submitted" value={metrics.submittedToInstitution} icon={Send} variant="primary" />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Recent Problem Statements</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/problem-statements')}
                className="text-primary"
              >
                View All
              </Button>
            </div>
            <DataTable columns={columns} data={recentPS} keyExtractor={(ps) => ps.id} />
          </div>

          <div className="lg:col-span-1">
            <AlertsPanel alerts={alerts} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
