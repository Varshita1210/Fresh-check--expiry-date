
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, AlertTriangle, Loader2 } from 'lucide-react';

interface CameraScannerProps {
  onCapture: (base64: string) => void;
  isProcessing: boolean;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      console.error(err);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-200">
      {error ? (
        <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
          <AlertTriangle className="text-amber-400 mb-4" size={48} />
          <p>{error}</p>
          <button 
            onClick={startCamera}
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full transition"
          >
            Retry Camera
          </button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          {/* Scanning Overlay UI */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1 rounded-br-lg"></div>
              
              {/* Scan Line Animation */}
              {!isProcessing && (
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-[scan_2s_linear_infinite]"></div>
              )}
            </div>
            <p className="mt-6 text-white text-sm font-medium bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm">
              Align expiry date within the box
            </p>
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center px-4">
            <button
              onClick={captureFrame}
              disabled={isProcessing}
              className={`group relative flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg transition-all active:scale-95 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            >
              <div className="w-16 h-16 border-4 border-slate-100 rounded-full flex items-center justify-center group-hover:border-indigo-100 transition-colors">
                <div className={`w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white`}>
                  {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Camera size={24} />}
                </div>
              </div>
            </button>
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(256px); }
        }
      `}</style>
    </div>
  );
};

export default CameraScanner;
