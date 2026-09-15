import {
  Question,
  EvaluationResponse,
  HeatmapItem,
  SystemHealth,
  SeniorPolishResponse,
  JobReadinessSummary,
  ResumeAnalyzeResponse,
  RoleCapabilitySummary,
  RoleTaxonomyItem
} from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function fetchHealth(): Promise<SystemHealth> {
  const res = await fetch(`${API_BASE}/api/health`).catch(() => fetch('/api/health'));
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchQuestions(domain?: string): Promise<Question[]> {
  const url = domain ? `${API_BASE}/api/questions?domain=${domain}` : `${API_BASE}/api/questions`;
  const res = await fetch(url).catch(() => fetch(domain ? `/api/questions?domain=${domain}` : '/api/questions'));
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
}

export async function evaluateAnswer(questionId: string, candidateAnswer: string): Promise<EvaluationResponse> {
  const res = await fetch(`${API_BASE}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question_id: questionId,
      candidate_answer: candidateAnswer,
    }),
  }).catch(() => fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question_id: questionId,
      candidate_answer: candidateAnswer,
    }),
  }));

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to evaluate answer');
  }
  return res.json();
}

export async function fetchReport(evaluationId: string): Promise<EvaluationResponse> {
  const res = await fetch(`${API_BASE}/api/report/${evaluationId}`).catch(() => fetch(`/api/report/${evaluationId}`));
  if (!res.ok) throw new Error('Failed to fetch evaluation report');
  return res.json();
}

export async function fetchHeatmap(): Promise<HeatmapItem[]> {
  const res = await fetch(`${API_BASE}/api/heatmap`).catch(() => fetch('/api/heatmap'));
  if (!res.ok) throw new Error('Failed to fetch heatmap data');
  return res.json();
}

export async function fetchSeniorPolish(questionId: string, candidateAnswer: string): Promise<SeniorPolishResponse> {
  const res = await fetch(`${API_BASE}/api/senior-polish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question_id: questionId,
      candidate_answer: candidateAnswer,
    }),
  }).catch(() => fetch('/api/senior-polish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question_id: questionId,
      candidate_answer: candidateAnswer,
    }),
  }));

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate senior polish');
  }
  return res.json();
}

export async function fetchPassport(domain?: string): Promise<JobReadinessSummary> {
  const url = domain ? `${API_BASE}/api/passport?domain=${domain}` : `${API_BASE}/api/passport`;
  const res = await fetch(url).catch(() => fetch(domain ? `/api/passport?domain=${domain}` : '/api/passport'));
  if (!res.ok) throw new Error('Failed to fetch skill passport');
  return res.json();
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalyzeResponse> {
  const res = await fetch(`${API_BASE}/api/analyze-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume_text: resumeText }),
  }).catch(() => fetch('/api/analyze-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume_text: resumeText }),
  }));

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to analyze resume');
  }
  return res.json();
}

export async function uploadResumeFile(file: File): Promise<ResumeAnalyzeResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/upload-resume`, {
    method: 'POST',
    body: formData,
  }).catch(() => fetch('/api/upload-resume', {
    method: 'POST',
    body: formData,
  }));

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to process resume file');
  }
  return res.json();
}

export async function fetchRolesTaxonomy(): Promise<RoleTaxonomyItem[]> {
  const res = await fetch(`${API_BASE}/api/roles`).catch(() => fetch('/api/roles'));
  if (!res.ok) throw new Error('Failed to fetch roles taxonomy');
  return res.json();
}

export async function fetchRandomQuestion(params?: { domain?: string; role?: string; skill?: string }): Promise<Question> {
  const query = new URLSearchParams();
  if (params?.domain && params.domain !== 'all') query.append('domain', params.domain);
  if (params?.role && params.role !== 'all') query.append('role', params.role);
  if (params?.skill && params.skill !== 'all') query.append('skill', params.skill);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const res = await fetch(`${API_BASE}/api/questions/random${qs}`).catch(() => fetch(`/api/questions/random${qs}`));
  if (!res.ok) throw new Error('Failed to fetch random question');
  return res.json();
}

export async function fetchRoleCapability(role: string): Promise<RoleCapabilitySummary> {
  const encoded = encodeURIComponent(role);
  const res = await fetch(`${API_BASE}/api/role-capability/${encoded}`).catch(() => fetch(`/api/role-capability/${encoded}`));
  if (!res.ok) throw new Error(`Failed to fetch capability for ${role}`);
  return res.json();
}
