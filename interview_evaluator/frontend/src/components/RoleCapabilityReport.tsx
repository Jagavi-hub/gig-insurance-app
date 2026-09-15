import React, { useEffect, useState } from 'react';
import { RoleCapabilitySummary, Question } from '../types';
import { fetchRoleCapability, fetchRandomQuestion } from '../api';
import { Target, CheckCircle, AlertTriangle, HelpCircle, ArrowRight, Sparkles, TrendingUp, Award, RefreshCw, Briefcase, Zap, ShieldCheck } from 'lucide-react';

interface RoleCapabilityReportProps {
  initialRole?: string;
  onSelectQuestion: (question: Question) => void;
}

export const RoleCapabilityReport: React.FC<RoleCapabilityReportProps> = ({
  initialRole = 'Machine Learning Engineer',
  onSelectQuestion,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [capability, setCapability] = useState<RoleCapabilitySummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRandomLoading, setIsRandomLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const availableRoles = [
    { title: 'Machine Learning Engineer', domain: 'ml', icon: '🧠' },
    { title: 'Senior Python Backend Developer', domain: 'python', icon: '🐍' },
    { title: 'Database Administrator / Data Architect', domain: 'dbms', icon: '🗄️' },
    { title: 'Full-Stack Software Engineer', domain: 'fullstack', icon: '💻' },
    { title: 'DevOps & Cloud Systems Engineer', domain: 'devops', icon: '☁️' },
    { title: 'Engineering Manager & Technical Lead', domain: 'hr', icon: '👥' },
  ];

  const loadCapability = async (role: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRoleCapability(role);
      setCapability(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load role capability assessment.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCapability(selectedRole);
  }, [selectedRole]);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  const handlePracticeSkill = async (skillName: string, qids: string[]) => {
    try {
      setIsRandomLoading(true);
      const q = await fetchRandomQuestion({ role: selectedRole, skill: skillName });
      onSelectQuestion(q);
    } catch (e) {
      // Fallback
      if (qids && qids.length > 0) {
        const q = await fetchRandomQuestion({ role: selectedRole });
        onSelectQuestion(q);
      }
    } finally {
      setIsRandomLoading(false);
    }
  };

  const handleRandomQuestionForRole = async () => {
    setIsRandomLoading(true);
    try {
      const q = await fetchRandomQuestion({ role: selectedRole });
      onSelectQuestion(q);
    } catch (e: any) {
      setError('Could not pick a random question for this role.');
    } finally {
      setIsRandomLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'mastered':
        return { label: '✓ Mastered (≥80%)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'proficient':
        return { label: '✓ Proficient (60-79%)', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'needs_practice':
        return { label: '⚠️ Needs Revision (<60%)', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: '○ Untested Skill', bg: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-indigo-200 text-xs font-semibold mb-2">
              <Target className="w-3.5 h-3.5 text-amber-300" />
              <span>Role Application Capability & Suitability Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Are You Capable of Applying for This Role?
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Calculates your hiring probability and technical suitability based on benchmarked RAG evaluation scores across all required core skills.
            </p>
          </div>

          {/* Quick Action: Random Question for Role */}
          <button
            type="button"
            onClick={handleRandomQuestionForRole}
            disabled={isRandomLoading}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition duration-150 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-amber-100" />
            <span>{isRandomLoading ? 'Selecting...' : '🎲 Random Question for Role'}</span>
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {availableRoles.map((r) => {
            const isSelected = selectedRole === r.title;
            return (
              <button
                key={r.title}
                type="button"
                onClick={() => handleRoleChange(r.title)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-semibold border transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{r.icon}</span>
                <span>{r.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <div className="text-sm font-bold text-slate-800">Calculating Role Capability Benchmark...</div>
        </div>
      ) : error || !capability ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-700 text-sm">
          {error || 'Unable to load capability data.'}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Capability Gauge Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left: Big Radial Metric */}
              <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">
                  Role Application Capability
                </div>
                <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight my-2">
                  {capability.capability_percentage}%
                </div>
                <div className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getScoreColor(capability.capability_percentage)}`}>
                  {capability.readiness_verdict}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-3">
                  Tested: {capability.skills_tested_count} of {capability.total_skills_count} Required Skills
                </div>
              </div>

              {/* Middle & Right: Application Verdict Details */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-start space-x-3">
                  {capability.can_apply_verdict ? (
                    <div className="p-2.5 bg-emerald-100 rounded-2xl text-emerald-700">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-700">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {capability.can_apply_verdict ? '✅ Ready to Submit Applications' : '⚠️ Additional Preparation Recommended Before Applying'}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {capability.can_apply_verdict
                        ? `Your technical scores across tested core skills meet or exceed hiring bar expectations for ${capability.role_title}. You have high probability of passing the initial technical assessment.`
                        : `To maximize your interview pass rate, you should complete assessments on the remaining untested or low-scoring skills below to raise your capability above 70%.`}
                    </p>
                  </div>
                </div>

                {/* Progress Bar of Tested Skills */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Curriculum Skill Coverage</span>
                    <span>{Math.round((capability.skills_tested_count / capability.total_skills_count) * 100)}% Complete</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
                      style={{ width: `${(capability.skills_tested_count / capability.total_skills_count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Required Skills Breakdown Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Required Core Skills for {capability.role_title}</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Click "Practice" on any skill to test a targeted interview question
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capability.skills_breakdown.map((s, idx) => {
                const badge = getStatusBadge(s.status);
                return (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-400 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {s.average_score > 0 ? `${s.average_score}% Avg` : 'Not Attempted'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {s.skill_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {s.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {s.tested_questions_count} evaluation(s) completed
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePracticeSkill(s.skill_name, s.recommended_question_ids)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition"
                      >
                        <span>Practice Skill</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategic Next Steps & Gap Roadmap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths Card */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-5 space-y-2.5">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Verified Strengths</span>
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
                {capability.strengths.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Recommendations Card */}
            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 space-y-2.5">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Actionable Steps to Reach 90%+ Bar</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                {capability.recommended_next_steps.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
