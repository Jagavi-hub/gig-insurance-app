import random
from typing import List, Optional, Dict, Any
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import QuestionModel, QuestionDTO, RubricWeights, RoleTaxonomyItem

ROLE_SKILL_TAXONOMY: List[Dict[str, Any]] = [
    {
        "role_title": "Machine Learning Engineer",
        "domain": "ml",
        "description": "Designs, builds, and deploys scalable machine learning and deep learning pipelines.",
        "icon": "Brain",
        "skills": [
            {
                "skill_name": "Model Generalization & Regularization",
                "description": "Overfitting prevention, bias-variance tradeoff, L1/L2 penalties, and early stopping.",
                "question_ids": ["ml-01"]
            },
            {
                "skill_name": "Classification Metrics & Evaluation",
                "description": "Precision, recall, ROC-AUC, threshold tuning, and imbalanced dataset handling.",
                "question_ids": ["ml-02"]
            },
            {
                "skill_name": "Optimization & Gradient Descent",
                "description": "Stochastic gradient descent variants, momentum, adaptive learning rates, and convergence.",
                "question_ids": ["ml-03"]
            }
        ]
    },
    {
        "role_title": "Senior Python Backend Developer",
        "domain": "python",
        "description": "Architects high-throughput backend APIs, microservices, and asynchronous systems in Python.",
        "icon": "Code",
        "skills": [
            {
                "skill_name": "CPython Internals & Memory Management",
                "description": "Reference counting, generational cyclic garbage collection, PyMalloc, and GIL behavior.",
                "question_ids": ["py-01"]
            },
            {
                "skill_name": "Generators & Memory Streaming",
                "description": "Lazy evaluation with yield, coroutines, and memory-efficient stream processing.",
                "question_ids": ["py-02"]
            },
            {
                "skill_name": "Concurrency & AsyncIO",
                "description": "Event loops, cooperative coroutines, threading vs multiprocessing, and non-blocking I/O.",
                "question_ids": ["py-03"]
            }
        ]
    },
    {
        "role_title": "Database Administrator / Data Architect",
        "domain": "dbms",
        "description": "Specializes in high-availability database engines, query optimization, indexing, and ACID guarantees.",
        "icon": "Database",
        "skills": [
            {
                "skill_name": "ACID Transactions & Concurrency",
                "description": "Transactional isolation levels, dirty/phantom reads, MVCC, and write-ahead logging.",
                "question_ids": ["db-01"]
            },
            {
                "skill_name": "Storage Engines & Index Optimization",
                "description": "B+Tree structures, clustered vs non-clustered indexes, range scans, and execution plans.",
                "question_ids": ["db-02"]
            },
            {
                "skill_name": "Distributed Data Systems & Sharding",
                "description": "Horizontal sharding, replication topologies, consistency models, and CAP theorem trade-offs.",
                "question_ids": ["db-03"]
            }
        ]
    },
    {
        "role_title": "Full-Stack Software Engineer",
        "domain": "fullstack",
        "description": "Bridges responsive client architectures with secure, resilient backend APIs and state management.",
        "icon": "Layers",
        "skills": [
            {
                "skill_name": "Web Security & Stateless Authentication",
                "description": "JWT cryptographic verification, HttpOnly cookies, and mitigation of XSS, CSRF, and injection.",
                "question_ids": ["fs-01"]
            }
        ]
    },
    {
        "role_title": "DevOps & Cloud Systems Engineer",
        "domain": "devops",
        "description": "Automates cloud infrastructure, container orchestration, zero-downtime releases, and observability.",
        "icon": "Server",
        "skills": [
            {
                "skill_name": "Containerization & Zero-Downtime Deployment",
                "description": "Docker layer caching, multi-stage builds, and Blue-Green / Canary release strategies.",
                "question_ids": ["devops-01"]
            }
        ]
    },
    {
        "role_title": "Engineering Manager & Technical Lead",
        "domain": "hr",
        "description": "Leads engineering squads, resolves technical disputes, raises coding standards, and manages tech debt.",
        "icon": "Users",
        "skills": [
            {
                "skill_name": "Team Conflict Resolution & Alignment",
                "description": "STAR methodology for de-escalating technical conflicts and achieving collaborative buy-in.",
                "question_ids": ["hr-01"]
            },
            {
                "skill_name": "Technical Debt & Engineering Hygiene",
                "description": "Strategically managing tech debt, code review culture, and engineering velocity metrics.",
                "question_ids": ["hr-02"]
            }
        ]
    }
]

