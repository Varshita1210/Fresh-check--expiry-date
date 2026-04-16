
import React from 'react';
import { Utensils, Pill, Sparkles, Home, Box, Trash2 } from 'lucide-react';
import { ScanResult, Category } from '../types';

interface ExpiryCardProps {
  item: ScanResult;
  onDelete: (id: string) => void;
}

const CategoryIcon = ({ category }: { category: Category }) => {
  switch (category) {
    case 'food': return <Utensils size={20} />;
    case 'medicine': return <Pill size={20} />;
    case 'personal-care': return <Sparkles size={20} />;
    case 'household': return <Home size={20} />;
    default: return <Box size={20} />;
  }
};

const ExpiryCard: React.FC<ExpiryCardProps> = ({ item, onDelete }) => {
  const getStatusConfig = () => {
    switch (item.status) {
      case 'expired': return { dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', label: 'Expired' };
      case 'expiring-soon': return { dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', label: 'Expiring' };
      default: return { dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Fresh' };
    }
  };

  const config = getStatusConfig();
  const date = new Date(item.expiryDate);
  const isInvalidDate = isNaN(date.getTime());

  return (
    <div className="group relative bg-white rounded-[2.5rem] p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl bg-slate-50 overflow-hidden border border-slate-50 group-hover:border-indigo-100 transition-colors shadow-inner">
            {item.imageUrl ? (
              <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="text-indigo-400">
                <CategoryIcon category={item.category} />
              </div>
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${config.dot}`}></div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-black text-slate-800 truncate pr-4 text-base tracking-tight">{item.productName}</h4>
          </div>
          
          <div className="flex items-center mt-0.5 space-x-2">
             <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-black uppercase tracking-widest">
               {item.category}
             </span>
             <span className="text-[10px] text-slate-400 font-bold">
               {isInvalidDate ? 'No Date' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
             </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${config.bg} ${config.text}`}>
                 {item.daysRemaining !== null 
                    ? (item.daysRemaining < 0 ? `${Math.abs(item.daysRemaining)}d ago` : `${item.daysRemaining}d left`)
                    : 'Undated'}
               </div>
            </div>
            
            <button 
              onClick={() => onDelete(item.id)}
              className="w-9 h-9 rounded-2xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiryCard;
