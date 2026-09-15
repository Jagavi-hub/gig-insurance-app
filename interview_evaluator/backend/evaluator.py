from typing import List, Dict, Any
from llm_client import llm_client
from models import LLMEvaluationRaw
from scoring import calculate_concept_coverage

SYSTEM_PROMPT = """You are an objective, rigorous Principal Technical Interview Evaluator.
You evaluate candidates based on ground-truth reference material and expected concept rubrics.

You MUST produce a JSON object with EXACTLY the following keys:
{
  "relevance": <number 0-10>,
  "completeness": <number 0-10>,
  "technical": <number 0-10>,
  "communication": <number 0-10>,
  "covered_concepts": ["concept 1", ...],
  "missing_concepts": ["concept 2", ...],
  "misconceptions_detected": ["misconception found (if any)", ...],
  "strengths": ["concrete strength 1", "concrete strength 2", ...],
  "improvements": ["actionable improvement 1", "actionable improvement 2", ...],
  "insufficient_reference": <boolean true/false>
}

DIMENSION GUIDELINES (0.0 to 10.0):
- relevance: How directly does the answer address the question prompt without fluff or unrelated digression?
- completeness: Breadth and depth of coverage across all expected concepts.
- technical: Accuracy, precision, depth of explanations, correct terminology, absence of technical errors.
- communication: Clarity, structure, professional tone, coherent flow, conciseness.

GROUNDING ENFORCEMENT:
If 'insufficient_reference' is signaled as TRUE, the reference material is inadequate to substantiate technical claims.
In this case, you MUST set "insufficient_reference": true, cap "technical" score at 5.0 max, and note the grounding limitation in improvements.

OUTPUT FORMAT:
Return ONLY raw, valid JSON. No markdown code blocks (no ```json). No preamble or postscript."""

