import { User, UserRole, SpaceRequest, RequestStatus, RateConfig, APPROVAL_CHAIN, UserNotification } from '../types';

// Initial Seed Data
const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'System Admin', email: 'admin@tsm.com', role: UserRole.ADMIN, workId: 'ADM-001', phone: '+1 555-0199' },
  { id: 'u2', name: 'John Doe', email: 'john@requester.com', role: UserRole.REQUESTER, department: 'Engineering', workId: 'ENG-102', phone: '+1 555-0234' },
  { id: 'u3', name: 'Alice BUM', email: 'alice@bum.com', role: UserRole.BUM, workId: 'MGT-501', phone: '+1 555-0555' },
  { id: 'u4', name: 'Bob WCM', email: 'bob@wcm.com', role: UserRole.WCM, workId: 'OPS-202', phone: '+1 555-0678' },
  { id: 'u5', name: 'Charlie IE', email: 'charlie@iefm.com', role: UserRole.IE_FM, workId: 'FAC-303', phone: '+1 555-0789' },
  { id: 'u6', name: 'David MFG', email: 'david@mfgfm.com', role: UserRole.MFG_FM, workId: 'MFG-404', phone: '+1 555-0890' },
  { id: 'u7', name: 'Eve Plant', email: 'eve@ieplant.com', role: UserRole.IE_PLANT, workId: 'PLT-606', phone: '+1 555-0901' },
];

const INITIAL_RATE_CONFIG: RateConfig = {
  baseRatePerSquareFoot: 4.20,
  currency: 'USD',
  totalWarehouseSqFt: 50000 // Default 50k sqft capacity
};

// Seed some realistic requests for demo purposes
const INITIAL_REQUESTS: SpaceRequest[] = [
  {
    id: 'REQ-1001',
    requesterId: 'u2',
    requesterName: 'John Doe',
    machineName: 'SMT Pick & Place Unit',
    serialNumber: 'SMT-2024-X99',
    workCell: 'PCBA Line 1',
    costCenter: 'CC-EN-500',
    dateIn: '2025-03-01', // Future
    dateOut: '2025-03-15', // Future
    length: 2.5,
    width: 1.5,
    height: 1.8,
    calculatedRate: 2372.25,
    status: RequestStatus.PENDING,
    currentApproverRole: UserRole.BUM,
    approvalHistory: [],
    createdAt: new Date().toISOString(),
    aiAnalysis: 'Size consistent with standard SMT equipment. No stacking permitted.'
  },
  {
    id: 'REQ-1002',
    requesterId: 'u2',
    requesterName: 'John Doe',
    machineName: 'Hydraulic Press Spare',
    serialNumber: 'HP-50T-RES',
    workCell: 'Metal Stamping',
    costCenter: 'CC-MFG-102',
    dateIn: '2024-02-10',
    dateOut: '2025-12-20',
    length: 1.2,
    width: 1.2,
    height: 2.0,
    calculatedRate: 650.90,
    status: RequestStatus.APPROVED,
    currentApproverRole: null,
    approvalHistory: [
      { role: UserRole.BUM, approverName: 'Alice BUM', status: 'Approved', timestamp: '2024-02-01T10:00:00Z' },
      { role: UserRole.WCM, approverName: 'Bob WCM', status: 'Approved', timestamp: '2024-02-01T14:30:00Z' },
      { role: UserRole.IE_FM, approverName: 'Charlie IE', status: 'Approved', timestamp: '2024-02-02T09:15:00Z' },
      { role: UserRole.MFG_FM, approverName: 'David MFG', status: 'Approved', timestamp: '2024-02-02T11:00:00Z' },
      { role: UserRole.IE_PLANT, approverName: 'Eve Plant', status: 'Approved', timestamp: '2024-02-03T08:45:00Z' }
    ],
    createdAt: '2024-01-30T09:00:00Z'
  },
  {
    id: 'REQ-1003',
    requesterId: 'u2',
    requesterName: 'John Doe',
    machineName: 'Old Conveyor Belt',
    serialNumber: 'CV-OLD-001',
    workCell: 'Assembly A',
    costCenter: 'CC-OPS-900',
    dateIn: '2024-01-10',
    dateOut: '2024-04-10',
    length: 5.0,
    width: 1.0,
    height: 0.5,
    calculatedRate: 20451.60,
    status: RequestStatus.REJECTED,
    currentApproverRole: null,
    approvalHistory: [
      { role: UserRole.BUM, approverName: 'Alice BUM', status: 'Approved', timestamp: '2024-01-05T10:00:00Z' },
      { role: UserRole.WCM, approverName: 'Bob WCM', status: 'Rejected', timestamp: '2024-01-05T15:00:00Z', comment: 'Scrap item, please dispose instead of store.' }
    ],
    createdAt: '2024-01-04T12:00:00Z'
  },
  {
    id: 'REQ-1004',
    requesterId: 'u2',
    requesterName: 'John Doe',
    machineName: 'Expired Test Machine',
    serialNumber: 'EXP-TEST-001',
    workCell: 'Testing Lab',
    costCenter: 'CC-TEST-100',
    dateIn: '2023-12-01',
    dateOut: '2023-12-31',
    length: 2.0,
    width: 2.0,
    height: 1.5,
    calculatedRate: 11299.20,
    status: RequestStatus.EXPIRED,
    currentApproverRole: null,
    approvalHistory: [
        { role: UserRole.BUM, approverName: 'Alice BUM', status: 'Approved', timestamp: '2023-11-20T10:00:00Z' },
        { role: UserRole.WCM, approverName: 'Bob WCM', status: 'Approved', timestamp: '2023-11-20T14:30:00Z' },
        { role: UserRole.IE_FM, approverName: 'Charlie IE', status: 'Approved', timestamp: '2023-11-21T09:15:00Z' },
        { role: UserRole.MFG_FM, approverName: 'David MFG', status: 'Approved', timestamp: '2023-11-21T11:00:00Z' },
        { role: UserRole.IE_PLANT, approverName: 'Eve Plant', status: 'Approved', timestamp: '2023-11-22T08:45:00Z' }
    ],
    createdAt: '2023-11-15T09:00:00Z'
  }
];

