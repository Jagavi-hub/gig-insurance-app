import React from 'react';
import { Zap, Target, Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { PracticeFormat } from '../types';

interface PracticeModeSelectorProps {
  currentFormat: PracticeFormat;
  onSelectFormat: (format: PracticeFormat) => void;
}

export const PracticeModeSelector: React.FC<PracticeModeSelectorProps> = ({
  currentFormat,
  onSelectFormat
}) => {
  const formats: {
    id: PracticeFormat;
    title: string;
    subtitle: string;
    questionsCount: number;
    duration: string;
    icon: React.ComponentType<{ className?: string }>;
    accentGradient: string;
    borderActive: string;
    badgeText: string;
  }[] = [
    {
      id: 'warmup',
      title: 'Quick Warmup',
      subtitle: 'Single high-impact question to sharpen focus before live calls',
      questionsCount: 1,
      duration: '~2 mins',
      icon: Zap,
      accentGradient: 'from-amber-500 to-orange-500',
      borderActive: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50',
      badgeText: '⚡ Fast Pace'
    },
    {
      id: 'standard',
      title: 'Standard Assessment',
      subtitle: 'Balanced 3-question evaluation benchmarking breadth and technical depth',
      questionsCount: 3,
      duration: '~8 mins',
      icon: Target,
      accentGradient: 'from-indigo-600 to-violet-600',
      borderActive: 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/50',
      badgeText: '🎯 Recommended'
    },
    {
      id: 'comprehensive',
      title: 'Comprehensive Evaluation',
      subtitle: 'Deep-dive 5-question multi-domain simulation for senior & staff readiness',
      questionsCount: 5,
      duration: '~15 mins',
      icon: Trophy,
      accentGradient: 'from-violet-600 to-purple-600',
      borderActive: 'border-purple-600 ring-2 ring-purple-600/20 bg-purple-50/50',
      badgeText: '🏆 Staff Bar'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Select Practice Format
          </h3>
          <p className="text-xs text-slate-500">Choose assessment length to track session progress & unlock passport badges</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {formats.map((fmt) => {
          const Icon = fmt.icon;
          const isSelected = currentFormat === fmt.id;

          return (
            <div
              key={fmt.id}
              onClick={() => onSelectFormat(fmt.id)}
              className={`relative cursor-pointer rounded-2xl p-4 sm:p-5 border transition duration-200 flex flex-col justify-between ${
                isSelected
                  ? `${fmt.borderActive} shadow-md`
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${fmt.accentGradient} flex items-center justify-center text-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {fmt.badgeText}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900">{fmt.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {fmt.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  {fmt.questionsCount} {fmt.questionsCount === 1 ? 'Question' : 'Questions'}
                </span>
                <span className="flex items-center space-x-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{fmt.duration}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
