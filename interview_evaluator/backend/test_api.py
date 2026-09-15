import unittest
from fastapi.testclient import TestClient
from main import app

class TestFastAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["chroma_connected"])

    def test_list_questions(self):
        res = self.client.get("/api/questions")
        self.assertEqual(res.status_code, 200)
        questions = res.json()
        self.assertGreaterEqual(len(questions), 6)

    def test_filter_questions_by_domain(self):
        res = self.client.get("/api/questions?domain=ml")
        self.assertEqual(res.status_code, 200)
        ml_questions = res.json()
        self.assertTrue(all(q["domain"] == "ml" for q in ml_questions))

    def test_evaluate_endpoint_strong_answer(self):
        payload = {
            "question_id": "ml-01",
            "candidate_answer": (
                "Overfitting occurs when a machine learning model memorizes training noise rather than generalizable "
                "patterns, representing high variance and low bias. The key symptom is a significant generalization gap: "
                "near-zero training loss alongside poor accuracy on unseen evaluation data. During training, it is detected "
                "when training loss continues decreasing while validation loss begins to diverge and climb. To prevent overfitting, "
                "we use regularization like L1 Lasso (sparsity) and L2 Ridge (weight decay). In deep learning, Dropout randomly "
                "deactivates neurons to reduce co-adaptation. We also use Early Stopping based on validation loss patience, "
                "K-Fold Cross-Validation, and data augmentation."
            )
        }
        res = self.client.post("/api/evaluate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("evaluation_id", data)
        self.assertGreater(data["overall_score"], 75.0)
        self.assertGreaterEqual(len(data["concept_evidence"]), 3)
        self.assertGreaterEqual(len(data["retrieved_chunks"]), 1)

    def test_evaluate_endpoint_insufficient_grounding(self):
        payload = {
            "question_id": "db-01",
            "candidate_answer": "Cooking pasta requires boiling water and adding salt to taste. Stir occasionally until al dente."
        }
        res = self.client.post("/api/evaluate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        # Should flag insufficient reference or have low scores
        self.assertLess(data["overall_score"], 50.0)

    def test_get_report(self):
        # Create an evaluation first
        payload = {
            "question_id": "py-02",
            "candidate_answer": "Generators in Python use yield to lazily produce values on demand, saving O(N) memory."
        }
        eval_res = self.client.post("/api/evaluate", json=payload)
        eval_id = eval_res.json()["evaluation_id"]

        # Fetch report
        rep_res = self.client.get(f"/api/report/{eval_id}")
        self.assertEqual(rep_res.status_code, 200)
        self.assertEqual(rep_res.json()["evaluation_id"], eval_id)

    def test_heatmap_endpoint(self):
        res = self.client.get("/api/heatmap")
        self.assertEqual(res.status_code, 200)
        heatmap = res.json()
        self.assertIsInstance(heatmap, list)

if __name__ == "__main__":
    unittest.main()
