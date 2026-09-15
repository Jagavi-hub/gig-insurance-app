from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from blueprints import get_roles_taxonomy, get_random_question, get_all_questions
from capability_analyzer import calculate_role_capability

client = TestClient(app)

def test_roles_taxonomy():
    db = SessionLocal()
    roles = get_roles_taxonomy(db)
    db.close()
    assert len(roles) >= 6
    role_titles = [r.role_title for r in roles]
    assert "Machine Learning Engineer" in role_titles
    assert "Senior Python Backend Developer" in role_titles
    assert "Database Administrator / Data Architect" in role_titles

def test_random_question():
    db = SessionLocal()
    rand_q = get_random_question(db)
    db.close()
    assert rand_q is not None
    assert rand_q.question_id is not None
    assert rand_q.skill is not None

def test_role_capability_calculation():
    db = SessionLocal()
    cap = calculate_role_capability(db, "Machine Learning Engineer")
    db.close()
    assert cap.role_title == "Machine Learning Engineer"
    assert 0.0 <= cap.capability_percentage <= 100.0
    assert len(cap.skills_breakdown) >= 3
    assert cap.readiness_verdict is not None

def test_api_endpoints():
    # 1. Random question
    res = client.get("/questions/random")
    assert res.status_code == 200
    data = res.json()
    assert "question_id" in data
    assert "skill" in data

    # 2. Roles taxonomy
    res = client.get("/roles")
    assert res.status_code == 200
    roles = res.json()
    assert len(roles) >= 6

    # 3. Role capability
    res = client.get("/role-capability/Machine Learning Engineer")
    assert res.status_code == 200
    cap_data = res.json()
    assert "capability_percentage" in cap_data
    assert "readiness_verdict" in cap_data
    assert "skills_breakdown" in cap_data

if __name__ == "__main__":
    print("Running test_roles_taxonomy...")
    test_roles_taxonomy()
    print("Running test_random_question...")
    test_random_question()
    print("Running test_role_capability_calculation...")
    test_role_capability_calculation()
    print("Running test_api_endpoints...")
    test_api_endpoints()
    print("ALL 4 CAPABILITY & ROLE TESTS PASSED SUCCESSFULLY!")