SAMPLE_BLUEPRINTS = [
    {
        "id": "ml-01",
        "domain": "ml",
        "role": "Machine Learning Engineer",
        "skill": "Model Generalization & Regularization",
        "difficulty": "Mid",
        "question_text": "What is overfitting in machine learning, how do you detect it, and what techniques can prevent it?",
        "expected_concepts": [
            "Definition: Model memorizes noise/training data instead of underlying generalizable patterns (high variance)",
            "Generalization gap: High performance on training set but poor accuracy on unseen test data",
            "Detection: Divergence of training loss (decreasing) and validation loss (increasing or plateauing)",
            "Mitigation: Regularization techniques such as L1 (Lasso) or L2 (Ridge / weight decay)",
            "Mitigation: Structural/training constraints such as Dropout, Early Stopping, or K-fold Cross-Validation"
        ],
        "optional_concepts": [
            "Data augmentation to expand sample size artificially",
            "Tree pruning or max_depth bounds for decision trees",
            "Bias-variance tradeoff discussion"
        ],
        "common_misconceptions": [
            "Confusing overfitting with underfitting (claiming overfitting is high bias)",
            "Claiming that adding more complex features directly cures overfitting",
            "Believing that 100% training accuracy guarantees a production-ready model"
        ],
        "rubric_weights": {
            "relevance": 0.25,
            "completeness": 0.25,
            "technical": 0.30,
            "communication": 0.20
        }
    },
    {
        "id": "ml-02",
        "domain": "ml",
        "role": "Machine Learning Engineer",
        "skill": "Classification Metrics & Evaluation",
        "difficulty": "Junior",
        "question_text": "Explain the difference between Precision and Recall. In what real-world scenarios would you prioritize one over the other?",
        "expected_concepts": [
            "Precision formula/definition: True Positives divided by (True Positives + False Positives)",
            "Recall formula/definition: True Positives divided by (True Positives + False Negatives)",
            "High Precision scenario: Where false alarms carry high cost (e.g., spam filtering, automated content blocking)",
            "High Recall scenario: Where missing a positive carries severe cost (e.g., medical cancer diagnosis, fraud detection)"
        ],
        "optional_concepts": [
            "F1-score as the harmonic mean balancing precision and recall",
            "Threshold tuning trade-off along the PR curve",
            "Accuracy paradox in imbalanced datasets"
        ],
        "common_misconceptions": [
            "Believing precision and recall can always be maximized simultaneously without trade-offs",
            "Relying on standard accuracy for heavily imbalanced classification datasets"
        ],
        "rubric_weights": {
            "relevance": 0.25,
            "completeness": 0.25,
            "technical": 0.30,
            "communication": 0.20
        }
    },
    {
        "id": "ml-03",
        "domain": "ml",
        "role": "Machine Learning Engineer",
        "skill": "Optimization & Gradient Descent",
        "difficulty": "Senior",
        "question_text": "Describe the differences between Batch, Stochastic, and Mini-Batch Gradient Descent, and how momentum accelerates convergence.",
        "expected_concepts": [
            "Batch Gradient Descent computes gradients over the entire training set (accurate but slow and memory intensive)",
            "Stochastic Gradient Descent (SGD) updates parameters per individual sample (noisy, fast, helps escape local minima)",
            "Mini-Batch Gradient Descent updates over batches (32-256) balancing hardware parallelism and variance",
            "Momentum maintains an exponentially weighted moving velocity of past gradients to accelerate in consistent directions and dampen oscillations"
        ],
        "optional_concepts": [
            "Adam optimizer combining momentum and RMSprop adaptive learning rates",
            "Vanishing/exploding gradient phenomenon and mitigation"
        ],
        "common_misconceptions": [
            "Believing Batch Gradient Descent works efficiently on gigabyte-scale datasets in memory",
            "Confusing learning rate with gradient momentum"
        ],
        "rubric_weights": {
            "relevance": 0.20,
            "completeness": 0.25,
            "technical": 0.35,
            "communication": 0.20
        }
    },
    {
        "id": "py-01",
        "domain": "python",
        "role": "Senior Python Backend Developer",
        "skill": "CPython Internals & Memory Management",
        "difficulty": "Senior",
        "question_text": "How does Python manage memory, and how does the Generational Garbage Collector handle cyclic references?",
        "expected_concepts": [
            "Reference counting as CPython's primary memory management mechanism",
            "Immediate deallocation when an object's reference count drops to zero",
            "Cyclic references problem: Isolated circular loops prevent reference counts from ever reaching zero",
            "Generational Garbage Collector: 3 generations (Gen 0, 1, 2) based on object lifetime and allocation heuristics",
            "Cycle-detection algorithm: Tracks container objects and identifies unreachable isolated subgraphs"
        ],
        "optional_concepts": [
            "Global Interpreter Lock (GIL) protecting reference counts from race conditions",
            "PyMalloc memory allocator arenas and pools",
            "The weakref module for non-owning references"
        ],
        "common_misconceptions": [
            "Believing the 'del' statement directly frees memory to the OS rather than decrementing reference counts",
            "Believing Python only uses a mark-and-sweep garbage collector without reference counting",
            "Assuming the GIL prevents memory leaks"
        ],
        "rubric_weights": {
            "relevance": 0.20,
            "completeness": 0.25,
            "technical": 0.35,
            "communication": 0.20
        }
    },
    {
        "id": "py-02",
        "domain": "python",
        "role": "Senior Python Backend Developer",
        "skill": "Generators & Memory Streaming",
        "difficulty": "Mid",
        "question_text": "What are Python generators and the yield keyword, and why are they preferable to returning standard lists for large data pipelines?",
        "expected_concepts": [
            "yield keyword pauses function execution and returns an iterator yielding items lazily",
            "Execution state (local variables and instruction pointer) is preserved between next() calls",
            "Memory efficiency: O(1) auxiliary space consumption vs O(N) memory allocation for full lists",
            "Suitability for streaming large datasets, file logs, or infinite series"
        ],
        "optional_concepts": [
            "Generator expressions syntax: (x for x in iterable)",
            "Generator send() and throw() coroutine methods",
            "Iterator protocol implementation (__iter__ and __next__)"
        ],
        "common_misconceptions": [
            "Believing generators are always faster in raw CPU clock execution than list comprehensions",
            "Believing yield loads all elements into memory in advance"
        ],
        "rubric_weights": {
            "relevance": 0.25,
            "completeness": 0.25,
            "technical": 0.30,
            "communication": 0.20
        }
    },
    {
        "id": "py-03",
        "domain": "python",
        "role": "Senior Python Backend Developer",
        "skill": "Concurrency & AsyncIO",
        "difficulty": "Senior",
        "question_text": "Explain how Python's AsyncIO event loop enables high-concurrency I/O, and compare it with threading and multiprocessing under the GIL.",
        "expected_concepts": [
            "AsyncIO event loop operates single-threaded cooperative multitasking using coroutines and await",
            "Non-blocking I/O multiplexing via OS selectors (epoll/kqueue) without thread context-switching overhead",
            "GIL constraints: Multithreading cannot achieve multi-core CPU parallelism for bytecode execution",
            "Multiprocessing spawns separate OS processes with dedicated interpreters to bypass the GIL for CPU-bound tasks",
            "Blocking synchronous code must be offloaded to threadpools using asyncio.to_thread"
        ],
        "optional_concepts": [
            "Task and Future primitives in asyncio",
            "Inter-process communication (IPC) and pickling serialization overhead in multiprocessing"
        ],
        "common_misconceptions": [
            "Believing asyncio speeds up CPU-intensive numerical matrix multiplication",
            "Assuming Python threads run entirely independently of the GIL"
        ],
        "rubric_weights": {
            "relevance": 0.20,
            "completeness": 0.25,
            "technical": 0.35,
            "communication": 0.20
        }
    },
    {
        "id": "db-01",
        "domain": "dbms",
        "role": "Database Administrator / Data Architect",
        "skill": "ACID Transactions & Concurrency",
        "difficulty": "Mid",
        "question_text": "Explain the ACID properties of a relational database and how isolation levels mitigate concurrency anomalies.",
        "expected_concepts": [
            "Atomicity: All operations in a transaction succeed or all are rolled back (all-or-nothing)",
            "Consistency: Transactions transition the database between valid states adhering to schema constraints",
            "Isolation: Concurrent transactions execute without cross-contamination or intermediate interference",
            "Durability: Committed transactions persist permanently across power failures or crashes (e.g. WAL)",
            "Concurrency anomalies: Dirty reads, non-repeatable reads, and phantom reads",
            "Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable"
        ],
        "optional_concepts": [
            "Multi-Version Concurrency Control (MVCC)",
            "Two-Phase Locking (2PL) vs optimistic concurrency control",
            "Write-Ahead Logging (WAL) mechanisms"
        ],
        "common_misconceptions": [
            "Believing Read Committed isolation level prevents phantom reads",
            "Claiming ACID guarantees zero downtime or hardware immunity"
        ],
        "rubric_weights": {
            "relevance": 0.25,
            "completeness": 0.25,
            "technical": 0.30,
            "communication": 0.20
        }
    },
    {
        "id": "db-02",
        "domain": "dbms",
        "role": "Database Administrator / Data Architect",
        "skill": "Storage Engines & Index Optimization",
        "difficulty": "Senior",
        "question_text": "How does a B+Tree index optimize SQL query performance, and what is the difference between a clustered and non-clustered index?",
        "expected_concepts": [
            "B+Tree structure: Balanced multi-way search tree with high fanout providing O(log N) search complexity",
            "Sequential leaf linking: Doubly linked list at leaf level allows highly efficient range scans",
            "Clustered index defines the physical order of table rows on disk (only one clustered index per table)",
            "Non-clustered (secondary) index stores indexed columns and a row pointer/primary key to locate records",
            "Eliminates full table scans on selective queries"
        ],
        "optional_concepts": [
            "Covering index allowing index-only scans without table page lookups",
            "Write overhead of maintaining indexes during INSERT/UPDATE/DELETE"
        ],
        "common_misconceptions": [
            "Believing a table can have multiple clustered indexes",
            "Believing indexes always speed up every database operation including bulk inserts"
        ],
        "rubric_weights": {
            "relevance": 0.25,
            "completeness": 0.25,
            "technical": 0.30,
            "communication": 0.20
        }
    },
    {
        "id": "db-03",
        "domain": "dbms",
        "role": "Database Administrator / Data Architect",
        "skill": "Distributed Data Systems & Sharding",
        "difficulty": "Senior",
        "question_text": "Discuss database sharding vs replication, and how the CAP theorem dictates consistency and availability trade-offs in distributed storage.",
        "expected_concepts": [
            "Replication: Copies data across multiple nodes for read scalability, high availability, and failover redundancy",
            "Sharding: Horizontally partitions rows across multiple physical databases using a shard key for write scalability",
            "CAP theorem: A distributed data store can guarantee at most two of Consistency, Availability, and Partition Tolerance",
            "Network partitions are inevitable in distributed systems, forcing a trade-off between CP (strong consistency) and AP (eventual consistency)",
            "Challenges of sharding: Cross-shard joins, distributed transactions (2PC), and rebalancing resharding overhead"
        ],
        "optional_concepts": [
            "Consistent hashing to minimize data movement during node additions",
            "Raft or Paxos consensus algorithms for distributed leadership"
        ],
        "common_misconceptions": [
            "Believing a distributed database can guarantee all three CAP properties simultaneously over a real network",
            "Confusing read replication with horizontal write sharding"
        ],
        "rubric_weights": {
            "relevance": 0.20,
            "completeness": 0.25,
            "technical": 0.35,
            "communication": 0.20
        }
    },
    {
        "id": "fs-01",
        "domain": "fullstack",
        "role": "Full-Stack Software Engineer",
        "skill": "Web Security & Stateless Authentication",
        "difficulty": "Mid",
        "question_text": "How do JSON Web Tokens (JWT) enable stateless authentication in web applications, and how do you protect against XSS and CSRF attacks?",
        "expected_concepts": [
            "JWT structure: Header (algorithm), Payload (claims like user id, exp), and cryptographic Signature",
            "Stateless verification: Server validates token signature mathematically without querying session storage on each request",
            "XSS mitigation: Storing tokens in HttpOnly, Secure, SameSite cookies rather than localStorage to prevent JavaScript access",
            "CSRF mitigation: Implementing SameSite cookie attributes, custom anti-CSRF headers (X-Requested-With), or CSRF tokens",
            "Token expiration & rotation: Short-lived access tokens paired with revocable refresh tokens"
        ],
        "optional_concepts": [
            "Content Security Policy (CSP) headers to prevent inline malicious script injection",
            "Public-private key pairs (RS256) vs symmetric HMAC (HS256) signing"
        ],
        "common_misconceptions": [
            "Storing sensitive passwords or secrets inside the unencrypted JWT payload",
            "Believing localStorage is immune to XSS script theft"
        ],
        "rubric_weights": {
            "relevance": 0.25,
            "completeness": 0.25,
            "technical": 0.30,
            "communication": 0.20
        }
    },
    {
        "id": "devops-01",
        "domain": "devops",
        "role": "DevOps & Cloud Systems Engineer",
        "skill": "Containerization & Zero-Downtime Deployment",
        "difficulty": "Mid",
        "question_text": "How does Docker layer caching work in image building, and what is the difference between Blue-Green and Canary zero-downtime deployment strategies?",
        "expected_concepts": [
            "Docker layer caching: Each instruction (COPY, RUN) creates an immutable read-only layer; changes invalidate all subsequent layers",
            "Cache optimization: Copying dependency manifests (requirements.txt/package.json) before source code, and using multi-stage builds",
            "Blue-Green deployment: Two identical environments; router flips 100% traffic from Blue to Green after verification, enabling instant rollback",
            "Canary release: Routes traffic incrementally (e.g. 5% -> 25% -> 100%) to validate error rates and latency before full promotion",
            "Health checks and automated rollback thresholds"
        ],
        "optional_concepts": [
            "Distroless or Alpine minimal container images to reduce attack surface",
            "Kubernetes rolling update readiness and liveness probes"
        ],
        "common_misconceptions": [
            "Copying the entire source repository before installing dependencies in Dockerfiles",
            "Assuming Blue-Green deployments require zero extra compute infrastructure"
        ],
        "rubric_weights": {
            "relevance": 0.25,
            "completeness": 0.25,
            "technical": 0.30,
            "communication": 0.20
        }
    },
    {
        "id": "hr-01",
        "domain": "hr",
        "role": "Engineering Manager & Technical Lead",
        "skill": "Team Conflict Resolution & Alignment",
        "difficulty": "Senior",
        "question_text": "Tell me about a time you had a significant technical disagreement with a teammate or lead. How did you handle it, and what was the outcome?",
        "expected_concepts": [
            "Situation & Task: Clear, concrete technical context where competing approaches clashed",
            "Action: De-escalation, focusing on business requirements and customer impact over personal ego",
            "Action: Data-driven evaluation, benchmarking, or creating a time-boxed proof-of-concept prototype",
            "Action: Active listening and respectful communication to understand teammate's core concerns",
            "Result: Concrete outcome, collaborative alignment ('disagree and commit'), and key team learnings"
        ],
        "optional_concepts": [
            "Documenting decisions in an Architectural Decision Record (ADR)",
            "Conducting a post-implementation retrospective"
        ],
        "common_misconceptions": [
            "Immediately escalating to management to force a top-down ruling without peer discussion",
            "Capitulating completely without technical analysis just to avoid uncomfortable debate",
            "Assigning personal blame to the other engineer"
        ],
        "rubric_weights": {
            "relevance": 0.25,
            "completeness": 0.25,
            "technical": 0.25,
            "communication": 0.25
        }
    },
    {
        "id": "hr-02",
        "domain": "hr",
        "role": "Engineering Manager & Technical Lead",
        "skill": "Technical Debt & Engineering Hygiene",
        "difficulty": "Senior",
        "question_text": "How do you strategically balance feature delivery with technical debt repayment, and how do you foster a high-performing code review culture?",
        "expected_concepts": [
            "Categorizing debt: Distinguishing between intentional prudent debt (meeting deadlines) and reckless inadvertent debt",
            "Dedicated capacity: Allocating fixed sprint velocity (e.g. 15-20%) or stabilization periods for debt repayment",
            "Business alignment: Tying technical refactoring to measurable business metrics (cycle time, MTTR, crash rates)",
            "Code review culture: Focusing reviews on architecture, failure modes, and knowledge sharing rather than subjective nitpicking",
            "Automation: Delegating linting, formatting, and security scans to CI tools before human review"
        ],
        "optional_concepts": [
            "Using Architectural Decision Records (ADRs) to track technical compromises",
            "Establishing team SLAs on code review turnaround time"
        ],
        "common_misconceptions": [
            "Treating technical debt as purely an engineering topic without articulating product ROI to stakeholders",
            "Allowing code reviews to devolve into gatekeeping or stylistic arguments"
        ],
        "rubric_weights": {
            "relevance": 0.25,
            "completeness": 0.25,
            "technical": 0.25,
            "communication": 0.25
        }
    }
]

