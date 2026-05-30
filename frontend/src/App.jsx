import React, { useState } from 'react';
import axios from 'axios';
import { 
  GraduationCap, 
  Cpu, 
  Database, 
  Zap, 
  ArrowRight 
} from 'lucide-react';

// Assets
import sgsitsLogo from './assets/sgsits-logo.png';

// Components
import GridBackground from './components/GridBackground';
import PredictionForm from './components/PredictionForm';
import ResultSection from './components/ResultSection';
import LoadingSkeleton from './components/LoadingSkeleton';
import ToastNotification from './components/ToastNotification';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [lastSubmittedData, setLastSubmittedData] = useState(null);

  const handlePredict = async (formData) => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    setLastSubmittedData(formData);

    try {
      // Direct POST request to the real FastAPI backend endpoint
      const response = await axios.post('https://sgsits-predictor.onrender.com/predict_all', formData, {
        headers: { 
          'Content-Type': 'application/json' 
        },
        timeout: 6000
      });

      if (response.data && response.data.status === 'success') {
        setTimeout(() => {
          setPrediction(response.data);
          setLoading(false);
        }, 1200);
      } else {
        throw new Error(response.data?.detail || 'Inference error occurred.');
      }

    } catch (err) {
      console.error('API connection failed:', err);
      let errorMsg = 'Backend server unavailable';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          errorMsg = detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
        } else if (typeof detail === 'string') {
          errorMsg = detail;
        } else {
          errorMsg = JSON.stringify(detail);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setTimeout(() => {
        setError(errorMsg);
        setLoading(false);
      }, 1000);
    }
  };

  const handleRetry = () => {
    if (lastSubmittedData) {
      handlePredict(lastSubmittedData);
    }
  };

  const scrollToPredictor = () => {
    const element = document.getElementById('predictor-form-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col antialiased bg-slate-50/30">
      {/* Background gridlines and ambient blurs */}
      <GridBackground />

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <img 
              src={sgsitsLogo} 
              alt="SGSITS Logo" 
              className="w-10 h-10 object-contain rounded-xl border border-slate-150 p-0.5 bg-white shadow-sm" 
            />
            <div className="text-left leading-none">
              <h1 className="text-lg font-extrabold text-slate-800 tracking-tight font-display">SGSITS Predictor</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Admission Analytics</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="#predictor-form-section" className="hover:text-blue-600 transition-colors">Predict</a>
            <a href="#features-section" className="hover:text-blue-600 transition-colors">About</a>
          </nav>

          {/* Action Button */}
          <button 
            onClick={scrollToPredictor}
            className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Start Prediction
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 space-y-24 text-center">
        
        {/* HERO SECTION */}
        <section className="space-y-6 max-w-3xl mx-auto pt-6 animate-fade-in flex flex-col items-center">
          
          {/* Small Emblem Branding above the title */}
          <div className="mb-2">
            <img 
              src={sgsitsLogo} 
              alt="SGSITS Emblem Hero" 
              className="w-12 h-12 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
            />
          </div>

          {/* Machine Learning Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm text-xs font-semibold text-slate-600 hover:shadow-md transition-all">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span>Machine Learning powered - SGSITS Indore</span>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-5xl font-extrabold tracking-tight text-slate-800 font-display sm:text-6xl">
              SGSITS <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Branch Predictor</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Predict your engineering branch admission chances using Machine Learning trained on years of SGSITS Indore cutoff data.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto">
            <button 
              onClick={scrollToPredictor}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              Try the predictor
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <a
              href="#features-section"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all hover:shadow-sm"
            >
              Learn more
            </a>
          </div>
        </section>

        {/* INPUT FORM SECTION */}
        <section id="predictor-form-section" className="space-y-2 pt-6">
          <PredictionForm onSubmit={handlePredict} loading={loading} />
        </section>

        {/* RESULTS AND OFFLINE WARNING VIEWS */}
        {(loading || error || prediction) && (
          <section className="space-y-4 pt-6">
            
            {/* Loading skeletons */}
            {loading && <LoadingSkeleton />}

            {/* Error handling strictly online */}
            {!loading && error && (
              <ToastNotification 
                message={error} 
                onClose={() => setError(null)} 
                onRetry={handleRetry} 
              />
            )}

            {/* Live Model cutoffs results */}
            {!loading && prediction && (
              <ResultSection data={prediction} />
            )}
          </section>
        )}

        {/* FEATURES GRID ("Built like a real admissions product") */}
        <section id="features-section" className="space-y-12 pt-12 border-t border-slate-200/50">
          <div className="space-y-2">
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight font-display">Built like a real admissions product</h3>
            <p className="text-sm sm:text-base text-slate-400 font-bold">Modern engineering best-practices behind every prediction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Feature 1: AI prediction */}
            <div className="glass-card p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-slate-800 font-display">AI Prediction</h4>
                <p className="text-sm font-semibold text-slate-400 leading-relaxed">
                  ML regression model trained on past SGSITS closing ranks for accurate, calibrated forecasts.
                </p>
              </div>
            </div>

            {/* Feature 2: Historical analysis */}
            <div className="glass-card p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-slate-800 font-display">Historical Data Analysis</h4>
                <p className="text-sm font-semibold text-slate-400 leading-relaxed">
                  Backed by 4+ years of MP DTE and SGSITS counseling data with year-over-year drift correction.
                </p>
              </div>
            </div>

            {/* Feature 3: FastAPI Backend */}
            <div className="glass-card p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-slate-800 font-display">Fast API Backend</h4>
                <p className="text-sm font-semibold text-slate-400 leading-relaxed">
                  Predictions served via a Python FastAPI service — sub-second latency, production ready.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-slate-50 border-t border-slate-100 px-6 py-8 mt-12 text-slate-500">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[13px] sm:text-sm font-medium leading-relaxed tracking-[0.02em]">
            Department of Information Technology, Shri G.S. Institute of Technology & Science, Indore.
          </p>
        </div>
      </footer>
    </div>
  );
}
