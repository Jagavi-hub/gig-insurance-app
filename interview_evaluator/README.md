# AI-Powered Interview Answer Evaluation System (EvalAI)

A production-ready, full-stack platform that benchmarks candidate interview answers against curated technical reference documentation using a structured, RAG-grounded pipeline (not an arbitrary "LLM, score this" prompt).

The system generates an **explainable, evidence-based evaluation report** detailing overall percentage, four-dimension rubric breakdown, verbatim supporting evidence quotes from candidate answers, detected misconceptions, and knowledge gap telemetry.

---

## Architecture & Pipeline Overview

```
                      Candidate Answer + Question Selection
                                       │
                                       ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │ 1. RETRIEVAL LAYER (ChromaDB + all-MiniLM-L6-v2)                     │
    │    • Queries local domain collection (ML, Python, DBMS, HR)          │
    │    • Computes cosine similarity scores                               │
    │    • HALLUCINATION GUARD: If max_similarity < 0.35 threshold,        │
    │      flags `insufficient_reference: true` and caps technical score  │
    └──────────────────────────────────┬───────────────────────────────────┘
                                       │ Top-k Chunks + Grounding Status
                                       ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │ 2. CONCEPT EXTRACTOR (Strict JSON LLM Prompt)                        │
    │    • Maps candidate answer against question's `expected_concepts`    │
    │    • Classifies each concept: matched / partially_matched / missing  │
    │    • Extracts VERBATIM supporting evidence quote from answer         │
    │    • Calculates certainty confidence (0.0 - 1.0)                     │
    └──────────────────────────────────┬───────────────────────────────────┘
                                       │ Concept Mapping + Evidence Quotes
                                       ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │ 3. STRUCTURED EVALUATOR (LLM Structured Output)                      │
    │    • Scores 4 dimensions (0-10): Relevance, Completeness,            │
    │      Technical Depth, Communication Quality                          │
    │    • Audits for blueprint `common_misconceptions`                   │
    │    • Generates concrete strengths and actionable improvement tips    │
    │    • Enforces grounding safety: caps technical at 5.0 max if low ref │
    └──────────────────────────────────┬───────────────────────────────────┘
                                       │ Raw Dimension Scores
                                       ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │ 4. SCORING ENGINE (Pure Unit-Testable Python Function)               │
    │    • Weighted overall score using question's rubric weights:         │
    │      Overall % = (w_rel*rel + w_comp*comp + w_tech*tech + w_comm*comm)│
    │    • Assigns performance tier (Exceptional / Strong / Competent / ...)│
    │    • No LLM calls; 100% deterministic & mathematically sound         │
    └──────────────────────────────────┬───────────────────────────────────┘
                                       │
                                       ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │ 5. PERSISTENCE & API (FastAPI + SQLite + SQLAlchemy)                 │
    │    • Endpoints: /questions, /evaluate, /report/{id}, /heatmap        │
    │    • Telemetry: Latency (ms), coverage rates, knowledge gaps         │
    └──────────────────────────────────┬───────────────────────────────────┘
                                       │
                                       ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │ 6. EXPLAINABLE REACT FRONTEND (Vite + TailwindCSS)                   │
    │    • Screen 1: Role/Domain + Question Picker                         │
    │    • Screen 2: Answer Editor + Preloaded Demo Presets + Loader       │
    │    • Screen 3: Diagnostic Report + Evidence Quotes + Grounding Drawer│
    │    • Screen 4: Real-time Knowledge Gap Heatmap Across Candidates     │
    └──────────────────────────────────────────────────────────────────────┘
```

---

## Why RAG Pipeline vs. Naive "LLM, Just Score This"?

| Challenge | Naive LLM Call ("Rate this 0-100") | EvalAI RAG Pipeline |
|---|---|---|
| **Hallucination & Ungrounded Claims** | Gives high scores to articulate but technically flawed or fabricated answers. | Compares claims against vector-indexed reference docs. If similarity is low, flags `insufficient_reference` and caps score. |
| **Explainability & Auditing** | Returns a generic, subjective paragraph with no traceability. | Maps every expected concept to **verbatim supporting quotes** extracted directly from candidate text. |
| **Misconception Detection** | Easily overlooks subtle technical misconceptions (e.g., claiming overfitting is high bias). | Cross-references answers against explicit misconception blueprints seeded per question. |
| **Scoring Consistency** | High variance across runs; temperature causes erratic ratings. | Pure Python mathematical engine applies fixed rubric weights over bounded dimensions. |
| **Actionable Feedback** | Vague advice ("study more"). | Distinguishes between matched, partially covered, and completely omitted concepts with concrete remedies. |