def init_db():
    """Create tables and seed/update sample blueprints."""
    Base.metadata.create_all(bind=engine)
    
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE questions ADD COLUMN skill VARCHAR"))
            conn.commit()
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE questions ADD COLUMN difficulty VARCHAR DEFAULT 'Mid'"))
            conn.commit()
        except Exception:
            pass

    db = SessionLocal()
    try:
        for item in SAMPLE_BLUEPRINTS:
            existing = db.query(QuestionModel).filter(QuestionModel.id == item["id"]).first()
            if existing:
                existing.domain = item["domain"]
                existing.role = item["role"]
                existing.skill = item.get("skill", "General Technical")
                existing.difficulty = item.get("difficulty", "Mid")
                existing.question_text = item["question_text"]
                existing.expected_concepts = item["expected_concepts"]
                existing.optional_concepts = item["optional_concepts"]
                existing.common_misconceptions = item["common_misconceptions"]
                existing.rubric_weights = item["rubric_weights"]
            else:
                q = QuestionModel(
                    id=item["id"],
                    domain=item["domain"],
                    role=item["role"],
                    skill=item.get("skill", "General Technical"),
                    difficulty=item.get("difficulty", "Mid"),
                    question_text=item["question_text"],
                    expected_concepts=item["expected_concepts"],
                    optional_concepts=item["optional_concepts"],
                    common_misconceptions=item["common_misconceptions"],
                    rubric_weights=item["rubric_weights"]
                )
                db.add(q)
        db.commit()
    finally:
        db.close()

