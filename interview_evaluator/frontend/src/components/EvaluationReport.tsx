import React, { useState } from 'react';
import { EvaluationResponse, SeniorPolishResponse } from '../types';
import {
  ArrowLeft,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Clock,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileSearch,
  Quote,
  Layers,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SeniorPolishDrawer } from './SeniorPolishDrawer';
import { fetchSeniorPolish } from '../api';

interface EvaluationReportProps {
  report: EvaluationResponse;
  onReset: () => void;
  onNextQuestion?: () => void;
  hasNextQuestion?: boolean;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({
  report,
  onReset,
  onNextQuestion,
  hasNextQuestion
}) => {
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'matched' | 'partially_matched' | 'missing'>('all');
  const [showGroundingDrawer, setShowGroundingDrawer] = useState<boolean>(false);
  const [isPolishDrawerOpen, setIsPolishDrawerOpen] = useState<boolean>(false);
  const [polishData, setPolishData] = useState<SeniorPolishResponse | null>(null);
  const [isPolishing, setIsPolishing] = useState<boolean>(false);

  const handleOpenSeniorPolish = async () => {
    setIsPolishDrawerOpen(true);
    if (!polishData) {
      setIsPolishing(true);
      try {
        const data = await fetchSeniorPolish(report.question_id, report.candidate_answer);
        setPolishData(data);
      } catch (err) {
        console.error('Failed to generate senior polish:', err);
      } finally {
        setIsPolishing(false);
      }
    }
  };

  const filteredEvidence = evidenceFilter === 'all'
    ? report.concept_evidence
    : report.concept_evidence.filter(c => c.status === evidenceFilter);

  const matchedCount = report.concept_evidence.filter(c => c.status === 'matched').length;
  const partialCount = report.concept_evidence.filter(c => c.status === 'partially_matched').length;
  const missingCount = report.concept_evidence.filter(c => c.status === 'missing').length;

  const getTierBadge = (tier: string) => {
    if (tier.includes('Exceptional')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (tier.includes('Strong')) {
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
    if (tier.includes('Competent')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    if (tier.includes('Developing')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    return 'bg-rose-50 text-rose-800 border-rose-200';
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-emerald-600';
    if (score >= 7.0) return 'text-indigo-600';
    if (score >= 5.5) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getProgressBg = (score: number) => {
    if (score >= 8.5) return 'bg-emerald-500';
    if (score >= 7.0) return 'bg-indigo-600';
    if (score >= 5.5) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="inline-flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessments</span>
        </button>

        <div className="flex items-center space-x-3">
          {/* Senior Polish Action Button */}
          <button
            onClick={handleOpenSeniorPolish}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition pulse-glow"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Make My Answer Senior-Level</span>
          </button>

          {hasNextQuestion ? (
            <button
              onClick={onNextQuestion}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs sm:text-sm font-bold text-white shadow transition"
            >
              <span>Next Question →</span>
            </button>
          ) : (
            <button
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Evaluation</span>
            </button>
          )}
        </div>
      </div>

      {/* Insufficient Reference Banner (Safety Guard) */}
      {report.insufficient_reference && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 shadow-sm flex items-start space-x-3 text-amber-900">
          <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm sm:text-base text-amber-900">
              Low Confidence Grounding Alert: Insufficient Reference Documentation
            </h4>
            <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
              The retrieval similarity score for candidate claims fell below the safety threshold.
              To prevent ungrounded hallucinations, the <strong>Technical Dimension Score</strong> was capped at 5.0 and flagged as low confidence.
            </p>
          </div>
        </div>
      )}

      {/* Header & Overall Score Summary (Clean Slate Card) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {report.domain.toUpperCase()}
              </span>
              <span className="text-xs text-slate-600 font-medium px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                Question ID: {report.question_id}
              </span>
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{report.latency_ms} ms</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {report.question_text}
            </h1>

            <div className="pt-1">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getTierBadge(report.performance_tier)}`}>
                <Award className="w-3.5 h-3.5" />
                <span>Performance Tier: {report.performance_tier}</span>
              </span>
            </div>
          </div>

          {/* Overall Score Circle */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/60 rounded-2xl border border-indigo-100 shadow-inner min-w-[210px]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Score</span>
            <div className="mt-1 flex items-baseline space-x-0.5">
              <span className={`text-4xl sm:text-5xl font-extrabold ${getScoreColor(report.overall_score / 10)}`}>
                {report.overall_score.toFixed(1)}
              </span>
              <span className="text-slate-400 text-lg font-bold">%</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 font-medium">Weighted Rubric Formula</span>
          </div>
        </div>

        {/* 4 Dimension Bars */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Relevance */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Relevance</span>
              <span className="text-slate-500 font-mono">w: {Math.round(report.rubric_weights.relevance * 100)}%</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className={`text-xl font-bold ${getScoreColor(report.relevance)}`}>
                {report.relevance.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 10</span>
              </span>
              <span className="text-xs text-slate-500">{Math.round(report.relevance * 10)}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressBg(report.relevance)} transition-all duration-500`}
                style={{ width: `${Math.min(100, report.relevance * 10)}%` }}
              />
            </div>
          </div>

          {/* Completeness */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Completeness</span>
              <span className="text-slate-500 font-mono">w: {Math.round(report.rubric_weights.completeness * 100)}%</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className={`text-xl font-bold ${getScoreColor(report.completeness)}`}>
                {report.completeness.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 10</span>
              </span>
              <span className="text-xs text-slate-500">{Math.round(report.completeness * 10)}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressBg(report.completeness)} transition-all duration-500`}
                style={{ width: `${Math.min(100, report.completeness * 10)}%` }}
              />
            </div>
          </div>

          {/* Technical */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 relative">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Technical Depth</span>
              <span className="text-slate-500 font-mono">w: {Math.round(report.rubric_weights.technical * 100)}%</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className={`text-xl font-bold ${getScoreColor(report.technical)}`}>
                {report.technical.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 10</span>
              </span>
              <span className="text-xs text-slate-500">{Math.round(report.technical * 10)}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressBg(report.technical)} transition-all duration-500`}
                style={{ width: `${Math.min(100, report.technical * 10)}%` }}
              />
            </div>
            {report.insufficient_reference && (
              <span className="absolute bottom-1 right-2 text-[9px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Capped</span>
            )}
          </div>

          {/* Communication */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Communication</span>
              <span className="text-slate-500 font-mono">w: {Math.round(report.rubric_weights.communication * 100)}%</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className={`text-xl font-bold ${getScoreColor(report.communication)}`}>
                {report.communication.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 10</span>
              </span>
              <span className="text-xs text-slate-500">{Math.round(report.communication * 10)}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressBg(report.communication)} transition-all duration-500`}
                style={{ width: `${Math.min(100, report.communication * 10)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Explainability Core: Concept Evidence Panel */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Concept Evidence & Grounding Audit
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Every blueprint concept mapped against candidate answer with verbatim supporting quote.
            </p>
          </div>

          {/* Status Filters */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setEvidenceFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                evidenceFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({report.concept_evidence.length})
            </button>
            <button
              onClick={() => setEvidenceFilter('matched')}
              className={`px-3 py-1.5 rounded-lg transition ${
                evidenceFilter === 'matched' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✓ Mastered ({matchedCount})
            </button>
            <button
              onClick={() => setEvidenceFilter('partially_matched')}
              className={`px-3 py-1.5 rounded-lg transition ${
                evidenceFilter === 'partially_matched' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚠ Partial ({partialCount})
            </button>
            <button
              onClick={() => setEvidenceFilter('missing')}
              className={`px-3 py-1.5 rounded-lg transition ${
                evidenceFilter === 'missing' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✗ Omitted ({missingCount})
            </button>
          </div>
        </div>

        {/* Evidence Cards with vibrant status colors */}
        <div className="space-y-3">
          {filteredEvidence.map((item, idx) => {
            const isMatched = item.status === 'matched';
            const isPartial = item.status === 'partially_matched';

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition ${
                  isMatched
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : isPartial
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-rose-50/60 border-rose-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex items-start space-x-2.5">
                    {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
                    {isPartial && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                    {!isMatched && !isPartial && <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />}
                    <span className="text-sm font-semibold text-slate-900 leading-tight">
                      {item.concept}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pl-7 sm:pl-0">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isMatched
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : isPartial
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Conf: {Math.round(item.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Supporting Quote / Evidence */}
                {item.evidence ? (
                  <div className="mt-2.5 pl-7">
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs sm:text-sm text-slate-800 shadow-sm relative">
                      <Quote className="w-3.5 h-3.5 text-indigo-500 inline-block mr-1.5 -mt-1 opacity-70" />
                      <span className="italic font-sans">"{item.evidence}"</span>
                    </div>
                    {item.reasoning && (
                      <p className="mt-1.5 text-xs text-slate-600">
                        <strong>Reasoning:</strong> {item.reasoning}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 pl-7 text-xs text-rose-700 italic">
                    No supporting verbatim evidence found in candidate answer.
                    {item.reasoning && <span className="text-slate-500 not-italic block mt-0.5">Note: {item.reasoning}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Quadrants Feedback Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mastered Strengths (Emerald) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-3.5">
          <div className="flex items-center space-x-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">✓ Mastered Points & Strengths</h3>
          </div>
          <ul className="space-y-2">
            {report.strengths.map((str, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-700 bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl flex items-start space-x-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Concepts (Rose Red) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-3.5">
          <div className="flex items-center space-x-2 text-rose-700">
            <XCircle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-base text-slate-900">✗ Omitted & Missing Concepts</h3>
          </div>
          {report.missing_concepts.length > 0 ? (
            <ul className="space-y-2">
              {report.missing_concepts.map((mc, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-700 bg-rose-50/70 border border-rose-200/80 p-3 rounded-xl flex items-start space-x-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>{mc}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500 text-center font-medium">
              🎉 No critical concepts were omitted!
            </div>
          )}
        </div>

        {/* Misconceptions Detected (Rose Red) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-3.5">
          <div className="flex items-center space-x-2 text-rose-700">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-base text-slate-900">⚠️ Misconceptions Detected</h3>
          </div>
          {report.misconceptions_detected.length > 0 ? (
            <ul className="space-y-2">
              {report.misconceptions_detected.map((misc, i) => (
                <li key={i} className="text-xs sm:text-sm text-rose-900 bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-start space-x-2">
                  <span className="text-rose-600 font-bold">⚠️</span>
                  <span>{misc}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 text-xs text-emerald-700 text-center flex items-center justify-center space-x-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No common misconceptions were triggered in this answer.</span>
            </div>
          )}
        </div>

        {/* Actionable Improvements (Warm Amber) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-3.5">
          <div className="flex items-center space-x-2 text-amber-700">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">💡 Actionable Improvement Points</h3>
          </div>
          <ul className="space-y-2">
            {report.improvements.map((imp, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-700 bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl flex items-start space-x-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Candidate Raw Answer Transcript */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <h3 className="font-semibold text-sm text-slate-800 mb-2">Submitted Candidate Answer</h3>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {report.candidate_answer}
        </div>
      </div>

      {/* Collapsible RAG Grounding Inspector */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <button
          onClick={() => setShowGroundingDrawer(!showGroundingDrawer)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2.5">
            <FileSearch className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-slate-900">
                RAG Grounding Inspector ({report.retrieved_chunks.length} Chunks Retrieved)
              </h3>
              <p className="text-xs text-slate-500">
                Inspect the curated reference documents retrieved from ChromaDB to ground this evaluation.
              </p>
            </div>
          </div>
          {showGroundingDrawer ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {showGroundingDrawer && (
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
            {report.retrieved_chunks.map((chunk, i) => (
              <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-mono text-indigo-700 font-semibold">{chunk.source}</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                    Cosine Sim: <strong>{chunk.similarity_score.toFixed(3)}</strong>
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed font-sans">{chunk.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Senior Polish Slide-Out Drawer */}
      <SeniorPolishDrawer
        polishData={polishData}
        candidateAnswer={report.candidate_answer}
        isOpen={isPolishDrawerOpen}
        onClose={() => setIsPolishDrawerOpen(false)}
        isLoading={isPolishing}
      />
    </div>
  );
};
