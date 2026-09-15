import re
from typing import List, Dict, Any
from llm_client import llm_client

SYSTEM_PROMPT = """You are an expert technical interviewer and AI evaluation engine.
Analyze a candidate's answer against a list of expected concepts, grounded in verified technical reference documentation.

For each expected concept, evaluate:
1. status: Must be exactly one of: "matched", "partially_matched", or "missing".
   - "matched": Candidate clearly, accurately, and substantively explained the concept.
   - "partially_matched": Candidate briefly touched on or implied the concept, but lacked technical precision or depth.
   - "missing": Candidate omitted the concept completely or was factually wrong about it.
2. confidence: Float between 0.0 and 1.0.
3. evidence: The EXACT verbatim quote or phrase from the candidate's answer supporting this concept. If "missing", set to "".
4. reasoning: A concise 1-sentence technical justification.

OUTPUT FORMAT:
Return ONLY a valid JSON object with a single key "concepts":
{
  "concepts": [
    {
      "concept": "<concept_string>",
      "status": "matched",
      "confidence": 0.95,
      "evidence": "<exact quote from candidate answer>",
      "reasoning": "<1 sentence reasoning>"
    }
  ]
}
DO NOT include markdown fences, backticks, or conversational text. Raw JSON only."""

def _offline_fallback_extractor(
    candidate_answer: str,
    expected_concepts: List[str]
) -> Dict[str, Any]:
    """
    Intelligent heuristic fallback when OpenAI is offline or API key is absent.
    Finds exact matching sentences in candidate answer using token overlap.
    """
    sentences = re.split(r'(?<=[.!?\n])\s+', candidate_answer.strip())
    results = []

    # Stopwords to filter out of concept matching
    stopwords = {"the", "a", "an", "is", "are", "and", "or", "in", "on", "of", "to", "for", "with", "as", "by", "such"}

    for concept in expected_concepts:
        # Extract meaningful keywords from concept (lower, alphanumeric)
        words = [w.lower().strip(":,().-\"'/") for w in concept.split()]
        keywords = [w for w in words if len(w) > 2 and w not in stopwords]

        best_sentence = ""
        best_overlap = 0

        for sentence in sentences:
            s_clean = sentence.lower()
            overlap_count = sum(1 for kw in keywords if kw in s_clean)
            if overlap_count > best_overlap:
                best_overlap = overlap_count
                best_sentence = sentence.strip()

        overlap_ratio = best_overlap / max(1, len(keywords))

        if overlap_ratio >= 0.40:
            status = "matched"
            confidence = min(0.95, round(0.70 + (overlap_ratio * 0.25), 2))
            evidence = best_sentence
            reasoning = f"Directly articulated key components of '{concept[:40]}...' in the answer."
        elif overlap_ratio >= 0.20:
            status = "partially_matched"
            confidence = 0.70
            evidence = best_sentence
            reasoning = f"Partially addressed aspects of this concept, but omitted comprehensive depth."
        else:
            status = "missing"
            confidence = 0.90
            evidence = ""
            reasoning = f"No substantive evidence found in candidate answer for '{concept[:40]}...'."

        results.append({
            "concept": concept,
            "status": status,
            "confidence": confidence,
            "evidence": evidence,
            "reasoning": reasoning
        })

    return {"concepts": results}

def extract_concepts(
    candidate_answer: str,
    expected_concepts: List[str],
    retrieved_chunks: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Extract and classify concepts against candidate answer using LLM with defensive parsing.
    """
    if not candidate_answer.strip():
        return [
            {
                "concept": c,
                "status": "missing",
                "confidence": 1.0,
                "evidence": "",
                "reasoning": "Candidate answer was empty."
            }
            for c in expected_concepts
        ]

    ref_text = "\n\n---\n\n".join(
        [f"[Source: {c.get('source', 'ref')}]\n{c.get('text', '')}" for c in retrieved_chunks[:3]]
    )

    concepts_bulleted = "\n".join([f"- {c}" for c in expected_concepts])

    user_prompt = f"""[REFERENCE DOCUMENTATION]:
{ref_text if ref_text else "No reference text available."}

[EXPECTED CONCEPTS]:
{concepts_bulleted}

[CANDIDATE ANSWER]:
{candidate_answer}

Extract each expected concept and classify its status (matched/partially_matched/missing), confidence, verbatim evidence, and reasoning."""

    def fallback():
        return _offline_fallback_extractor(candidate_answer, expected_concepts)

    try:
        response_json = llm_client.call_llm_json(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            fallback_fn=fallback
        )
    except Exception as e:
        print(f"[ConceptExtractor] Error during LLM call: {e}. Using fallback extractor.")
        response_json = fallback()

    raw_list = response_json.get("concepts", [])
    if not isinstance(raw_list, list) or len(raw_list) == 0:
        raw_list = fallback().get("concepts", [])

    # Normalize and validate to match expected concepts
    concept_map = {item.get("concept", "").strip(): item for item in raw_list if isinstance(item, dict)}
    
    final_results = []
    for orig_concept in expected_concepts:
        match = concept_map.get(orig_concept.strip())
        if not match:
            # Try fuzzy match on concept text
            for k, v in concept_map.items():
                if orig_concept.lower() in k.lower() or k.lower() in orig_concept.lower():
                    match = v
                    break
        
        if match:
            status = match.get("status", "missing").lower()
            if status not in ["matched", "partially_matched", "missing"]:
                status = "partially_matched"
            final_results.append({
                "concept": orig_concept,
                "status": status,
                "confidence": max(0.0, min(1.0, float(match.get("confidence", 0.8)))),
                "evidence": str(match.get("evidence", "")),
                "reasoning": str(match.get("reasoning", ""))
            })
        else:
            final_results.append({
                "concept": orig_concept,
                "status": "missing",
                "confidence": 0.85,
                "evidence": "",
                "reasoning": "Concept not addressed in candidate answer."
            })

    return final_results
