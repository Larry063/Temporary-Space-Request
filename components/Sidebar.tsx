import React from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, PlusCircle, Users, Settings, LogOut, FileText, Box } from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  onLogout: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout, currentView, onChangeView }) => {
  
  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 border-l-4 transition-all duration-300 ease-out group ${
        currentView === view 
          ? 'border-brand-500 bg-industrial-800 text-white shadow-[inset_10px_0_20px_-10px_rgba(59,130,246,0.3)]' 
          : 'border-transparent text-industrial-400 hover:bg-industrial-800 hover:text-white hover:pl-6'
      }`}
    >
      <Icon size={20} className={`transition-colors duration-300 ${currentView === view ? 'text-brand-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'group-hover:text-brand-400'}`} />
      <span className="font-medium tracking-wide text-sm">{label}</span>
    </button>
  );

  return (
    <div className="w-64 bg-industrial-900 h-screen flex flex-col fixed left-0 top-0 z-10 shadow-2xl border-r border-industrial-800">
      <div className="p-6 border-b border-industrial-800 flex items-center space-x-3 bg-industrial-950/50 backdrop-blur-sm">
        <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center shadow-glow transform transition-transform hover:scale-110 duration-300">
          <Box className="text-white" size={24} />
        </div>
        <div>
          <span className="block text-lg font-black text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-industrial-400">TSM</span>
          <span className="text-[10px] font-mono text-industrial-400 uppercase tracking-widest">System v2.0</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-2">
        <div className="px-6 pb-2">
          <p className="text-[10px] font-bold text-industrial-500 uppercase tracking-widest">Operations</p>
        </div>

        {currentUser.role === UserRole.REQUESTER && (
          <>
            <NavItem view="requester-dashboard" icon={LayoutDashboard} label="MY STATUS" />
            <NavItem view="new-request" icon={PlusCircle} label="NEW REQUEST" />
          </>
        )}

        {(currentUser.role === UserRole.ADMIN) && (
          <>
            <NavItem view="admin-users" icon={Users} label="USER MGMT" />
            <NavItem view="admin-rates" icon={Settings} label="RATE CONFIG" />
            <NavItem view="admin-features" icon={PlusCircle} label="FEATURES" />
          </>
        )}

        {/* Approver Views */}
        {Object.values(UserRole).includes(currentUser.role) && 
         currentUser.role !== UserRole.ADMIN && 
         currentUser.role !== UserRole.REQUESTER && (
          <NavItem view="approver-dashboard" icon={FileText} label="APPROVALS" />
        )}

      </div>

      <div className="p-4 bg-industrial-950/30 border-t border-industrial-800">
        <div className="flex items-center space-x-3 mb-4 px-2 group cursor-default">
          <div className="w-10 h-10 rounded-lg bg-industrial-800 border border-industrial-700 flex items-center justify-center text-brand-400 font-bold font-mono shadow-inner group-hover:border-brand-500/50 transition-colors">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate font-mono group-hover:text-brand-100 transition-colors">{currentUser.name}</p>
            <p className="text-[10px] text-brand-500 uppercase tracking-wider font-bold truncate">{currentUser.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg border border-industrial-700 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all duration-200 text-industrial-400 text-xs font-bold uppercase tracking-wider group"
        >
          <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Disconnect</span>
        </button>
      </div>
    </div>
  );
};