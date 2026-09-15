from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from models import EvaluationModel, RoleCapabilitySummary, SkillAssessmentStatus
from blueprints import ROLE_SKILL_TAXONOMY, get_question_by_id

def calculate_role_capability(db: Session, target_role_input: str) -> RoleCapabilitySummary:
    """
    Calculate candidate's capability percentage (0-100%) for applying to a specific role,
    evaluating proficiency across all required skills from past evaluation history.
    """
    target_role = target_role_input.strip()
    
    # 1. Match role in taxonomy
    matched_role_item = None
    for item in ROLE_SKILL_TAXONOMY:
        if target_role.lower() in item["role_title"].lower() or item["role_title"].lower() in target_role.lower():
            matched_role_item = item
            break
        if target_role.lower() == item["domain"].lower():
            matched_role_item = item
            break

    if not matched_role_item:
        # Default to first role if not found
        matched_role_item = ROLE_SKILL_TAXONOMY[0]

    role_title = matched_role_item["role_title"]
    domain = matched_role_item["domain"]
    skills_config = matched_role_item["skills"]
    total_skills_count = len(skills_config)

    # 2. Query all past evaluations from DB
    past_evaluations = db.query(EvaluationModel).order_by(EvaluationModel.created_at.desc()).all()
    # Map question_id -> list of evaluation overall_scores
    q_scores: Dict[str, List[float]] = {}
    for ev in past_evaluations:
        if ev.question_id not in q_scores:
            q_scores[ev.question_id] = []
        q_scores[ev.question_id].append(ev.overall_score)

    skills_breakdown: List[SkillAssessmentStatus] = []
    skills_tested_count = 0
    skill_scores_sum = 0.0
    strengths: List[str] = []
    critical_gaps: List[str] = []
    sample_practice_qids: List[str] = []

    for s in skills_config:
        skill_name = s["skill_name"]
        desc = s["description"]
        q_ids = s.get("question_ids", [])

        # Gather scores for this skill
        collected_scores = []
        for qid in q_ids:
            if qid in q_scores:
                # take the best score or average of attempts
                collected_scores.extend(q_scores[qid])

        if collected_scores:
            avg_score = round(sum(collected_scores) / len(collected_scores), 1)
            skills_tested_count += 1
            skill_scores_sum += avg_score

            if avg_score >= 80.0:
                status = "mastered"
                strengths.append(f"Mastered: {skill_name} ({avg_score}%)")
            elif avg_score >= 60.0:
                status = "proficient"
                strengths.append(f"Proficient: {skill_name} ({avg_score}%)")
            else:
                status = "needs_practice"
                critical_gaps.append(f"Low Proficiency: {skill_name} ({avg_score}%) - requires revision")
                sample_practice_qids.extend(q_ids)
        else:
            avg_score = 0.0
            status = "untested"
            critical_gaps.append(f"Untested Skill: {skill_name}")
            sample_practice_qids.extend(q_ids)

        skills_breakdown.append(
            SkillAssessmentStatus(
                skill_name=skill_name,
                description=desc,
                tested_questions_count=len(collected_scores),
                average_score=avg_score,
                status=status,
                recommended_question_ids=q_ids
            )
        )

    # 3. Calculate Overall Capability Percentage
    if total_skills_count == 0:
        capability_percentage = 0.0
    elif skills_tested_count == 0:
        capability_percentage = 0.0
    else:
        # Base average over all skills (untested skills contribute 0)
        raw_skill_avg = skill_scores_sum / total_skills_count
        # Coverage multiplier: rewarding testing more skills in the role
        coverage_factor = 0.6 + (0.4 * (skills_tested_count / total_skills_count))
        capability_percentage = round(min(100.0, raw_skill_avg * coverage_factor), 1)

    # 4. Formulate Application Readiness Verdict
    if capability_percentage >= 82.0 and skills_tested_count == total_skills_count:
        verdict = "Ready to Apply - Strong Hire Benchmark"
        can_apply = True
    elif capability_percentage >= 68.0:
        verdict = "Competitive Applicant - Minor Polish Recommended"
        can_apply = True
    elif capability_percentage >= 50.0:
        verdict = "Developing Competency - Practice Key Missing Skills First"
        can_apply = False
    elif skills_tested_count > 0:
        verdict = "Emerging Foundations - Additional Role Practice Required"
        can_apply = False
    else:
        verdict = "Not Yet Assessed - Take Sample Practice Questions to Benchmark"
        can_apply = False

    # 5. Formulate Next Steps
    next_steps = []
    untested_skills = [s.skill_name for s in skills_breakdown if s.status == "untested"]
    needs_work_skills = [s.skill_name for s in skills_breakdown if s.status == "needs_practice"]

    if untested_skills:
        next_steps.append(f"Complete practice questions for {len(untested_skills)} unassessed skill(s): {', '.join(untested_skills[:2])}.")
    if needs_work_skills:
        next_steps.append(f"Improve scores on: {', '.join(needs_work_skills[:2])} by reviewing Senior Answer Polisher trade-offs.")
    if can_apply:
        next_steps.append("Your technical benchmark meets hiring thresholds for this role. You are ready to submit job applications!")
    else:
        next_steps.append(f"Target reaching at least 70% capability across all {total_skills_count} skills before formal technical screens.")

    # Deduplicate sample questions
    sample_practice_qids = list(dict.fromkeys(sample_practice_qids))
    if not sample_practice_qids and skills_config:
        sample_practice_qids = skills_config[0].get("question_ids", [])

    return RoleCapabilitySummary(
        role_title=role_title,
        domain=domain,
        capability_percentage=capability_percentage,
        readiness_verdict=verdict,
        can_apply_verdict=can_apply,
        total_skills_count=total_skills_count,
        skills_tested_count=skills_tested_count,
        skills_breakdown=skills_breakdown,
        strengths=strengths if strengths else ["No skills benchmarked yet."],
        critical_gaps=critical_gaps if critical_gaps else ["None detected - all core skills proficient."],
        recommended_next_steps=next_steps,
        sample_practice_question_ids=sample_practice_qids[:4]
    )
