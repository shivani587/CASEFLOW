export type Role = 'ADVOCATE' | 'CLIENT';

export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'AWAITING_HEARING' | 'PENDING_CLIENT' | 'DISPOSED' | 'CLOSED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type HearingStatus = 'SCHEDULED' | 'COMPLETED' | 'ADJOURNED' | 'CANCELLED';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type DocumentStatus = 'REQUIRED' | 'AWAITING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
export type ActionStatus = 'PENDING' | 'IN_PROGRESS' | 'RESPONDED' | 'COMPLETED' | 'OVERDUE';
export type PartyType = 'CLIENT' | 'OPPOSING_COUNSEL' | 'COURT_REGISTRY' | 'WITNESS' | 'THIRD_PARTY';
export type ClientRequestType = 'INFORMATION_REQUEST' | 'DOCUMENT_SUBMISSION' | 'AFFIDAVIT_SIGNATURE' | 'CLARIFICATION' | 'FEES_OR_BILLING';
export type ClientRequestStatus = 'PENDING_CLIENT' | 'SUBMITTED_BY_CLIENT' | 'APPROVED' | 'NEEDS_REVISION';

export interface AuthResponse {
  token: string;
  userId: number;
  clientId?: number;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  barRegistrationNo?: string;
  specialization?: string;
}

export interface UserProfile {
  id: number;
  clientId?: number;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  barRegistrationNo?: string;
  specialization?: string;
  address?: string;
  companyOrOrganization?: string;
}

export interface ClientModel {
  id?: number;
  userId?: number;
  advocateId?: number;
  advocateName?: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  companyOrOrganization?: string;
  identificationReference?: string;
  notes?: string;
  portalPassword?: string;
  active: boolean;
  assignedCasesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LegalCaseModel {
  id?: number;
  caseNumber: string;
  title: string;
  caseType: string;
  status: CaseStatus;
  priority: PriorityLevel;
  courtName: string;
  courtHall?: string;
  judgeName?: string;
  opposingParty?: string;
  opposingCounsel?: string;
  description?: string;
  filingDate: string;
  nextDeadline?: string;
  deadlineDescription?: string;
  advocateId?: number;
  advocateName?: string;
  clientId: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  nextHearingDate?: string;
  pendingTasksCount?: number;
  missingDocumentsCount?: number;
  pendingActionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CaseUpdateModel {
  id?: number;
  caseId: number;
  caseNumber?: string;
  caseTitle?: string;
  authorUserId?: number;
  authorName?: string;
  updateType: string;
  title: string;
  details: string;
  visibleToClient: boolean;
  createdAt?: string;
}

export interface HearingModel {
  id?: number;
  caseId: number;
  caseNumber?: string;
  caseTitle?: string;
  clientName?: string;
  hearingDate: string;
  courtName: string;
  courtRoom?: string;
  purpose: string;
  status: HearingStatus;
  outcomeNotes?: string;
  nextSteps?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskModel {
  id?: number;
  caseId: number;
  caseNumber?: string;
  caseTitle?: string;
  assignedAdvocateId?: number;
  assignedAdvocateName?: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  status: TaskStatus;
  dueDate: string;
  overdue?: boolean;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentModel {
  id?: number;
  caseId: number;
  caseNumber?: string;
  caseTitle?: string;
  clientId?: number;
  clientName?: string;
  uploadedByUserId?: number;
  uploadedByName?: string;
  title: string;
  category: string;
  description?: string;
  fileName?: string;
  contentType?: string;
  fileSize?: number;
  status?: DocumentStatus;
  verificationRemarks?: string;
  dueDate?: string;
  uploadedAt?: string;
  verifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PendingActionModel {
  id?: number;
  caseId: number;
  caseNumber?: string;
  caseTitle?: string;
  clientName?: string;
  advocateId?: number;
  title: string;
  responsibleParty: string;
  partyType: PartyType;
  instructions: string;
  status: ActionStatus;
  dueDate: string;
  resolutionNotes?: string;
  overdue?: boolean;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientRequestModel {
  id?: number;
  caseId: number;
  caseNumber?: string;
  caseTitle?: string;
  clientId: number;
  clientName?: string;
  advocateId?: number;
  advocateName?: string;
  title: string;
  requestType: ClientRequestType;
  instructions: string;
  clientResponse?: string;
  advocateReviewNotes?: string;
  status?: ClientRequestStatus;
  dueDate: string;
  overdue?: boolean;
  respondedAt?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationModel {
  id: number;
  recipientUserId: number;
  caseId?: number;
  caseNumber?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AdvocateDashboardModel {
  totalCases: number;
  activeCases: number;
  totalClients: number;
  upcomingHearingsCount: number;
  urgentTasksCount: number;
  overdueTasksCount: number;
  missingDocumentsCount: number;
  awaitingVerificationDocumentsCount: number;
  pendingActionsCount: number;
  requiredClientFollowUpsCount: number;
  upcomingDeadlinesCount: number;
  upcomingHearings: HearingModel[];
  urgentAndOverdueTasks: TaskModel[];
  documentsNeedingAttention: DocumentModel[];
  pendingActions: PendingActionModel[];
  clientFollowUps: ClientRequestModel[];
  upcomingDeadlines: LegalCaseModel[];
  recentCaseUpdates: CaseUpdateModel[];
}

export interface ClientDashboardModel {
  clientName: string;
  advocateName: string;
  advocateEmail: string;
  advocatePhone: string;
  assignedCasesCount: number;
  upcomingHearingsCount: number;
  requiredDocumentsCount: number;
  awaitingVerificationCount: number;
  pendingRequestsCount: number;
  unreadNotificationsCount: number;
  assignedCases: LegalCaseModel[];
  upcomingHearings: HearingModel[];
  requiredAndSubmittedDocuments: DocumentModel[];
  pendingRequests: ClientRequestModel[];
  recentCaseUpdates: CaseUpdateModel[];
}
