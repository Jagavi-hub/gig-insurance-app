from typing import List, Dict, Any
from llm_client import llm_client
from models import SeniorPolishResponse, KeyPhrasingUpgrade

SYSTEM_PROMPT = """You are a Principal Software Engineer & Staff Bar Raiser Interview Coach.
Your task is to transform a candidate's interview answer into an exemplary, senior/staff-level answer that would easily clear a FAANG / Tier-1 tech company bar.

A true senior-level answer demonstrates:
1. Precise architectural and theoretical framing (e.g., bias-variance trade-off, memory arenas, lock escalation).
2. Concrete real-world trade-offs and numbers (e.g., latency vs throughput, O(1) space complexity).
3. Production edge cases, failure modes, and monitoring/alerting metrics.
4. Clean, structured communication with no fluff.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching:
{
  "senior_answer": "<complete senior-level answer in 2-3 structured paragraphs>",
  "senior_highlights": [
    "<Highlight 1: why this is senior level (e.g. addressed production failure modes)>",
    "<Highlight 2: trade-off analysis (e.g. latency vs consistency)>",
    "<Highlight 3: concrete engineering metrics or mathematical rigor>"
  ],
  "key_phrasing_upgrades": [
    {
      "junior_or_candidate_phrase": "<phrase from candidate or common casual phrasing>",
      "senior_upgrade": "<senior engineering phrasing>",
      "rationale": "<why this phrasing demonstrates higher seniority>"
    }
  ],
  "production_considerations": [
    "<Operational tip: e.g. monitoring validation curves in MLflow>",
    "<Scalability guard: e.g. circuit breakers or connection pool sizing>"
  ]
}
DO NOT include markdown fences, backticks, or conversational text. Return valid JSON only."""

