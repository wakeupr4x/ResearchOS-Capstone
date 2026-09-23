# ResearchOS — REST API Reference

Base URL: `http://localhost:8000/api`
Interactive OpenAPI Swagger Docs: `http://localhost:8000/docs`

---

## 1. System & Health

### `GET /api/health`
Returns service health, version, active LLM provider, and embedding configuration.

### `GET /api/stats`
Returns aggregated research metrics:
```json
{
  "papers_count": 3,
  "projects_count": 1,
  "conversations_count": 1,
  "insights_count": 2,
  "notes_count": 2,
  "indexed_chunks_count": 18,
  "llm_provider": "gemini",
  "embedding_provider": "sentence_transformers"
}
```

---

## 2. Papers Management

### `POST /api/papers/upload`
Uploads a scientific PDF document and enqueues document intelligence parsing.
- **Request**: `multipart/form-data` with `file: UploadFile`, `title?: str`, `tags?: str`.
- **Response**: `PaperResponse` object with `status: "uploaded"`.

### `GET /api/papers`
Lists all papers in library with optional filters:
- Query parameters: `query?: str`, `tag?: str`, `status?: str`, `is_favorite?: bool`.

### `GET /api/papers/{id}`
Returns full paper details, abstract, structured summary, extracted metadata, and indexed chunks.

### `GET /api/papers/{id}/status`
Returns ingestion pipeline progress (`uploaded`, `processing`, `indexing`, `ready`, `failed`).

### `POST /api/papers/{id}/process`
Re-runs document intelligence, section parsing, chunking, and vector indexing.

### `GET /api/papers/{id}/file`
Streams the raw PDF document for in-browser PDF viewer rendering.

### `PATCH /api/papers/{id}`
Updates paper title, authors, abstract, publication year, journal, tags, or favorite flag.

### `DELETE /api/papers/{id}`
Deletes paper record, all associated vector chunks, notes, and file from disk.

---

## 3. Research Intelligence

### `POST /api/papers/{id}/summary`
Generates or retrieves a structured executive research summary:
```json
{
  "paper_id": "...",
  "paper_title": "...",
  "executive_summary": "...",
  "research_problem": "...",
  "research_objective": "...",
  "methodology": "...",
  "dataset": "...",
  "model_approach": "...",
  "key_results": "...",
  "limitations": "...",
  "conclusion": "...",
  "key_takeaways": ["..."]
}
```

### `POST /api/papers/{id}/extract`
Extracts structured experimental variables:
- `research_problem`, `objectives`, `methodology`, `dataset`, `sample_size`, `models_algorithms`, `evaluation_metrics`, `results`, `limitations`, `future_work`.

### `POST /api/compare`
Generates side-by-side dimensional comparison matrix and cross-paper synthesis.
- **Request Body**:
  ```json
  {
    "paper_ids": ["uuid-1", "uuid-2"],
    "focus_aspect": "all"
  }
  ```

### `POST /api/literature-review`
Synthesizes themes, methodological progressions, agreements, and contradictions across selected literature.
- **Request Body**:
  ```json
  {
    "paper_ids": ["uuid-1", "uuid-2"],
    "theme_focus": "Grounded Clinical QA"
  }
  ```

### `POST /api/research-gaps`
Analyzes repeated limitations and underexplored areas to propose potential research gaps with supporting citations.
- **Request Body**:
  ```json
  {
    "paper_ids": ["uuid-1", "uuid-2"]
  }
  ```

---

## 4. Research Chat (Grounded RAG)

### `POST /api/chat`
Performs hybrid RAG over selected papers or the entire library, returning a citation-grounded response.
- **Request Body**:
  ```json
  {
    "content": "How does Med-CorrectRAG reduce hallucinations?",
    "conversation_id": "optional-uuid",
    "paper_ids": ["optional-uuid"]
  }
  ```
- **Response**:
  ```json
  {
    "conversation_id": "...",
    "message": {
      "id": "...",
      "role": "assistant",
      "content": "...",
      "citations": [
        {
          "paper_id": "...",
          "paper_title": "...",
          "page_number": 1,
          "section": "Abstract",
          "excerpt": "...",
          "score": 0.94
        }
      ]
    }
  }
  ```

### `GET /api/conversations`
Lists all user conversations.

### `GET /api/conversations/{id}`
Retrieves full conversation history and grounded citations.

### `DELETE /api/conversations/{id}`
Deletes conversation.

---

## 5. Paper Discovery

### `GET /api/discovery/search`
Searches academic repositories (arXiv API):
- Query parameters: `q: str`, `category?: str`, `max_results?: int`.
- Indicates `in_library: true/false` for each paper found.

### `POST /api/discovery/save`
Imports a discovered paper directly into the ResearchOS library.

---

## 6. Projects, Notes & Insights

- `/api/projects`: CRUD endpoints for research projects.
- `/api/notes`: CRUD endpoints for notes with paper/project linkage.
- `/api/insights`: CRUD endpoints for saved findings, quotes, and results.
