import os
import time
import uuid
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import (
    QuestionModel, EvaluationModel, QuestionDTO,
    EvaluationRequest, EvaluationResponse, ConceptEvidence,
    RetrievedChunk, RubricWeights, HeatmapItem,
    SeniorPolishRequest, SeniorPolishResponse, JobReadinessSummary,
    ResumeAnalyzeRequest, ResumeAnalyzeResponse,
    RoleCapabilitySummary, RoleTaxonomyItem
)
from blueprints import (
    init_db, get_all_questions, get_question_by_id,
    get_roles_taxonomy, get_random_question
)
from kb_loader import load_all_domains, get_chroma_client
from retriever import retrieve_context
from concept_extractor import extract_concepts
from evaluator import evaluate_answer
from scoring import calculate_weighted_score
from llm_client import llm_client
from senior_polisher import generate_senior_polish
from badge_engine import calculate_job_readiness
from resume_analyzer import analyze_candidate_resume, extract_text_from_pdf
from capability_analyzer import calculate_role_capability

# Initialize FastAPI App
app = FastAPI(
    title="AI-Powered Interview Answer Evaluation API",
    description="RAG-grounded, explainable interview answer evaluation engine with concept evidence and rubric scoring.",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    print("[Startup] Initializing SQLite database schema and seed questions...")
    init_db()
    print("[Startup] Indexing knowledge base into ChromaDB collections...")
    try:
        load_all_domains(force_reload=False)
    except Exception as e:
        print(f"[Startup] Warning during KB indexing: {e}")
    print("[Startup] Ready to accept requests.")

# ==========================================
# Health Check Endpoint
# ==========================================

@app.get("/health")
@app.get("/api/health")
def health_check():
    chroma_ok = False
    try:
        client = get_chroma_client()
        collections = client.list_collections()
        chroma_ok = True
        col_names = [c.name for c in collections]
    except Exception as e:
        col_names = [str(e)]

    return {
        "status": "healthy",
        "llm_mode": "openai_live" if llm_client.is_live else "local_fallback",
        "llm_model": llm_client.model,
        "chroma_connected": chroma_ok,
        "chroma_collections": col_names
    }

# ==========================================
# Questions Endpoints
# ==========================================

@app.get("/questions", response_model=List[QuestionDTO])
@app.get("/api/questions", response_model=List[QuestionDTO])
def list_questions(domain: Optional[str] = Query(None, description="Filter by domain e.g. ml, python, dbms, hr"), db: Session = Depends(get_db)):
    """List all available interview questions, optionally filtered by domain."""
    return get_all_questions(db, domain=domain)

@app.get("/questions/random", response_model=QuestionDTO)
@app.get("/api/questions/random", response_model=QuestionDTO)
def get_random_question_endpoint(
    domain: Optional[str] = Query(None, description="Optional domain filter"),
    role: Optional[str] = Query(None, description="Optional role filter"),
    skill: Optional[str] = Query(None, description="Optional skill filter"),
    db: Session = Depends(get_db)
):
    """Retrieve a random question matching the optional criteria."""
    q = get_random_question(db, domain=domain, role=role, skill=skill)
    if not q:
        raise HTTPException(status_code=404, detail="No matching question found.")
    return q

@app.get("/roles", response_model=List[RoleTaxonomyItem])
@app.get("/api/roles", response_model=List[RoleTaxonomyItem])
def list_roles_taxonomy(db: Session = Depends(get_db)):
    """Retrieve the complete Role -> Skills -> Questions taxonomy."""
    return get_roles_taxonomy(db)

@app.get("/role-capability/{role}", response_model=RoleCapabilitySummary)
@app.get("/api/role-capability/{role}", response_model=RoleCapabilitySummary)
def evaluate_role_capability(role: str, db: Session = Depends(get_db)):
    """Calculate the candidate's capability percentage and readiness for applying to a target role."""
    return calculate_role_capability(db, role)

@app.get("/questions/{question_id}", response_model=QuestionDTO)
@app.get("/api/questions/{question_id}", response_model=QuestionDTO)
def get_question(question_id: str, db: Session = Depends(get_db)):
    """Get single question specification and blueprint."""
    q = get_question_by_id(db, question_id)
    if not q:
        raise HTTPException(status_code=404, detail=f"Question '{question_id}' not found")
    return q

# ==========================================
# Evaluation Pipeline Endpoint
# ==========================================

@app.post("/evaluate", response_model=EvaluationResponse)
@app.post("/api/evaluate", response_model=EvaluationResponse)
def evaluate_candidate_answer(payload: EvaluationRequest, db: Session = Depends(get_db)):
    """
    Execute full RAG-grounded interview evaluation pipeline:
    1. Retrieval Layer (ChromaDB top-k + cosine similarity)
    2. Concept Extraction (LLM + verbatim candidate evidence)
    3. Structured Evaluation (relevance, completeness, technical, communication)
    4. Scoring Engine (rubric weighting + grounding caps)
    5. Persistence & Report Generation
    """
    start_time = time.perf_counter()

    # 1. Fetch Question Blueprint
    q = get_question_by_id(db, payload.question_id)
    if not q:
        raise HTTPException(status_code=404, detail=f"Question '{payload.question_id}' not found")

    candidate_answer = payload.candidate_answer.strip()
    if not candidate_answer:
        raise HTTPException(status_code=400, detail="Candidate answer cannot be empty")

    # 2. Retrieval Layer: Query domain Chroma collection
    query_text = f"{q.question_text} {candidate_answer[:250]}"
    retrieval_data = retrieve_context(
        domain=q.domain,
        query=query_text,
        top_k=4
    )
    retrieved_chunks = retrieval_data["chunks"]
    insufficient_ref = retrieval_data["insufficient_reference"]

    # 3. Concept Extraction Layer
    concept_evidence_raw = extract_concepts(
        candidate_answer=candidate_answer,
        expected_concepts=q.expected_concepts,
        retrieved_chunks=retrieved_chunks
    )

    # 4. Structured Dimension Evaluation
    eval_raw = evaluate_answer(
        question_text=q.question_text,
        candidate_answer=candidate_answer,
        expected_concepts=q.expected_concepts,
        common_misconceptions=q.common_misconceptions,
        concept_evidence=concept_evidence_raw,
        retrieved_chunks=retrieved_chunks,
        insufficient_reference=insufficient_ref
    )

    # 5. Scoring Engine
    weights_dict = q.rubric_weights.model_dump()
    effective_tech, overall_score, tier = calculate_weighted_score(
        relevance=eval_raw["relevance"],
        completeness=eval_raw["completeness"],
        technical=eval_raw["technical"],
        communication=eval_raw["communication"],
        rubric_weights=weights_dict,
        insufficient_reference=eval_raw.get("insufficient_reference", insufficient_ref)
    )

    latency_ms = round((time.perf_counter() - start_time) * 1000.0, 1)
    eval_id = str(uuid.uuid4())

    # 6. Persist to SQLite
    eval_record = EvaluationModel(
        id=eval_id,
        question_id=q.question_id,
        candidate_answer=candidate_answer,
        relevance=eval_raw["relevance"],
        completeness=eval_raw["completeness"],
        technical=effective_tech,
        communication=eval_raw["communication"],
        overall_score=overall_score,
        covered_concepts=eval_raw.get("covered_concepts", []),
        missing_concepts=eval_raw.get("missing_concepts", []),
        misconceptions_detected=eval_raw.get("misconceptions_detected", []),
        strengths=eval_raw.get("strengths", []),
        improvements=eval_raw.get("improvements", []),
        concept_evidence=concept_evidence_raw,
        retrieved_chunks=retrieved_chunks,
        insufficient_reference=eval_raw.get("insufficient_reference", insufficient_ref),
        latency_ms=latency_ms
    )
    db.add(eval_record)
    db.commit()

    # 7. Construct Response
    return EvaluationResponse(
        evaluation_id=eval_id,
        question_id=q.question_id,
        question_text=q.question_text,
        domain=q.domain,
        candidate_answer=candidate_answer,
        relevance=eval_raw["relevance"],
        completeness=eval_raw["completeness"],
        technical=effective_tech,
        communication=eval_raw["communication"],
        overall_score=overall_score,
        performance_tier=tier,
        covered_concepts=eval_raw.get("covered_concepts", []),
        missing_concepts=eval_raw.get("missing_concepts", []),
        misconceptions_detected=eval_raw.get("misconceptions_detected", []),
        strengths=eval_raw.get("strengths", []),
        improvements=eval_raw.get("improvements", []),
        concept_evidence=[ConceptEvidence(**c) for c in concept_evidence_raw],
        retrieved_chunks=[RetrievedChunk(**rc) for rc in retrieved_chunks],
        insufficient_reference=eval_raw.get("insufficient_reference", insufficient_ref),
        rubric_weights=q.rubric_weights,
        latency_ms=latency_ms,
        created_at=eval_record.created_at.isoformat()
    )

# ==========================================
# Report Endpoint
# ==========================================

@app.get("/report/{evaluation_id}", response_model=EvaluationResponse)
@app.get("/api/report/{evaluation_id}", response_model=EvaluationResponse)
def get_evaluation_report(evaluation_id: str, db: Session = Depends(get_db)):
    """Fetch past evaluation result by ID."""
    r = db.query(EvaluationModel).filter(EvaluationModel.id == evaluation_id).first()
    if not r:
        raise HTTPException(status_code=404, detail=f"Report '{evaluation_id}' not found")

    q = get_question_by_id(db, r.question_id)
    question_text = q.question_text if q else "Historical Question"
    domain = q.domain if q else "general"
    weights = q.rubric_weights if q else RubricWeights()
    _, _, tier = calculate_weighted_score(r.relevance, r.completeness, r.technical, r.communication, weights.model_dump())

    return EvaluationResponse(
        evaluation_id=r.id,
        question_id=r.question_id,
        question_text=question_text,
        domain=domain,
        candidate_answer=r.candidate_answer,
        relevance=r.relevance,
        completeness=r.completeness,
        technical=r.technical,
        communication=r.communication,
        overall_score=r.overall_score,
        performance_tier=tier,
        covered_concepts=r.covered_concepts or [],
        missing_concepts=r.missing_concepts or [],
        misconceptions_detected=r.misconceptions_detected or [],
        strengths=r.strengths or [],
        improvements=r.improvements or [],
        concept_evidence=[ConceptEvidence(**c) for c in (r.concept_evidence or [])],
        retrieved_chunks=[RetrievedChunk(**rc) for rc in (r.retrieved_chunks or [])],
        insufficient_reference=r.insufficient_reference or False,
        rubric_weights=weights,
        latency_ms=r.latency_ms or 0.0,
        created_at=r.created_at.isoformat() if r.created_at else ""
    )

# ==========================================
# Heatmap Endpoint
# ==========================================

@app.get("/heatmap", response_model=List[HeatmapItem])
@app.get("/api/heatmap", response_model=List[HeatmapItem])
def get_knowledge_gap_heatmap(db: Session = Depends(get_db)):
    """
    Aggregate concept coverage across all historical evaluations to visualize
    candidate knowledge gaps and mastery rates per technical concept.
    """
    evaluations = db.query(EvaluationModel).all()
    questions = {q.id: q for q in db.query(QuestionModel).all()}

    concept_stats = {}

    for ev in evaluations:
        q = questions.get(ev.question_id)
        domain = q.domain if q else "general"

        for item in (ev.concept_evidence or []):
            concept = item.get("concept", "")
            if not concept:
                continue

            status = item.get("status", "").lower()
            key = (domain, concept)
            if key not in concept_stats:
                concept_stats[key] = {
                    "domain": domain,
                    "concept": concept,
                    "total": 0,
                    "matched": 0,
                    "partial": 0,
                    "missing": 0
                }

            concept_stats[key]["total"] += 1
            if status == "matched":
                concept_stats[key]["matched"] += 1
            elif status == "partially_matched":
                concept_stats[key]["partial"] += 1
            else:
                concept_stats[key]["missing"] += 1

    results = []
    for (domain, concept), stats in concept_stats.items():
        total = stats["total"]
        # Coverage rate: (matched + 0.5 * partial) / total * 100
        coverage = ((stats["matched"] + 0.5 * stats["partial"]) / total) * 100.0 if total > 0 else 0.0
        gap_index = 100.0 - coverage
        results.append(HeatmapItem(
            concept=concept,
            domain=domain,
            total_evaluations=total,
            matched_count=stats["matched"],
            partial_count=stats["partial"],
            missing_count=stats["missing"],
            coverage_rate=round(coverage, 1),
            gap_index=round(gap_index, 1)
        ))

    # Sort by gap_index descending (biggest gaps first)
    results.sort(key=lambda x: x.gap_index, reverse=True)
    return results

# ==========================================
# Senior Polish Endpoint
# ==========================================

@app.post("/senior-polish", response_model=SeniorPolishResponse)
@app.post("/api/senior-polish", response_model=SeniorPolishResponse)
def senior_polish_answer(payload: SeniorPolishRequest, db: Session = Depends(get_db)):
    """
    Generate an expert/staff-level software engineer answer, trade-off highlights,
    and side-by-side phrasing upgrades for learning.
    """
    q = get_question_by_id(db, payload.question_id)
    if not q:
        raise HTTPException(status_code=404, detail=f"Question '{payload.question_id}' not found")

    retrieval_data = retrieve_context(domain=q.domain, query=q.question_text, top_k=3)
    chunks = retrieval_data.get("chunks", [])

    return generate_senior_polish(
        question_id=q.question_id,
        question_text=q.question_text,
        role=q.role,
        domain=q.domain,
        candidate_answer=payload.candidate_answer,
        expected_concepts=q.expected_concepts,
        retrieved_chunks=chunks
    )

# ==========================================
# Skill Passport & Job Readiness Endpoint
# ==========================================

@app.get("/passport", response_model=JobReadinessSummary)
@app.get("/api/passport", response_model=JobReadinessSummary)
def get_skill_passport(domain: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """
    Fetch candidate's cumulative Job Readiness Indicator, competency breakdown,
    and unlocked Skill Badges across all practice sessions.
    """
    return calculate_job_readiness(db, target_domain=domain)

# ==========================================
# Resume Analyzer Endpoints
# ==========================================

@app.post("/analyze-resume", response_model=ResumeAnalyzeResponse)
@app.post("/api/analyze-resume", response_model=ResumeAnalyzeResponse)
def analyze_resume_endpoint(payload: ResumeAnalyzeRequest, db: Session = Depends(get_db)):
    """
    Analyze candidate resume text, detect skills and seniority, match job roles with
    fit percentages, and recommend tailored interview question blueprints.
    """
    if not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty")
    return analyze_candidate_resume(payload.resume_text, db)

@app.post("/upload-resume", response_model=ResumeAnalyzeResponse)
@app.post("/api/upload-resume", response_model=ResumeAnalyzeResponse)
async def upload_resume_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a resume file (.pdf, .txt, .docx), extract text, and run job role matching.
    """
    file_bytes = await file.read()
    filename = file.filename.lower() if file.filename else "resume.txt"

    if filename.endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file_bytes)
    else:
        try:
            extracted_text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            extracted_text = file_bytes.decode("latin-1", errors="ignore")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract readable text from uploaded file")

    return analyze_candidate_resume(extracted_text, db)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
