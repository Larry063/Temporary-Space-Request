import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storageService';
import { Box, Lock, ArrowRight, User as UserIcon, Key } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  const [users] = useState<User[]>(StorageService.getUsers());
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id);
  
  // State for manual login inputs
  const [workId, setWorkId] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoLogin = () => {
    const user = users.find(u => u.id === selectedUserId);
    if (user) onLogin(user);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For this prototype, we guide the user to the demo section if they try to use real creds
    alert("For this system demo, please use the 'Quick Access' panel below to simulate different user roles.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-industrial-900 via-industrial-800 to-brand-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-0 overflow-hidden border border-white/20 relative z-10 animate-enter-3d">
        
        {/* Header */}
        <div className="bg-brand-600 p-8 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
           <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-4 shadow-glow border border-white/20 transform hover:scale-105 transition-transform duration-500">
             <Box className="text-white" size={32} />
           </div>
           <h1 className="text-2xl font-black text-white tracking-tighter uppercase drop-shadow-md">TSM Portal</h1>
           <p className="text-brand-100 font-medium text-xs tracking-wide">Temporary Space Management</p>
        </div>

        <div className="p-8 bg-white">
            
            {/* Standard Login Form */}
            <form onSubmit={handleManualLogin} className="space-y-5 mb-8">
                <div>
                    <label className="block text-xs font-bold text-industrial-500 uppercase mb-2 ml-1">Work ID</label>
                    <div className="relative group">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-industrial-400 group-focus-within:text-brand-500 transition-colors">
                            <UserIcon size={18} />
                        </div>
                        <input 
                            type="text" 
                            value={workId}
                            onChange={(e) => setWorkId(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-industrial-200 rounded-lg text-sm text-industrial-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm placeholder-industrial-300 hover:shadow-md"
                            placeholder="Enter Work ID"
                        />
                    </div>
                </div>
                 <div>
                    <label className="block text-xs font-bold text-industrial-500 uppercase mb-2 ml-1">Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-industrial-400 group-focus-within:text-brand-500 transition-colors">
                            <Lock size={18} />
                        </div>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-industrial-200 rounded-lg text-sm text-industrial-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm placeholder-industrial-300 hover:shadow-md"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full py-3 bg-industrial-900 hover:bg-industrial-800 text-white font-bold uppercase text-sm tracking-wider rounded-lg transition-all duration-300 shadow-md hover:-translate-y-0.5 hover:shadow-xl"
                >
                    Sign In
                </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-x-0 h-px bg-industrial-100"></div>
                <span className="relative z-10 bg-white px-2 text-[10px] font-bold text-industrial-400 uppercase tracking-widest">Or Use Demo Account</span>
            </div>

            {/* Demo Access Section */}
             <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100 transition-colors hover:border-brand-200">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <select
                            className="w-full pl-3 pr-8 py-2 bg-white border border-industrial-200 rounded-lg font-medium text-xs text-industrial-700 focus:border-brand-500 outline-none appearance-none shadow-sm cursor-pointer hover:border-brand-300 transition-all"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.role} — {u.name}
                            </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-industrial-400">
                           <Key size={14} />
                        </div>
                    </div>
                    <button
                        onClick={handleDemoLogin}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold uppercase text-xs tracking-wider rounded-lg transition-all duration-300 shadow-sm flex items-center hover:shadow-brand-500/30"
                    >
                        Go <ArrowRight size={14} className="ml-1" />
                    </button>
                </div>
            </div>
        </div>
        
        <div className="bg-industrial-50 p-4 text-center border-t border-industrial-100">
             <p className="text-[10px] font-mono text-industrial-400 uppercase tracking-wider">Secure Connection • Ver 2.0</p>
        </div>
      </div>
    </div>
  );
};