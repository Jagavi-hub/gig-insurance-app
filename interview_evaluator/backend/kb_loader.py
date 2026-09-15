import os
import glob
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
KB_ROOT = os.path.join(BACKEND_DIR, "knowledge_base")
CHROMA_DIR = os.path.join(BACKEND_DIR, "chroma_db")

class LocalEmbeddingFunction(EmbeddingFunction):
    """Local SentenceTransformer embedding function for ChromaDB without external APIs."""
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        print(f"[KBLoader] Loading local embedding model: {model_name}...")
        self.model = SentenceTransformer(model_name)

    def name(self) -> str:
        return "all-MiniLM-L6-v2"

    def __call__(self, input: Documents) -> Embeddings:
        embeddings = self.model.encode(input, convert_to_numpy=True, show_progress_bar=False)
        return embeddings.tolist()

_embedding_fn = None
def get_embedding_function():
    global _embedding_fn
    if _embedding_fn is None:
        _embedding_fn = LocalEmbeddingFunction()
    return _embedding_fn

def chunk_text(text: str, chunk_size_tokens: int = 300, overlap_tokens: int = 50) -> List[str]:
    """
    Chunk markdown/plain text with sliding window.
    ~300 tokens is roughly 225 words with 35 words overlap.
    """
    words = text.split()
    if not words:
        return []
    
    words_per_chunk = max(20, int(chunk_size_tokens * 0.75))
    overlap_words = max(5, int(overlap_tokens * 0.75))
    step = max(1, words_per_chunk - overlap_words)
    
    chunks = []
    for i in range(0, len(words), step):
        chunk_slice = words[i : i + words_per_chunk]
        chunk = " ".join(chunk_slice).strip()
        if len(chunk) > 30:  # Skip tiny residual fragments
            chunks.append(chunk)
    return chunks

def get_chroma_client():
    """Return persistent ChromaDB client."""
    os.makedirs(CHROMA_DIR, exist_ok=True)
    return chromadb.PersistentClient(path=CHROMA_DIR)

def load_and_index_domain(domain: str, force_reload: bool = False) -> int:
    """
    Ingest .md and .txt files from knowledge_base/<domain>/ into Chroma collection kb_<domain>.
    """
    domain_dir = os.path.join(KB_ROOT, domain)
    if not os.path.exists(domain_dir):
        print(f"[KBLoader] Domain folder does not exist: {domain_dir}")
        return 0

    client = get_chroma_client()
    collection_name = f"kb_{domain.lower()}"
    emb_fn = get_embedding_function()

    if force_reload:
        try:
            client.delete_collection(collection_name)
            print(f"[KBLoader] Resetting collection {collection_name}")
        except Exception:
            pass

    collection = client.get_or_create_collection(
        name=collection_name,
        embedding_function=emb_fn,
        metadata={"hnsw:space": "cosine"}
    )

    # Check if already populated
    if not force_reload and collection.count() > 0:
        print(f"[KBLoader] Collection {collection_name} already contains {collection.count()} chunks. Skipping reload.")
        return collection.count()

    doc_files = glob.glob(os.path.join(domain_dir, "*.md")) + glob.glob(os.path.join(domain_dir, "*.txt"))
    all_chunks = []
    all_metadatas = []
    all_ids = []

    for file_path in doc_files:
        filename = os.path.basename(file_path)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        file_chunks = chunk_text(content)
        for idx, chunk in enumerate(file_chunks):
            chunk_id = f"{domain}_{filename}_{idx}"
            all_chunks.append(chunk)
            all_metadatas.append({
                "domain": domain,
                "source": filename,
                "chunk_index": idx
            })
            all_ids.append(chunk_id)

    if all_chunks:
        # Chroma handles batches
        batch_size = 50
        for i in range(0, len(all_chunks), batch_size):
            collection.upsert(
                documents=all_chunks[i : i + batch_size],
                metadatas=all_metadatas[i : i + batch_size],
                ids=all_ids[i : i + batch_size]
            )
        print(f"[KBLoader] Successfully indexed {len(all_chunks)} chunks for domain '{domain}'.")

    return len(all_chunks)

def load_all_domains(force_reload: bool = False):
    """Scan knowledge_base/ and index every domain folder."""
    if not os.path.exists(KB_ROOT):
        print(f"[KBLoader] Knowledge base root not found: {KB_ROOT}")
        return

    domains = [d for d in os.listdir(KB_ROOT) if os.path.isdir(os.path.join(KB_ROOT, d))]
    print(f"[KBLoader] Discovered domains: {domains}")
    for d in domains:
        load_and_index_domain(d, force_reload=force_reload)

if __name__ == "__main__":
    print("[KBLoader] Starting Knowledge Base Ingestion...")
    load_all_domains(force_reload=True)
    print("[KBLoader] Ingestion complete.")
