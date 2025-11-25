import React, { useState, useEffect } from 'react';
import { User, SpaceRequest, RateConfig, RequestStatus } from '../types';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';
import { Calculator, Sparkles, Box, Calendar, Ruler, Hash, Tag, Factory, ArrowRight, RefreshCw } from 'lucide-react';
import { differenceInDays, addDays } from 'date-fns';

interface Props {
  currentUser: User;
  onSuccess: () => void;
  preFillData?: SpaceRequest | null; // Accept pre-fill data
}

export const NewRequest: React.FC<Props> = ({ currentUser, onSuccess, preFillData }) => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [config, setConfig] = useState<RateConfig>(StorageService.getRateConfig());
  const [todayStr, setTodayStr] = useState('');

  const [formData, setFormData] = useState({
    machineName: '',
    serialNumber: '',
    workCell: '',
    costCenter: '',
    dateIn: '',
    dateOut: '',
    length: 0,
    width: 0,
    height: 0,
  });

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [areaSqFt, setAreaSqFt] = useState(0);

  useEffect(() => {
    // Set today's date string for min attribute
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  // Load pre-fill data if available (Renewal flow)
  useEffect(() => {
      if (preFillData) {
          // Pre-fill only machine specs, leave dates blank for user selection
          setFormData({
              machineName: preFillData.machineName,
              serialNumber: preFillData.serialNumber,
              workCell: preFillData.workCell,
              costCenter: preFillData.costCenter,
              length: preFillData.length,
              width: preFillData.width,
              height: preFillData.height,
              dateIn: '', // User must select new date
              dateOut: '' // User must select new date
          });
          setAiFeedback("System Note: Renewal initiated. Please select new dates for this allocation.");
      }
  }, [preFillData]);

  useEffect(() => {
    // Recalculate cost when inputs change
    const days = (formData.dateIn && formData.dateOut) 
      ? Math.max(0, differenceInDays(new Date(formData.dateOut), new Date(formData.dateIn))) 
      : 0;
    
    // Calculate Area in Meters Squared
    const areaM2 = formData.length * formData.width;
    
    // Convert to Square Feet (1 m² = 10.7639 sq ft)
    const sqFt = areaM2 * 10.7639;
    setAreaSqFt(sqFt);

    // Calculate Cost: SqFt * Rate * Days
    const cost = sqFt * config.baseRatePerSquareFoot * (days || 1);
    setEstimatedCost(cost);
  }, [formData, config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'length' || name === 'width' || name === 'height') ? parseFloat(value) || 0 : value
    }));
  };

  const handleAIAnalysis = async () => {
    if (!formData.machineName || !formData.length) return;
    setAnalyzing(true);
    const feedback = await GeminiService.analyzeSpaceRequest(formData);
    setAiFeedback(feedback);
    setAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newRequest: SpaceRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      ...formData,
      calculatedRate: estimatedCost,
      status: RequestStatus.DRAFT, 
      currentApproverRole: null,
      approvalHistory: [],
      createdAt: new Date().toISOString(),
      aiAnalysis: aiFeedback || undefined
    };

    StorageService.submitRequest(newRequest);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 800);
  };

  // High contrast white input fields with Enhanced Picker logic
  const InputField = ({ label, icon: Icon, name, type = "text", placeholder, step, min }: any) => (
    <div className="relative group transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center space-x-2 mb-2">
        {Icon && <Icon size={14} className="text-brand-600" />}
        <label className="text-xs font-bold text-industrial-500 uppercase tracking-wider">{label}</label>
      </div>
      <div className="relative">
        <input 
          required
          type={type}
          step={step}
          name={name}
          min={min}
          value={formData[name as keyof typeof formData]}
          onChange={handleChange}
          onClick={(e) => {
             // Force open picker on click for date inputs
             if (type === 'date' && 'showPicker' in HTMLInputElement.prototype) {
                 try { (e.target as HTMLInputElement).showPicker(); } catch(err) {}
             }
          }}
          onFocus={(e) => {
              // Force open picker on focus for date inputs
             if (type === 'date' && 'showPicker' in HTMLInputElement.prototype) {
                 try { (e.target as HTMLInputElement).showPicker(); } catch(err) {}
             }
          }}
          className={`w-full px-4 py-3 bg-white border border-industrial-200 rounded-lg text-industrial-900 font-mono text-sm placeholder-industrial-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-sm hover:shadow-md ${type === 'date' ? 'cursor-pointer appearance-none' : ''}`}
          placeholder={placeholder}
        />
        {/* Visual indicator for date fields if it's empty */}
        {type === 'date' && !formData[name as keyof typeof formData] && (
           <div className="absolute right-3 top-3 pointer-events-none text-industrial-300">
              <Calendar size={16} />
           </div>
        )}
        
        <div className="absolute right-3 top-3 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
           <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-enter-3d">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-industrial-800 uppercase tracking-tight">
              {preFillData ? 'Renew Allocation' : 'New Allocation'}
          </h2>
          <p className="text-industrial-500 font-medium text-sm mt-1 flex items-center gap-2">
             <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
             {preFillData ? 'CONFIRM RENEWAL DETAILS' : 'FILL DETAILS FOR SPACE APPROVAL'}
          </p>
        </div>
        <div className="bg-white px-4 py-2 border border-industrial-200 rounded-lg font-mono text-xs text-brand-600 shadow-sm flex items-center gap-2">
           <Hash size={14} />
           AUTO-ID
        </div>
      </div>
      
      {preFillData && (
          <div className="mb-6 bg-brand-50 border border-brand-200 p-4 rounded-xl flex items-center gap-3 animate-pulse">
              <RefreshCw size={20} className="text-brand-600" />
              <div className="text-brand-800 text-sm font-bold">Renewal Mode: Machine specs loaded. Please Select New Dates.</div>
          </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 perspective-1000">
        
        {/* SECTION 1: ASSET IDENTIFICATION */}
        <div className="bg-white border border-industrial-100 rounded-xl overflow-hidden shadow-card hover:shadow-depth transition-all duration-500 ease-out transform">
          <div className="bg-gradient-to-r from-industrial-50 to-white px-6 py-4 border-b border-industrial-100 flex justify-between items-center">
             <h3 className="font-bold text-industrial-700 flex items-center gap-2">
               <div className="p-1 bg-brand-100 text-brand-600 rounded">
                 <Tag size={18} />
               </div>
               ASSET IDENTIFICATION
             </h3>
             <span className="text-[10px] bg-brand-50 text-brand-600 px-2 py-1 rounded-full font-bold uppercase border border-brand-100">Required</span>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/50">
            <InputField 
              label="Machine / Accessory Name" 
              name="machineName" 
              icon={Box}
              placeholder="e.g. High-Speed Motor 2000"
            />
            <InputField 
              label="Serial Number (SN)" 
              name="serialNumber" 
              icon={Hash}
              placeholder="SN-XXXX-XXXX"
            />
            <InputField 
              label="Origin Work Cell" 
              name="workCell" 
              icon={Factory}
              placeholder="Assembly Line A"
            />
            <InputField 
              label="Cost Center Charge" 
              name="costCenter" 
              icon={Tag}
              placeholder="CC-9900"
            />
          </div>
        </div>

        {/* SECTION 2: SPECS & TIMING */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Dimensions */}
          <div className="lg:col-span-2 bg-white border border-industrial-100 rounded-xl overflow-hidden shadow-card hover:shadow-depth transition-all duration-500 ease-out transform">
            <div className="bg-gradient-to-r from-industrial-50 to-white px-6 py-4 border-b border-industrial-100 flex justify-between items-center">
              <h3 className="font-bold text-industrial-700 flex items-center gap-2">
                <div className="p-1 bg-brand-100 text-brand-600 rounded">
                  <Ruler size={18} />
                </div>
                SPECS & DURATION
              </h3>
              <button
                 type="button"
                 onClick={handleAIAnalysis}
                 disabled={analyzing}
                 className="flex items-center space-x-2 text-xs font-bold text-white bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-1.5 rounded-full shadow-lg hover:shadow-brand-500/30 hover:scale-105 transition-all duration-300"
               >
                 <Sparkles size={14} className={analyzing ? "animate-spin" : ""} />
                 <span>{analyzing ? 'SCANNING...' : 'AI CHECK'}</span>
               </button>
            </div>

            <div className="p-6">
               {aiFeedback && (
                  <div className="mb-6 p-4 bg-indigo-50 border-l-4 border-brand-500 rounded-r text-sm text-indigo-900 font-medium animate-enter-3d">
                     <strong className="block text-brand-600 text-xs uppercase mb-1 flex items-center gap-2">
                        <Sparkles size={12} /> AI Analysis Report
                     </strong>
                     {aiFeedback}
                  </div>
                )}

              <div className="grid grid-cols-3 gap-4 mb-6 bg-industrial-50/50 p-6 rounded-xl border border-industrial-100/50">
                <InputField label="Length (M)" name="length" type="number" step="0.1" />
                <InputField label="Width (M)" name="width" type="number" step="0.1" />
                <InputField label="Height (M)" name="height" type="number" step="0.1" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField 
                    label="Date In" 
                    name="dateIn" 
                    type="date" 
                    icon={Calendar} 
                    min={todayStr} 
                />
                <InputField 
                    label="Date Out" 
                    name="dateOut" 
                    type="date" 
                    icon={Calendar} 
                    min={formData.dateIn || todayStr}
                />
              </div>
            </div>
          </div>

          {/* Cost Calculator Card */}
          <div className="bg-gradient-to-br from-industrial-900 to-brand-900 rounded-xl shadow-2xl overflow-hidden text-white flex flex-col transform transition-transform hover:-translate-y-2 duration-300 relative group">
             {/* Background decoration */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="px-6 py-5 border-b border-white/10 bg-white/5 backdrop-blur-sm">
               <h3 className="font-bold text-white flex items-center gap-2">
                  <Calculator size={18} className="text-brand-400" />
                  ESTIMATED CHARGES
               </h3>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-center items-center text-center relative z-10">
               <div className="text-brand-200 text-xs font-bold uppercase tracking-widest mb-2">Total Calculation</div>
               <div className="text-5xl font-mono font-bold text-white mb-2 drop-shadow-glow">
                 {estimatedCost.toFixed(2)}
               </div>
               <div className="text-xl font-bold text-brand-300">{config.currency}</div>
               
               <div className="mt-8 w-full pt-6 border-t border-white/10 text-left space-y-3">
                 <div className="flex justify-between text-xs text-brand-100 font-mono">
                    <span>RATE / SQFT:</span>
                    <span>{config.baseRatePerSquareFoot}</span>
                 </div>
                 <div className="flex justify-between text-xs text-brand-100 font-mono">
                    <span>AREA:</span>
                    <span>{areaSqFt.toFixed(2)} SQFT</span>
                 </div>
                 <div className="flex justify-between text-xs text-brand-100 font-mono">
                    <span>DAYS:</span>
                    <span>{formData.dateIn && formData.dateOut ? differenceInDays(new Date(formData.dateOut), new Date(formData.dateIn)) : 0}</span>
                 </div>
               </div>
            </div>
            
            <button
             type="submit"
             disabled={loading}
             className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group-hover:bg-brand-500"
           >
             {loading ? 'PROCESSING...' : (
               <>
                 SUBMIT MANIFEST <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </>
             )}
           </button>
          </div>

        </div>

      </form>
    </div>
  );
};