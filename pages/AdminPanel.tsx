import React, { useState } from 'react';
import { User, UserRole, RateConfig } from '../types';
import { StorageService } from '../services/storageService';
import { Trash2, UserPlus, Save, DollarSign, Plus, CheckCircle, Zap, Clock, CircleDashed, Maximize2, BellRing, Mail, Smartphone } from 'lucide-react';

interface Props {
  view: 'users' | 'rates' | 'features' | 'workflow';
}

export const AdminPanel: React.FC<Props> = ({ view }) => {
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [config, setConfig] = useState<RateConfig>(StorageService.getRateConfig());
  const [newUser, setNewUser] = useState<Partial<User>>({ role: UserRole.REQUESTER, name: '', email: '' });
  
  // Mock features list for the "Add new feature" requirement
  const [features, setFeatures] = useState<Array<{name: string, status: 'Active' | 'Beta' | 'Planned'}>>([
    { name: "Dark Mode Support", status: 'Beta' },
    { name: "Mobile Push Notifications", status: 'Active' },
    { name: "Email Notification Service", status: 'Active' }
  ]);
  const [newFeatureText, setNewFeatureText] = useState("");

  // Workflow Oversight State
  const [workflowRequests] = useState(StorageService.getRequests().filter(r => r.status === 'Pending Approval' && r.currentApproverRole));
  const [nudgeLoading, setNudgeLoading] = useState<string | null>(null);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.role) return;
    
    StorageService.addUser({
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
    setUsers(StorageService.getUsers());
    setNewUser({ role: UserRole.REQUESTER, name: '', email: '' });
  };

  const handleRemoveUser = (id: string) => {
    StorageService.removeUser(id);
    setUsers(StorageService.getUsers());
  };

  const handleUpdateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateRateConfig(config);
    alert('Rate configuration updated successfully!');
  };

  const handleAddFeature = () => {
    if(newFeatureText) {
        setFeatures([...features, { name: newFeatureText, status: 'Planned' }]);
        setNewFeatureText("");
    }
  }

  const handleNudge = (role: string, type: 'email' | 'whatsapp') => {
      const targetKey = `${role}-${type}`;
      setNudgeLoading(targetKey);
      
      // Simulate API call
      setTimeout(() => {
          const targetUsers = users.filter(u => u.role === role);
          targetUsers.forEach(u => {
             StorageService.sendAdminReminder(u.id, type === 'email' ? 'Urgent: Approval Required' : 'Reminder: Check TSM App');
          });
          alert(`Simulated ${type === 'email' ? 'Email' : 'WhatsApp'} sent to all ${role} users.`);
          setNudgeLoading(null);
      }, 1500);
  }

  if (view === 'workflow') {
      // Group pending requests by role
      const bottleneckMap: Record<string, number> = {};
      workflowRequests.forEach(r => {
          if(r.currentApproverRole) {
              bottleneckMap[r.currentApproverRole] = (bottleneckMap[r.currentApproverRole] || 0) + 1;
          }
      });

      return (
          <div className="animate-enter-3d space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-industrial-800 uppercase tracking-tight">Workflow Oversight</h2>
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-xs uppercase border border-red-100 flex items-center gap-2">
                    <CircleDashed className="animate-spin" size={14} />
                    {workflowRequests.length} Pending Actions Global
                </div>
              </div>

              <div className="grid gap-6">
                  {Object.entries(bottleneckMap).map(([role, count]) => {
                      const responsibleUsers = users.filter(u => u.role === role);
                      return (
                          <div key={role} className="bg-white rounded-xl shadow-card border border-industrial-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                              <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-lg font-black text-industrial-800 uppercase">{role}</h3>
                                      <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold uppercase">{count} Stuck Requests</span>
                                  </div>
                                  <p className="text-sm text-industrial-500 mb-3">Responsible Personnel:</p>
                                  <div className="flex flex-wrap gap-2">
                                      {responsibleUsers.map(u => (
                                          <span key={u.id} className="bg-industrial-50 border border-industrial-200 px-2 py-1 rounded text-xs font-mono text-industrial-600 flex items-center gap-1">
                                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                              {u.name}
                                          </span>
                                      ))}
                                      {responsibleUsers.length === 0 && <span className="text-xs text-red-400 italic">No users assigned to this role!</span>}
                                  </div>
                              </div>

                              <div className="flex gap-3 w-full md:w-auto">
                                  <button 
                                    onClick={() => handleNudge(role, 'email')}
                                    disabled={!!nudgeLoading}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-industrial-100 hover:border-brand-300 text-industrial-600 hover:text-brand-600 rounded-lg font-bold text-xs uppercase transition-all shadow-sm"
                                  >
                                      {nudgeLoading === `${role}-email` ? <CircleDashed className="animate-spin" size={16}/> : <Mail size={16} />}
                                      Send Email
                                  </button>
                                  <button 
                                    onClick={() => handleNudge(role, 'whatsapp')}
                                    disabled={!!nudgeLoading}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-bold text-xs uppercase transition-all shadow-lg hover:shadow-emerald-500/30"
                                  >
                                       {nudgeLoading === `${role}-whatsapp` ? <CircleDashed className="animate-spin" size={16}/> : <Smartphone size={16} />}
                                      WhatsApp Nudge
                                  </button>
                              </div>
                          </div>
                      )
                  })}

                  {Object.keys(bottleneckMap).length === 0 && (
                      <div className="p-12 text-center border-2 border-dashed border-industrial-200 rounded-xl">
                          <CheckCircle className="mx-auto text-emerald-400 mb-4" size={48} />
                          <h3 className="text-industrial-400 font-bold uppercase">No Bottlenecks Detected</h3>
                          <p className="text-xs text-industrial-300 mt-2">All workflows are proceeding smoothly.</p>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  if (view === 'rates') {
    return (
      <div className="max-w-2xl animate-enter-3d">
        <h2 className="text-2xl font-black text-industrial-800 mb-6 uppercase tracking-tight">Rate Configuration</h2>
        <div className="bg-white p-8 rounded-xl shadow-card border border-industrial-200">
           <form onSubmit={handleUpdateConfig} className="space-y-6">
              
              {/* Capacity Config */}
              <div>
                <label className="block text-xs font-bold text-industrial-500 uppercase mb-2">Total Facility Capacity (SqFt)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Maximize2 size={18} className="text-industrial-400" />
                  </div>
                  <input 
                    type="number" step="100"
                    className="pl-12 w-full px-4 py-3 bg-white border-2 border-industrial-200 rounded-lg text-industrial-900 font-mono font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm hover:shadow-md"
                    value={config.totalWarehouseSqFt || 50000}
                    onChange={(e) => setConfig({...config, totalWarehouseSqFt: parseFloat(e.target.value)})}
                  />
                </div>
                <p className="text-xs text-industrial-400 mt-2 font-mono">Used to calculate analytics utilization percentages.</p>
              </div>

              <div className="border-t border-industrial-100 my-6"></div>

              {/* Rate Config */}
              <div>
                <label className="block text-xs font-bold text-industrial-500 uppercase mb-2">Base Rate per Square Foot (SqFt) / Day</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign size={18} className="text-brand-500" />
                  </div>
                  <input 
                    type="number" step="0.01"
                    className="pl-12 w-full px-4 py-3 bg-white border-2 border-industrial-200 rounded-lg text-industrial-900 font-mono font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm hover:shadow-md"
                    value={config.baseRatePerSquareFoot}
                    onChange={(e) => setConfig({...config, baseRatePerSquareFoot: parseFloat(e.target.value)})}
                  />
                </div>
                <p className="text-xs text-industrial-400 mt-2 font-mono">Formula: (Length × Width × 10.764) × Rate × Days.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-industrial-500 uppercase mb-2">Currency Code</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-white border-2 border-industrial-200 rounded-lg text-industrial-900 font-bold focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none uppercase transition-all shadow-sm hover:shadow-md"
                  value={config.currency}
                  onChange={(e) => setConfig({...config, currency: e.target.value})}
                />
              </div>

              <button type="submit" className="flex items-center space-x-2 px-8 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-500 font-bold uppercase tracking-wider shadow-lg hover:shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 w-full justify-center">
                <Save size={18} />
                <span>Save Configuration</span>
              </button>
           </form>
        </div>
      </div>
    );
  }

  if (view === 'features') {
      return (
          <div className="max-w-2xl animate-enter-3d">
            <h2 className="text-2xl font-black text-industrial-800 mb-6 uppercase tracking-tight">System Features</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-card border border-industrial-200 mb-8">
                <label className="block text-xs font-bold text-industrial-500 uppercase mb-2">Add New Feature Request</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Feature name..." 
                        className="flex-1 bg-white border-2 border-industrial-200 rounded-lg px-4 py-3 outline-none focus:border-brand-500 font-medium text-industrial-800 transition-all"
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                    />
                    <button onClick={handleAddFeature} className="bg-industrial-800 hover:bg-industrial-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold uppercase text-xs tracking-wider transition-colors shadow-lg">
                        <Plus size={18} /> Add
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {features.map((f, i) => {
                    let icon, iconBg, badgeStyle;
                    
                    switch(f.status) {
                        case 'Active':
                            icon = <CheckCircle size={18} />;
                            iconBg = "bg-emerald-100 text-emerald-600";
                            badgeStyle = "bg-emerald-50 border-emerald-200 text-emerald-700";
                            break;
                        case 'Beta':
                            icon = <Zap size={18} />;
                            iconBg = "bg-amber-100 text-amber-600";
                            badgeStyle = "bg-amber-50 border-amber-200 text-amber-700";
                            break;
                        case 'Planned':
                            icon = <Clock size={18} />;
                            iconBg = "bg-industrial-100 text-industrial-500";
                            badgeStyle = "bg-industrial-50 border-industrial-200 text-industrial-500";
                            break;
                        default:
                             icon = <CircleDashed size={18} />;
                             iconBg = "bg-gray-100 text-gray-500";
                             badgeStyle = "bg-gray-50 border-gray-200 text-gray-500";
                    }

                    return (
                        <div key={i} className="bg-white p-5 rounded-xl border border-industrial-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${iconBg} shadow-sm`}>
                                {icon}
                            </div>
                            <span className="font-bold text-industrial-800 text-sm tracking-wide">{f.name}</span>
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-full border tracking-widest ${badgeStyle}`}>
                                {f.status}
                            </span>
                        </div>
                    );
                })}
            </div>
          </div>
      )
  }

  // User Management View
  return (
    <div className="animate-enter-3d">
      <h2 className="text-2xl font-black text-industrial-800 mb-6 uppercase tracking-tight">User Management</h2>
      
      {/* Add User Form */}
      <div className="bg-white p-8 rounded-xl shadow-card border border-industrial-200 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500"></div>
        <h3 className="text-lg font-bold mb-6 flex items-center text-industrial-800 uppercase tracking-wide">
            <div className="w-8 h-8 rounded bg-brand-100 text-brand-600 flex items-center justify-center mr-3">
                <UserPlus size={18} />
            </div>
            Add New User
        </h3>
        
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-industrial-500 uppercase mb-2">Name</label>
            <input 
              required
              className="w-full px-4 py-3 bg-white border-2 border-industrial-200 rounded-lg text-industrial-900 font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              placeholder="Full Name"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-industrial-500 uppercase mb-2">Email</label>
            <input 
              required
              type="email"
              className="w-full px-4 py-3 bg-white border-2 border-industrial-200 rounded-lg text-industrial-900 font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              placeholder="user@example.com"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-industrial-500 uppercase mb-2">Role Assignment</label>
            <div className="relative">
                <select 
                className="w-full px-4 py-3 bg-white border-2 border-industrial-200 rounded-lg text-industrial-900 font-medium focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                >
                {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-industrial-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
            </div>
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="w-full px-6 py-3.5 bg-brand-600 text-white rounded-lg hover:bg-brand-500 font-bold uppercase text-xs tracking-wider shadow-lg hover:shadow-brand-500/30 transition-all transform hover:-translate-y-0.5">
                Create Account
            </button>
          </div>
        </form>
      </div>

      {/* User List */}
      <div className="bg-white rounded-xl shadow-card border border-industrial-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-industrial-50 border-b border-industrial-100">
            <tr>
              <th className="px-8 py-4 text-[10px] font-bold text-industrial-500 uppercase tracking-widest">Name</th>
              <th className="px-8 py-4 text-[10px] font-bold text-industrial-500 uppercase tracking-widest">Email</th>
              <th className="px-8 py-4 text-[10px] font-bold text-industrial-500 uppercase tracking-widest">Role</th>
              <th className="px-8 py-4 text-[10px] font-bold text-industrial-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-industrial-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-brand-50/30 transition-colors group">
                <td className="px-8 py-5 text-sm font-bold text-industrial-800">{user.name}</td>
                <td className="px-8 py-5 text-sm font-medium text-industrial-600 font-mono">{user.email}</td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                      user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                      user.role === UserRole.REQUESTER ? 'bg-brand-50 text-brand-700 border-brand-200' :
                      'bg-industrial-100 text-industrial-600 border-industrial-200'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  {user.role !== UserRole.ADMIN && (
                    <button 
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-industrial-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};