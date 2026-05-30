import React, { useEffect, useRef } from 'react';
import { CheckCircle2, TrendingUp, GraduationCap, Calendar, Tag, ShieldCheck, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import Disclaimer from './Disclaimer';

const BRANCH_LABELS = {
  CSE: 'Computer Science & Engineering (CSE)',
  IT: 'Information Technology (IT)',
  ENTC: 'Electronics & Telecommunication (ENTC)',
  EE: 'Electrical Engineering (EE)',
  MECH: 'Mechanical Engineering (MECH)',
  CE: 'Civil Engineering (CE)',
  EI: 'Electronics Instrumentation (EI)',
  IP: 'Industrial & Production (IP)',
  BM: 'Biomedical Engineering (BM)'
};

const CATEGORY_LABELS = {
  UR: 'General (UR)',
  OBC: 'Other Backward Class (OBC)',
  SC: 'Scheduled Caste (SC)',
  ST: 'Scheduled Tribe (ST)',
  EWS: 'Economically Weaker Section (EWS)',
  FW: 'Fee Waiver (FW)',
  'FW/OP': 'Fee Waiver (FW)'
};

const VALID_BRANCHES = ['CSE', 'IT', 'ENTC', 'EE', 'MECH', 'CE', 'EI', 'IP', 'BM'];

function BranchCard({ pred, userRank }) {
  const [expanded, setExpanded] = React.useState(false);
  const { branch, predicted_closing_rank } = pred || {};
  
  const branchFullName = BRANCH_LABELS[branch] || branch || 'Unknown Branch';
  
  let chance = 'LOW';
  let likelihood = 0;
  
  const rankVal = parseInt(userRank) || 0;
  const cutoffVal = parseInt(predicted_closing_rank) || 0;

  if (cutoffVal > 0 && rankVal > 0) {
    if (rankVal <= cutoffVal) {
      chance = 'HIGH';
      const ratio = rankVal / cutoffVal;
      likelihood = Math.round(99 - ratio * 20); // 79% to 99%
    } else {
      const ratio = cutoffVal / rankVal;
      if (ratio >= 0.85) {
        chance = 'MEDIUM';
        likelihood = Math.round(45 + (ratio - 0.85) * 100); // 45% to 60%
      } else {
        chance = 'LOW';
        likelihood = Math.round(Math.max(5, ratio * 50)); // 5% to 44%
      }
    }
  }

  const theme = {
    HIGH: {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/50',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      dot: 'bg-emerald-500',
      bar: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/10'
    },
    MEDIUM: {
      text: 'text-amber-700',
      bg: 'bg-amber-50/80',
      border: 'border-amber-200/50',
      badgeBg: 'bg-amber-100 text-amber-800',
      dot: 'bg-amber-500',
      bar: 'bg-amber-500',
      shadow: 'shadow-amber-500/10'
    },
    LOW: {
      text: 'text-rose-700',
      bg: 'bg-rose-50/80',
      border: 'border-rose-200/50',
      badgeBg: 'bg-rose-100 text-rose-800',
      dot: 'bg-rose-500',
      bar: 'bg-rose-500',
      shadow: 'shadow-rose-500/10'
    }
  }[chance];

  const getAiInsight = () => {
    if (chance === 'HIGH') {
      return `Your rank is comfortably within the predicted cutoff range for ${branchFullName}. Admission chances are strong based on historical SGSITS cutoff trends. You have a high probability of securing a seat during the initial DTE counseling rounds.`;
    } else if (chance === 'MEDIUM') {
      return `Your rank is close to the predicted cutoff for ${branchFullName}. While admission is highly competitive, you maintain fair chances. We strongly recommend adding ${branchFullName} as your top preference in the counseling form and monitoring subsequent upgrade rounds.`;
    } else {
      return `Your rank is currently higher than the predicted cutoff rank for ${branchFullName}. While direct round allotment might be competitive, we suggest exploring related branches like IT or ENTC as alternative targets at SGSITS.`;
    }
  };

  const formatRank = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-white/60 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01] flex flex-col justify-between">
      <div>
        {/* Header Row: Branch & Chance Badge */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <h3 className="font-bold text-base text-slate-800 text-left font-display leading-tight">{branchFullName}</h3>
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${theme.badgeBg} font-extrabold text-[10px] uppercase tracking-wider whitespace-nowrap shadow-sm`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
            {chance}
          </div>
        </div>

        {/* Ranks breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-left">
          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Predicted Cutoff</span>
            <span className="text-base font-extrabold text-blue-600 font-display">{formatRank(predicted_closing_rank)}</span>
          </div>
          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Rank</span>
            <span className="text-base font-extrabold text-slate-700 font-display">{formatRank(userRank)}</span>
          </div>
        </div>

        {/* Likelihood progress */}
        <div className="space-y-1.5 text-left mb-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500">Likelihood</span>
            <span className={`font-extrabold ${theme.text}`}>{likelihood}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${theme.bar}`}
              style={{ width: `${likelihood}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        {/* Expandable Insight Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-1.5 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors border-t border-slate-100 mt-3 pt-3"
        >
          {expanded ? (
            <>Hide Insights <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>View AI Insights <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>

        {/* Expanded Insight Text */}
        {expanded && (
          <div className={`mt-3 p-3.5 rounded-xl ${theme.bg} border ${theme.border} text-left text-xs font-semibold text-slate-700 leading-relaxed animate-fade-in`}>
            {getAiInsight()}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultSection({ data }) {
  const resultRef = useRef(null);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [data]);

  const { predictions, input_parameters } = data;
  const { rank: userRank, category, year, home_state } = input_parameters;

  const categoryFullName = CATEGORY_LABELS[category] || category;
  const domicileFullName = home_state === 'OTHER' ? 'Other State (AI)' : 'MP Domicile';

  const formatRank = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Filter out any branches that are not offered at SGSITS Indore
  // e.g. AIADS, AIML, BEIL (as requested by user)
  const filteredPredictions = (predictions || []).filter(pred => pred && pred.branch && VALID_BRANCHES.includes(pred.branch));

  // Compute likelihood for each prediction and sort by highest likelihood first
  const sortedPredictions = filteredPredictions.map(pred => {
    let likelihood = 0;
    const cutoff = parseInt(pred.predicted_closing_rank) || 0;
    const rankVal = parseInt(userRank) || 0;
    if (cutoff > 0 && rankVal > 0) {
      if (rankVal <= cutoff) {
        likelihood = Math.round(99 - (rankVal / cutoff) * 20);
      } else {
        const ratio = cutoff / rankVal;
        if (ratio >= 0.85) {
          likelihood = Math.round(45 + (ratio - 0.85) * 100);
        } else {
          likelihood = Math.round(Math.max(5, ratio * 50));
        }
      }
    }
    return { ...pred, likelihood };
  }).sort((a, b) => b.likelihood - a.likelihood);

  return (
    <div ref={resultRef} className="w-full max-w-6xl mx-auto space-y-8 animate-slide-up p-1">
      
      {/* SECTION TITLE & META BADGE */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        <div className="text-left">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Simulation Summary</span>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-display">Cutoff Predictions for B.Tech Branches</h2>
        </div>
      </div>

      {/* INPUT DETAILS CARD GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Your Rank Card */}
        <div className="p-4 bg-white/60 glass-card rounded-2xl border border-slate-100 text-left transition-all hover:scale-[1.03] hover:shadow-sm">
          <div className="text-slate-400 font-medium text-xs flex items-center gap-1.5 mb-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> Your JEE Rank
          </div>
          <div className="font-extrabold text-slate-800 text-lg font-display">{formatRank(userRank)}</div>
        </div>

        {/* Domicile */}
        <div className="p-4 bg-white/60 glass-card rounded-2xl border border-slate-100 text-left transition-all hover:scale-[1.03] hover:shadow-sm">
          <div className="text-slate-400 font-medium text-xs flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Domicile
          </div>
          <div className="font-extrabold text-slate-800 text-lg font-display truncate">{domicileFullName}</div>
        </div>

        {/* Category */}
        <div className="p-4 bg-white/60 glass-card rounded-2xl border border-slate-100 text-left transition-all hover:scale-[1.03] hover:shadow-sm">
          <div className="text-slate-400 font-medium text-xs flex items-center gap-1.5 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-500" /> Category
          </div>
          <div className="font-extrabold text-slate-800 text-lg font-display truncate">{categoryFullName}</div>
        </div>

        {/* Target Year */}
        <div className="p-4 bg-white/60 glass-card rounded-2xl border border-slate-100 text-left transition-all hover:scale-[1.03] hover:shadow-sm">
          <div className="text-slate-400 font-medium text-xs flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-rose-500" /> Target Year
          </div>
          <div className="font-extrabold text-slate-800 text-lg font-display">{year}</div>
        </div>
      </div>

      {/* GRID OF SMALL CONTAINERS FOR EACH VALID BRANCH */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {sortedPredictions.map((pred) => (
          <BranchCard 
            key={pred.branch} 
            pred={pred} 
            userRank={userRank} 
          />
        ))}
      </div>

      <Disclaimer />

    </div>
  );
}
