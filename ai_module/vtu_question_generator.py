
import json
import logging

import numpy as np

from llama.llama_client import ask_llama
from rag.retrieve import db, embeddings


def retrieve_vtu_context(subject, module, topic, k=4):
    """Retrieve relevant context only from VTU PDFs."""

    query = (
        f"VTU subject: {subject}. "
        f"Module: {module}. Topic: {topic}. "
        "Find academic concepts, definitions, algorithms, "
        "examples, and important questions relevant to this topic."
    )

    data = db.get(include=["documents", "metadatas", "embeddings"])

    documents = data.get("documents") or []
    metadata = data.get("metadatas") or []
    vectors = data.get("embeddings")

    if not documents or vectors is None:
        raise ValueError("ChromaDB contains no indexed documents.")

    query_vector = np.asarray(
        embeddings.embed_query(query), dtype=np.float32
    )
    query_norm = np.linalg.norm(query_vector)

    matches = []

    for index, document in enumerate(documents):
        source = (metadata[index] or {}).get("source", "")
        normalized_source = source.replace("\\", "/").upper()

        # Only retrieve material from the VTU knowledge base.
        if "/KNOWLEDGE_BASE/VTU/" not in normalized_source:
            continue

        if not document or index >= len(vectors):
            continue

        vector = np.asarray(vectors[index], dtype=np.float32)
        vector_norm = np.linalg.norm(vector)

        if query_norm == 0 or vector_norm == 0:
            continue

        similarity = float(
            np.dot(query_vector, vector) / (query_norm * vector_norm)
        )

        matches.append((similarity, document, source))

    matches.sort(key=lambda item: item[0], reverse=True)
    selected = matches[:k]

    if not selected:
        raise ValueError("No VTU documents found in ChromaDB.")

    context = "\n\n".join(item[1] for item in selected)
    sources = list(dict.fromkeys(item[2] for item in selected))

    return {"context": context, "sources": sources}


def generate_vtu_question(subject, module, topic):
    """Generate one VTU question and its expected answer using Llama."""

    retrieved = retrieve_vtu_context(subject, module, topic)

    prompt = f"""
You are generating a university examination question for VTU students.

Subject: {subject}
Module: {module}
Topic: {topic}

Use ONLY the academic information in the retrieved context below.
Do not invent syllabus details or introduce unrelated topics.
Create exactly ONE clear, technically correct examination question
and a concise model answer suitable for evaluating a student's response.

Retrieved VTU context:
{retrieved["context"]}

Return valid JSON with exactly these fields:
{{
  "question": "The generated question",
  "expected_answer": "The model answer",
  "difficulty": "Easy, Medium, or Hard"
}}

Do not include Markdown fences or text outside the JSON.
"""

    raw = ask_llama(prompt, max_tokens=500, response_format="json")

    if not raw:
        raise RuntimeError("Llama did not return a question.")

    try:
        result = json.loads(raw)
    except (json.JSONDecodeError, TypeError) as error:
        logging.error("Invalid VTU question JSON: %s", raw)
        raise RuntimeError("Llama returned invalid JSON.") from error

    question = result.get("question")
    expected_answer = result.get("expected_answer")
    difficulty = str(result.get("difficulty", "Medium")).capitalize()

    if not isinstance(question, str) or not question.strip():
        raise RuntimeError("Generated question is empty.")

    if not isinstance(expected_answer, str) or not expected_answer.strip():
        raise RuntimeError("Generated expected answer is empty.")

    if difficulty not in {"Easy", "Medium", "Hard"}:
        difficulty = "Medium"

    return {
        "question": question.strip(),
        "expected_answer": expected_answer.strip(),
        "difficulty": difficulty,
        "topic": topic,
        "subject": subject,
        "module": module,
        "sources": retrieved["sources"],
    }
