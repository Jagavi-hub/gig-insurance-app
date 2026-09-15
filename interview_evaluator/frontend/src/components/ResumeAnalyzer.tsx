import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Target,
  ArrowRight,
  Loader2,
  Brain,
  Code,
  Database,
  Users,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ResumeAnalyzeResponse, Question } from '../types';
import { analyzeResume, uploadResumeFile } from '../api';

interface ResumeAnalyzerProps {
  onStartInterviewForQuestion: (question: Question) => void;
}

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({
  onStartInterviewForQuestion
}) => {
  const [resumeText, setResumeText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Curated demo resumes for instant 1-click candidate testing
  const demoResumes = {
    ml: {
      label: '🤖 Senior ML Engineer',
      text: `Dr. Maya Lin
Senior Machine Learning Engineer
Summary: 6+ years designing and deploying production deep learning models at scale.
Experience:
- Architected computer vision and NLP transformer architectures with PyTorch and Hugging Face.
- Designed custom regularization strategies (L1/L2 weight decay, inverted dropout) to resolve high variance and training loss divergence.
- Established rigorous evaluation frameworks utilizing PR-AUC, ROC-AUC, and calibration curves for imbalanced fraud classification.
- Reduced model inference latency by 45% using TensorRT, ONNX runtime, and quantizing weights.
Skills: Python, PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, XGBoost, Docker, Kubernetes, AWS SageMaker.`
    },
    python: {
      label: '🐍 Python Backend Engineer',
      text: `Marcus Vance
Staff Python Backend Engineer
Summary: 7+ years building resilient microservices, asynchronous APIs, and distributed event systems.
Experience:
- Architected high-throughput REST and gRPC services using FastAPI, asyncio, and Pydantic handling 25K RPS.
- Optimized CPython memory allocations by profiling circular references and generational garbage collector heuristics (Gen 0/1/2).
- Designed streaming data ingestion pipelines using Python generators and the yield keyword, maintaining O(1) auxiliary memory space over 50GB log batches.
- Led migration of legacy monolith to containerized Docker services orchestrated with Kubernetes and Redis.
Skills: Python, FastAPI, Django, Flask, AsyncIO, Pytest, PostgreSQL, Redis, Celery, Docker, System Design, CI/CD.`
    },
    dbms: {
      label: '💾 Database Architect / DBA',
      text: `Elena Rostova
Principal Database Administrator & Data Architect
Summary: 8+ years leading relational database architecture, high availability, and transaction optimization.
Experience:
- Managed multi-terabyte PostgreSQL and MySQL InnoDB clusters ensuring strict ACID guarantees and 99.99% uptime.
- Optimized complex analytical queries by designing B+Tree clustered indexes, covering indexes, and tuning Postgres vacuuming parameters to prevent dead tuple table bloat.
- Resolved distributed deadlocks and concurrency anomalies by implementing snapshot isolation and Serializable MVCC policies.
- Implemented streaming WAL replication, automated disaster recovery, and connection pooling via PgBouncer.
Skills: SQL, PostgreSQL, MySQL, ACID, B-Tree Indexing, Query Optimization, Sharding, Replication, WAL, Redis, ClickHouse, Linux.`
    }
  };

  const handleLoadDemo = (key: keyof typeof demoResumes) => {
    setResumeText(demoResumes[key].text);
    setSelectedFile(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setResumeText('');
      setError(null);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !resumeText.trim()) {
      setError('Please upload a resume file (.pdf, .txt) or paste your resume text to begin.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      let result: ResumeAnalyzeResponse;
      if (selectedFile) {
        result = await uploadResumeFile(selectedFile);
      } else {
        result = await analyzeResume(resumeText);
      }
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Resume analysis error:', err);
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'ml': return <Brain className="w-5 h-5 text-purple-600" />;
      case 'python': return <Code className="w-5 h-5 text-blue-600" />;
      case 'dbms': return <Database className="w-5 h-5 text-emerald-600" />;
      case 'hr': return <Users className="w-5 h-5 text-amber-600" />;
      default: return <Briefcase className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-indigo-200 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Resume Taxonomy & Role Matcher</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Resume Analyzer & Job Role Matcher
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Upload or paste your resume to extract verified competencies, calculate compatibility across target engineering roles,
            and instantly practice tailored interview questions matched to your skill profile.
          </p>
        </div>
      </div>

      {/* Input / Upload Panel */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Provide Your Resume</h3>
            <p className="text-xs text-slate-500">Upload a PDF/TXT document or paste your resume text below</p>
          </div>

          {/* Quick Demo Pre-fills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-400 mr-1 font-medium">Quick Demo:</span>
            <button
              type="button"
              onClick={() => handleLoadDemo('ml')}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition"
            >
              🤖 ML Engineer
            </button>
            <button
              type="button"
              onClick={() => handleLoadDemo('python')}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
            >
              🐍 Python Backend
            </button>
            <button
              type="button"
              onClick={() => handleLoadDemo('dbms')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
            >
              💾 Database Architect
            </button>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          {/* File Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition space-y-1.5"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-6 h-6 text-indigo-600 mx-auto" />
            <div className="text-xs font-semibold text-slate-700">
              {selectedFile ? (
                <span className="text-indigo-600 font-bold">Selected file: {selectedFile.name}</span>
              ) : (
                <span>Click to upload resume (.pdf or .txt)</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">PDFs are parsed with PyPDF2; text is extracted securely</p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 uppercase font-semibold">Or paste text</span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Textarea */}
          <textarea
            rows={7}
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              if (selectedFile) setSelectedFile(null);
            }}
            placeholder="Paste raw resume text here (experience, skills, technical achievements)..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 resize-y focus:outline-none transition leading-relaxed font-sans"
          />

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="flex items-center space-x-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-md shadow-indigo-500/20 transition text-sm disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Resume & Matching Roles...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analyze Resume & Match Job Roles</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results Dashboard */}
      {analysisResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Candidate Profile Overview Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {analysisResult.candidate_name}
                  </h2>
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {analysisResult.experience_level}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  {analysisResult.executive_summary}
                </p>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-xs text-slate-400 uppercase font-semibold">Matched Roles</span>
                <div className="text-2xl font-extrabold text-indigo-600">
                  {analysisResult.matched_roles.length} Roles Analyzed
                </div>
              </div>
            </div>

            {/* Detected Skills Cloud */}
            <div className="mt-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Detected Verified Competencies
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(analysisResult.detected_skills).map(([category, skills]) => (
                  <div key={category} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      {category.replace(/_/g, ' ')}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {skills.length > 0 ? (
                        skills.map((s, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">None detected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Matched Job Roles Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Target Job Roles Ranked by Fit
                </h3>
                <p className="text-xs text-slate-500">
                  Select a role to start a targeted interview on tailored assessment questions
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {analysisResult.matched_roles.map((role, idx) => {
                const isTopMatch = idx === 0;

                return (
                  <div
                    key={role.role_title}
                    className={`bg-white rounded-3xl p-6 border transition duration-200 ${
                      isTopMatch
                        ? 'border-indigo-300 ring-2 ring-indigo-500/10 shadow-md'
                        : 'border-slate-200/90 shadow-sm hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                          {getDomainIcon(role.domain)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-base sm:text-lg font-bold text-slate-900">
                              {role.role_title}
                            </h4>
                            {isTopMatch && (
                              <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ⭐ Top Match
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {role.fit_summary}
                          </p>
                        </div>
                      </div>

                      {/* Fit Score Badge */}
                      <div className="flex items-center space-x-3 self-start md:self-auto bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                        <div className="text-center">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Role Fit
                          </span>
                          <span className="text-xl sm:text-2xl font-extrabold text-indigo-600">
                            {role.fit_percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Matching Skills vs Skill Gaps */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Matching Skills */}
                      <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Key Matching Strengths</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {role.matching_skills.map((s, i) => (
                            <span key={i} className="text-xs font-medium px-2 py-0.5 rounded-md bg-white text-emerald-900 border border-emerald-200 shadow-2xs">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Skill Gaps */}
                      <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1">
                          <Target className="w-3.5 h-3.5 text-amber-600" />
                          <span>Interview Focus / Skill Gaps</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {role.skill_gaps.map((g, i) => (
                            <span key={i} className="text-xs font-medium px-2 py-0.5 rounded-md bg-white text-amber-900 border border-amber-200 shadow-2xs">
                              • {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommended Practice Questions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Recommended Blueprint Questions for this Role:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {analysisResult.recommended_questions
                          .filter(q => role.recommended_question_ids.includes(q.question_id) || q.domain === role.domain)
                          .slice(0, 2)
                          .map((q) => (
                            <div
                              key={q.question_id}
                              onClick={() => onStartInterviewForQuestion(q)}
                              className="group/q flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 cursor-pointer transition"
                            >
                              <div className="max-w-md pr-2">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 mr-1.5">
                                  {q.question_id}
                                </span>
                                <span className="text-xs font-semibold text-slate-800 group-hover/q:text-indigo-600 transition line-clamp-1">
                                  {q.question_text}
                                </span>
                              </div>
                              <button className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 group-hover/q:bg-indigo-700 text-white text-[11px] font-bold transition shadow-xs flex-shrink-0">
                                <span>Practice</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
