import re
import io
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import PyPDF2
from llm_client import llm_client
from models import ResumeAnalyzeResponse, MatchedJobRole, QuestionDTO
from blueprints import get_question_by_id, get_all_questions

SYSTEM_PROMPT = """You are an expert Technical Talent Partner & Engineering Bar Raiser.
Analyze a candidate's resume text to extract skills, seniority level, and match them with target job roles.

You MUST return ONLY a valid JSON object matching:
{
  "candidate_name": "<Name if found, else Candidate>",
  "experience_level": "<Junior | Mid-Level | Senior | Staff / Lead>",
  "executive_summary": "<2-sentence technical summary>",
  "detected_skills": {
    "languages": ["Python", "SQL", ...],
    "frameworks_and_libraries": ["FastAPI", "PyTorch", ...],
    "databases_and_infrastructure": ["PostgreSQL", "Docker", ...],
    "core_concepts": ["Distributed Systems", "Object-Oriented Design", ...]
  },
  "matched_roles": [
    {
      "role_title": "Machine Learning Engineer",
      "domain": "ml",
      "fit_percentage": 92.0,
      "fit_summary": "<1-2 sentence match rationale>",
      "matching_skills": ["PyTorch", "Model Evaluation"],
      "skill_gaps": ["Loss curve debugging under class imbalance"],
      "recommended_question_ids": ["ml-01", "ml-02"]
    }
  ]
}

TARGET ROLES TO EVALUATE:
1. "Machine Learning Engineer" (domain: "ml") - recommended Qs: ml-01, ml-02, ml-03
2. "Senior Python Backend Developer" (domain: "python") - recommended Qs: py-01, py-02
3. "Database Administrator / Data Architect" (domain: "dbms") - recommended Qs: db-01, db-02
4. "Software Engineer (Behavioral & Leadership)" (domain: "hr") - recommended Qs: hr-01

Sort matched_roles by fit_percentage descending.
CRITICAL: Respond with RAW JSON only. No markdown fences, backticks, or conversational text."""

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract plain text from uploaded PDF file using PyPDF2."""
    text_content = []
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text_content.append(extracted)
    except Exception as e:
        print(f"[ResumeAnalyzer] PDF parse warning: {e}")
    return "\n".join(text_content).strip()

def _offline_fallback_resume_analyzer(resume_text: str) -> Dict[str, Any]:
    """
    Intelligent keyword-driven taxonomy matcher when offline or without API keys.
    """
    text_lower = resume_text.lower()
    
    # 1. Detect candidate name heuristics
    first_lines = [l.strip() for l in resume_text.split("\n") if l.strip()][:3]
    candidate_name = "Candidate"
    for line in first_lines:
        if len(line.split()) in [2, 3] and not any(c in line.lower() for c in ["resume", "curriculum", "email", "phone", "http", "@"]):
            candidate_name = line.title()
            break

    # 2. Inferred Experience Level
    seniority = "Mid-Level"
    if any(term in text_lower for term in ["staff engineer", "principal", "head of", "director", "architect"]):
        seniority = "Staff / Lead"
    elif any(term in text_lower for term in ["senior", "lead engineer", "5+ years", "6+ years", "7+ years", "8+ years"]):
        seniority = "Senior"
    elif any(term in text_lower for term in ["intern", "graduate", "junior", "student", "entry level", "associate"]):
        seniority = "Junior"

    # 3. Detect Skills
    skill_taxonomies = {
        "languages": ["python", "sql", "java", "c++", "c#", "go", "golang", "javascript", "typescript", "rust", "bash"],
        "frameworks_and_libraries": ["pytorch", "tensorflow", "keras", "scikit-learn", "fastapi", "django", "flask", "react", "pandas", "numpy", "transformers", "xgboost"],
        "databases_and_infrastructure": ["postgresql", "mysql", "redis", "mongodb", "docker", "kubernetes", "aws", "gcp", "sqlite", "kafka", "elasticsearch", "clickhouse"],
        "core_concepts": ["machine learning", "deep learning", "microservices", "rest api", "system design", "acid", "ci/cd", "distributed systems", "oop", "rag"]
    }

    detected_skills = {}
    all_matched_tokens = set()

    for category, tokens in skill_taxonomies.items():
        found = []
        for token in tokens:
            if re.search(r'\b' + re.escape(token) + r'\b', text_lower):
                found.append(token.title() if len(token) > 3 else token.upper())
                all_matched_tokens.add(token)
        detected_skills[category] = found

    # 4. Score Roles
    ml_keywords = ["pytorch", "tensorflow", "keras", "scikit-learn", "machine learning", "deep learning", "nlp", "transformers", "overfitting", "neural networks", "pandas", "numpy", "xgboost", "model", "training"]
    py_keywords = ["python", "fastapi", "django", "flask", "async", "multiprocessing", "pytest", "generators", "decorators", "celery", "redis", "backend", "api"]
    db_keywords = ["sql", "postgresql", "mysql", "acid", "indexing", "b-tree", "database", "transactions", "replication", "sharding", "data warehouse", "schema", "query optimization"]
    hr_keywords = ["led", "mentored", "collaborated", "architected", "agile", "scrum", "stakeholders", "ownership", "delivered", "cross-functional"]

    def calculate_domain_fit(keywords: List[str]) -> float:
        hits = sum(1 for kw in keywords if kw in text_lower)
        ratio = hits / max(3, len(keywords) * 0.4)
        return min(96.0, max(25.0, round(35.0 + (ratio * 60.0), 1)))

    ml_fit = calculate_domain_fit(ml_keywords)
    py_fit = calculate_domain_fit(py_keywords)
    db_fit = calculate_domain_fit(db_keywords)
    hr_fit = min(90.0, max(50.0, calculate_domain_fit(hr_keywords)))

    roles = [
        {
            "role_title": "Machine Learning Engineer",
            "domain": "ml",
            "fit_percentage": ml_fit,
            "fit_summary": "Strong alignment with predictive modeling and machine learning workflows." if ml_fit > 70 else "Foundational alignment with data and numerical computation.",
            "matching_skills": [s for s in detected_skills.get("frameworks_and_libraries", []) if s.lower() in ml_keywords] or ["Python", "Model Development"],
            "skill_gaps": ["Loss divergence debugging", "Imbalanced metric evaluation", "Regularization tuning"],
            "recommended_question_ids": ["ml-01", "ml-02"]
        },
        {
            "role_title": "Senior Python Backend Developer",
            "domain": "python",
            "fit_percentage": py_fit,
            "fit_summary": "Extensive experience with Python runtime, asynchronous APIs, and backend services." if py_fit > 70 else "Competent Python syntax and scripting capabilities.",
            "matching_skills": [s for s in detected_skills.get("languages", []) if s.lower() == "python"] + [s for s in detected_skills.get("frameworks_and_libraries", []) if s.lower() in py_keywords],
            "skill_gaps": ["CPython cyclic garbage collector internals", "O(1) generator streaming pipelines"],
            "recommended_question_ids": ["py-01", "py-02"]
        },
        {
            "role_title": "Database Administrator / Data Architect",
            "domain": "dbms",
            "fit_percentage": db_fit,
            "fit_summary": "Demonstrated background in relational schemas, persistent data integrity, and transactional modeling." if db_fit > 70 else "Familiarity with standard SQL query operations.",
            "matching_skills": [s for s in detected_skills.get("databases_and_infrastructure", []) if s.lower() in db_keywords] or ["SQL", "Relational Databases"],
            "skill_gaps": ["B+Tree leaf sequential linking", "Isolation level anomalies (phantom reads)"],
            "recommended_question_ids": ["db-01", "db-02"]
        },
        {
            "role_title": "Software Engineer (Behavioral & Leadership)",
            "domain": "hr",
            "fit_percentage": hr_fit,
            "fit_summary": "Demonstrated collaborative problem solving, agile execution, and engineering delivery.",
            "matching_skills": ["Technical Communication", "Cross-Functional Collaboration", "Conflict Resolution"],
            "skill_gaps": ["STAR framework structuring with measurable business KPIs"],
            "recommended_question_ids": ["hr-01"]
        }
    ]

    roles.sort(key=lambda r: r["fit_percentage"], reverse=True)

    summary = (
        f"{seniority} technical professional displaying strong competency in {', '.join(list(all_matched_tokens)[:4]) or 'software engineering'}. "
        f"Primary compatibility aligns strongly with {roles[0]['role_title']} ({roles[0]['fit_percentage']}% fit)."
    )

    return {
        "candidate_name": candidate_name,
        "experience_level": seniority,
        "executive_summary": summary,
        "detected_skills": detected_skills,
        "matched_roles": roles
    }

def analyze_candidate_resume(resume_text: str, db: Session) -> ResumeAnalyzeResponse:
    """
    Parse resume text using LLM (or heuristic fallback) and map matched roles
    to actual blueprint questions in the SQLite database.
    """
    cleaned_text = resume_text.strip()
    if not cleaned_text:
        cleaned_text = "Experienced Software Engineer with Python and SQL background."

    def fallback():
        return _offline_fallback_resume_analyzer(cleaned_text)

    user_prompt = f"""Analyze this candidate resume:
