import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import Column, String, Text, Float, Boolean, DateTime, JSON
from pydantic import BaseModel, Field
from database import Base

# ==========================================
# SQLAlchemy ORM Models
# ==========================================

class QuestionModel(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    domain = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False)
    skill = Column(String, nullable=True, index=True)
    difficulty = Column(String, nullable=True, default="Mid")
    expected_concepts = Column(JSON, nullable=False)
    optional_concepts = Column(JSON, nullable=True, default=list)
    common_misconceptions = Column(JSON, nullable=True, default=list)
    rubric_weights = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class EvaluationModel(Base):
    __tablename__ = "evaluations"

    id = Column(String, primary_key=True, index=True)
    question_id = Column(String, index=True, nullable=False)
    candidate_answer = Column(Text, nullable=False)
    relevance = Column(Float, nullable=False)
    completeness = Column(Float, nullable=False)
    technical = Column(Float, nullable=False)
    communication = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    covered_concepts = Column(JSON, nullable=False, default=list)
    missing_concepts = Column(JSON, nullable=False, default=list)
    misconceptions_detected = Column(JSON, nullable=False, default=list)
    strengths = Column(JSON, nullable=False, default=list)
    improvements = Column(JSON, nullable=False, default=list)
    concept_evidence = Column(JSON, nullable=False, default=list)
    retrieved_chunks = Column(JSON, nullable=True, default=list)
    insufficient_reference = Column(Boolean, default=False)
    latency_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))


# ==========================================
# Pydantic Schemas
# ==========================================

class RubricWeights(BaseModel):
    relevance: float = 0.25
    completeness: float = 0.25
    technical: float = 0.30
    communication: float = 0.20

class QuestionDTO(BaseModel):
    question_id: str
    question_text: str
    domain: str
    role: str
    skill: Optional[str] = "General Technical"
    difficulty: Optional[str] = "Mid"
    expected_concepts: List[str]
    optional_concepts: List[str] = []
    common_misconceptions: List[str] = []
    rubric_weights: RubricWeights

class ConceptEvidence(BaseModel):
    concept: str
    status: str  # "matched" | "partially_matched" | "missing"
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    evidence: str = ""
    reasoning: Optional[str] = ""

class RetrievedChunk(BaseModel):
    chunk_id: str
    text: str
    source: str
    similarity_score: float

class EvaluationRequest(BaseModel):
    question_id: str
    candidate_answer: str

class LLMEvaluationRaw(BaseModel):
    relevance: float = Field(..., ge=0.0, le=10.0)
    completeness: float = Field(..., ge=0.0, le=10.0)
    technical: float = Field(..., ge=0.0, le=10.0)
    communication: float = Field(..., ge=0.0, le=10.0)
    covered_concepts: List[str] = []
    missing_concepts: List[str] = []
    misconceptions_detected: List[str] = []
    strengths: List[str] = []
    improvements: List[str] = []
    insufficient_reference: bool = False

class EvaluationResponse(BaseModel):
    evaluation_id: str
    question_id: str
    question_text: str
    domain: str
    candidate_answer: str
    relevance: float
    completeness: float
    technical: float
    communication: float
    overall_score: float
    performance_tier: str
    covered_concepts: List[str]
    missing_concepts: List[str]
    misconceptions_detected: List[str]
    strengths: List[str]
    improvements: List[str]
    concept_evidence: List[ConceptEvidence]
    retrieved_chunks: List[RetrievedChunk] = []
    insufficient_reference: bool
    rubric_weights: RubricWeights
    latency_ms: float
    created_at: str

class HeatmapItem(BaseModel):
    concept: str
    domain: str
    total_evaluations: int
    matched_count: int
    partial_count: int
    missing_count: int
    coverage_rate: float
    gap_index: float  # Higher means bigger knowledge gap

# ==========================================
# Senior Polish & Skill Passport Schemas
# ==========================================

class KeyPhrasingUpgrade(BaseModel):
    junior_or_candidate_phrase: str
    senior_upgrade: str
    rationale: str

class SeniorPolishRequest(BaseModel):
    question_id: str
    candidate_answer: str

class SeniorPolishResponse(BaseModel):
    question_id: str
    question_text: str
    role: str
    domain: str
    senior_answer: str
    senior_highlights: List[str]  # e.g. Architectural trade-offs, edge cases, metrics
    key_phrasing_upgrades: List[KeyPhrasingUpgrade]
    production_considerations: List[str]

class Badge(BaseModel):
    id: str
    name: str
    category: str
    description: str
    icon: str
    unlocked: bool
    unlocked_at: Optional[str] = None
    progress: float = 1.0  # 0.0 to 1.0

class JobReadinessSummary(BaseModel):
    readiness_percentage: float  # 0 - 100
    target_role: str
    readiness_status: str  # e.g. "Ready for Onsite", "Ready for Technical Screen", "Foundation Building"
    total_evaluations: int
    technical_mastery: float
    completeness_mastery: float
    communication_mastery: float
    earned_badges_count: int
    total_badges_count: int
    badges: List[Badge]
    recommendation: str

# ==========================================
# Resume Analyzer Schemas
# ==========================================

class ResumeAnalyzeRequest(BaseModel):
    resume_text: str

class MatchedJobRole(BaseModel):
    role_title: str
    domain: str
    fit_percentage: float
    fit_summary: str
    matching_skills: List[str]
    skill_gaps: List[str]
    recommended_question_ids: List[str]

class ResumeAnalyzeResponse(BaseModel):
    candidate_name: Optional[str] = "Candidate"
    experience_level: str  # "Junior" | "Mid-Level" | "Senior" | "Staff / Lead"
    executive_summary: str
    detected_skills: Dict[str, List[str]]  # e.g. {"languages": [...], "frameworks": [...], "databases": [...]}
    matched_roles: List[MatchedJobRole]
    recommended_questions: List[QuestionDTO]

# ==========================================
# Role-Based Skills & Capability Schemas
# ==========================================

class SkillAssessmentStatus(BaseModel):
    skill_name: str
    description: str
    tested_questions_count: int
    average_score: float
    status: str  # "mastered" | "proficient" | "needs_practice" | "untested"
    recommended_question_ids: List[str] = []

class RoleCapabilitySummary(BaseModel):
    role_title: str
    domain: str
    capability_percentage: float  # 0 - 100
    readiness_verdict: str  # e.g. "Ready to Apply - Strong Hire", "Competitive with Minor Gaps", "Developing Competency", "Not Ready Yet"
    can_apply_verdict: bool
    total_skills_count: int
    skills_tested_count: int
    skills_breakdown: List[SkillAssessmentStatus]
    strengths: List[str]
    critical_gaps: List[str]
    recommended_next_steps: List[str]
    sample_practice_question_ids: List[str]

class RoleTaxonomyItem(BaseModel):
    role_title: str
    domain: str
    description: str
    icon: str
    skills: List[Dict[str, Any]]