def _to_dto(r: QuestionModel) -> QuestionDTO:
    return QuestionDTO(
        question_id=r.id,
        question_text=r.question_text,
        domain=r.domain,
        role=r.role,
        skill=getattr(r, "skill", None) or "General Technical",
        difficulty=getattr(r, "difficulty", None) or "Mid",
        expected_concepts=r.expected_concepts,
        optional_concepts=r.optional_concepts or [],
        common_misconceptions=r.common_misconceptions or [],
        rubric_weights=RubricWeights(**r.rubric_weights)
    )

def get_all_questions(db: Session, domain: Optional[str] = None) -> List[QuestionDTO]:
    """Fetch questions, optionally filtered by domain."""
    query = db.query(QuestionModel)
    if domain and domain.lower() != "all":
        query = query.filter(QuestionModel.domain == domain.lower())
    records = query.all()
    return [_to_dto(r) for r in records]

def get_question_by_id(db: Session, question_id: str) -> Optional[QuestionDTO]:
    """Fetch single question by question_id."""
    r = db.query(QuestionModel).filter(QuestionModel.id == question_id).first()
    if not r:
        return None
    return _to_dto(r)

def get_random_question(
    db: Session,
    domain: Optional[str] = None,
    role: Optional[str] = None,
    skill: Optional[str] = None
) -> Optional[QuestionDTO]:
    """Pick a random question matching the given optional criteria."""
    query = db.query(QuestionModel)
    if domain and domain.lower() != "all":
        query = query.filter(QuestionModel.domain == domain.lower())
    if role and role.lower() != "all":
        query = query.filter(QuestionModel.role.ilike(f"%{role}%"))
    if skill and skill.lower() != "all":
        query = query.filter(QuestionModel.skill.ilike(f"%{skill}%"))
    
    records = query.all()
    if not records:
        records = db.query(QuestionModel).all()
    if not records:
        return None
    chosen = random.choice(records)
    return _to_dto(chosen)

