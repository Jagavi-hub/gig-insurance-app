import unittest
from fastapi.testclient import TestClient
from main import app
from senior_polisher import _offline_fallback_senior_polish, generate_senior_polish
from badge_engine import calculate_job_readiness
from database import SessionLocal

class TestAdvancedFeatures(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_senior_polish_generator(self):
        res = generate_senior_polish(
            question_id="ml-01",
            question_text="What is overfitting in machine learning?",
            role="Machine Learning Engineer",
            domain="ml",
            candidate_answer="Overfitting is when a model fits training data too well.",
            expected_concepts=["high variance", "regularization", "dropout"],
            retrieved_chunks=[]
        )
        self.assertGreater(len(res.senior_answer), 100)
        self.assertGreaterEqual(len(res.senior_highlights), 2)
        self.assertGreaterEqual(len(res.key_phrasing_upgrades), 1)

    def test_badge_engine_and_job_readiness(self):
        db = SessionLocal()
        summary = calculate_job_readiness(db)
        db.close()
        
        self.assertGreaterEqual(summary.readiness_percentage, 0.0)
        self.assertLessEqual(summary.readiness_percentage, 100.0)
        self.assertIsInstance(summary.badges, list)
        self.assertGreaterEqual(len(summary.badges), 5)
        # Verify badges have id, name, unlocked status
        for b in summary.badges:
            self.assertTrue(hasattr(b, "unlocked"))
            self.assertTrue(hasattr(b, "icon"))

    def test_senior_polish_endpoint(self):
        payload = {
            "question_id": "ml-01",
            "candidate_answer": "Overfitting happens when a model fits training noise."
        }
        res = self.client.post("/api/senior-polish", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("senior_answer", data)
        self.assertIn("senior_highlights", data)
        self.assertIn("key_phrasing_upgrades", data)

    def test_passport_endpoint(self):
        res = self.client.get("/api/passport")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("readiness_percentage", data)
        self.assertIn("badges", data)
        self.assertIn("target_role", data)

if __name__ == "__main__":
    unittest.main()
