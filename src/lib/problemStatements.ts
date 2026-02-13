import { ProblemStatement } from '@/types/app';

interface ProblemStatementRow {
  id: string;
  problem_statement_id: string;
  title: string;
  category: string;
  theme: string;
  status?: ProblemStatement['status'];
  last_updated?: string;
  created_at: string;
  faculty_owner?: string | null;
  assigned_spoc?: string | null;
  description: string;
  detailed_description?: string | null;
  created_by?: string;
  department_id?: string;
}

export function mapProblemStatement(row: ProblemStatementRow): ProblemStatement {
  return {
    id: row.id,
    psCode: row.problem_statement_id,
    title: row.title,
    category: row.category,
    theme: row.theme,
    status: row.status ?? 'draft',
    lastUpdated: row.last_updated ?? row.created_at,
    createdAt: row.created_at,
    facultyOwner: row.faculty_owner ?? 'Unassigned',
    assignedSpoc: row.assigned_spoc ?? 'Unassigned',
    description: row.description,
    detailedDescription: row.detailed_description ?? undefined,
    createdBy: row.created_by,
    departmentId: row.department_id,
  };
}

export function generateProblemStatementCode(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `PS-${year}-${suffix}`;
}
