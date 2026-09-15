import unittest
from fastapi.testclient import TestClient
from main import app
from resume_analyzer import _offline_fallback_resume_analyzer, analyze_candidate_resume
from database import SessionLocal

class TestResumeAnalyzer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_ml_resume_matching(self):
        ml_resume = """
        Jane Doe
        Senior Machine Learning Engineer
        Experience: 6+ years specializing in deep learning, PyTorch, and NLP transformers.
        Built end-to-end model training pipelines, addressed overfitting with L2 weight decay and dropout.
        Evaluated classification metrics using PR-AUC and ROC-AUC.
        Tech Stack: Python, PyTorch, TensorFlow, Scikit-Learn, Docker, PostgreSQL.
        """
        db = SessionLocal()
        result = analyze_candidate_resume(ml_resume, db)
        db.close()

        self.assertEqual(result.experience_level, "Senior")
        self.assertGreaterEqual(len(result.matched_roles), 3)
        # Top matched role should be ML Engineer
        top_role = result.matched_roles[0]
        self.assertEqual(top_role.domain, "ml")
        self.assertGreater(top_role.fit_percentage, 75.0)
        self.assertIn("ml-01", top_role.recommended_question_ids)
        self.assertGreater(len(result.recommended_questions), 0)

    def test_python_backend_resume_matching(self):
        py_resume = """
        John Smith
        Backend Python Developer
        Skills: Python, FastAPI, Django, PostgreSQL, Redis, Celery, Docker, AsyncIO, Pytest.
        Architected high-throughput microservices handling 15,000 req/sec.
        Deep knowledge of Python memory management, GIL, and generator streaming.
        """
        db = SessionLocal()
        result = analyze_candidate_resume(py_resume, db)
        db.close()

        # Top role should be Python Backend Developer
        top_role = result.matched_roles[0]
        self.assertEqual(top_role.domain, "python")
        self.assertGreater(top_role.fit_percentage, 75.0)
        self.assertIn("py-01", top_role.recommended_question_ids)

    def test_analyze_resume_endpoint(self):
        payload = {
            "resume_text": "Software Engineer with Python, SQL, and database transaction experience."
        }
        res = self.client.post("/api/analyze-resume", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("experience_level", data)
        self.assertIn("matched_roles", data)
        self.assertIn("detected_skills", data)
        self.assertGreater(len(data["matched_roles"]), 0)

    def test_upload_resume_endpoint_txt(self):
        txt_content = b"Candidate: Alex Lee\nSkills: PostgreSQL, ACID transactions, B-Tree indexes, Python."
        files = {"file": ("resume.txt", txt_content, "text/plain")}
        res = self.client.post("/api/upload-resume", files=files)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("matched_roles", data)

if __name__ == "__main__":
    unittest.main()
