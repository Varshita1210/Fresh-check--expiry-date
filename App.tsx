
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  History, 
  LayoutDashboard, 
  Leaf, 
  UserCircle, 
  Heart, 
  XCircle, 
  Clock, 
  CheckCircle, 
  Utensils, 
  Pill, 
  Sparkles, 
  Home, 
  Package,
  Box,
  Trash2,
  AlertTriangle,
  Camera,
  Upload,
  Keyboard
} from 'lucide-react';
import CameraScanner from './components/CameraScanner';
import ImageUploader from './components/ImageUploader';
import ManualEntryForm from './components/ManualEntryForm';
import ExpiryCard from './components/ExpiryCard';
import { analyzeExpiryImage } from './services/geminiService';
import { AppView, ScanMethod, ScanResult, Category, DashboardStats } from './types';
import { cn } from './lib/utils';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [method, setMethod] = useState<ScanMethod>('camera');
  const [results, setResults] = useState<ScanResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('freshcheck_v2_results');
    if (saved) setResults(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('freshcheck_v2_results', JSON.stringify(results));
  }, [results]);

  const stats: DashboardStats = useMemo(() => {
    return results.reduce((acc, curr) => {
      acc.total++;
      if (curr.status === 'expired') acc.expired++;
      else if (curr.status === 'expiring-soon') acc.soon++;
      else acc.safe++;
      return acc;
    }, { total: 0, expired: 0, soon: 0, safe: 0 });
  }, [results]);

  const healthScore = useMemo(() => {
    if (stats.total === 0) return 100;
    return Math.round(((stats.total - stats.expired) / stats.total) * 100);
  }, [stats]);

  const filteredResults = useMemo(() => {
    return results
      .filter(r => activeFilter === 'all' || r.category === activeFilter)
      .filter(r => r.productName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [results, activeFilter, searchQuery]);

  const recentItems = useMemo(() => results.slice(0, 3), [results]);

  const handleScan = async (base64: string) => {
    setIsProcessing(true);
    try {
      const analysis = await analyzeExpiryImage(base64);
      const newResult: ScanResult = {
        ...analysis,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageUrl: `data:image/jpeg;base64,${base64}`
      };
      setResults(prev => [newResult, ...prev]);
      setView('history');
    } catch (e) {
      alert("Analysis failed. Try again with a clearer photo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualAdd = (analysis: any) => {
    const newResult: ScanResult = {
      ...analysis,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    setResults(prev => [newResult, ...prev]);
    setView('history');
  };

  const renderDashboard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pb-28"
    >
      {/* Premium Hero Card with Health Score */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-indigo-100 text-sm font-semibold opacity-90 uppercase tracking-widest">Inventory Health</p>
            <h2 className="text-5xl font-black mt-2">{healthScore}%</h2>
            <p className="text-indigo-100/70 text-xs font-medium mt-1">
              {stats.expired > 0 ? `${stats.expired} items need attention` : 'All items are looking good!'}
            </p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center relative">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray={`${healthScore * 2.13} 213`} className="text-emerald-400 opacity-100" />
            </svg>
            <Heart className="absolute text-emerald-300 fill-emerald-300" size={24} />
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <button onClick={() => setView('scan')} className="bg-white text-indigo-700 px-6 py-3 rounded-2xl text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center">
            <Plus className="mr-2" size={18} />Scan Item
          </button>
        </div>
      </div>
      
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Expired', count: stats.expired, color: 'text-red-500', bg: 'bg-red-50', icon: XCircle },
          { label: 'Soon', count: stats.soon, color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock },
          { label: 'Safe', count: stats.safe, color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle }
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-xl font-black text-slate-800 leading-none">{stat.count}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Categories Horizontal Scroll */}
      <div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 px-1">Top Categories</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {['food', 'medicine', 'personal-care', 'household'].map(cat => {
            const count = results.filter(r => r.category === cat).length;
            const icons: Record<string, any> = { food: Utensils, medicine: Pill, 'personal-care': Sparkles, household: Home };
            const Icon = icons[cat];
            return (
              <div 
                key={cat} 
                onClick={() => { setActiveFilter(cat as Category); setView('history'); }} 
                className="shrink-0 w-32 p-4 bg-white rounded-[2rem] border border-slate-100 hover:border-indigo-200 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="w-8 h-8 bg-slate-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                  <Icon size={16} />
                </div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{cat}</p>
                <p className="font-bold text-slate-700 text-sm">{count} items</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {recentItems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Activity</h3>
            <button onClick={() => setView('history')} className="text-xs font-bold text-indigo-600">View All</button>
          </div>
          <div className="space-y-3">
            {recentItems.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-50 shadow-sm">
                 <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Box size={20} /></div>}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate text-sm">{item.productName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Added {new Date(item.timestamp).toLocaleDateString()}</p>
                 </div>
                 <div className={cn(
                   "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                   item.status === 'expired' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                 )}>
                   {item.status}
                 </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const renderScan = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6 pb-32"
    >
      <div className="flex bg-slate-200/50 backdrop-blur-sm p-1.5 rounded-[1.5rem] max-w-xs mx-auto mb-4 border border-white">
        {[
          { id: 'camera', icon: Camera },
          { id: 'upload', icon: Upload },
          { id: 'manual', icon: Keyboard }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id as ScanMethod)}
            className={cn(
              "flex-1 py-2.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
              method === m.id ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'
            )}
          >
            <m.icon size={14} />
            {m.id}
          </button>
        ))}
      </div>

      {method === 'camera' && <CameraScanner onCapture={handleScan} isProcessing={isProcessing} />}
      {method === 'upload' && <ImageUploader onUpload={handleScan} isProcessing={isProcessing} />}
      {method === 'manual' && <ManualEntryForm onSubmit={handleManualAdd} onCancel={() => setView('dashboard')} />}
    </motion.div>
  );

  const renderHistory = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-32"
    >
      {/* Search & Filter Header */}
      <div className="sticky top-0 bg-slate-50/90 backdrop-blur-xl pt-2 pb-4 z-10 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          <button 
            onClick={() => setActiveFilter('all')}
            className={cn(
              "shrink-0 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
              activeFilter === 'all' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-100 text-slate-400'
            )}
          >
            All
          </button>
          {['food', 'medicine', 'personal-care', 'household'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveFilter(cat as Category)}
              className={cn(
                "shrink-0 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                activeFilter === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-100 text-slate-400'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="py-20 text-center space-y-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-inner">
            <Package size={48} />
          </div>
          <div className="space-y-1">
            <p className="text-slate-600 font-black uppercase tracking-widest text-sm">No items found</p>
            <p className="text-slate-400 text-xs font-medium">Try adjusting your search or filters</p>
          </div>
          <button onClick={() => { setSearchQuery(''); setActiveFilter('all'); }} className="text-indigo-600 text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Reset View</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Matching Items ({filteredResults.length})</p>
          <AnimatePresence mode="popLayout">
            {filteredResults.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <ExpiryCard item={item} onDelete={(id) => setResults(prev => prev.filter(r => r.id !== id))} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-indigo-100">
      <div className="max-w-md mx-auto px-6 pt-10">
        {/* Top App Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-200 rotate-3 transition-transform hover:rotate-0">
              <Leaf size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">FreshCheck</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Monitoring</p>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-500 border border-slate-100 transition-all hover:bg-slate-50 hover:border-slate-200 cursor-pointer">
              <UserCircle size={24} />
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {view === 'dashboard' && renderDashboard()}
          {view === 'scan' && renderScan()}
          {view === 'history' && renderHistory()}
        </AnimatePresence>

        {/* Modern Floating Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-10 pointer-events-none z-50">
          <div className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] p-2.5 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto border border-white/10">
            <button 
              onClick={() => setView('dashboard')}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-4 rounded-[2rem] transition-all duration-300",
                view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <LayoutDashboard size={20} />
              <span className="text-[8px] font-black uppercase mt-1 opacity-60">Home</span>
            </button>
            
            <button 
              onClick={() => setView('scan')}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl -translate-y-8 transition-all duration-500 text-white border-4 border-slate-900",
                view === 'scan' ? 'bg-indigo-600 rotate-90 scale-110 shadow-indigo-500/40' : 'bg-slate-800 hover:bg-slate-700'
              )}
            >
              <Plus size={28} />
            </button>

            <button 
              onClick={() => setView('history')}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-4 rounded-[2rem] transition-all duration-300",
                view === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <History size={20} />
              <span className="text-[8px] font-black uppercase mt-1 opacity-60">Items</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
