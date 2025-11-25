import React from 'react';
import { SpaceRequest, APPROVAL_CHAIN, UserRole, RequestStatus } from '../types';
import { Check, X, Clock, Circle } from 'lucide-react';

interface Props {
  request: SpaceRequest;
}

export const ApprovalChain: React.FC<Props> = ({ request }) => {
  const isRejected = request.status === RequestStatus.REJECTED;

  return (
    <div className="py-2">
      <h4 className="text-[10px] font-bold text-industrial-400 uppercase tracking-widest mb-6">Workflow Authorization Chain</h4>
      <div className="flex items-center justify-between relative px-2">
        {/* Line Connector */}
        <div className="absolute left-0 top-4 w-full h-0.5 bg-industrial-100 -z-10" />

        {APPROVAL_CHAIN.map((role, index) => {
          // Check approval history for this role
          const historyItem = request.approvalHistory.find(h => h.role === role);
          const isApproved = historyItem?.status === 'Approved';
          const isRejectedHere = historyItem?.status === 'Rejected';
          const isPending = request.currentApproverRole === role && request.status === RequestStatus.PENDING;
          
          // Determine State
          let icon = <div className="w-2 h-2 bg-industrial-300 rounded-full" />;
          let containerClass = "border-industrial-200 bg-white shadow-sm";
          let textClass = "text-industrial-300";

          if (isApproved) {
            icon = <Check className="text-white" size={14} strokeWidth={3} />;
            containerClass = "border-emerald-500 bg-emerald-500 shadow-md scale-110";
            textClass = "text-emerald-600 font-bold";
          } else if (isRejectedHere) {
             icon = <X className="text-white" size={14} strokeWidth={3} />;
             containerClass = "border-red-500 bg-red-500 shadow-md scale-110";
             textClass = "text-red-600 font-bold";
          } else if (isPending) {
            icon = <Clock className="text-brand-600 animate-pulse" size={16} />;
            containerClass = "border-brand-500 bg-white ring-4 ring-brand-100 shadow-lg scale-110";
            textClass = "text-brand-700 font-bold";
          } else if (isRejected) {
             // Upstream rejected
             icon = <div className="w-2 h-2 bg-industrial-200 rounded-full" />;
             containerClass = "border-industrial-200 bg-industrial-50";
             textClass = "text-industrial-300 line-through";
          }

          return (
            <div key={role} className="flex flex-col items-center group">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${containerClass}`}>
                {icon}
              </div>
              <span className={`text-[10px] mt-3 uppercase tracking-tight text-center max-w-[60px] leading-tight transition-colors ${textClass}`}>{role}</span>
              {historyItem && (
                 <span className="text-[9px] font-mono text-industrial-400 mt-1">{new Date(historyItem.timestamp).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};