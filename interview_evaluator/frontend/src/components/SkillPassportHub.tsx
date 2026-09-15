import React, { useState, useEffect } from 'react';
import { Award, Shield, CheckCircle2, Lock, Sparkles, Target, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { JobReadinessSummary, Badge } from '../types';
import { fetchPassport } from '../api';

interface SkillPassportHubProps {
  onStartPractice: () => void;
}

export const SkillPassportHub: React.FC<SkillPassportHubProps> = ({ onStartPractice }) => {
  const [passport, setPassport] = useState<JobReadinessSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadPassport = () => {
    setIsLoading(true);
    fetchPassport()
      .then((data) => {
        setPassport(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching passport:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadPassport();
  }, []);

  const categories = ['all', 'Practice', 'Accuracy', 'Breadth', 'Technical', 'Communication', 'Domain'];

  const filteredBadges = !passport
    ? []
    : selectedCategory === 'all'
    ? passport.badges
    : passport.badges.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-indigo-200 text-xs font-semibold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Verified Candidate Skill Passport</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Skill Mastery & Job Readiness Hub
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Every evaluation rigorously builds your verifiable skill credentials. Track readiness across technical depth,
              grounding precision, and earned engineering badges.
            </p>

            <div className="pt-2 flex items-center space-x-3 text-xs text-indigo-200">
              <span>Target Role: <strong className="text-white">{passport?.target_role || 'Software Engineer'}</strong></span>
              <span>•</span>
              <span>Completed Sessions: <strong className="text-white">{passport?.total_evaluations || 0}</strong></span>
            </div>
          </div>

          {/* Readiness Score Orb */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center min-w-[220px] shadow-inner text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Job Readiness Score</span>
            <div className="flex items-baseline space-x-1 my-1">
              <span className="text-4xl sm:text-5xl font-extrabold text-white">
                {passport?.readiness_percentage.toFixed(0) || 0}
              </span>
              <span className="text-indigo-200 text-xl font-bold">%</span>
            </div>
            <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
              {passport?.readiness_status || 'Foundation Building'}
            </span>
          </div>
        </div>
      </div>

      {/* Competency Overview Cards */}
      {passport && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">Technical Mastery</span>
              <span className="font-bold text-slate-800">{passport.technical_mastery.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${passport.technical_mastery}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Calibrated against theoretical precision and absence of misconceptions</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">Conceptual Breadth</span>
              <span className="font-bold text-slate-800">{passport.completeness_mastery.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-violet-600 h-full rounded-full transition-all duration-500" style={{ width: `${passport.completeness_mastery}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Percentage of blueprint expected concepts accurately addressed</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">Communication Polish</span>
              <span className="font-bold text-slate-800">{passport.communication_mastery.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${passport.communication_mastery}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Clarity, conciseness, and engineering structure of submitted prose</p>
          </div>
        </div>
      )}

      {/* Badges Showcase Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">Skill Mastery Badges</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Unlock badges by submitting high-grounding answers across domains
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-xs font-semibold text-slate-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
              {passport?.earned_badges_count || 0} / {passport?.total_badges_count || 10} Unlocked
            </div>
            <button
              onClick={loadPassport}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              title="Refresh Passport"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Badges' : cat}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = badge.unlocked;

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition duration-200 flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/70 border-indigo-200 shadow-sm hover:shadow-md'
                    : 'bg-slate-50/80 border-slate-200/80 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-xl">
                      {badge.icon}
                    </div>
                    {isUnlocked ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>UNLOCKED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>LOCKED</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{badge.name}</h4>
                  <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
                    {badge.category}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  {isUnlocked ? (
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                      <span>✓ Credential Active in Passport</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(badge.progress * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${badge.progress * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Start Practice CTA */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-4 rounded-2xl">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Ready to boost your Job Readiness?</h4>
            <p className="text-xs text-slate-500">Pick a warmup or standard assessment to unlock your remaining badges.</p>
          </div>
          <button
            onClick={onStartPractice}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition self-start sm:self-auto"
          >
            <span>Start Practice Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
