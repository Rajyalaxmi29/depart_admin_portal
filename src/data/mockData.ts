// Mock data for the inCamp Department Admin Portal

export interface ProblemStatement {
  id: string;
  title: string;
  category: string;
  theme: string;
  status: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'revision_needed';
  lastUpdated: string;
  createdAt: string;
  facultyOwner: string;
  assignedSpoc: string;
  description: string;
}

export interface Message {
  id: string;
  psId: string;
  psTitle: string;
  sender: string;
  senderRole: 'institution_admin' | 'department_admin';
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Alert {
  id: string;
  type: 'overdue' | 'reminder' | 'message' | 'approval';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

// Problem Statements
export const problemStatements: ProblemStatement[] = [
  {
    id: 'PS-2024-001',
    title: 'Smart Campus Energy Management System',
    category: 'Sustainability',
    theme: 'Green Campus',
    status: 'approved',
    lastUpdated: '2024-01-28',
    createdAt: '2024-01-10',
    facultyOwner: 'Dr. Priya Sharma',
    assignedSpoc: 'Prof. Anand Verma',
    description: 'Develop an IoT-based energy monitoring and optimization system for campus buildings.',
  },
  {
    id: 'PS-2024-002',
    title: 'AI-Powered Student Attendance Tracking',
    category: 'EdTech',
    theme: 'Smart Education',
    status: 'pending_review',
    lastUpdated: '2024-01-27',
    createdAt: '2024-01-15',
    facultyOwner: 'Dr. Amit Patel',
    assignedSpoc: 'Prof. Anand Verma',
    description: 'Facial recognition-based attendance system with real-time analytics.',
  },
  {
    id: 'PS-2024-003',
    title: 'Campus Waste Segregation Platform',
    category: 'Sustainability',
    theme: 'Green Campus',
    status: 'submitted',
    lastUpdated: '2024-01-26',
    createdAt: '2024-01-18',
    facultyOwner: 'Dr. Meena Gupta',
    assignedSpoc: 'Prof. Sanjay Kumar',
    description: 'Mobile app for waste categorization and collection scheduling.',
  },
  {
    id: 'PS-2024-004',
    title: 'Virtual Lab Experiment Simulator',
    category: 'EdTech',
    theme: 'Digital Learning',
    status: 'revision_needed',
    lastUpdated: '2024-01-25',
    createdAt: '2024-01-12',
    facultyOwner: 'Dr. Rajesh Kumar',
    assignedSpoc: 'Prof. Anand Verma',
    description: 'VR-based simulation platform for conducting physics and chemistry experiments.',
  },
  {
    id: 'PS-2024-005',
    title: 'Campus Food Delivery Optimization',
    category: 'Operations',
    theme: 'Student Services',
    status: 'draft',
    lastUpdated: '2024-01-24',
    createdAt: '2024-01-20',
    facultyOwner: 'Dr. Sunita Reddy',
    assignedSpoc: 'Unassigned',
    description: 'Algorithm for optimizing food delivery routes within campus.',
  },
  {
    id: 'PS-2024-006',
    title: 'Mental Health Support Chatbot',
    category: 'Healthcare',
    theme: 'Student Wellness',
    status: 'draft',
    lastUpdated: '2024-01-23',
    createdAt: '2024-01-21',
    facultyOwner: 'Dr. Kavita Singh',
    assignedSpoc: 'Unassigned',
    description: 'AI chatbot providing 24/7 mental health support and resources.',
  },
];

// Messages
export const messages: Message[] = [
  {
    id: 'msg_001',
    psId: 'PS-2024-004',
    psTitle: 'Virtual Lab Experiment Simulator',
    sender: 'Institution Admin',
    senderRole: 'institution_admin',
    content: 'Please revise the budget section. The proposed costs exceed the allocated funding limit. Also, include more details about the VR hardware requirements.',
    timestamp: '2024-01-25T10:30:00',
    isRead: false,
  },
  {
    id: 'msg_002',
    psId: 'PS-2024-002',
    psTitle: 'AI-Powered Student Attendance Tracking',
    sender: 'Institution Admin',
    senderRole: 'institution_admin',
    content: 'This proposal looks promising. We need additional documentation on data privacy compliance. Please provide GDPR and local regulations adherence details.',
    timestamp: '2024-01-27T14:15:00',
    isRead: false,
  },
  {
    id: 'msg_003',
    psId: 'PS-2024-001',
    psTitle: 'Smart Campus Energy Management System',
    sender: 'Institution Admin',
    senderRole: 'institution_admin',
    content: 'Congratulations! Your problem statement has been approved. You may proceed with team formation and implementation planning.',
    timestamp: '2024-01-28T09:00:00',
    isRead: true,
  },
];

// Alerts
export const alerts: Alert[] = [
  {
    id: 'alert_001',
    type: 'overdue',
    title: 'PS Pending Approval',
    description: 'Virtual Lab Experiment Simulator requires revision within 3 days',
    timestamp: '2024-01-28T08:00:00',
    priority: 'high',
  },
  {
    id: 'alert_002',
    type: 'reminder',
    title: 'Submission Deadline',
    description: 'Next batch submission closes in 5 days',
    timestamp: '2024-01-28T07:00:00',
    priority: 'medium',
  },
  {
    id: 'alert_003',
    type: 'message',
    title: 'New Feedback',
    description: 'Institution Admin sent feedback on AI Attendance system',
    timestamp: '2024-01-27T14:15:00',
    priority: 'medium',
  },
  {
    id: 'alert_004',
    type: 'approval',
    title: 'PS Approved',
    description: 'Smart Campus Energy Management System approved',
    timestamp: '2024-01-28T09:00:00',
    priority: 'low',
  },
];

// Dashboard metrics
export const dashboardMetrics = {
  totalPrepared: 6,
  submittedToInstitution: 3,
  pendingReview: 1,
  approved: 1,
  revisionNeeded: 1,
  deadlineDate: '2024-02-05',
};

// Submission cycle stages
export const submissionCycle = {
  stages: [
    { id: 'draft', label: 'Draft', completed: true },
    { id: 'department_review', label: 'Department Review', completed: true },
    { id: 'institution_review', label: 'Institution Review', completed: false, active: true },
    { id: 'approved', label: 'Approved', completed: false },
  ],
};