def _offline_fallback_senior_polish(
    question_text: str,
    role: str,
    domain: str,
    candidate_answer: str,
    expected_concepts: List[str]
) -> Dict[str, Any]:
    """
    Intelligent fallback senior answers curated for each domain and question.
    """
    q_lower = question_text.lower()
    
    if "overfitting" in q_lower:
        senior_ans = (
            "In statistical machine learning, overfitting occurs when a high-capacity model captures dataset-specific noise "
            "and idiosyncratic fluctuations rather than the true underlying data-generating distribution, manifesting as "
            "high variance and low bias. In production, we detect this through divergent empirical loss curves: training loss "
            "monotonically decreases while validation loss plateaus and begins diverging upward after optimal epoch t*.\n\n"
            "To mitigate overfitting architecturally, we apply structural constraints: L2 regularization (weight decay) to shrink "
            "weight norms continuously, and L1 regularization (Lasso) to induce parameter sparsity and eliminate noisy features. "
            "In deep networks, inverted Dropout (p=0.2–0.5) prevents co-adaptation of hidden activations. Operationally, we enforce "
            "Early Stopping with patience windows tied to checkpointed weights, utilize stratified K-Fold cross-validation, and "
            "synthesize realistic perturbations via domain-specific data augmentation."
        )
        highlights = [
            "Framed fundamentally as a bias-variance trade-off with explicit loss curve dynamics.",
            "Distinguished between architectural constraints (L1/L2, Dropout) vs operational safeguards (Early Stopping, K-Fold).",
            "Specified exact engineering hyperparameters (dropout rate p=0.2–0.5, checkpointed patience windows)."
        ]
        upgrades = [
            {
                "junior_or_candidate_phrase": "Overfitting is when the model is too complex and fits training data.",
                "senior_upgrade": "Overfitting reflects high variance where parameter capacity exceeds the effective sample size, memorizing sample noise over the data distribution.",
                "rationale": "Positions the issue statistically in terms of capacity and sample complexity."
            },
            {
                "junior_or_candidate_phrase": "We can stop training when test accuracy drops.",
                "senior_upgrade": "We enforce Early Stopping with a configurable patience threshold on validation loss, restoring the best checkpointed model weights.",
                "rationale": "Specifies production checkpointing and validation curve mechanics."
            }
        ]
        prod = [
            "Log training vs validation loss ratios into MLflow/Weights & Biases to automatically alert on gradient divergence.",
            "Ensure data transformations (standardization, feature encoding) are fitted strictly on training folds to prevent data leakage."
        ]
    elif "precision" in q_lower or "recall" in q_lower:
        senior_ans = (
            "Precision (TP / [TP + FP]) measures the positive predictive value of a classifier, while Recall (TP / [TP + FN]) "
            "measures sensitivity. In real-world systems, we navigate the Precision-Recall Pareto frontier by tuning the classification "
            "decision threshold based on the asymmetric cost matrix of errors.\n\n"
            "We prioritize Precision in high-friction customer touchpoints where false alarms induce costly consequences or alert fatigue—such "
            "as automated financial fraud blocking or B2B email spam filtering. Conversely, Recall is mission-critical in high-stakes domains "
            "where false negatives carry existential or legal risk—such as oncology screening, safety-critical defect inspection, or sanctions screening. "
            "When balancing both under heavy class imbalance, we evaluate PR-AUC curves rather than deceptive ROC-AUC or standard accuracy."
        )
        highlights = [
            "Introduced the asymmetric cost matrix and Pareto frontier concepts.",
            "Contrasted concrete industrial failure modes (alert fatigue vs catastrophic false negatives).",
            "Addressed class imbalance and why PR-AUC is mathematically superior to ROC-AUC."
        ]
        upgrades = [
            {
                "junior_or_candidate_phrase": "Precision is how many were right, recall is how many you caught.",
                "senior_upgrade": "Precision defines positive predictive value, whereas recall defines sensitivity across the actual positive population.",
                "rationale": "Uses standard statistical terminology expected in senior ML interviews."
            }
        ]
        prod = [
            "Instrument calibration curves (Brier score / Platt scaling) so predicted probabilities reflect true empirical odds.",
            "Establish alert budgets: if false positive rate spikes >1.5%, trigger automated fallback to human review."
        ]
    elif "memory" in q_lower or "garbage" in q_lower:
        senior_ans = (
            "CPython manages memory primarily through deterministic reference counting (tracking ob_refcnt in the PyObject header), "
            "enabling immediate deallocation when an object falls out of scope. However, reference counting fundamentally fails on "
            "circular references—such as doubly linked structures or bound closures—where unreachable objects maintain mutual pointers.\n\n"
            "To prevent leaks, CPython employs a generational cyclic garbage collector across three generations (0, 1, 2) based on the "
            "heuristic that young objects die quickly. The collector traverses container objects, decrements candidate reference counts "
            "temporarily to isolate internal cycles, and sweeps unreachable cliques. Underneath, memory is pooled via PyMalloc arenas (256KB) "
            "and pools (4KB) for small allocations (<=512 bytes) to minimize OS syscall overhead and fragmentation."
        )
        highlights = [
            "Explained both primary (reference counting) and secondary (generational cyclic GC) systems.",
            "Detailed PyMalloc internals (arenas, pools, 512-byte boundary) showing deep systems knowledge.",
            "Explained how the cycle-detection traversal identifies isolated cliques."
        ]
        upgrades = [
            {
                "junior_or_candidate_phrase": "Python has a garbage collector that cleans memory.",
                "senior_upgrade": "CPython pairs deterministic reference counting with a multi-generational cyclic collector to resolve circular pointer graphs.",
                "rationale": "Distinguishes between CPython's dual mechanisms with technical precision."
            }
        ]
        prod = [
            "Profile memory in production using tracemalloc and objgraph to inspect object allocation backtraces.",
            "For memory-intensive batch jobs, tune gc.disable() during ingestion or adjust gc.set_threshold() to prevent GC pauses."
        ]
    elif "acid" in q_lower or "isolation" in q_lower:
        senior_ans = (
            "ACID encapsulates the core guarantees of transactional persistence: Atomicity (all-or-nothing via write-ahead logging rollback), "
            "Consistency (transitioning strictly between valid states respecting schema invariants), Isolation (concurrency control without cross-leakage), "
            "and Durability (persistence on fsync via non-volatile WAL).\n\n"
            "Concurrency anomalies—dirty reads, non-repeatable reads, and phantom reads—are governed by SQL isolation levels. Modern engines like PostgreSQL "
            "and MySQL InnoDB implement Multi-Version Concurrency Control (MVCC) rather than naive table locks, where readers do not block writers and writers "
            "do not block readers. In Postgres, Repeatable Read relies on snapshot isolation, preventing phantom reads by reading from a frozen transaction snapshot, "
            "while Serializable employs Serializable Snapshot Isolation (SSI) to track rw-antidependencies and abort conflicting schedules."
        )
        highlights = [
            "Connected ACID guarantees to low-level database primitives (WAL, fsync, invariants).",
            "Explained MVCC mechanics: readers don't block writers, writers don't block readers.",
            "Clarified modern database behavior (Postgres snapshot isolation vs classic ANSI SQL definitions)."
        ]
        upgrades = [
            {
                "junior_or_candidate_phrase": "ACID means data doesn't get lost and transactions work.",
                "senior_upgrade": "ACID guarantees transactional integrity across failure boundaries via atomic WAL commits and MVCC concurrency isolation.",
                "rationale": "Frames the discussion around production fault tolerance and concurrency theory."
            }
        ]
        prod = [
            "Keep transactions short: long-running open transactions prevent MVCC VACUUM from reclaiming dead row tuples, bloating tables.",
            "Configure statement_timeout and lock_timeout to prevent catastrophic cascading connection pool exhaustion."
        ]
    else:
        senior_ans = (
            f"From an architectural standpoint for a {role}, addressing '{question_text}' requires balancing engineering trade-offs, "
            "scalability, and operational simplicity. The primary objective is to implement an extensible, resilient solution that isolates failure "
            "domains while maintaining strict service-level objectives (SLOs).\n\n"
            f"Key technical pillars: {', '.join(expected_concepts[:3])}. We ensure observability via structured telemetry, establish clear "
            "idempotency boundaries, and test edge cases under simulated degraded network conditions."
        )
        highlights = [
            "Framed in terms of production SLOs and fault isolation.",
            f"Explicitly addressed core pillars: {', '.join(expected_concepts[:2])}.",
            "Emphasized telemetry, idempotency, and chaos testing."
        ]
        upgrades = [
            {
                "junior_or_candidate_phrase": "We do this by writing code and testing it.",
                "senior_upgrade": "We establish automated contract testing, define clear idempotency keys, and monitor p99 latency regressions.",
                "rationale": "Replaces vague claims with concrete production engineering standards."
            }
        ]
        prod = [
            "Establish p95 and p99 latency SLOs in Datadog/Prometheus.",
            "Implement automated circuit breakers to fail gracefully during downstream outages."
        ]

    return {
        "senior_answer": senior_ans,
        "senior_highlights": highlights,
        "key_phrasing_upgrades": upgrades,
        "production_considerations": prod
    }

