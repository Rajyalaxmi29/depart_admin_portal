import { Clock, CheckCircle, Timer, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { differenceInDays, parseISO } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertItem, ProblemStatement } from '@/types/app';
import { mapProblemStatement } from '@/lib/problemStatements';
import { useAuth } from '@/contexts/AuthContext';

interface AlertRow {
  id: string;
  type: AlertItem['type'];
  title: string;
  description: string;
  created_at: string;
  priority: AlertItem['priority'];
}

interface ProblemStatementRawRow {
  submitted_at?: string | null;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [deadlineDate, setDeadlineDate] = useState(new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString());

  useEffect(() => {
    const loadData = async () => {
      if (!user?.department?.id) {
        setProblemStatements([]);
        setAlerts([]);
        return;
      }

      const [{ data: psData }, { data: alertData }] = await Promise.all([
        supabase
          .from('problem_statements')
          .select('*')
          .eq('department_id', user.department.id)
          .order('last_updated', { ascending: false, nullsFirst: false }),
        supabase
          .from('problem_statement_alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      setProblemStatements((psData ?? []).map(mapProblemStatement));
      setAlerts(
        ((alertData ?? []) as AlertRow[]).map((a) => ({
          id: a.id,
          type: a.type,
          title: a.title,
          description: a.description,
          timestamp: a.created_at,
          priority: a.priority,
        }))
      );

      const latestSubmission = ((psData ?? []) as ProblemStatementRawRow[])
        .map((ps) => ps.submitted_at)
        .filter(Boolean)
        .sort()
        .reverse()[0];

      if (latestSubmission) {
        const derived = new Date(new Date(latestSubmission).getTime() + 14 * 24 * 60 * 60 * 1000);
        setDeadlineDate(derived.toISOString());
      }
    };

    void loadData();
  }, [user?.department?.id]);

  const daysUntilDeadline = differenceInDays(parseISO(deadlineDate), new Date());

  const reviewablePS = useMemo(() => problemStatements.filter((ps) => ps.status !== 'draft'), [problemStatements]);
  const myReviewablePS = useMemo(
    () => reviewablePS.filter((ps) => ps.createdBy === user?.id),
    [reviewablePS, user?.id]
  );

  const pendingReview = myReviewablePS.filter((ps) => ps.status === 'pending_review').length;
  const approved = myReviewablePS.filter((ps) => ps.status === 'approved').length;
  const revisionNeeded = myReviewablePS.filter((ps) => ps.status === 'revision_needed').length;

  const columns = [
    {
      key: 'title',
      header: 'PS Title',
      render: (ps: ProblemStatement) => (
        <div className="min-w-[150px]">
          <p className="text-xs text-muted-foreground">{ps.psCode}</p>
          <p className="font-medium text-foreground truncate">{ps.title}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category / Theme',
      hideOnMobile: true,
      render: (ps: ProblemStatement) => (
        <div>
          <p className="font-medium text-foreground">{ps.category}</p>
          <p className="text-xs text-muted-foreground">{ps.theme}</p>
        </div>
      ),
    },
    {
      key: 'lastUpdated',
      header: 'Last Submission',
      hideOnMobile: true,
      render: (ps: ProblemStatement) => new Date(ps.lastUpdated).toLocaleDateString(),
    },
    {
      key: 'assignedSpoc',
      header: 'Assigned SPOC',
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (ps: ProblemStatement) => <StatusBadge status={ps.status} />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Reviews & Approvals</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track the review status of your submitted problem statements
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard title="Pending Review" value={pendingReview} icon={Clock} variant="warning" />
          <MetricCard title="Approved" value={approved} icon={CheckCircle} variant="success" />
          <MetricCard
            title="Current Deadline"
            value={<div><p className="text-2xl font-bold">{Math.max(0, daysUntilDeadline)} Days</p></div>}
            icon={Timer}
            variant="default"
          />
          <MetricCard title="Revision Needed" value={revisionNeeded} icon={AlertTriangle} variant="danger" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">Submitted Problem Statements</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review status is managed by Institution Admin. You can view and respond to feedback.
              </p>
            </div>
            <DataTable columns={columns} data={reviewablePS} keyExtractor={(ps) => ps.id} />
          </div>

          <div className="lg:col-span-1">
            <AlertsPanel alerts={alerts} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
