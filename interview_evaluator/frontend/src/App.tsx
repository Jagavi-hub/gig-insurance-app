import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { QuestionPicker } from './components/QuestionPicker';
import { AnswerInput } from './components/AnswerInput';
import { EvaluationReport } from './components/EvaluationReport';
import { HeatmapView } from './components/HeatmapView';
import { SkillPassportHub } from './components/SkillPassportHub';
import { ResumeAnalyzer } from './components/ResumeAnalyzer';
import { RoleCapabilityReport } from './components/RoleCapabilityReport';
import { Question, EvaluationResponse, PracticeFormat, JobReadinessSummary } from './types';
import { fetchQuestions, fetchPassport, fetchRandomQuestion } from './api';
import { Loader2, AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'practice' | 'resume' | 'passport' | 'heatmap' | 'capability'>('practice');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [practiceFormat, setPracticeFormat] = useState<PracticeFormat>('warmup');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResponse | null>(null);
  const [sessionQuestionIndex, setSessionQuestionIndex] = useState<number>(1);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [jobReadiness, setJobReadiness] = useState<JobReadinessSummary | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = () => {
    setIsLoadingQuestions(true);
    setError(null);
    Promise.all([fetchQuestions(), fetchPassport().catch(() => null)])
      .then(([qList, passportData]) => {
        setQuestions(qList);
        if (passportData) setJobReadiness(passportData);
        setIsLoadingQuestions(false);
      })
      .catch((err) => {
        console.error('Error loading initial data:', err);
        setError('Could not connect to FastAPI evaluation backend. Please ensure the backend is running at http://127.0.0.1:8000.');
        setIsLoadingQuestions(false);
      });
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const getFormatTotalCount = (format: PracticeFormat) => {
    if (format === 'warmup') return 1;
    if (format === 'standard') return 3;
    return 5;
  };

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestion(q);
    setEvaluationResult(null);

    // Build question playlist for the selected practice format
    const totalCount = getFormatTotalCount(practiceFormat);
    const otherQuestions = questions.filter(item => item.question_id !== q.question_id);
    const sessionPlaylist = [q, ...otherQuestions.slice(0, totalCount - 1)];
    setSessionQuestions(sessionPlaylist);
    setSessionQuestionIndex(1);
  };

  const handleBackToPicker = () => {
    setSelectedQuestion(null);
    setEvaluationResult(null);
  };

  const handleEvaluationComplete = (result: EvaluationResponse) => {
    setEvaluationResult(result);
    // Refresh skill passport and job readiness
    fetchPassport()
      .then(setJobReadiness)
      .catch((err) => console.warn('Could not refresh passport:', err));
  };

  const handleNextQuestion = () => {
    const nextIndex = sessionQuestionIndex + 1;
    if (nextIndex <= sessionQuestions.length) {
      setSessionQuestionIndex(nextIndex);
      setSelectedQuestion(sessionQuestions[nextIndex - 1]);
      setEvaluationResult(null);
    } else {
      setSelectedQuestion(null);
      setEvaluationResult(null);
    }
  };

  const handleReset = () => {
    setSelectedQuestion(null);
    setEvaluationResult(null);
  };

  const handleRandomQuestionLaunch = async () => {
    try {
      setIsLoadingQuestions(true);
      const randQ = await fetchRandomQuestion();
      setActiveTab('practice');
      handleSelectQuestion(randQ);
    } catch (err) {
      console.error('Failed to launch random question:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const totalQuestionsInFormat = sessionQuestions.length || getFormatTotalCount(practiceFormat);
  const hasNextQuestion = sessionQuestionIndex < totalQuestionsInFormat;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        onRandomQuestion={handleRandomQuestionLaunch}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'practice') {
            setSelectedQuestion(null);
            setEvaluationResult(null);
          }
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'capability' ? (
          <RoleCapabilityReport
            onSelectQuestion={(q) => {
              setActiveTab('practice');
              handleSelectQuestion(q);
            }}
          />
        ) : activeTab === 'resume' ? (
          <ResumeAnalyzer
            onStartInterviewForQuestion={(matchedQuestion) => {
              setActiveTab('practice');
              handleSelectQuestion(matchedQuestion);
            }}
          />
        ) : activeTab === 'passport' ? (
          <SkillPassportHub
            onStartPractice={() => {
              setActiveTab('practice');
              setSelectedQuestion(null);
              setEvaluationResult(null);
            }}
          />
        ) : activeTab === 'heatmap' ? (
          <HeatmapView />
        ) : (
          <>
            {isLoadingQuestions ? (
              <div className="py-24 text-center space-y-4">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-slate-500 text-sm font-medium">Connecting to evaluation backend & loading blueprints...</p>
              </div>
            ) : error ? (
              <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white border border-rose-200 text-center space-y-3 shadow-sm">
                <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-base">Backend Connection Issue</h3>
                <p className="text-xs sm:text-sm text-slate-600">{error}</p>
                <button
                  onClick={loadInitialData}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition shadow-sm"
                >
                  Retry Connection
                </button>
              </div>
            ) : evaluationResult ? (
              <EvaluationReport
                report={evaluationResult}
                onReset={handleReset}
                onNextQuestion={handleNextQuestion}
                hasNextQuestion={hasNextQuestion}
              />
            ) : selectedQuestion ? (
              <AnswerInput
                question={selectedQuestion}
                onBack={handleBackToPicker}
                onEvaluationComplete={handleEvaluationComplete}
                practiceFormat={practiceFormat}
                questionIndex={sessionQuestionIndex}
                totalQuestionsInFormat={totalQuestionsInFormat}
              />
            ) : (
              <QuestionPicker
                questions={questions}
                onSelectQuestion={handleSelectQuestion}
                practiceFormat={practiceFormat}
                onSelectPracticeFormat={setPracticeFormat}
                jobReadiness={jobReadiness}
                onOpenPassport={() => setActiveTab('passport')}
              />
            )}
          </>
        )}
      </main>

      {/* Modern Job Portal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-600">EvalAI — AI-Powered Interview Answer Evaluation System</span>
          <span className="text-slate-400">ChromaDB Vector Store • Sentence-Transformers • FastAPI • React + Vite</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
