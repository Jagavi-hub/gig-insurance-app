import React, { useEffect, useState } from 'react';
import { HeatmapItem } from '../types';
import { fetchHeatmap } from '../api';
import { BarChart3, AlertOctagon, CheckCircle2, TrendingUp, Filter, RefreshCw, Layers } from 'lucide-react';

export const HeatmapView: React.FC = () => {
  const [data, setData] = useState<HeatmapItem[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = () => {
    setIsLoading(true);
    fetchHeatmap()
      .then((items) => {
        setData(items);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Heatmap load error:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const domains = ['all', 'ml', 'python', 'dbms', 'hr'];

  const filteredData = selectedDomain === 'all'
    ? data
    : data.filter(d => d.domain.toLowerCase() === selectedDomain);

  const getCoverageColor = (rate: number) => {
    if (rate >= 75) return 'text-emerald-700 bg-emerald-500';
    if (rate >= 45) return 'text-amber-700 bg-amber-500';
    return 'text-rose-700 bg-rose-500';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Aggregated Concept Analytics</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Candidate Knowledge Gap Heatmap
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tracks concept mastery and identifies pervasive knowledge gaps across all candidate evaluations.
            </p>
          </div>

          <button
            onClick={loadData}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Heatmap</span>
          </button>
        </div>

        {/* Domain Filter */}
        <div className="mt-6 flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Domain:</span>
          </span>
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                selectedDomain === d
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {d.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Content */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-sm space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
            <span>Compiling knowledge gap metrics across submissions...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No Evaluation Records Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Run candidate evaluations on the Practice screen to populate real-time concept mastery telemetry!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
              <span>Expected Technical Concept</span>
              <div className="flex items-center space-x-8">
                <span className="hidden sm:inline">Submissions</span>
                <span>Mastery / Coverage</span>
              </div>
            </div>

            {filteredData.map((item, i) => {
              const colorInfo = getCoverageColor(item.coverage_rate);
              return (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-indigo-700 border border-slate-200">
                        {item.domain}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {item.concept}
                      </span>
                    </div>

                    <div className="flex items-center space-x-6">
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        {item.total_evaluations} evaluated
                      </span>
                      <div className="flex items-center space-x-2 min-w-[120px] justify-end">
                        <span className={`text-sm font-bold ${colorInfo.split(' ')[0]}`}>
                          {item.coverage_rate.toFixed(1)}%
                        </span>
                        {item.gap_index > 50 && (
                          <span title="Significant Knowledge Gap" className="text-rose-600">
                            <AlertOctagon className="w-4 h-4" />
                          </span>
                        )}
                        {item.coverage_rate >= 75 && (
                          <span title="High Candidate Mastery" className="text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorInfo.split(' ')[1]} transition-all duration-500`}
                      style={{ width: `${Math.min(100, item.coverage_rate)}%` }}
                    />
                  </div>

                  {/* Breakdown tally */}
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-0.5">
                    <span className="text-emerald-700 font-medium">✓ {item.matched_count} Matched</span>
                    <span>•</span>
                    <span className="text-amber-700 font-medium">⚠ {item.partial_count} Partial</span>
                    <span>•</span>
                    <span className="text-rose-700 font-medium">✗ {item.missing_count} Omitted</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