def _offline_fallback_evaluator(
    question_text: str,
    candidate_answer: str,
    expected_concepts: List[str],
    common_misconceptions: List[str],
    concept_evidence: List[Dict[str, Any]],
    insufficient_reference: bool
) -> Dict[str, Any]:
    """
    Intelligent fallback evaluator when OpenAI is unavailable.
    Synthesizes scores from concept extraction evidence and misconception detection.
    """
    matched_concepts = [c["concept"] for c in concept_evidence if c["status"] == "matched"]
    partial_concepts = [c["concept"] for c in concept_evidence if c["status"] == "partially_matched"]
    missing_concepts = [c["concept"] for c in concept_evidence if c["status"] == "missing"]

    coverage = calculate_concept_coverage(concept_evidence)  # 0 to 100
    answer_len = len(candidate_answer.split())

    # 1. Relevance: based on presence of keywords and reasonable length
    if answer_len < 10:
        relevance = 2.0
    elif answer_len < 30:
        relevance = 5.0
    else:
        relevance = min(9.5, round(6.5 + (coverage / 100.0) * 3.0, 1))

    # 2. Completeness: directly driven by coverage
    completeness = min(10.0, round(coverage / 10.0, 1))
    if completeness < 1.0 and answer_len > 15:
        completeness = 2.0

    # 3. Technical: depth of matched concepts minus misconceptions
    ans_lower = candidate_answer.lower()
    detected_misconceptions = []
    for misc in common_misconceptions:
        # Check if words in misconception appear closely
        misc_words = [w.lower().strip(":,().-\"'/") for w in misc.split() if len(w) > 3]
        if sum(1 for mw in misc_words if mw in ans_lower) >= max(2, len(misc_words) // 2):
            detected_misconceptions.append(f"Potentially reflected misconception: '{misc}'")

    raw_tech = (len(matched_concepts) * 2.0 + len(partial_concepts) * 1.0)
    raw_tech = min(9.5, round(raw_tech, 1))
    if detected_misconceptions:
        raw_tech = max(2.0, raw_tech - 2.5)

    if insufficient_reference:
        technical = min(5.0, raw_tech)
    else:
        technical = raw_tech

    # 4. Communication: structure, formatting, punctuation
    comm_score = 7.0
    if "\n" in candidate_answer or "-" in candidate_answer:
        comm_score += 1.5
    if answer_len > 150:
        comm_score += 0.5
    if answer_len < 25:
        comm_score = 4.0
    communication = min(9.5, round(comm_score, 1))

    # Strengths
    strengths = []
    if matched_concepts:
        strengths.append(f"Solid explanation of {len(matched_concepts)} core concept(s), including {matched_concepts[0][:40]}...")
    if answer_len > 80:
        strengths.append("Provided structured explanations with good engineering articulation.")
    if not detected_misconceptions:
        strengths.append("Avoided common technical pitfalls and misconceptions on this topic.")
    if not strengths:
        strengths.append("Answer attempted the core question prompt.")

    # Improvements
    improvements = []
    if missing_concepts:
        improvements.append(f"Deepen coverage on omitted concepts: {missing_concepts[0][:50]}...")
    if partial_concepts:
        improvements.append(f"Provide concrete implementation details for partially covered areas: {partial_concepts[0][:50]}...")
    if detected_misconceptions:
        improvements.append(f"Clarify distinction regarding detected misconception: {detected_misconceptions[0]}")
    if insufficient_reference:
        improvements.append("Technical claims could not be fully grounded against local reference documentation (insufficient grounding).")
    if not improvements:
        improvements.append("Consider discussing edge cases and production scalability tradeoffs.")

    return {
        "relevance": relevance,
        "completeness": completeness,
        "technical": technical,
        "communication": communication,
        "covered_concepts": matched_concepts + partial_concepts,
        "missing_concepts": missing_concepts,
        "misconceptions_detected": detected_misconceptions,
        "strengths": strengths,
        "improvements": improvements,
        "insufficient_reference": insufficient_reference
    }

def evaluate_answer(
    question_text: str,
    candidate_answer: str,
    expected_concepts: List[str],
    common_misconceptions: List[str],
    concept_evidence: List[Dict[str, Any]],
    retrieved_chunks: List[Dict[str, Any]],
    insufficient_reference: bool
) -> Dict[str, Any]:
    """
    Executes single structured LLM evaluation call with strict JSON validation
    and defensive fallback.
    """
    ref_text = "\n\n---\n\n".join(
        [f"[Source: {c.get('source', 'ref')} | Similarity: {c.get('similarity_score', 0.0)}]\n{c.get('text', '')}"
         for c in retrieved_chunks[:3]]
    )

    evidence_summary = "\n".join(
        [f"- Concept: '{item['concept']}' -> Status: {item['status'].upper()} (Confidence: {item['confidence']}). "
         f"Evidence: \"{item['evidence']}\""
         for item in concept_evidence]
    )

    misconceptions_text = "\n".join([f"- {m}" for m in common_misconceptions])

    user_prompt = f"""[QUESTION]:
{question_text}

[CANDIDATE ANSWER]:
{candidate_answer}

[EVALUATED CONCEPT EVIDENCE (From Concept Extractor)]:
{evidence_summary}

[COMMON MISCONCEPTIONS TO AUDIT]:
{misconceptions_text}

[VERIFIED GROUND-TRUTH REFERENCE]:
{ref_text if ref_text else "None available."}

[GROUNDING STATUS]:
Insufficient Reference Grounding: {insufficient_reference}
{"WARNING: Retrieval similarity is below acceptable threshold! You MUST set insufficient_reference: true and cap technical score at 5.0 max." if insufficient_reference else "Reference similarity is sufficient for grounded technical evaluation."}

Evaluate the candidate answer across the 4 dimensions (relevance, completeness, technical, communication), list covered and missing concepts, flag misconceptions, and provide strengths and improvements."""

    def fallback():
        return _offline_fallback_evaluator(
            question_text=question_text,
            candidate_answer=candidate_answer,
            expected_concepts=expected_concepts,
            common_misconceptions=common_misconceptions,
            concept_evidence=concept_evidence,
            insufficient_reference=insufficient_reference
        )

    try:
        raw_result = llm_client.call_llm_json(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            fallback_fn=fallback
        )
    except Exception as e:
        print(f"[Evaluator] LLM invocation failed: {e}. Utilizing defensive fallback.")
        raw_result = fallback()

    # Defensively validate against Pydantic schema
    try:
        parsed = LLMEvaluationRaw(**raw_result)
        result_dict = parsed.model_dump()
    except Exception as ve:
        print(f"[Evaluator] Pydantic validation issue ({ve}). Sanitizing fields.")
        result_dict = fallback()

    # Enforce strict grounding safety rule
    if insufficient_reference:
        result_dict["insufficient_reference"] = True
        result_dict["technical"] = min(5.0, float(result_dict.get("technical", 5.0)))

    return result_dict
