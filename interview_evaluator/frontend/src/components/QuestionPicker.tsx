import React, { useState } from 'react';
import { Question, PracticeFormat, JobReadinessSummary } from '../types';
import { Brain, Code, Database, Users, ChevronRight, Layers, Award, Sparkles, Zap, Briefcase } from 'lucide-react';
import { PracticeModeSelector } from './PracticeModeSelector';
import { JobReadinessGauge } from './JobReadinessGauge';
import { RoleSkillBrowser } from './RoleSkillBrowser';
import { fetchRandomQuestion } from '../api';

interface QuestionPickerProps {
  questions: Question[];
  onSelectQuestion: (question: Question) => void;
  practiceFormat: PracticeFormat;
  onSelectPracticeFormat: (format: PracticeFormat) => void;
  jobReadiness: JobReadinessSummary | null;
  onOpenPassport: () => void;
}

export const QuestionPicker: React.FC<QuestionPickerProps> = ({
  questions,
  onSelectQuestion,
  practiceFormat,
  onSelectPracticeFormat,
  jobReadiness,
  onOpenPassport
}) => {
  const [viewMode, setViewMode] = useState<'domain' | 'roles'>('domain');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [isRandomPicking, setIsRandomPicking] = useState<boolean>(false);

  const handleSurpriseMe = async () => {
    try {
      setIsRandomPicking(true);
      const q = await fetchRandomQuestion();
      onSelectQuestion(q);
    } catch (e) {
      console.error('Failed to pick random question:', e);
    } finally {
      setIsRandomPicking(false);
    }
  };

  const domains = [
    { id: 'all', label: 'All Domains', icon: Layers, count: questions.length },
    { id: 'ml', label: 'Machine Learning', icon: Brain, count: questions.filter(q => q.domain === 'ml').length },
    { id: 'python', label: 'Python & Systems', icon: Code, count: questions.filter(q => q.domain === 'python').length },
    { id: 'dbms', label: 'Databases & Storage', icon: Database, count: questions.filter(q => q.domain === 'dbms').length },
    { id: 'hr', label: 'Behavioral & STAR', icon: Users, count: questions.filter(q => q.domain === 'hr').length },
  ];

  const filteredQuestions = selectedDomain === 'all'
    ? questions
    : questions.filter(q => q.domain === selectedDomain);

  const getDomainBadge = (domain: string) => {
    switch (domain) {
      case 'ml':
        return { bg: 'bg-purple-50 border-purple-200 text-purple-700', label: 'Machine Learning' };
      case 'python':
        return { bg: 'bg-blue-50 border-blue-200 text-blue-700', label: 'Python' };
      case 'dbms':
        return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: 'DBMS' };
      case 'hr':
        return { bg: 'bg-amber-50 border-amber-200 text-amber-700', label: 'Behavioral' };
      default:
        return { bg: 'bg-slate-50 border-slate-200 text-slate-700', label: domain.toUpperCase() };
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome with Modern Indigo Gradient */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-indigo-200 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Senior Bar Raiser & Assessment Lab</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Select Your Target Practice Question
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Answers are benchmarked against curated technical reference docs stored in ChromaDB collections.
              Get explainable evidence quotes, job readiness analytics, and single-click senior-level answer polish.
            </p>
          </div>

          {/* Random Question Surprise Me Button */}
          <button
            type="button"
            onClick={handleSurpriseMe}
            disabled={isRandomPicking}
            className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-orange-500/20 transition disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-slate-950 fill-current" />
            <span>{isRandomPicking ? 'Rolling Question...' : '🎲 Surprise Me (Random Question)'}</span>
          </button>
        </div>
      </div>

      {/* Job Readiness Benchmark Card */}
      {jobReadiness && (
        <JobReadinessGauge summary={jobReadiness} onOpenPassport={onOpenPassport} />
      )}

      {/* Practice Mode Selector Formats (Quick Warmup, Standard, Comprehensive) */}
      <PracticeModeSelector
        currentFormat={practiceFormat}
        onSelectFormat={onSelectPracticeFormat}
      />

      {/* Browsing View Mode Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setViewMode('domain')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            viewMode === 'domain'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Questions by Domain</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('roles')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            viewMode === 'roles'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Role & Skill Pathways (6 Roles)</span>
        </button>
      </div>

      {viewMode === 'roles' ? (
        <RoleSkillBrowser onSelectQuestion={onSelectQuestion} />
      ) : (
        <>
          {/* Domain Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            {domains.map((d) => {
              const Icon = d.icon;
              const isSelected = selectedDomain === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomain(d.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold border transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{d.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {d.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Questions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredQuestions.map((q) => {
              const badge = getDomainBadge(q.domain);
              return (
                <div
                  key={q.question_id}
                  onClick={() => onSelectQuestion(q)}
                  className="group bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-indigo-500/50 rounded-3xl p-5 sm:p-6 transition duration-200 flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        {q.role}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                      {q.question_text}
                    </h3>

                    {q.skill && (
                      <div className="mt-2 text-xs font-semibold text-indigo-700">
                        Skill: {q.skill}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                        Expected Concepts ({q.expected_concepts.length})
                      </span>
                      <ul className="mt-2 space-y-1.5">
                        {q.expected_concepts.slice(0, 3).map((concept, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start space-x-1.5">
                            <span className="text-indigo-600 font-bold">•</span>
                            <span className="line-clamp-1">{concept}</span>
                          </li>
                        ))}
                        {q.expected_concepts.length > 3 && (
                          <li className="text-[11px] text-slate-400 pl-3 font-medium">
                            + {q.expected_concepts.length - 3} more concepts...
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <span>Rubric:</span>
                      <span className="text-slate-700 font-medium">Rel {Math.round(q.rubric_weights.relevance * 100)}%</span>
                      <span>•</span>
                      <span className="text-slate-700 font-medium">Tech {Math.round(q.rubric_weights.technical * 100)}%</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition duration-200">
                      <span>Start Answer</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
