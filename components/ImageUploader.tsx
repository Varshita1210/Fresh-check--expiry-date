
import React, { useRef, useState } from 'react';
import { Upload, Loader2, Lightbulb } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (base64: string) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className={`relative flex flex-col items-center justify-center w-full aspect-[3/4] border-4 border-dashed rounded-3xl transition-all ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'
        } ${isProcessing ? 'opacity-70 pointer-events-none' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center text-slate-500 p-8 text-center">
          <div className={`w-20 h-20 mb-6 rounded-full flex items-center justify-center text-white transition-all ${isProcessing ? 'bg-indigo-400' : 'bg-indigo-600'}`}>
            {isProcessing ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            {isProcessing ? 'Analyzing Label...' : 'Upload Image'}
          </h3>
          <p className="text-sm leading-relaxed max-w-xs">
            {isProcessing 
              ? 'Our AI is searching for expiry dates and product info...' 
              : 'Drag and drop an image of your product label or click to browse files'}
          </p>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px] rounded-3xl">
             {/* Progress overlay if needed */}
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
        <Lightbulb className="text-amber-500 shrink-0" size={18} />
        <p className="text-xs text-amber-800 leading-normal">
          <strong>Tip:</strong> Ensure the expiry date is clearly visible and well-lit for the most accurate results.
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;
