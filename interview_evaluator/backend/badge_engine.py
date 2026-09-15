from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from models import EvaluationModel, QuestionModel, Badge, JobReadinessSummary

ALL_BADGE_DEFINITIONS = [
    {
        "id": "quick_warmup",
        "name": "Quick Warmup Champion",
        "category": "Practice",
        "description": "Completed your first interview evaluation.",
        "icon": "⚡"
    },
    {
        "id": "assessment_veteran",
        "name": "Assessment Veteran",
        "category": "Practice",
        "description": "Completed 3 or more full technical evaluations.",
        "icon": "🏆"
    },
    {
        "id": "grounding_guardian",
        "name": "Grounding Guardian",
        "category": "Accuracy",
        "description": "Submitted an answer with verified reference grounding and zero misconceptions.",
        "icon": "🛡️"
    },
    {
        "id": "concept_master",
        "name": "Concept Master",
        "category": "Breadth",
        "description": "Achieved 100% expected concept match in a single evaluation.",
        "icon": "🎯"
    },
    {
        "id": "deep_technologist",
        "name": "Deep Technologist",
        "category": "Technical",
        "description": "Awarded a technical depth score of 9.0 or higher.",
        "icon": "🧠"
    },
    {
        "id": "clean_communicator",
        "name": "Clean Communicator",
        "category": "Communication",
        "description": "Demonstrated concise, professional articulation with communication score >= 8.5.",
        "icon": "💎"
    },
    {
        "id": "ml_specialist",
        "name": "ML Specialist",
        "category": "Domain",
        "description": "Scored 80%+ on Machine Learning domain questions.",
        "icon": "🤖"
    },
    {
        "id": "python_guru",
        "name": "Python Guru",
        "category": "Domain",
        "description": "Scored 80%+ on Python & systems architecture questions.",
        "icon": "🐍"
    },
    {
        "id": "dbms_architect",
        "name": "Database Architect",
        "category": "Domain",
        "description": "Scored 80%+ on ACID, concurrency, and database indexing questions.",
        "icon": "💾"
    },
    {
        "id": "star_diplomat",
        "name": "STAR Diplomat",
        "category": "Domain",
        "description": "Scored 80%+ applying the STAR framework on behavioral challenges.",
        "icon": "🤝"
    }
]

