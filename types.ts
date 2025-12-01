export enum UserRole {
  ADMIN = 'Admin',
  REQUESTER = 'Requester',
  BUM = 'BUM',
  WCM = 'WCM',
  MFG_FM = 'MFG FM',
  IE_PLANT = 'IE Plant'
}

export enum RequestStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  EXPIRED = 'Expired', // System detected date passed
  AWAITING_INSPECTION = 'Awaiting Inspection', // Requester claimed vacated, IE Plant to check
  COMPLETED = 'Completed', // Successfully removed
  OVERSTAY = 'Overstay (Penalty)' // IE Plant found item still there
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  workId?: string; // Added Work ID
  phone?: string;  // Added Phone Number
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'success' | 'alert' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
  relatedRequestId?: string;
}

export interface SpaceRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  machineName: string;
  serialNumber: string;
  workCell: string;
  costCenter: string;
  dateIn: string;
  dateOut: string;
  length: number; // in cm
  width: number; // in cm
  height: number; // in cm
  calculatedRate: number;
  status: RequestStatus;
  currentApproverRole: UserRole | null; // Who needs to approve next
  approvalHistory: ApprovalAction[];
  createdAt: string;
  aiAnalysis?: string; // Optional AI feedback
}

export interface ApprovalAction {
  role: UserRole;
  approverName: string;
  status: 'Approved' | 'Rejected' | 'Verified' | 'Flagged';
  timestamp: string;
  comment?: string;
}

export interface RateConfig {
  baseRatePerSquareFoot: number;
  currency: string;
  totalWarehouseSqFt: number; // Added capacity limit
}

export const APPROVAL_CHAIN = [
  UserRole.BUM,
  UserRole.WCM,
  UserRole.MFG_FM,
  UserRole.IE_PLANT
];