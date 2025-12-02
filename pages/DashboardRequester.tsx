import React, { useEffect, useState } from 'react';
import { User, SpaceRequest, RequestStatus, UserNotification } from '../types';
import { StorageService } from '../services/storageService';
import { ApprovalChain } from '../components/ApprovalChain';
import { Package, Calendar, Activity, ArrowRight, Tag, Maximize2, AlertOctagon, RefreshCw, LogOut, MessageSquare, Bell } from 'lucide-react';

interface Props {
  currentUser: User;
  onNavigate?: (view: string, data?: any) => void;
}

export const DashboardRequester: React.FC<Props> = ({ currentUser, onNavigate }) => {
  const [requests, setRequests] = useState<SpaceRequest[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  useEffect(() => {
    const loadData = () => {
        const allRequests = StorageService.getRequests();
        setRequests(allRequests.filter(r => r.requesterId === currentUser.id).reverse());
        setNotifications(StorageService.getNotifications(currentUser.id));
    };
    
    loadData();
    // Simple poll to keep dashboard updated with simulated notifications
    const interval = setInterval(loadData, 2000); 
    return () => clearInterval(interval);
  }, [currentUser.id]);

  const handleRenew = (req: SpaceRequest) => {
    if (onNavigate) {
        onNavigate('new-request', req);
    }
  };

  const handleVacate = (req: SpaceRequest) => {
    if (window.confirm("Are you sure you have removed this item? IE Plant will perform a physical check.")) {
        StorageService.requestVacated(req.id);
        const allRequests = StorageService.getRequests();
        setRequests(allRequests.filter(r => r.requesterId === currentUser.id).reverse());
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED: 
        return <span className="px-3 py-1 border border-emerald-200 text-emerald-700 font-bold uppercase text-[10px] tracking-widest bg-emerald-50 rounded-full shadow-sm">Active</span>;
      case RequestStatus.REJECTED: 
        return <span className="px-3 py-1 border border-red-200 text-red-700 font-bold uppercase text-[10px] tracking-widest bg-red-50 rounded-full shadow-sm">Rejected</span>;
      case RequestStatus.DRAFT: 
        return <span className="px-3 py-1 border border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest bg-slate-50 rounded-full shadow-sm">Draft</span>;
      case RequestStatus.EXPIRED:
        return <span className="px-3 py-1 border border-orange-200 text-orange-700 font-bold uppercase text-[10px] tracking-widest bg-orange-50 rounded-full shadow-sm animate-pulse">Expired</span>;
      case RequestStatus.AWAITING_INSPECTION:
        return <span className="px-3 py-1 border border-blue-200 text-blue-700 font-bold uppercase text-[10px] tracking-widest bg-blue-50 rounded-full shadow-sm">Inspecting</span>;
      case RequestStatus.COMPLETED:
        return <span className="px-3 py-1 border border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-widest bg-gray-100 rounded-full shadow-sm">Closed</span>;
      case RequestStatus.OVERSTAY:
        return <span className="px-3 py-1 border border-red-500 bg-red-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-full shadow-sm animate-pulse">OVERSTAY CHARGE</span>;
      default: 
        return <span className="px-3 py-1 border border-brand-200 text-brand-600 font-bold uppercase text-[10px] tracking-widest bg-brand-50 rounded-full shadow-sm animate-pulse">Pending</span>;
    }
  };

  return (
    <div className="space-y-8 animate-enter-3d">
      <div className="flex items-center justify-between pb-4 border-b border-industrial-200">
        <div>
          <h2 className="text-3xl font-black text-industrial-800 uppercase tracking-tight">My Requisitions</h2>
          <p className="text-industrial-500 font-medium text-sm mt-1">Real-time status tracking</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-5 py-2 rounded-lg border border-industrial-200 shadow-sm flex flex-col items-end">
             <span className="block text-[10px] font-bold text-industrial-400 uppercase tracking-wider">Total Items</span>
             <span className="text-xl font-mono font-bold text-brand-600">{requests.length}</span>
           </div>
        </div>
      </div>

      {/* TERMINAL STYLE NOTIFICATIONS */}
      {notifications.length > 0 && (
          <div className="bg-industrial-900 rounded-xl overflow-hidden shadow-2xl border border-industrial-700">
              <div className="bg-industrial-950 px-4 py-2 flex items-center justify-between border-b border-industrial-800">
                  <span className="text-[10px] font-mono text-brand-400 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
                      System Messages / Inbox ({notifications.length})
                  </span>
                  <Bell size={14} className="text-industrial-500" />
              </div>
              <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((note) => (
                      <div key={note.id} className={`p-3 rounded border-l-2 font-mono text-xs flex gap-3 ${
                          note.type === 'alert' 
                            ? 'bg-red-500/10 border-red-500 text-red-200' 
                            : 'bg-emerald-500/10 border-emerald-500 text-emerald-200'
                      }`}>
                          {note.type === 'alert' ? <AlertOctagon size={16} className="shrink-0 text-red-500" /> : <MessageSquare size={16} className="shrink-0 text-emerald-500" />}
                          <div>
                              <span className="block opacity-50 text-[10px] mb-1">{new Date(note.timestamp).toLocaleString()}</span>
                              <span className="leading-relaxed">{note.message}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="grid gap-6">
        {requests.length === 0 && (
           <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-industrial-200 shadow-sm">
             <div className="w-20 h-20 bg-industrial-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-industrial-300" />
             </div>
             <p className="text-industrial-500 font-bold uppercase tracking-wide">No Requests Found</p>
             <p className="text-sm text-industrial-400">Initialize a new manifest to begin.</p>
           </div>
        )}

        {requests.map((req, idx) => {
          // Calculate sq ft from cm: (L * W * 10.764) / 10000
          const areaSqFt = ((req.length * req.width * 10.764) / 10000).toFixed(2);
          const isExpired = req.status === RequestStatus.EXPIRED;
          const isOverstay = req.status === RequestStatus.OVERSTAY;

          return (
          <div 
            key={req.id} 
            className={`bg-white rounded-xl border shadow-card hover:shadow-3d transition-all duration-300 group relative overflow-hidden transform hover:-translate-y-1 ${
                isExpired ? 'border-orange-300 ring-2 ring-orange-100' : isOverstay ? 'border-red-500 ring-2 ring-red-100' : 'border-industrial-100'
            }`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Left accent strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${
              req.status === RequestStatus.APPROVED || req.status === RequestStatus.COMPLETED ? 'bg-emerald-500' : 
              req.status === RequestStatus.REJECTED || isOverstay ? 'bg-red-500' : 
              isExpired ? 'bg-orange-500' : 'bg-brand-400'
            }`} />

            <div className="p-6 pl-8">
              {/* Alert Header for Expired */}
              {isExpired && (
                  <div className="mb-4 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <AlertOctagon className="text-orange-500" />
                          <div>
                              <p className="font-bold text-orange-800 text-sm uppercase">Lease Expired</p>
                              <p className="text-xs text-orange-700">Item exceeded 'Date Out'. Immediate action required.</p>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button 
                            onClick={() => handleVacate(req)}
                            className="bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded text-xs font-bold uppercase hover:bg-orange-100 flex items-center gap-2"
                          >
                             <LogOut size={14} /> Reject (End)
                          </button>
                          <button 
                            onClick={() => handleRenew(req)}
                            className="bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase hover:bg-orange-700 flex items-center gap-2 shadow-sm"
                          >
                             <RefreshCw size={14} /> Approve (Renew)
                          </button>
                      </div>
                  </div>
              )}

              {/* Header Row */}
              <div className="flex justify-between items-start mb-6">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                     <span className="font-mono text-xs text-industrial-400 bg-industrial-50 px-2 py-0.5 rounded">ID: {req.id}</span>
                     {getStatusBadge(req.status)}
                   </div>
                   <h3 className="text-xl font-bold text-industrial-800 tracking-tight group-hover:text-brand-600 transition-colors">{req.machineName}</h3>
                   <div className="flex items-center gap-4 mt-2 text-sm font-medium text-industrial-500">
                      <span className="flex items-center gap-1.5 bg-industrial-50 px-2 py-1 rounded text-xs"><Tag size={12}/> {req.serialNumber}</span>
                      <span className="w-1 h-1 bg-industrial-300 rounded-full"></span>
                      <span>{req.workCell}</span>
                   </div>
                </div>
                <div className="text-right bg-gradient-to-br from-white to-industrial-50 px-5 py-3 rounded-lg border border-industrial-100 shadow-sm">
                   <p className="text-[10px] font-bold text-industrial-400 uppercase tracking-wider">Est. Cost</p>
                   <p className="text-xl font-mono font-bold text-industrial-900">{req.calculatedRate.toFixed(2)} <span className="text-xs text-industrial-400 font-sans">USD</span></p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-1">
                <div className="flex flex-col p-3 bg-industrial-50/50 rounded-lg border border-industrial-100/50 group-hover:border-industrial-200 transition-colors">
                  <span className="text-[10px] font-bold text-industrial-400 uppercase tracking-wider mb-1">Area Utilized</span>
                  <span className="font-mono font-bold text-industrial-700 flex items-center text-sm">
                    <Maximize2 className="mr-2 text-brand-500" size={14} />
                    {areaSqFt} SQFT
                  </span>
                  <span className="text-[9px] text-industrial-400 mt-1 pl-6">({req.length}cm × {req.width}cm)</span>
                </div>
                <div className="flex flex-col p-3 bg-industrial-50/50 rounded-lg border border-industrial-100/50 group-hover:border-industrial-200 transition-colors">
                  <span className="text-[10px] font-bold text-industrial-400 uppercase tracking-wider mb-1">Duration</span>
                  <span className={`font-mono font-bold flex items-center text-sm ${isExpired ? 'text-orange-600' : 'text-industrial-700'}`}>
                    <Calendar className={`mr-2 ${isExpired ? 'text-orange-500' : 'text-brand-500'}`} size={14} />
                    {req.dateIn} <ArrowRight size={12} className="mx-1 text-industrial-400" /> {req.dateOut}
                  </span>
                </div>
                 <div className="flex flex-col p-3 bg-industrial-50/50 rounded-lg border border-industrial-100/50 group-hover:border-industrial-200 transition-colors">
                  <span className="text-[10px] font-bold text-industrial-400 uppercase tracking-wider mb-1">Charge Code</span>
                  <span className="font-mono font-bold text-industrial-700 flex items-center text-sm">
                    <Activity className="mr-2 text-brand-500" size={14} />
                    {req.costCenter}
                  </span>
                </div>
              </div>

              {/* Approval Viz */}
              <div className="pt-4 border-t border-industrial-100">
                 <ApprovalChain request={req} />
                 {isOverstay && (
                     <p className="mt-2 text-xs font-bold text-red-600 uppercase flex items-center gap-2">
                         <AlertOctagon size={12} /> IE Plant Flagged: Item not removed. Additional charges applying daily.
                     </p>
                 )}
              </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};