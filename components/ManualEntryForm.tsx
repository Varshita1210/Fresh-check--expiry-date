
import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { Category, ExpiryAnalysis } from '../types';
import { processAnalysisData } from '../services/geminiService';

interface ManualEntryFormProps {
  onSubmit: (analysis: ExpiryAnalysis) => void;
  onCancel: () => void;
}

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    productName: '',
    expiryDate: '',
    category: 'food' as Category
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const analysis = processAnalysisData({
      ...formData,
      foundText: 'Manually entered',
      confidence: 'high'
    });
    onSubmit(analysis);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <Edit3 className="mr-3 text-indigo-600" size={24} />
        Manual Entry
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Name</label>
          <input 
            required
            type="text" 
            placeholder="e.g. Milk, Ibuprofen..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.productName}
            onChange={e => setFormData({...formData, productName: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
          <input 
            required
            type="date" 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.expiryDate}
            onChange={e => setFormData({...formData, expiryDate: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {(['food', 'medicine', 'personal-care', 'household'] as Category[]).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({...formData, category: cat})}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                  formData.category === cat 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex space-x-3">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          Add Item
        </button>
      </div>
    </form>
  );
};

export default ManualEntryForm;
