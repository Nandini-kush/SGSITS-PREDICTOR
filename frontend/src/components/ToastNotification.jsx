import React, { useEffect } from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

export default function ToastNotification({ message, onClose, onRetry }) {
  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <>
      {/* Floating Elegant Toast */}
      <div className="fixed top-6 right-6 z-50 max-w-md w-full sm:w-[400px] bg-white/95 glass-card rounded-2xl shadow-2xl border border-red-100 p-4 animate-slide-up flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-bold text-slate-800 text-sm font-display">Prediction Request Failed</h4>
          <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Modern Inline Error Alert Card */}
      <div className="w-full max-w-2xl mx-auto p-6 rounded-3xl bg-red-50/50 border border-red-100 glass-card text-center space-y-4 animate-fade-in shadow-lg">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-red-800 font-display">Backend server unavailable</h3>
          <p className="text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
            The API server at <code className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs">https://sgsits-predictor.onrender.com</code> is currently offline or unreachable.
            Please verify that the production backend is running.
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        )}
      </div>
    </>
  );
}