def get_roles_taxonomy(db: Session) -> List[RoleTaxonomyItem]:
    """Return the structured roles and skills taxonomy enriched with question counts."""
    result = []
    for item in ROLE_SKILL_TAXONOMY:
        skills_enriched = []
        for s in item["skills"]:
            q_ids = s.get("question_ids", [])
            questions_dto = []
            for qid in q_ids:
                q = get_question_by_id(db, qid)
                if q:
                    questions_dto.append(q.dict())
            skills_enriched.append({
                "skill_name": s["skill_name"],
                "description": s["description"],
                "question_ids": q_ids,
                "questions": questions_dto,
                "question_count": len(questions_dto)
            })
        result.append(
            RoleTaxonomyItem(
                role_title=item["role_title"],
                domain=item["domain"],
                description=item["description"],
                icon=item["icon"],
                skills=skills_enriched
            )
        )
    return result

def get_questions_by_role_and_skill(db: Session, role: str, skill: Optional[str] = None) -> List[QuestionDTO]:
    """Fetch questions specifically for a role and optional skill."""
    query = db.query(QuestionModel).filter(QuestionModel.role.ilike(f"%{role}%"))
    if skill:
        query = query.filter(QuestionModel.skill.ilike(f"%{skill}%"))
    records = query.all()
    return [_to_dto(r) for r in records]