---

## Project Structure

```
interview_evaluator/
├── backend/
│   ├── knowledge_base/               # Curated reference markdown documentation
│   │   ├── ml/                       # Overfitting, metrics, gradient descent
│   │   ├── python/                   # Memory management, generators & decorators
│   │   ├── dbms/                     # ACID, isolation levels, B+Tree indexing
│   │   └── hr/                       # STAR method, conflict resolution
│   ├── blueprints.py                 # SQLite question blueprints and seeds
│   ├── database.py                   # SQLAlchemy engine and session setup
│   ├── models.py                     # SQLAlchemy ORM and Pydantic schemas
│   ├── kb_loader.py                  # Chunking (~300 tokens, 50 overlap) & ChromaDB indexing
│   ├── retriever.py                  # Domain vector retrieval & cosine similarity threshold
│   ├── concept_extractor.py          # LLM concept mapping & verbatim evidence extraction
│   ├── evaluator.py                  # 4-dimension evaluation & misconception auditing
│   ├── scoring.py                    # Pure function weighted rubric scoring engine
│   ├── llm_client.py                 # Swappable LLM wrapper (OpenAI + intelligent fallback)
│   ├── main.py                       # FastAPI API server
│   ├── eval_dataset.json             # Benchmark dataset with human ground truth
│   ├── run_eval.py                   # Evaluation-of-evaluator Optimization Lab script
│   ├── test_pipeline.py              # Automated test suite
│   ├── requirements.txt              # Python backend dependencies
│   └── .env                          # Configuration (optional OpenAI API key)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx            # Navigation and system health status badge
    │   │   ├── QuestionPicker.tsx    # Screen 1: Domain filter, role cards, questions
    │   │   ├── AnswerInput.tsx       # Screen 2: Textarea, presets, pipeline loader
    │   │   ├── EvaluationReport.tsx  # Screen 3: Score bars, evidence quotes, safety alerts
    │   │   └── HeatmapView.tsx       # Screen 4: Aggregated knowledge gap heatmap
    │   ├── api.ts                    # Backend API client
    │   ├── types.ts                  # TypeScript interfaces
    │   ├── App.tsx                   # Main state container & screen routing
    │   ├── main.tsx                  # React entry point
    │   └── index.css                 # Tailwind CSS styling
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    └── package.json
```

---

## Setup & Running Instructions

### 1. Prerequisites
- Python 3.10+ (tested with Python 3.13)
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd interview_evaluator/backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Add your OpenAI API key in .env
# If left blank, the system automatically runs with the intelligent local fallback engine!
# OPENAI_API_KEY=sk-...

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```
Backend will be live at `http://127.0.0.1:8000`.
Interactive OpenAPI docs available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd interview_evaluator/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## Automated Verification & Optimization Lab

### Run Unit & Integration Tests
```bash
cd interview_evaluator/backend
python test_pipeline.py
```
Validates:
- Mathematical scoring engine calculations and custom rubric weights
- Grounding safety cap enforcement (`insufficient_reference: true` -> max 5.0)
- Sliding window chunking (~300 tokens, 50 tokens overlap)
- SQLite database blueprint initialization
- Concept extraction evidence mapping and fallback heuristics

### Run Optimization Lab Benchmark (`run_eval.py`)
```bash
cd interview_evaluator/backend
python run_eval.py
```
Runs the evaluation pipeline against `eval_dataset.json` (human ground-truth benchmark) and compares it side-by-side against a naive single-prompt LLM call:
- Computes Pearson correlation ($r$) with human scores
- Computes Mean Absolute Error (MAE)
- Measures average latency per answer
- Reports % of answers triggering the hallucination / low-grounding safety guard
