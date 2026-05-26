import React, { useState } from 'react';
import { Target, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { label: 'General (UR)', value: 'UR' },
  { label: 'Other Backward Class (OBC)', value: 'OBC' },
  { label: 'Scheduled Caste (SC)', value: 'SC' },
  { label: 'Scheduled Tribe (ST)', value: 'ST' },
  { label: 'Economically Weaker Section (EWS)', value: 'EWS' },
];

const GENDERS = [
  { label: 'Gender Neutral / Open Pool', value: 'OP' },
  { label: 'Female Quota', value: 'F' },
];

const YEARS = [2026, 2025, 2024];

const BRANCHES = [
  { label: 'Computer Science & Engineering (CSE)', value: 'CSE' },
  { label: 'Information Technology (IT)', value: 'IT' },
  { label: 'Electronics & Telecommunication (ENTC)', value: 'ENTC' },
  { label: 'Electrical Engineering (EE)', value: 'EE' },
  { label: 'Mechanical Engineering (MECH)', value: 'MECH' },
  { label: 'Civil Engineering (CE)', value: 'CE' },
  { label: 'Electronics Instrumentation (EI)', value: 'EI' },
];

export default function PredictionForm({ onSubmit, loading }) {
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('UR');
  const [gender, setGender] = useState('OP');
  const [year, setYear] = useState(2026);
  const [branch, setBranch] = useState('CSE');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rank || isNaN(rank) || parseInt(rank) <= 0) {
      setError('Please enter a valid positive JEE Rank.');
      return;
    }
    setError('');
    onSubmit({
      rank: parseInt(rank),
      category,
      gender,
      year: parseInt(year),
      branch,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-3xl shadow-xl p-8 border border-white/60 animate-slide-up">
      {/* Card Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <Target className="w-6 h-6" />
        </div>
        <div className="text-left">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Get your prediction</h2>
          <p className="text-sm text-slate-500 font-medium">Fill in your details — results are instant.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        {/* JEE Rank Input */}
        <div>
          <label htmlFor="rank" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            JEE Rank
          </label>
          <input
            type="number"
            id="rank"
            placeholder="Enter your rank, e.g. 12500"
            value={rank}
            onChange={(e) => {
              setRank(e.target.value);
              if (error) setError('');
            }}
            disabled={loading}
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
          {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
        </div>

        {/* Category & Gender Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_16px_center] bg-no-repeat pr-12"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gender" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_16px_center] bg-no-repeat pr-12"
            >
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Year & Preferred Branch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label htmlFor="year" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Year
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_16px_center] bg-no-repeat pr-12"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="branch" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Preferred Branch
            </label>
            <select
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_16px_center] bg-no-repeat pr-12"
            >
              {BRANCHES.map((br) => (
                <option key={br.value} value={br.value}>
                  {br.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Predict Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-300 cursor-pointer ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Calculating Admission Chances...
            </>
          ) : (
            <>
              Predict Admission
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