def calculate_job_readiness(db: Session, target_domain: Optional[str] = None) -> JobReadinessSummary:
    """
    Computes candidate's cumulative Job Readiness Indicator and unlocked Skill Badges
    based on all evaluations in the database.
    """
    evaluations = db.query(EvaluationModel).all()
    questions = {q.id: q for q in db.query(QuestionModel).all()}

    total_evals = len(evaluations)
    
    if total_evals == 0:
        # Default starter state
        badges = [
            Badge(
                id=b["id"],
                name=b["name"],
                category=b["category"],
                description=b["description"],
                icon=b["icon"],
                unlocked=False,
                progress=0.0
            )
            for b in ALL_BADGE_DEFINITIONS
        ]
        return JobReadinessSummary(
            readiness_percentage=0.0,
            target_role="Software Engineer",
            readiness_status="Foundation Building",
            total_evaluations=0,
            technical_mastery=0.0,
            completeness_mastery=0.0,
            communication_mastery=0.0,
            earned_badges_count=0,
            total_badges_count=len(ALL_BADGE_DEFINITIONS),
            badges=badges,
            recommendation="Complete your first practice evaluation to benchmark your readiness!"
        )

    # Compute aggregate metrics
    avg_tech = sum(e.technical for e in evaluations) / total_evals
    avg_comp = sum(e.completeness for e in evaluations) / total_evals
    avg_comm = sum(e.communication for e in evaluations) / total_evals
    avg_overall = sum(e.overall_score for e in evaluations) / total_evals

    # Determine domain breakdown
    domain_scores: Dict[str, List[float]] = {}
    for e in evaluations:
        q = questions.get(e.question_id)
        d = q.domain if q else "general"
        domain_scores.setdefault(d, []).append(e.overall_score)

    # Most practiced role/domain
    top_domain = max(domain_scores.keys(), key=lambda k: len(domain_scores[k])) if domain_scores else "ml"
    role_map = {
        "ml": "Machine Learning Engineer",
        "python": "Senior Python Backend Developer",
        "dbms": "Database Administrator / Data Architect",
        "hr": "Software Engineering Candidate (Behavioral)"
    }
    target_role = role_map.get(top_domain, "Full-Stack Software Engineer")

    # Evaluate Badges
    unlocked_badges = []
    
    for b in ALL_BADGE_DEFINITIONS:
        bid = b["id"]
        unlocked = False
        progress = 0.0

        if bid == "quick_warmup":
            unlocked = total_evals >= 1
            progress = min(1.0, total_evals / 1.0)
        elif bid == "assessment_veteran":
            unlocked = total_evals >= 3
            progress = min(1.0, total_evals / 3.0)
        elif bid == "grounding_guardian":
            unlocked = any(not e.insufficient_reference and len(e.misconceptions_detected or []) == 0 for e in evaluations)
            progress = 1.0 if unlocked else 0.5
        elif bid == "concept_master":
            unlocked = any(len(e.missing_concepts or []) == 0 and len(e.covered_concepts or []) >= 3 for e in evaluations)
            progress = 1.0 if unlocked else 0.6
        elif bid == "deep_technologist":
            unlocked = any(e.technical >= 9.0 for e in evaluations)
            progress = min(1.0, max((e.technical / 9.0 for e in evaluations), default=0.0))
        elif bid == "clean_communicator":
            unlocked = any(e.communication >= 8.5 for e in evaluations)
            progress = min(1.0, max((e.communication / 8.5 for e in evaluations), default=0.0))
        elif bid == "ml_specialist":
            ml_scores = domain_scores.get("ml", [])
            unlocked = any(s >= 80.0 for s in ml_scores)
            progress = min(1.0, max((s / 80.0 for s in ml_scores), default=0.0))
        elif bid == "python_guru":
            py_scores = domain_scores.get("python", [])
            unlocked = any(s >= 80.0 for s in py_scores)
            progress = min(1.0, max((s / 80.0 for s in py_scores), default=0.0))
        elif bid == "dbms_architect":
            db_scores = domain_scores.get("dbms", [])
            unlocked = any(s >= 80.0 for s in db_scores)
            progress = min(1.0, max((s / 80.0 for s in db_scores), default=0.0))
        elif bid == "star_diplomat":
            hr_scores = domain_scores.get("hr", [])
            unlocked = any(s >= 80.0 for s in hr_scores)
            progress = min(1.0, max((s / 80.0 for s in hr_scores), default=0.0))

        unlocked_badges.append(
            Badge(
                id=bid,
                name=b["name"],
                category=b["category"],
                description=b["description"],
                icon=b["icon"],
                unlocked=unlocked,
                progress=round(progress, 2),
                unlocked_at="Unlocked" if unlocked else None
            )
        )

    # Job Readiness Index Formula
    # 50% average score + 30% technical mastery + 20% badge progression bonus
    earned_count = sum(1 for b in unlocked_badges if b.unlocked)
    badge_ratio = (earned_count / len(ALL_BADGE_DEFINITIONS)) * 100.0

    readiness = (avg_overall * 0.55) + (avg_tech * 10.0 * 0.30) + (badge_ratio * 0.15)
    readiness = max(10.0, min(99.0, round(readiness, 1)))

    if readiness >= 85.0:
        status = "Ready for Onsite"
        rec = f"Outstanding command of core principles. High probability of clearing senior technical bars for {target_role}."
    elif readiness >= 70.0:
        status = "Ready for Technical Screen"
        rec = f"Strong fundamentals demonstrated. Review nuanced edge cases and system trade-offs to reach staff level."
    else:
        status = "Foundation Building"
        rec = f"Continue targeted practice on omitted concepts and grounding accuracy to boost your interview readiness."

    return JobReadinessSummary(
        readiness_percentage=readiness,
        target_role=target_role,
        readiness_status=status,
        total_evaluations=total_evals,
        technical_mastery=round(avg_tech * 10.0, 1),
        completeness_mastery=round(avg_comp * 10.0, 1),
        communication_mastery=round(avg_comm * 10.0, 1),
        earned_badges_count=earned_count,
        total_badges_count=len(ALL_BADGE_DEFINITIONS),
        badges=unlocked_badges,
        recommendation=rec
    )