const STORAGE_KEYS = {
  USERS: 'tsm_users',
  REQUESTS: 'tsm_requests',
  CONFIG: 'tsm_config',
  NOTIFICATIONS: 'tsm_notifications'
};

export const StorageService = {
  // --- Auth / User Management ---
  getUsers: (): User[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    return stored ? JSON.parse(stored) : INITIAL_USERS;
  },

  addUser: (user: User) => {
    const users = StorageService.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  removeUser: (userId: string) => {
    let users = StorageService.getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  login: (email: string): User | undefined => {
    const users = StorageService.getUsers();
    return users.find(u => u.email === email);
  },

  // --- Configuration ---
  getRateConfig: (): RateConfig => {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return stored ? JSON.parse(stored) : INITIAL_RATE_CONFIG;
  },

  updateRateConfig: (config: RateConfig) => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  // --- Notifications ---
  getNotifications: (userId: string): UserNotification[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: UserNotification[] = stored ? JSON.parse(stored) : [];
    return notifications.filter(n => n.userId === userId).reverse();
  },

  addNotification: (notification: UserNotification) => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications: UserNotification[] = stored ? JSON.parse(stored) : [];
    notifications.push(notification);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  markNotificationsRead: (userId: string) => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!stored) return;
    let notifications: UserNotification[] = JSON.parse(stored);
    notifications = notifications.map(n => n.userId === userId ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  // --- Requests ---
  getRequests: (): SpaceRequest[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    let requests: SpaceRequest[] = stored ? JSON.parse(stored) : INITIAL_REQUESTS;
    
    // Auto-Expire Check on Load
    const today = new Date().toISOString().split('T')[0];
    let updated = false;

    requests = requests.map(req => {
        if (req.status === RequestStatus.APPROVED && req.dateOut < today) {
            req.status = RequestStatus.EXPIRED;
            updated = true;
        }
        return req;
    });

    if (updated || !stored) {
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    }

    return requests;
  },

  saveRequest: (request: SpaceRequest) => {
    const requests = StorageService.getRequests();
    const index = requests.findIndex(r => r.id === request.id);
    if (index >= 0) {
      requests[index] = request;
    } else {
      requests.push(request);
    }
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  },

  // --- Logic Helpers ---
  submitRequest: (request: SpaceRequest) => {
    // Start the chain
    request.status = RequestStatus.PENDING;
    request.currentApproverRole = APPROVAL_CHAIN[0]; // First approver
    StorageService.saveRequest(request);
  },

  approveRequest: (requestId: string, approver: User, comment: string) => {
    const requests = StorageService.getRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // Record history
    req.approvalHistory.push({
      role: approver.role,
      approverName: approver.name,
      status: 'Approved',
      timestamp: new Date().toISOString(),
      comment
    });

    // Move to next stage
    const currentStageIndex = APPROVAL_CHAIN.indexOf(approver.role);
    if (currentStageIndex === -1) return; // Should not happen

    if (currentStageIndex < APPROVAL_CHAIN.length - 1) {
      req.currentApproverRole = APPROVAL_CHAIN[currentStageIndex + 1];
    } else {
      // Final approval
      req.currentApproverRole = null;
      req.status = RequestStatus.APPROVED;
    }

    StorageService.saveRequest(req);
  },

  rejectRequest: (requestId: string, approver: User, comment: string) => {
    const requests = StorageService.getRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    req.approvalHistory.push({
      role: approver.role,
      approverName: approver.name,
      status: 'Rejected',
      timestamp: new Date().toISOString(),
      comment
    });

    req.status = RequestStatus.REJECTED;
    req.currentApproverRole = null;
    StorageService.saveRequest(req);
  },

  requestVacated: (requestId: string) => {
      const requests = StorageService.getRequests();
      const req = requests.find(r => r.id === requestId);
      if(req) {
          req.status = RequestStatus.AWAITING_INSPECTION;
          StorageService.saveRequest(req);
      }
  },

  inspectRequest: (requestId: string, approver: User, result: 'Verified' | 'Flagged', comment: string) => {
      const requests = StorageService.getRequests();
      const req = requests.find(r => r.id === requestId);
      if(req) {
          req.approvalHistory.push({
              role: approver.role,
              approverName: approver.name,
              status: result,
              timestamp: new Date().toISOString(),
              comment
          });
          
          let notifyMsg = "";
          let notifyType: 'success' | 'alert' = 'success';

          if (result === 'Verified') {
              req.status = RequestStatus.COMPLETED;
              notifyMsg = `SYSTEM NOTIFICATION: Inspection for [${req.machineName}] complete. Clearance verified. Please remove item immediately.`;
              notifyType = 'success';
          } else {
              req.status = RequestStatus.OVERSTAY;
              notifyMsg = `SYSTEM ALERT: Issue detected for [${req.machineName}] during inspection. Item must remain on site. Extended billing charges applying.`;
              notifyType = 'alert';
          }
          
          StorageService.saveRequest(req);

          // Trigger Notification
          StorageService.addNotification({
              id: Date.now().toString(),
              userId: req.requesterId,
              type: notifyType,
              message: notifyMsg,
              timestamp: new Date().toISOString(),
              read: false,
              relatedRequestId: req.id
          });
      }
  },
  
  sendAdminReminder: (userId: string, message: string) => {
    StorageService.addNotification({
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      userId: userId,
      type: 'info',
      message: `ADMIN ALERT: ${message}`,
      timestamp: new Date().toISOString(),
      read: false
    });
  },

  // --- Analytics Logic ---
  getAnalyticsData: () => {
    const requests = StorageService.getRequests();
    const config = StorageService.getRateConfig();
    
    // Statuses that are considered "Occupying Space"
    const activeStatuses = [
        RequestStatus.APPROVED, 
        RequestStatus.EXPIRED, 
        RequestStatus.AWAITING_INSPECTION, 
        RequestStatus.OVERSTAY
    ];

    let usedSqFt = 0;
    const breakdown: Record<string, number> = {};

    requests.forEach(req => {
        if (activeStatuses.includes(req.status)) {
            const sqFt = req.length * req.width * 10.764;
            usedSqFt += sqFt;
            
            // Categorize by Work Cell
            const category = req.workCell || 'Unassigned';
            breakdown[category] = (breakdown[category] || 0) + sqFt;
        }
    });

    const total = config.totalWarehouseSqFt || 50000;
    
    return {
        totalCapacity: total,
        usedSqFt: parseFloat(usedSqFt.toFixed(2)),
        freeSqFt: parseFloat((total - usedSqFt).toFixed(2)),
        percentageUsed: Math.min(100, (usedSqFt / total) * 100).toFixed(1),
        breakdown,
        allRequests: requests
    };
  }
};