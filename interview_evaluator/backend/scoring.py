from typing import Dict, List, Any, Tuple

def get_performance_tier(overall_score: float) -> str:
    """Return human-readable performance tier based on overall percentage."""
    if overall_score >= 90.0:
        return "Exceptional / Staff Level"
    elif overall_score >= 80.0:
        return "Strong Hire / Senior Level"
    elif overall_score >= 65.0:
        return "Competent / Mid Level"
    elif overall_score >= 50.0:
        return "Developing / Junior Level"
    else:
        return "Needs Significant Preparation"

def calculate_weighted_score(
    relevance: float,
    completeness: float,
    technical: float,
    communication: float,
    rubric_weights: Dict[str, float] = None,
    insufficient_reference: bool = False,
    technical_cap: float = 5.0
) -> Tuple[float, float, str]:
    """
    Pure function to calculate weighted overall score (0 - 100%).
    Ensures safe grounding capping if insufficient_reference is True.
    
    Returns:
        (effective_technical, overall_score_pct, performance_tier)
    """
    if rubric_weights is None:
        rubric_weights = {
            "relevance": 0.25,
            "completeness": 0.25,
            "technical": 0.30,
            "communication": 0.20
        }

    # Clamp raw inputs to [0, 10]
    rel = max(0.0, min(10.0, float(relevance)))
    comp = max(0.0, min(10.0, float(completeness)))
    tech = max(0.0, min(10.0, float(technical)))
    comm = max(0.0, min(10.0, float(communication)))

    # Grounding Safety Guard: If reference is insufficient, cap technical score
    effective_tech = tech
    if insufficient_reference and tech > technical_cap:
        effective_tech = technical_cap

    # Normalize weights to sum to 1.0 just in case
    w_rel = rubric_weights.get("relevance", 0.25)
    w_comp = rubric_weights.get("completeness", 0.25)
    w_tech = rubric_weights.get("technical", 0.30)
    w_comm = rubric_weights.get("communication", 0.20)
    total_w = w_rel + w_comp + w_tech + w_comm
    if total_w <= 0:
        total_w = 1.0
    w_rel /= total_w
    w_comp /= total_w
    w_tech /= total_w
    w_comm /= total_w

    raw_weighted = (
        rel * w_rel +
        comp * w_comp +
        effective_tech * w_tech +
        comm * w_comm
    )

    # Convert 0-10 scale to 0-100%
    overall_pct = round(raw_weighted * 10.0, 1)
    overall_pct = max(0.0, min(100.0, overall_pct))
    tier = get_performance_tier(overall_pct)

    return effective_tech, overall_pct, tier

def calculate_concept_coverage(concept_evidence: List[Dict[str, Any]]) -> float:
    """
    Compute concept coverage percentage (0 - 100%).
    Matched = 1.0, Partially Matched = 0.5, Missing = 0.0.
    """
    if not concept_evidence:
        return 0.0
    
    score = 0.0
    for item in concept_evidence:
        status = item.get("status", "").lower()
        if status == "matched":
            score += 1.0
        elif status == "partially_matched":
            score += 0.5

    coverage = (score / len(concept_evidence)) * 100.0
    return round(coverage, 1)
