import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { SpaceRequest, RequestStatus } from '../types';
import { PieChart, Filter, Search, Table, LayoutGrid, ArrowUpRight } from 'lucide-react';

export const GlobalAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    // Load analytics
    const stats = StorageService.getAnalyticsData();
    setData(stats);
    
    // Auto-refresh every 5s for demo feeling
    const interval = setInterval(() => {
        setData(StorageService.getAnalyticsData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="p-10 text-center animate-pulse text-industrial-500 font-bold">LOADING ANALYTICS ENGINE...</div>;

  // Filter Logic for Table
  const filteredHistory = data.allRequests.filter((r: SpaceRequest) => {
      const matchCat = filterCategory ? r.workCell.toLowerCase().includes(filterCategory.toLowerCase()) : true;
      const matchStatus = filterStatus !== 'All' ? r.status === filterStatus : true;
      return matchCat && matchStatus;
  });

  return (
    <div className="animate-enter-3d space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
         <div>
          <h2 className="text-3xl font-black text-industrial-800 uppercase tracking-tight">Facility Analytics</h2>
          <p className="text-industrial-500 font-medium text-sm mt-1 flex items-center gap-2">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
             LIVE SYSTEM DATA
          </p>
        </div>
        <div className="text-right">
             <p className="text-[10px] font-bold text-industrial-400 uppercase tracking-wider">Total Warehouse Capacity</p>
             <p className="text-2xl font-mono font-bold text-industrial-900">{data.totalCapacity.toLocaleString()} SQFT</p>
        </div>
      </div>

      {/* Top Visuals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart Card */}
        <div className="bg-white rounded-xl shadow-card border border-industrial-200 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-500"></div>
            <h3 className="text-xs font-bold text-industrial-500 uppercase tracking-widest mb-6 w-full text-left flex items-center gap-2">
                <PieChart size={16} className="text-brand-500" /> Space Utilization
            </h3>
            
            {/* CSS Conic Gradient Donut Chart */}
            <div className="relative w-48 h-48 rounded-full mb-4 transition-transform duration-500 hover:scale-105"
                 style={{
                     background: `conic-gradient(#3b82f6 0% ${data.percentageUsed}%, #e2e8f0 ${data.percentageUsed}% 100%)`
                 }}
            >
                <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-brand-600 font-mono">{data.percentageUsed}%</span>
                    <span className="text-[10px] font-bold text-industrial-400 uppercase">Occupied</span>
                </div>
            </div>
            
            <div className="flex w-full justify-between px-8 text-xs font-mono font-bold text-industrial-600 mt-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-brand-500 rounded-sm"></div>
                    Used: {data.usedSqFt.toLocaleString()} SQFT
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-industrial-200 rounded-sm"></div>
                    Balance: {data.freeSqFt.toLocaleString()} SQFT
                </div>
            </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card border border-industrial-200 p-6 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-industrial-800"></div>
             <h3 className="text-xs font-bold text-industrial-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <LayoutGrid size={16} className="text-industrial-800" /> Utilization by Work Cell
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[220px]">
                {Object.entries(data.breakdown).map(([cat, sqft]: [string, any], i) => (
                    <div key={i} className="bg-industrial-50 p-4 rounded-lg border border-industrial-100 flex flex-col justify-between hover:border-brand-300 transition-colors group">
                        <span className="text-xs font-bold text-industrial-600 uppercase truncate mb-2">{cat}</span>
                        <div className="flex items-end justify-between">
                             <span className="text-lg font-mono font-bold text-industrial-900 group-hover:text-brand-600">{Math.round(sqft).toLocaleString()} <span className="text-[10px]">sqft</span></span>
                             <div className="h-1 bg-industrial-200 w-1/3 rounded-full overflow-hidden">
                                 <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, (sqft / data.usedSqFt) * 100)}%` }}></div>
                             </div>
                        </div>
                    </div>
                ))}
                {Object.keys(data.breakdown).length === 0 && (
                    <div className="col-span-3 text-center py-10 text-industrial-400 text-sm">No active allocations to display breakdown.</div>
                )}
            </div>
        </div>
      </div>

      {/* History Table with Filters */}
      <div className="bg-white rounded-xl shadow-card border border-industrial-200 overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="p-5 border-b border-industrial-100 bg-industrial-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-sm font-black text-industrial-800 uppercase tracking-wide flex items-center gap-2">
                  <Table size={16} /> Global Request Log
              </h3>
              
              <div className="flex gap-3">
                  <div className="relative">
                      <Search size={14} className="absolute left-3 top-3 text-industrial-400" />
                      <input 
                        type="text" 
                        placeholder="Filter by Work Cell..." 
                        className="pl-9 pr-4 py-2 text-xs font-medium border border-industrial-300 rounded-lg outline-none focus:border-brand-500 w-48 transition-all"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      />
                  </div>
                  
                  <div className="relative">
                      <Filter size={14} className="absolute left-3 top-3 text-industrial-400" />
                      <select 
                         className="pl-9 pr-8 py-2 text-xs font-medium border border-industrial-300 rounded-lg outline-none focus:border-brand-500 appearance-none bg-white cursor-pointer transition-all"
                         value={filterStatus}
                         onChange={(e) => setFilterStatus(e.target.value)}
                      >
                          <option value="All">All Statuses</option>
                          {Object.values(RequestStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
              </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-industrial-100 border-b border-industrial-200">
                      <tr>
                          <th className="px-6 py-3 text-[10px] font-bold text-industrial-500 uppercase tracking-widest">ID</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-industrial-500 uppercase tracking-widest">Machine / Item</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-industrial-500 uppercase tracking-widest">Work Cell</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-industrial-500 uppercase tracking-widest">Dates</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-industrial-500 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-industrial-500 uppercase tracking-widest text-right">Area (SqFt)</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-industrial-100">
                      {filteredHistory.map((req: SpaceRequest) => (
                          <tr key={req.id} className="hover:bg-brand-50/20 transition-colors">
                              <td className="px-6 py-4 text-xs font-mono text-industrial-400">{req.id}</td>
                              <td className="px-6 py-4 text-sm font-bold text-industrial-800">
                                  {req.machineName}
                                  <div className="text-[10px] font-normal text-industrial-500 font-mono mt-0.5">{req.serialNumber}</div>
                              </td>
                              <td className="px-6 py-4 text-xs font-medium text-industrial-600">
                                  <span className="bg-industrial-100 px-2 py-1 rounded border border-industrial-200">{req.workCell}</span>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-industrial-600">
                                  {req.dateIn} <span className="text-industrial-300">→</span> {req.dateOut}
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${
                                      req.status === RequestStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                      req.status === RequestStatus.REJECTED ? 'bg-red-50 text-red-600 border-red-200' :
                                      req.status === RequestStatus.EXPIRED ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                      req.status === RequestStatus.OVERSTAY ? 'bg-red-600 text-white border-red-600' :
                                      'bg-industrial-100 text-industrial-500 border-industrial-200'
                                  }`}>
                                      {req.status}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-mono font-bold text-industrial-700">
                                  {(req.length * req.width * 10.764).toFixed(1)}
                              </td>
                          </tr>
                      ))}
                      {filteredHistory.length === 0 && (
                          <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-industrial-400 text-sm italic">
                                  No records found matching filters.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>

    </div>
  );
};