def generate_senior_polish(
    question_id: str,
    question_text: str,
    role: str,
    domain: str,
    candidate_answer: str,
    expected_concepts: List[str],
    retrieved_chunks: List[Dict[str, Any]]
) -> SeniorPolishResponse:
    """
    Generate an expert/staff-level answer and educational upgrades using LLM or offline fallback.
    """
    ref_text = "\n\n".join([f"- {c.get('text', '')}" for c in retrieved_chunks[:3]])

    user_prompt = f"""[ROLE]: {role} ({domain.upper()})
[QUESTION]: {question_text}

[EXPECTED CONCEPTS]:
{chr(10).join(f"- {c}" for c in expected_concepts)}

[GROUND TRUTH REFERENCE MATERIAL]:
{ref_text if ref_text else "None"}

[CANDIDATE ANSWER]:
{candidate_answer}

Transform this answer into an expert-level, senior software engineer answer.
Highlight what makes it senior, provide side-by-side phrasing upgrades, and include production considerations."""

    def fallback():
        return _offline_fallback_senior_polish(
            question_text=question_text,
            role=role,
            domain=domain,
            candidate_answer=candidate_answer,
            expected_concepts=expected_concepts
        )

    try:
        raw_json = llm_client.call_llm_json(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
            fallback_fn=fallback
        )
    except Exception as e:
        print(f"[SeniorPolisher] LLM call failed: {e}. Utilizing fallback.")
        raw_json = fallback()

    senior_ans = raw_json.get("senior_answer") or fallback()["senior_answer"]
    highlights = raw_json.get("senior_highlights") or fallback()["senior_highlights"]
    upgrades_raw = raw_json.get("key_phrasing_upgrades") or fallback()["key_phrasing_upgrades"]
    prod = raw_json.get("production_considerations") or fallback()["production_considerations"]

    upgrades = [
        KeyPhrasingUpgrade(
            junior_or_candidate_phrase=item.get("junior_or_candidate_phrase", "Candidate answer"),
            senior_upgrade=item.get("senior_upgrade", "Senior phrasing"),
            rationale=item.get("rationale", "Enhanced technical precision")
        )
        for item in upgrades_raw if isinstance(item, dict)
    ]

    return SeniorPolishResponse(
        question_id=question_id,
        question_text=question_text,
        role=role,
        domain=domain,
        senior_answer=senior_ans,
        senior_highlights=highlights,
        key_phrasing_upgrades=upgrades,
        production_considerations=prod
    )
