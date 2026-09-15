import React, { useState } from 'react';
import { Question, EvaluationResponse, PracticeFormat } from '../types';
import { ArrowLeft, Sparkles, AlertCircle, CheckCircle, HelpCircle, FileText, Loader2, Video, Edit3 } from 'lucide-react';
import { evaluateAnswer } from '../api';
import { AudioVideoBooth } from './AudioVideoBooth';

interface AnswerInputProps {
  question: Question;
  onBack: () => void;
  onEvaluationComplete: (result: EvaluationResponse) => void;
  practiceFormat?: PracticeFormat;
  questionIndex?: number;
  totalQuestionsInFormat?: number;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  question,
  onBack,
  onEvaluationComplete,
  practiceFormat = 'warmup',
  questionIndex = 1,
  totalQuestionsInFormat = 1
}) => {
  const [interviewMode, setInterviewMode] = useState<'video' | 'text'>('video');
  const [answerText, setAnswerText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleAppendTranscript = (chunk: string) => {
    setAnswerText(prev => (prev ? `${prev.trim()} ${chunk.trim()}` : chunk.trim()));
  };

  // Preset answers for rapid evaluation demoing
  const presets: { [key: string]: { label: string; text: string; icon: string } } = {
    strong: {
      label: 'Exemplary Strong Answer',
      icon: '🌟',
      text: question.domain === 'ml'
        ? `Overfitting occurs when a machine learning model learns the training data and noise rather than generalizable underlying patterns, representing high variance and low bias. The key symptom is a significant generalization gap: near-zero training loss alongside poor accuracy on unseen evaluation data. During training, it is detected when training loss continues decreasing while validation loss begins to diverge and climb. To prevent overfitting, we use regularization like L1 Lasso (which induces sparsity) and L2 Ridge (which penalizes large weights). In deep learning, Dropout randomly deactivates neurons to reduce co-adaptation. We also use Early Stopping based on validation loss patience, K-Fold Cross-Validation, and data augmentation to expand the training distribution.`
        : question.domain === 'python'
        ? `Python uses reference counting as its primary memory management mechanism: each object's ob_refcnt tracks active pointers, and the object is immediately deallocated when count reaches zero. However, reference counting alone cannot resolve cyclic references where isolated objects point to each other. To solve this, CPython has a Generational Garbage Collector with three generations (0, 1, 2) based on object lifetime. The cyclic GC detects isolated cycles by tracking container objects, decrementing candidate references, and freeing unreachable loops.`
        : `ACID guarantees transactional reliability: Atomicity ensures all operations succeed or all are rolled back (all-or-nothing); Consistency preserves database integrity constraints; Isolation ensures concurrent operations do not leak uncommitted state; Durability guarantees committed data survives crashes via Write-Ahead Logging. Concurrency phenomena include dirty reads, non-repeatable reads, and phantom reads. SQL isolation levels—Read Uncommitted, Read Committed, Repeatable Read, and Serializable—progressively prevent these anomalies using locking or MVCC snapshot isolation.`
    },
    average: {
      label: 'Average / Incomplete Answer',
      icon: '⚠️',
      text: question.domain === 'ml'
        ? `Overfitting is when a model gets too complex and fits the training set too closely. You can detect it because training accuracy is much higher than testing accuracy. To prevent it, you can gather more training data or add dropout.`
        : `Python counts references to delete objects when not needed. Sometimes things leak if they point to each other.`
    },
    misconception: {
      label: 'Answer with Misconceptions',
      icon: '❌',
      text: question.domain === 'ml'
        ? `Overfitting means the model has very high bias and doesn't fit the training data properly. If your model gets 100% training accuracy it means it is fully ready for production. You can fix it by adding as many polynomial features as possible so the model gets smarter.`
        : `In Python, the del statement immediately frees memory back to the operating system, and the GIL completely prevents all memory leaks in multithreaded programs.`
    },
    ungrounded: {
      label: 'Off-Topic / Low Grounding Answer',
      icon: '🚫',
      text: `I enjoy writing software using web technologies. When developing applications, I like using React and modern CSS frameworks to build user interfaces that display data from JSON APIs.`
    }
  };

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const charCount = answerText.length;

  const handlePresetSelect = (key: string) => {
    if (presets[key]) {
      setAnswerText(presets[key].text);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) {
      setError('Please provide an answer before running the evaluation.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPipelineStep(1);

    const timer1 = setTimeout(() => setPipelineStep(2), 500);
    const timer2 = setTimeout(() => setPipelineStep(3), 1100);
    const timer3 = setTimeout(() => setPipelineStep(4), 1700);

    try {
      const result = await evaluateAnswer(question.question_id, answerText);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      onEvaluationComplete(result);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsLoading(false);
      setError(err.message || 'An unexpected error occurred during evaluation.');
    }
  };

  const formatTitleMap = {
    warmup: '⚡ Quick Warmup',
    standard: '🎯 Standard Assessment',
    comprehensive: '🏆 Comprehensive Evaluation'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Navigation & Session Format Pill */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900 transition font-medium disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Question List</span>
        </button>

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
          <span>{formatTitleMap[practiceFormat]}</span>
          <span>•</span>
          <span>Question {questionIndex} of {totalQuestionsInFormat}</span>
        </div>
      </div>

      {/* Target Question Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {question.domain.toUpperCase()}
            </span>
            <span className="text-xs text-slate-600 font-medium px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
              Role: {question.role}
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Weights: Rel {Math.round(question.rubric_weights.relevance * 100)}% • Comp {Math.round(question.rubric_weights.completeness * 100)}% • Tech {Math.round(question.rubric_weights.technical * 100)}% • Comm {Math.round(question.rubric_weights.communication * 100)}%
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
          {question.question_text}
        </h2>

        {/* Expected Concepts */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Expected Blueprint Concepts ({question.expected_concepts.length})</span>
          </div>
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.expected_concepts.map((concept, i) => (
              <div key={i} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-start space-x-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>{concept}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interview Mode Selector Tabs */}
      <div className="flex items-center justify-between p-1 bg-slate-200/80 rounded-2xl border border-slate-300 max-w-md">
        <button
          type="button"
          onClick={() => setInterviewMode('video')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition ${
            interviewMode === 'video'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>🎙️ Video & Audio Booth</span>
        </button>
        <button
          type="button"
          onClick={() => setInterviewMode('text')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition ${
            interviewMode === 'text'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>✍️ Standard Text Mode</span>
        </button>
      </div>

      {/* Live Video & Audio Booth */}
      {interviewMode === 'video' && (
        <AudioVideoBooth
          onAppendTranscript={handleAppendTranscript}
          currentAnswerLength={answerText.length}
        />
      )}

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <label className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Your Technical Answer</span>
            </label>

            {/* Quick Demo Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-400 mr-1 font-medium">Quick Demo:</span>
              <button
                type="button"
                onClick={() => handlePresetSelect('strong')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
              >
                🌟 Strong
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('average')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition"
              >
                ⚠️ Average
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('misconception')}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
              >
                ❌ Misconception
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('ungrounded')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              >
                🚫 Off-Topic
              </button>
            </div>
          </div>

          <textarea
            rows={10}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={isLoading}
            placeholder="Type or paste your candidate answer here. Be specific about underlying mechanisms, mathematical definitions, failure modes, and practical trade-offs..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl p-4 text-sm text-slate-800 placeholder-slate-400 resize-y focus:outline-none transition leading-relaxed font-sans"
          />

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
            <div>
              <span>{wordCount} words</span>
              <span className="mx-2">•</span>
              <span>{charCount} characters</span>
            </div>
            <span className="italic">Grounded in ChromaDB vector reference documents</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Pipeline State Animation */}
        {isLoading && (
          <div className="bg-white border border-indigo-300 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <h3 className="font-bold text-slate-900 text-base">
                Executing RAG-Grounded Evaluation Pipeline...
              </h3>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm font-medium">
              <div className={`flex items-center space-x-2.5 ${pipelineStep >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {pipelineStep > 1 ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
                <span>1. Retrieving domain reference chunks from ChromaDB (all-MiniLM-L6-v2)</span>
              </div>
              <div className={`flex items-center space-x-2.5 ${pipelineStep >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {pipelineStep > 2 ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : pipelineStep === 2 ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                <span>2. Concept Extractor: Mapping concepts & extracting verbatim supporting evidence</span>
              </div>
              <div className={`flex items-center space-x-2.5 ${pipelineStep >= 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {pipelineStep > 3 ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : pipelineStep === 3 ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                <span>3. Evaluator: Auditing 4 dimensions, detecting misconceptions & grounding safety</span>
              </div>
              <div className={`flex items-center space-x-2.5 ${pipelineStep >= 4 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {pipelineStep === 4 ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                <span>4. Scoring Engine: Computing weighted rubric score and compiling report</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="submit"
            disabled={isLoading || !answerText.trim()}
            className="flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Evaluating Answer...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Evaluate with Grounded RAG Pipeline</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
