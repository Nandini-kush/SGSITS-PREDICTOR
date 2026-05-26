import React from 'react';

export default function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Absolute background color */}
      <div className="absolute inset-0 bg-slate-50/50" />

      {/* Grid Lines Pattern */}
      <div className="absolute inset-0 grid-overlay" />

      {/* Soft Ambient Blur Glows - Left Blue */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl animate-pulse-subtle" />

      {/* Soft Ambient Blur Glows - Right Purple */}
      <div className="absolute top-20 -right-40 w-96 h-96 rounded-full bg-purple-400/20 blur-3xl animate-pulse-subtle" style={{ animationDelay: '1.5s' }} />

      {/* Subtle bottom center glow to connect to footer */}
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-indigo-200/20 blur-3xl" />
    </div>
  );
}
