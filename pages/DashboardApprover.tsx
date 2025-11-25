import React, { useEffect, useState } from 'react';
import { User, SpaceRequest, RequestStatus, UserRole } from '../types';
import { StorageService } from '../services/storageService';
import { CheckCircle, XCircle, AlertTriangle, Box, Info, Maximize2, ClipboardCheck, AlertOctagon } from 'lucide-react';

interface Props {
  currentUser: User;
}

export const DashboardApprover: React.FC<Props> = ({ currentUser }) => {
  const [pendingRequests, setPendingRequests] = useState<SpaceRequest[]>([]);
  const [inspectionRequests, setInspectionRequests] = useState<SpaceRequest[]>([]); // For IE Plant
  const [comment, setComment] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = () => {
    const all = StorageService.getRequests();
    
    // Standard Approvals
    const pending = all.filter(r => 
      r.status === RequestStatus.PENDING && 
      r.currentApproverRole === currentUser.role
    );
    setPendingRequests(pending);

    // Inspection Tasks (Only for IE Plant)
    if (currentUser.role === UserRole.IE_PLANT) {
        const inspecting = all.filter(r => r.status === RequestStatus.AWAITING_INSPECTION);
        setInspectionRequests(inspecting);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const handleAction = (request: SpaceRequest, action: 'approve' | 'reject') => {
    if (!processingId) setProcessingId(request.id);
    
    setTimeout(() => {
        if (action === 'approve') {
            StorageService.approveRequest(request.id, currentUser, comment);
        } else {
            StorageService.rejectRequest(request.id, currentUser, comment);
        }
        setComment('');
        setProcessingId(null);
        fetchRequests();
    }, 500);
  };

  const handleInspection = (request: SpaceRequest, result: 'Verified' | 'Flagged') => {
      if (!processingId) setProcessingId(request.id);
      setTimeout(() => {
          StorageService.inspectRequest(request.id, currentUser, result, comment);
          setComment('');
          setProcessingId(null);
          fetchRequests();
      }, 500);
  };

  return (
    <div className="space-y-6 animate-enter-3d">
      <div className="bg-gradient-to-r from-industrial-900 to-industrial-800 text-white p-8 rounded-xl shadow-lg border-b-4 border-brand-500 flex justify-between items-center relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black uppercase tracking-tight">Approvals Queue</h2>
          <p className="text-industrial-300 text-sm font-medium mt-1">ROLE: <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">{currentUser.role}</span></p>
        </div>
        <div className="flex gap-4">
             {currentUser.role === UserRole.IE_PLANT && (
                <div className="bg-amber-500/20 backdrop-blur-md px-6 py-3 rounded-lg text-center min-w-[120px] border border-amber-400/30 relative z-10">
                    <span className="block text-xs text-amber-200 uppercase font-bold tracking-wider">Inspections</span>
                    <span className="text-3xl font-mono font-bold text-white">{inspectionRequests.length}</span>
                </div>
             )}
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-lg text-center min-w-[120px] border border-white/20 relative z-10">
                <span className="block text-xs text-brand-200 uppercase font-bold tracking-wider">Pending</span>
                <span className="text-3xl font-mono font-bold text-white">{pendingRequests.length}</span>
            </div>
        </div>
      </div>

      {pendingRequests.length === 0 && inspectionRequests.length === 0 && (
        <div className="bg-white p-16 rounded-xl border border-industrial-200 shadow-sm text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100">
             <CheckCircle size={40} />
          </div>
          <h3 className="text-xl font-bold text-industrial-800 uppercase tracking-wide">Queue Empty</h3>
          <p className="text-industrial-500 mt-2">All tasks have been processed.</p>
        </div>
      )}

      {/* INSPECTION QUEUE (IE PLANT ONLY) */}
      {currentUser.role === UserRole.IE_PLANT && inspectionRequests.length > 0 && (
          <div className="mb-12">
              <h3 className="text-lg font-black text-industrial-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <ClipboardCheck className="text-amber-500" /> Physical Inspections Required
              </h3>
              <div className="grid gap-6">
                {inspectionRequests.map(req => (
                    <div key={req.id} className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-6 relative">
                         <div className="absolute top-0 left-0 bottom-0 w-2 bg-amber-400 rounded-l-xl"></div>
                         <div className="pl-4 flex flex-col md:flex-row justify-between gap-6">
                             <div>
                                 <h4 className="font-bold text-industrial-800 text-lg">{req.machineName}</h4>
                                 <p className="text-sm text-industrial-600 mb-2">Requester claimed item vacated. Verify physical space.</p>
                                 <div className="flex gap-4 text-xs font-mono text-industrial-500">
                                     <span className="bg-white px-2 py-1 rounded border border-amber-200">LOC: {req.workCell}</span>
                                     <span className="bg-white px-2 py-1 rounded border border-amber-200">SN: {req.serialNumber}</span>
                                 </div>
                             </div>
                             <div className="flex flex-col gap-2 w-full md:w-auto">
                                <input 
                                    type="text"
                                    placeholder="Inspection notes..."
                                    className="px-3 py-2 text-sm border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    value={processingId === req.id ? comment : ''}
                                    onChange={(e) => { if (!processingId) setComment(e.target.value) }}
                                    disabled={processingId === req.id}
                                />
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleInspection(req, 'Flagged')}
                                        disabled={!!processingId}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-xs font-bold uppercase flex-1 flex items-center justify-center gap-1"
                                    >
                                        <AlertOctagon size={14} /> Not Removed (Charge)
                                    </button>
                                    <button 
                                        onClick={() => handleInspection(req, 'Verified')}
                                        disabled={!!processingId}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded text-xs font-bold uppercase flex-1 flex items-center justify-center gap-1"
                                    >
                                        <CheckCircle size={14} /> Confirmed Empty
                                    </button>
                                </div>
                             </div>
                         </div>
                    </div>
                ))}
              </div>
          </div>
      )}

      {/* STANDARD APPROVALS */}
      <div className="grid gap-8">
        {pendingRequests.map(req => {
            const sqFt = (req.length * req.width * 10.764).toFixed(2);
            return (
          <div key={req.id} className="bg-white rounded-xl border border-industrial-200 shadow-card hover:shadow-3d transition-all duration-500 transform hover:-translate-y-1">
            
            {/* Card Header */}
            <div className="bg-industrial-50/50 px-8 py-5 border-b border-industrial-100 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded shadow-sm text-brand-600">
                     <Box size={24} />
                  </div>
                  <div>
                    <span className="block font-bold text-lg text-industrial-800 tracking-tight">{req.machineName}</span>
                    <span className="text-xs bg-industrial-200/50 text-industrial-600 px-2 py-0.5 rounded font-mono">SN: {req.serialNumber}</span>
                  </div>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-bold text-industrial-400 uppercase tracking-wider">Requested By</p>
                 <p className="font-bold text-industrial-800">{req.requesterName}</p>
               </div>
            </div>

            <div className="p-8">
               <div className="flex flex-col md:flex-row gap-8 mb-8">
                   <div className="flex-1 space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white border border-industrial-200 rounded-lg shadow-sm">
                             <span className="block text-[10px] font-bold text-industrial-400 uppercase tracking-wider mb-1">Total Area (SqFt)</span>
                             <span className="font-mono font-bold text-industrial-700 text-lg flex items-center gap-2">
                                <Maximize2 size={16} className="text-brand-500"/>
                                {sqFt}
                             </span>
                             <div className="text-[10px] text-industrial-400 mt-1 font-mono">
                                Dim: {req.length}m x {req.width}m
                             </div>
                          </div>
                          <div className="p-4 bg-white border border-industrial-200 rounded-lg shadow-sm">
                             <span className="block text-[10px] font-bold text-industrial-400 uppercase tracking-wider mb-1">Duration</span>
                             <span className="font-mono font-bold text-industrial-700 text-lg">{req.dateIn} / {req.dateOut}</span>
                          </div>
                       </div>
                       
                       <div className="p-4 bg-white border border-industrial-200 rounded-lg shadow-sm flex justify-between items-center">
                             <span className="text-xs font-bold text-industrial-500 uppercase">Work Cell Location</span>
                             <span className="font-mono font-bold text-industrial-800 bg-industrial-100 px-3 py-1 rounded">{req.workCell}</span>
                       </div>

                       {req.aiAnalysis && (
                         <div className="flex gap-4 bg-amber-50 text-amber-900 p-4 rounded-lg border-l-4 border-amber-400 shadow-sm">
                            <AlertTriangle className="shrink-0 text-amber-500 mt-0.5" size={20} />
                            <div>
                              <strong className="block text-xs font-bold uppercase mb-1 text-amber-700">Automated Inspection Note:</strong>
                              <p className="text-sm leading-relaxed">{req.aiAnalysis}</p>
                            </div>
                         </div>
                       )}
                   </div>

                   <div className="md:w-56 flex flex-col justify-center items-center bg-industrial-900 text-white rounded-xl p-6 text-center shadow-lg transform rotate-1">
                       <span className="text-xs text-industrial-400 uppercase font-bold tracking-wider">Total Charge</span>
                       <span className="text-4xl font-mono font-bold text-brand-400 my-3">${req.calculatedRate.toFixed(2)}</span>
                       <span className="text-[10px] text-industrial-500 bg-industrial-800 px-2 py-1 rounded-full">SqFt Rate Applied</span>
                   </div>
               </div>

               {/* Action Area */}
               <div className="mt-8 pt-8 border-t border-industrial-100">
                  <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-industrial-500 uppercase mb-2 ml-1">Reviewer Comments</label>
                      <input 
                        type="text"
                        className="w-full text-sm border border-industrial-300 rounded-lg px-4 py-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 font-medium transition-all shadow-sm bg-white"
                        placeholder="Enter reason or approval note..."
                        value={processingId === req.id ? comment : ''}
                        onChange={(e) => {
                            if (!processingId) setComment(e.target.value) 
                        }}
                        disabled={processingId === req.id}
                      />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                       <button
                          onClick={() => handleAction(req, 'reject')}
                          disabled={!!processingId}
                          className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-red-200 text-red-600 rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-red-50 hover:border-red-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                       >
                          <XCircle size={16} />
                          <span>Deny</span>
                       </button>
                       <button
                          onClick={() => handleAction(req, 'approve')}
                          disabled={!!processingId}
                          className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-8 py-3 bg-brand-600 text-white rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5 transition-all duration-200"
                       >
                          {processingId === req.id ? (
                              <span className="animate-pulse">Processing...</span>
                          ) : (
                              <>
                                  <CheckCircle size={16} />
                                  <span>Authorize</span>
                              </>
                          )}
                       </button>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};