---
{cleaned_text[:4000]}
---

Extract seniority, categorize detected skills, score target role fits, and provide recommended question blueprints."""

    try:
        parsed_json = llm_client.call_llm_json(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            fallback_fn=fallback
        )
    except Exception as e:
        print(f"[ResumeAnalyzer] LLM call failed: {e}. Utilizing fallback.")
        parsed_json = fallback()

    candidate_name = parsed_json.get("candidate_name") or "Candidate"
    experience_level = parsed_json.get("experience_level") or "Mid-Level"
    executive_summary = parsed_json.get("executive_summary") or fallback()["executive_summary"]
    detected_skills = parsed_json.get("detected_skills") or fallback()["detected_skills"]
    matched_roles_raw = parsed_json.get("matched_roles") or fallback()["matched_roles"]

    matched_roles = []
    recommended_q_ids = set()

    for r in matched_roles_raw:
        if isinstance(r, dict):
            q_ids = r.get("recommended_question_ids", [])
            for qid in q_ids:
                recommended_q_ids.add(qid)

            matched_roles.append(
                MatchedJobRole(
                    role_title=r.get("role_title", "Software Engineer"),
                    domain=r.get("domain", "ml"),
                    fit_percentage=float(r.get("fit_percentage", 75.0)),
                    fit_summary=r.get("fit_summary", "Role match based on skill alignment."),
                    matching_skills=r.get("matching_skills", []),
                    skill_gaps=r.get("skill_gaps", []),
                    recommended_question_ids=q_ids
                )
            )

    # Sort matched roles by fit percentage descending
    matched_roles.sort(key=lambda x: x.fit_percentage, reverse=True)

    # Fetch QuestionDTO objects for the recommended question IDs from database
    recommended_questions = []
    for qid in recommended_q_ids:
        q_dto = get_question_by_id(db, qid)
        if q_dto:
            recommended_questions.append(q_dto)

    if not recommended_questions:
        all_qs = get_all_questions(db)
        recommended_questions = all_qs[:3]

    return ResumeAnalyzeResponse(
        candidate_name=candidate_name,
        experience_level=experience_level,
        executive_summary=executive_summary,
        detected_skills=detected_skills,
        matched_roles=matched_roles,
        recommended_questions=recommended_questions
    )
