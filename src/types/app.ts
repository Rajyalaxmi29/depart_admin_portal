export type PSStatus = 'draft' | 'submitted' | 'pending_review' | 'approved' | 'revision_needed';

export interface DepartmentInfo {
  id?: string;
  name: string;
  facultyId?: string;
  institution: string;
  head?: string;
  innovationLab?: string;
  location?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: DepartmentInfo;
  phone?: string;
  avatar?: string;
}

export interface ProblemStatement {
  id: string;
  psCode: string;
  title: string;
  category: string;
  theme: string;
  status: PSStatus;
  lastUpdated: string;
  createdAt: string;
  facultyOwner: string;
  assignedSpoc: string;
  description: string;
  createdBy?: string;
  departmentId?: string;
}

export interface AlertItem {
  id: string;
  type: 'overdue' | 'reminder' | 'message' | 'approval';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DashboardMetrics {
  totalPrepared: number;
  submittedToInstitution: number;
  pendingReview: number;
  approved: number;
  revisionNeeded: number;
  deadlineDate: string;
}
