import unittest
from scoring import calculate_weighted_score, calculate_concept_coverage, get_performance_tier
from kb_loader import chunk_text
from blueprints import init_db, get_all_questions, get_question_by_id
from database import SessionLocal
from concept_extractor import _offline_fallback_extractor
from evaluator import _offline_fallback_evaluator
from retriever import retrieve_context

class TestInterviewEvaluationPipeline(unittest.TestCase):

    def test_scoring_engine_default_weights(self):
        # Perfect 10/10/10/10 -> 100.0%
        tech, overall, tier = calculate_weighted_score(
            relevance=10.0,
            completeness=10.0,
            technical=10.0,
            communication=10.0
        )
        self.assertEqual(tech, 10.0)
        self.assertEqual(overall, 100.0)
        self.assertIn("Exceptional", tier)

    def test_scoring_engine_custom_weights(self):
        # Weights: 0.25 rel, 0.25 comp, 0.30 tech, 0.20 comm
        # Scores: 8.0, 6.0, 7.0, 9.0
        # Weighted: 8*0.25 + 6*0.25 + 7*0.30 + 9*0.20 = 2.0 + 1.5 + 2.1 + 1.8 = 7.4 -> 74.0%
        weights = {"relevance": 0.25, "completeness": 0.25, "technical": 0.30, "communication": 0.20}
        tech, overall, tier = calculate_weighted_score(
            relevance=8.0,
            completeness=6.0,
            technical=7.0,
            communication=9.0,
            rubric_weights=weights
        )
        self.assertEqual(tech, 7.0)
        self.assertEqual(overall, 74.0)
        self.assertIn("Competent", tier)

    def test_scoring_grounding_safety_cap(self):
        # When insufficient_reference is True, technical score must be capped at 5.0
        tech, overall, tier = calculate_weighted_score(
            relevance=10.0,
            completeness=10.0,
            technical=9.5,
            communication=10.0,
            insufficient_reference=True,
            technical_cap=5.0
        )
        self.assertEqual(tech, 5.0)
        # Weighted with cap: 10*0.25 + 10*0.25 + 5.0*0.30 + 10*0.20 = 2.5 + 2.5 + 1.5 + 2.0 = 8.5 -> 85.0%
        self.assertEqual(overall, 85.0)

    def test_concept_coverage_math(self):
        evidence = [
            {"concept": "c1", "status": "matched"},
            {"concept": "c2", "status": "partially_matched"},
            {"concept": "c3", "status": "missing"},
            {"concept": "c4", "status": "matched"}
        ]
        # score = 1 + 0.5 + 0 + 1 = 2.5 / 4 = 62.5%
        coverage = calculate_concept_coverage(evidence)
        self.assertEqual(coverage, 62.5)

    def test_chunking_sliding_window(self):
        text = "word " * 600
        chunks = chunk_text(text, chunk_size_tokens=300, overlap_tokens=50)
        self.assertGreaterEqual(len(chunks), 2)
        # First chunk should have full sliding window length (~225 words)
        self.assertGreaterEqual(len(chunks[0].split()), 200)
        # All chunks must be non-empty
        for c in chunks:
            self.assertGreater(len(c.strip()), 0)

    def test_blueprint_store_and_database(self):
        init_db()
        db = SessionLocal()
        questions = get_all_questions(db)
        self.assertGreaterEqual(len(questions), 6)
        
        # Verify overfitting question is present
        ml_q = get_question_by_id(db, "ml-01")
        self.assertIsNotNone(ml_q)
        self.assertIn("overfitting", ml_q.question_text.lower())
        self.assertGreaterEqual(len(ml_q.expected_concepts), 3)
        db.close()

    def test_retriever_grounding_and_similarity(self):
        # Search for ML overfitting in ML collection
        result = retrieve_context(
            domain="ml",
            query="What is overfitting in machine learning and regularization?",
            top_k=3
        )
        self.assertIn("chunks", result)
        self.assertGreaterEqual(len(result["chunks"]), 1)
        self.assertGreaterEqual(result["max_similarity"], 0.35)
        self.assertFalse(result["insufficient_reference"])

    def test_offline_concept_extractor_matching(self):
        answer = "Overfitting is high variance where the model learns training noise. We can prevent it using dropout and L2 regularization."
        concepts = [
            "high variance and learns training noise",
            "dropout and L2 regularization",
            "quantum entanglement computation"
        ]
        res = _offline_fallback_extractor(answer, concepts)
        concept_list = res.get("concepts", [])
        self.assertEqual(len(concept_list), 3)
        
        # First concept should match
        c1 = next(c for c in concept_list if "variance" in c["concept"])
        self.assertIn(c1["status"], ["matched", "partially_matched"])
        self.assertGreater(len(c1["evidence"]), 0)

        # Third concept should be missing
        c3 = next(c for c in concept_list if "quantum" in c["concept"])
        self.assertEqual(c3["status"], "missing")
        self.assertEqual(c3["evidence"], "")

    def test_offline_evaluator_structure(self):
        evidence = [
            {"concept": "c1", "status": "matched"},
            {"concept": "c2", "status": "missing"}
        ]
        res = _offline_fallback_evaluator(
            question_text="What is overfitting?",
            candidate_answer="Overfitting happens when a model fits noise in training data.",
            expected_concepts=["fits noise", "diverging validation loss"],
            common_misconceptions=["overfitting is high bias"],
            concept_evidence=evidence,
            insufficient_reference=False
        )
        self.assertGreaterEqual(res["relevance"], 0.0)
        self.assertLessEqual(res["relevance"], 10.0)
        self.assertGreaterEqual(res["technical"], 0.0)
        self.assertLessEqual(res["technical"], 10.0)
        self.assertIsInstance(res["strengths"], list)
        self.assertIsInstance(res["improvements"], list)
        self.assertFalse(res["insufficient_reference"])

if __name__ == "__main__":
    unittest.main()
