import React, { useEffect, useState } from 'react';
import { Sparkles, Cpu, BarChart3, HelpCircle, Award, FileSearch, Target, Zap } from 'lucide-react';
import { fetchHealth } from '../api';
import { SystemHealth } from '../types';

interface NavbarProps {
  activeTab: 'practice' | 'resume' | 'passport' | 'heatmap' | 'capability';
  setActiveTab: (tab: 'practice' | 'resume' | 'passport' | 'heatmap' | 'capability') => void;
  onRandomQuestion?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onRandomQuestion }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch((err) => console.warn('Health check unavailable:', err));
  }, []);

  return (
    <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('practice')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-700 bg-clip-text text-transparent">
                EvalAI
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Senior Coach
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">RAG-Grounded Technical Interview Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'practice'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Practice</span>
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'resume'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>Resume Matcher</span>
          </button>
          <button
            onClick={() => setActiveTab('passport')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'passport'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Skill Passport</span>
          </button>
          <button
            onClick={() => setActiveTab('capability')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'capability'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Role Capability</span>
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'heatmap'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Knowledge Gap</span>
          </button>
        </div>

        {/* Quick Action & Health status indicator */}
        <div className="flex items-center space-x-2 text-xs">
          {onRandomQuestion && (
            <button
              type="button"
              onClick={onRandomQuestion}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold transition shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>🎲 Random Q</span>
            </button>
          )}

          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ChromaDB:</span>
            <span className="text-emerald-700 font-bold">{health?.chroma_connected ? 'Active' : 'Ready'}</span>
          </div>
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-medium">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-slate-700 font-semibold">
              {health?.llm_mode === 'openai_live' ? `OpenAI (${health.llm_model})` : 'Grounded Engine'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
