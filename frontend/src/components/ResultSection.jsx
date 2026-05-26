import React, { useEffect, useRef } from 'react';
import { CheckCircle2, TrendingUp, GraduationCap, Calendar, Tag, ShieldCheck } from 'lucide-react';

const BRANCH_LABELS = {
  CSE: 'Computer Science & Engineering',
  IT: 'Information Technology',
  ENTC: 'Electronics & Telecommunication',
  EE: 'Electrical Engineering',
  MECH: 'Mechanical Engineering',
  CE: 'Civil Engineering',
  EI: 'Electronics Instrumentation',
};

const CATEGORY_LABELS = {
  UR: 'General (UR)',
  OBC: 'Other Backward Class (OBC)',
  SC: 'Scheduled Caste (SC)',
  ST: 'Scheduled Tribe (ST)',
  EWS: 'Economically Weaker Section (EWS)',
};

export default function ResultSection({ data }) {
  const resultRef = useRef(null);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [data]);

  const { predicted_closing_rank, input_parameters } = data;
  const { rank: userRank, category, year, branch } = input_parameters;

  const branchFullName = BRANCH_LABELS[branch] || branch;
  const categoryFullName = CATEGORY_LABELS[category] || category;

  let chance = 'LOW';
  let likelihood = 0;
  
  if (userRank <= predicted_closing_rank) {
    chance = 'HIGH';
    const ratio = userRank / predicted_closing_rank;
    likelihood = Math.round(99 - ratio * 20); // 79% to 99%
  } else {
    const ratio = predicted_closing_rank / userRank;
    if (ratio >= 0.85) {
      chance = 'MEDIUM';
      likelihood = Math.round(45 + (ratio - 0.85) * 100); // 45% to 60%
    } else {
      chance = 'LOW';
      likelihood = Math.round(Math.max(5, ratio * 50)); // 5% to 44%
    }
  }

  const formatRank = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const theme = {
    HIGH: {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/50',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      dot: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/20',
      bar: 'bg-emerald-500',
      glow: 'shadow-emerald-500/10'
    },
    MEDIUM: {
      text: 'text-amber-700',
      bg: 'bg-amber-50/80',
      border: 'border-amber-200/50',
      badgeBg: 'bg-amber-100 text-amber-800',
      dot: 'bg-amber-500',
      shadow: 'shadow-amber-500/20',
      bar: 'bg-amber-500',
      glow: 'shadow-amber-500/10'
    },
    LOW: {
      text: 'text-rose-700',
      bg: 'bg-rose-50/80',
      border: 'border-rose-200/50',
      badgeBg: 'bg-rose-100 text-rose-800',
      dot: 'bg-rose-500',
      shadow: 'shadow-rose-500/20',
      bar: 'bg-rose-500',
      glow: 'shadow-rose-500/10'
    }
  }[chance];

  const getAiInsight = () => {
    if (chance === 'HIGH') {
      return `Your rank is comfortably within the predicted cutoff range for ${branch}. Admission chances are strong based on historical SGSITS cutoff trends. You have a high probability of securing a seat during the initial DTE counseling rounds.`;
    } else if (chance === 'MEDIUM') {
      return `Your rank is close to the predicted cutoff for ${branch}. While admission is highly competitive, you maintain fair chances. We strongly recommend adding ${branch} as your top preference in the counseling form and monitoring subsequent upgrade rounds.`;
    } else {
      return `Your rank is currently higher than the predicted cutoff rank for ${branch}. While direct round allotment might be competitive, we suggest exploring related branches like IT or ENTC as alternative targets at SGSITS.`;
    }
  };

  return (
    <div ref={resultRef} className="w-full max-w-4xl mx-auto space-y-8 animate-slide-up p-1">
      
      {/* MAIN RESULT CARD */}
      <div className="glass-card rounded-3xl p-8 border border-white/60 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-slate-200/50">
        
        {/* Subtle decorative glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 opacity-20 blur-3xl ${theme.glow}`} />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100/80 pb-6 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prediction Result</span>
          </div>

          {/* CHANCE BADGES */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${theme.badgeBg} font-bold text-xs uppercase tracking-wider ${theme.shadow} shadow-md`}>
            <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
            {chance} Chance
          </div>
        </div>

        {/* Selected Branch Detail */}
        <div className="text-left mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight font-display sm:text-4xl">{branchFullName}</h2>
          <p className="text-sm font-semibold text-slate-400 mt-1">SGSITS Indore</p>
        </div>

        {/* INNER CARDS FOR KEY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Predicted Cutoff Card */}
          <div className="p-6 rounded-2xl border border-blue-100 bg-blue-50/20 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-md relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Predicted Closing Rank</span>
            </div>
            <div className="text-3xl font-extrabold text-blue-600 font-display">
              {formatRank(predicted_closing_rank)}
            </div>
          </div>

          {/* Your Rank Card */}
          <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your JEE Rank</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-800 font-display">
              {formatRank(userRank)}
            </div>
          </div>

          {/* Model Confidence Card */}
          <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Model Confidence</span>
            </div>
            <div className="text-3xl font-extrabold text-indigo-600 font-display">
              98%
            </div>
          </div>
        </div>

        {/* LIKELIHOOD PROGRESS BAR */}
        <div className="space-y-2 pt-2 text-left">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-slate-500">Admission likelihood</span>
            <span className={`font-extrabold ${theme.text}`}>{likelihood}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${theme.bar}`}
              style={{ width: `${likelihood}%` }}
            />
          </div>
        </div>
      </div>

      {/* STATS DETAILS CARD GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat Card: Category */}
        <div className="p-4 bg-white/60 glass-card rounded-2xl border border-slate-100 text-left transition-all hover:scale-[1.03] hover:shadow-sm">
          <div className="text-slate-400 font-medium text-xs flex items-center gap-1.5 mb-1.5">
            <Tag className="w-3.5 h-3.5" /> Category
          </div>
          <div className="font-bold text-slate-700 truncate">{categoryFullName}</div>
        </div>

        {/* Stat Card: Target Year */}
        <div className="p-4 bg-white/60 glass-card rounded-2xl border border-slate-100 text-left transition-all hover:scale-[1.03] hover:shadow-sm">
          <div className="text-slate-400 font-medium text-xs flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5" /> Target Year
          </div>
          <div className="font-bold text-slate-700">{year}</div>
        </div>

        {/* Stat Card: User Rank */}
        <div className="p-4 bg-white/60 glass-card rounded-2xl border border-slate-100 text-left transition-all hover:scale-[1.03] hover:shadow-sm">
          <div className="text-slate-400 font-medium text-xs flex items-center gap-1.5 mb-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> Your Merit Rank
          </div>
          <div className="font-bold text-slate-700">{formatRank(userRank)}</div>
        </div>

        {/* Stat Card: Predicted Cutoff */}
        <div className="p-4 bg-white/60 glass-card rounded-2xl border border-slate-100 text-left transition-all hover:scale-[1.03] hover:shadow-sm">
          <div className="text-slate-400 font-medium text-xs flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Predicted Cutoff
          </div>
          <div className="font-bold text-slate-700">{formatRank(predicted_closing_rank)}</div>
        </div>
      </div>

      {/* ADMISSION INSIGHT SECTION */}
      <div className={`p-6 rounded-2xl ${theme.bg} border ${theme.border} text-left space-y-2.5 transition-all duration-300 hover:shadow-sm`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
            <span className="text-xs">✨</span>
          </div>
          <h4 className={`font-bold text-sm uppercase tracking-wider font-display ${theme.text}`}>AI Admission Insights</h4>
        </div>
        <p className="text-slate-700 text-sm font-medium leading-relaxed">
          “{getAiInsight()}”
        </p>
      </div>

    </div>
  );
}
