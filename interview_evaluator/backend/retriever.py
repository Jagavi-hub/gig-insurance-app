from typing import List, Dict, Any, Tuple
from kb_loader import get_chroma_client, get_embedding_function

DEFAULT_SIMILARITY_THRESHOLD = 0.35

def retrieve_context(
    domain: str,
    query: str,
    top_k: int = 4,
    similarity_threshold: float = DEFAULT_SIMILARITY_THRESHOLD
) -> Dict[str, Any]:
    """
    Retrieve top-k relevant chunks from ChromaDB for the given domain and query.
    Calculates cosine similarity and detects if reference grounding is insufficient.
    
    Returns:
        {
            "chunks": [
                {
                    "chunk_id": str,
                    "text": str,
                    "source": str,
                    "similarity_score": float
                }
            ],
            "max_similarity": float,
            "insufficient_reference": bool
        }
    """
    client = get_chroma_client()
    collection_name = f"kb_{domain.lower()}"
    emb_fn = get_embedding_function()

    try:
        collection = client.get_collection(name=collection_name, embedding_function=emb_fn)
    except Exception as e:
        print(f"[Retriever] Collection {collection_name} not found or unavailable ({e}). Marking insufficient reference.")
        return {
            "chunks": [],
            "max_similarity": 0.0,
            "insufficient_reference": True
        }

    total_docs = collection.count()
    if total_docs == 0:
        return {
            "chunks": [],
            "max_similarity": 0.0,
            "insufficient_reference": True
        }

    actual_k = min(top_k, total_docs)
    results = collection.query(
        query_texts=[query],
        n_results=actual_k,
        include=["documents", "metadatas", "distances"]
    )

    docs = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]
    ids = results.get("ids", [[]])[0]

    retrieved_chunks = []
    max_sim = 0.0

    for i in range(len(docs)):
        dist = distances[i] if i < len(distances) else 1.0
        # For cosine distance, similarity is 1 - distance
        sim = max(0.0, min(1.0, 1.0 - dist))
        if sim > max_sim:
            max_sim = sim
            
        source = metadatas[i].get("source", "unknown") if i < len(metadatas) else "unknown"
        chunk_id = ids[i] if i < len(ids) else f"chunk_{i}"

        retrieved_chunks.append({
            "chunk_id": chunk_id,
            "text": docs[i],
            "source": source,
            "similarity_score": round(sim, 3)
        })

    # Sort chunks descending by similarity
    retrieved_chunks.sort(key=lambda x: x["similarity_score"], reverse=True)

    insufficient_reference = (max_sim < similarity_threshold) or (len(retrieved_chunks) == 0)

    return {
        "chunks": retrieved_chunks,
        "max_similarity": round(max_sim, 3),
        "insufficient_reference": insufficient_reference
    }
