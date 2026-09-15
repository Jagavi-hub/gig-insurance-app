import React, { useState } from 'react';
import { SeniorPolishResponse } from '../types';
import { Sparkles, X, Copy, Check, ArrowRight, ShieldCheck, Cpu, Terminal, Layers } from 'lucide-react';

interface SeniorPolishDrawerProps {
  polishData: SeniorPolishResponse | null;
  candidateAnswer: string;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export const SeniorPolishDrawer: React.FC<SeniorPolishDrawerProps> = ({
  polishData,
  candidateAnswer,
  isOpen,
  onClose,
  isLoading
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'senior' | 'comparison' | 'upgrades'>('senior');

  if (!isOpen) return null;

  const handleCopy = () => {
    if (polishData?.senior_answer) {
      navigator.clipboard.writeText(polishData.senior_answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-400 to-violet-400 flex items-center justify-center text-slate-900 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">AI Senior Answer Polish</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Staff / L6+ Bar
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Model answer benchmarking production metrics, architectural trade-offs, and failure modes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs within Drawer */}
        <div className="flex items-center space-x-1 px-6 py-3 bg-slate-100/80 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setViewMode('senior')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'senior'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✨ Senior Model Answer
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'comparison'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚖️ Side-by-Side Comparison
          </button>
          <button
            onClick={() => setViewMode('upgrades')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'upgrades'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚀 Key Phrasing Upgrades ({polishData?.key_phrasing_upgrades.length || 0})
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="font-semibold text-slate-800 text-sm">Synthesizing Senior-Level Answer...</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Grounding against ChromaDB reference blueprints, infusing architectural edge cases, and calibrating phrasing...
              </p>
            </div>
          ) : !polishData ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              No senior answer generated yet. Click generate to proceed.
            </div>
          ) : (
            <>
              {/* Mode: Senior Model Answer */}
              {viewMode === 'senior' && (
                <div className="space-y-5">
                  {/* Senior Highlights Badges */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Why This Answer Clears The Senior Bar</span>
                    </div>
                    <ul className="space-y-1.5 mt-2">
                      {polishData.senior_highlights.map((highlight, i) => (
                        <li key={i} className="text-xs text-indigo-950 flex items-start space-x-2">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* The Answer Box */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Senior Model Response
                      </span>
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied to Clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                      {polishData.senior_answer}
                    </div>
                  </div>

                  {/* Production Considerations */}
                  {polishData.production_considerations.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                        <Terminal className="w-4 h-4 text-emerald-600" />
                        <span>Production & Operational Considerations</span>
                      </div>
                      <ul className="space-y-1.5">
                        {polishData.production_considerations.map((prod, i) => (
                          <li key={i} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start space-x-2">
                            <span className="text-emerald-600 font-bold">⚙️</span>
                            <span>{prod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Mode: Side-by-Side Comparison */}
              {viewMode === 'comparison' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Your Answer */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 flex flex-col">
                    <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Your Original Answer
                      </h4>
                    </div>
                    <div className="flex-1 text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {candidateAnswer}
                    </div>
                  </div>

                  {/* Senior Polish */}
                  <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-sm space-y-2 flex flex-col ring-1 ring-indigo-500/20">
                    <div className="flex items-center space-x-2 pb-2 border-b border-indigo-100">
                      <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center space-x-1">
                        <span>Staff-Level Polished Answer</span>
                      </h4>
                    </div>
                    <div className="flex-1 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-indigo-50/40 p-3 rounded-xl border border-indigo-100">
                      {polishData.senior_answer}
                    </div>
                  </div>
                </div>
              )}

              {/* Mode: Phrasing Upgrades */}
              {viewMode === 'upgrades' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-600 mb-2">
                    Compare casual explanations against professional engineering terminology:
                  </div>

                  {polishData.key_phrasing_upgrades.map((upgrade, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                          <span className="text-[10px] uppercase font-bold text-rose-600 block mb-1">
                            Common / Casual Phrasing
                          </span>
                          <p className="text-xs text-rose-950 font-medium italic">
                            "{upgrade.junior_or_candidate_phrase}"
                          </p>
                        </div>

                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">
                            Senior Engineering Upgrade
                          </span>
                          <p className="text-xs text-emerald-950 font-medium">
                            "{upgrade.senior_upgrade}"
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <strong>Why this works:</strong> {upgrade.rationale}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Grounded in official blueprint rubrics & ChromaDB collections</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition"
          >
            Done Learning
          </button>
        </div>
      </div>
    </div>
  );
};
