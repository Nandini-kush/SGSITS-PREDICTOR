import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const LOADING_STEPS = [
  'Consulting Machine Learning regression models...',
  'Analyzing 4+ years of SGSITS cutoff trends...',
  'Extracting seat matrix and category quota variables...',
  'Calculating admission probability thresholds...',
  'Formulating AI prediction insights...'
];

export default function LoadingSkeleton() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-pulse p-4">
      {/* Dynamic Text Spinner Overlay */}
      <div className="flex flex-col items-center justify-center p-8 bg-white/40 glass-card rounded-3xl border border-white/50 shadow-lg text-center gap-4">
        {/* Modern Rotating Glowing Loader */}
        <div className="relative w-16 h-16">
          {/* External Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin" />
          {/* Inner Glow */}
          <div className="absolute inset-2 rounded-full bg-blue-550/50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg text-slate-800 font-display">Processing Admission Model</h3>
          <p className="text-sm text-slate-500 font-medium h-5 transition-all duration-300">
            {LOADING_STEPS[stepIndex]}
          </p>
        </div>
      </div>

      {/* Main Skeleton Cards representing the results dashboard */}
      <div className="glass-card rounded-3xl p-8 border border-white/60 shadow-xl space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded-lg" />
            <div className="h-8 w-64 bg-slate-200 rounded-lg" />
            <div className="h-4 w-20 bg-slate-200 rounded-lg" />
          </div>
          {/* Badge Skeleton */}
          <div className="h-8 w-32 bg-slate-200 rounded-full" />
        </div>

        {/* Outer Grid for Rank Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-white/40 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-6 w-16 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Likelihood Skeleton */}
        <div className="space-y-2 pt-4">
          <div className="flex justify-between text-sm">
            <div className="h-4 w-36 bg-slate-200 rounded" />
            <div className="h-4 w-8 bg-slate-200 rounded" />
          </div>
          <div className="h-3.5 w-full bg-slate-200 rounded-full" />
        </div>
      </div>

      {/* AI Insight Skeleton */}
      <div className="p-6 rounded-2xl bg-slate-100/50 border border-slate-200/50 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-slate-200" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
      </div>
    </div>
  );
}
