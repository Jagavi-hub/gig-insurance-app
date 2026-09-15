import React from 'react';
import { Target, CheckCircle2, TrendingUp, Award, Sparkles } from 'lucide-react';
import { JobReadinessSummary } from '../types';

interface JobReadinessGaugeProps {
  summary: JobReadinessSummary | null;
  onOpenPassport?: () => void;
}

export const JobReadinessGauge: React.FC<JobReadinessGaugeProps> = ({ summary, onOpenPassport }) => {
  if (!summary) return null;

  const score = summary.readiness_percentage;

  const getStatusBadge = (status: string) => {
    if (status.includes('Onsite')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Ready for Onsite'
      };
    }
    if (status.includes('Technical Screen')) {
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
        label: 'Ready for Tech Screen'
      };
    }
    return {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Foundation Building'
    };
  };

  const statusInfo = getStatusBadge(summary.readiness_status);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Candidate Readiness Benchmark</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Target Role: {summary.target_role}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Calibrated against evaluation rubrics, concept coverage, and grounding accuracy
          </p>
        </div>

        {/* Readiness Percentage Hero */}
        <div className="flex items-center space-x-4 bg-gradient-to-r from-indigo-50 to-violet-50 p-4 rounded-2xl border border-indigo-100/80">
          <div className="text-center">
            <div className="flex items-baseline justify-center space-x-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {score.toFixed(0)}%
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Job Ready
            </span>
          </div>

          <div className="border-l border-indigo-200/60 pl-4 space-y-1.5">
            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.bg}`}>
              <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
              <span>{statusInfo.label}</span>
            </span>
            <div className="text-[11px] text-slate-500">
              {summary.earned_badges_count} / {summary.total_badges_count} Skill Badges
            </div>
          </div>
        </div>
      </div>

      {/* Sub-competencies Progress */}
      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Technical */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600 font-medium">Technical Depth</span>
            <span className="font-bold text-slate-800">{summary.technical_mastery.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.technical_mastery}%` }}
            />
          </div>
        </div>

        {/* Completeness */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600 font-medium">Concept Coverage</span>
            <span className="font-bold text-slate-800">{summary.completeness_mastery.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-violet-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.completeness_mastery}%` }}
            />
          </div>
        </div>

        {/* Communication */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600 font-medium">Communication</span>
            <span className="font-bold text-slate-800">{summary.communication_mastery.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.communication_mastery}%` }}
            />
          </div>
        </div>
      </div>

      {onOpenPassport && (
        <div className="mt-4 flex items-center justify-between text-xs">
          <p className="text-slate-500 italic max-w-xl">
            "{summary.recommendation}"
          </p>
          <button
            onClick={onOpenPassport}
            className="flex items-center space-x-1 font-semibold text-indigo-600 hover:text-indigo-800 transition whitespace-nowrap ml-4"
          >
            <Award className="w-3.5 h-3.5" />
            <span>View Skill Passport →</span>
          </button>
        </div>
      )}
    </div>
  );
};
