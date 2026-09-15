export interface RubricWeights {
  relevance: number;
  completeness: number;
  technical: number;
  communication: number;
}

export interface Question {
  question_id: string;
  question_text: string;
  domain: string;
  role: string;
  skill?: string;
  difficulty?: string;
  expected_concepts: string[];
  optional_concepts: string[];
  common_misconceptions: string[];
  rubric_weights: RubricWeights;
}

export interface ConceptEvidence {
  concept: string;
  status: 'matched' | 'partially_matched' | 'missing';
  confidence: number;
  evidence: string;
  reasoning?: string;
}

export interface RetrievedChunk {
  chunk_id: string;
  text: string;
  source: string;
  similarity_score: number;
}

export interface EvaluationResponse {
  evaluation_id: string;
  question_id: string;
  question_text: string;
  domain: string;
  candidate_answer: string;
  relevance: number;
  completeness: number;
  technical: number;
  communication: number;
  overall_score: number;
  performance_tier: string;
  covered_concepts: string[];
  missing_concepts: string[];
  misconceptions_detected: string[];
  strengths: string[];
  improvements: string[];
  concept_evidence: ConceptEvidence[];
  retrieved_chunks: RetrievedChunk[];
  insufficient_reference: boolean;
  rubric_weights: RubricWeights;
  latency_ms: number;
  created_at: string;
}

export interface HeatmapItem {
  concept: string;
  domain: string;
  total_evaluations: number;
  matched_count: number;
  partial_count: number;
  missing_count: number;
  coverage_rate: number;
  gap_index: number;
}

export interface SystemHealth {
  status: string;
  llm_mode: string;
  llm_model: string;
  chroma_connected: boolean;
  chroma_collections: string[];
}

export interface KeyPhrasingUpgrade {
  junior_or_candidate_phrase: string;
  senior_upgrade: string;
  rationale: string;
}

export interface SeniorPolishResponse {
  question_id: string;
  question_text: string;
  role: string;
  domain: string;
  senior_answer: string;
  senior_highlights: string[];
  key_phrasing_upgrades: KeyPhrasingUpgrade[];
  production_considerations: string[];
}

export interface Badge {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
  progress: number;
}

export interface JobReadinessSummary {
  readiness_percentage: number;
  target_role: string;
  readiness_status: string;
  total_evaluations: number;
  technical_mastery: number;
  completeness_mastery: number;
  communication_mastery: number;
  earned_badges_count: number;
  total_badges_count: number;
  badges: Badge[];
  recommendation: string;
}

export type PracticeFormat = 'warmup' | 'standard' | 'comprehensive';

export interface MatchedJobRole {
  role_title: string;
  domain: string;
  fit_percentage: number;
  fit_summary: string;
  matching_skills: string[];
  skill_gaps: string[];
  recommended_question_ids: string[];
}

export interface ResumeAnalyzeResponse {
  candidate_name: string;
  experience_level: string;
  executive_summary: string;
  detected_skills: Record<string, string[]>;
  matched_roles: MatchedJobRole[];
  recommended_questions: Question[];
}

export interface SkillAssessmentStatus {
  skill_name: string;
  description: string;
  tested_questions_count: number;
  average_score: number;
  status: 'mastered' | 'proficient' | 'needs_practice' | 'untested';
  recommended_question_ids: string[];
}

export interface RoleCapabilitySummary {
  role_title: string;
  domain: string;
  capability_percentage: number;
  readiness_verdict: string;
  can_apply_verdict: boolean;
  total_skills_count: number;
  skills_tested_count: number;
  skills_breakdown: SkillAssessmentStatus[];
  strengths: string[];
  critical_gaps: string[];
  recommended_next_steps: string[];
  sample_practice_question_ids: string[];
}

export interface RoleTaxonomySkill {
  skill_name: string;
  description: string;
  question_ids: string[];
  questions?: Question[];
  question_count: number;
}

export interface RoleTaxonomyItem {
  role_title: string;
  domain: string;
  description: string;
  icon: string;
  skills: RoleTaxonomySkill[];
}
