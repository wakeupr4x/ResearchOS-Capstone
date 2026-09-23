# ResearchOS — Database Schema & Data Models

## 1. Relational Entity-Relationship Model

ResearchOS utilizes an entity-relationship schema built on SQLAlchemy with full PostgreSQL + pgvector support and SQLite compatibility for local zero-dependency development.

```
┌─────────────────────────┐           ┌───────────────────────────┐
│         papers          │           │     research_projects     │
├─────────────────────────┤           ├───────────────────────────┤
│ id (PK, String 36)      │◄──┐   ┌──►│ id (PK, String 36)        │
│ title (String 500)      │   │   │   │ name (String 255)         │
│ authors (JSON List)     │   │   │   │ description (Text)        │
│ abstract (Text)         │   │   │   │ tags (JSON List)          │
│ publication_year (Int)  │   │   │   │ created_at (DateTime)     │
│ journal (String 255)    │   │   │   │ updated_at (DateTime)     │
│ doi (String 255)        │   │   │   └─────────────┬─────────────┘
│ url (String 1000)       │   │   │                 │
│ source (String 50)      │   │   │                 │
│ file_path (String 1000) │   │   │                 │
│ status (String 50)      │   │   │                 │
│ page_count (Int)        │   │   │                 │
│ tags (JSON List)        │   │   │                 │
│ is_favorite (Boolean)   │   │   │                 │
│ extracted_metadata (JSON│   │   │                 │
│ summary (JSON)          │   │   │                 │
│ created_at (DateTime)   │   │   │                 │
│ updated_at (DateTime)   │   │   │                 │
└───────────┬─────────────┘   │   │                 │
            │                 │   │                 │
            ▼                 │   │                 │
┌─────────────────────────┐   │   │                 │
│     document_chunks     │   │   │                 │
├─────────────────────────┤   │   │                 │
│ id (PK, String 36)      │   │   │                 │
│ paper_id (FK -> papers) │   │   │                 │
│ chunk_index (Int)       │   │   │                 │
│ page_number (Int)       │   │   │                 │
│ section (String 100)    │   │   │                 │
│ content (Text)          │   │   │                 │
│ token_count (Int)       │   │   │                 │
│ embedding (JSON/Vector) │   │   │                 │
│ created_at (DateTime)   │   │   │                 │
└─────────────────────────┘   │   │                 │
                              │   │                 │
               ┌──────────────┴───┴───────┐         │
               │      paper_projects      │         │
               ├──────────────────────────┤         │
               │ paper_id (FK -> papers)  │         │
               │ project_id (FK -> proj)  │         │
               └──────────────────────────┘         │
                                                    │
       ┌────────────────────────────────────────────┴──────────────────────────┐
       ▼                                            ▼                          ▼
┌─────────────────────────┐            ┌─────────────────────────┐  ┌─────────────────────┐
│      conversations      │            │          notes          │  │   saved_insights    │
├─────────────────────────┤            ├─────────────────────────┤  ├─────────────────────┤
│ id (PK, String 36)      │            │ id (PK, String 36)      │  │ id (PK, String 36)  │
│ title (String 255)      │            │ title (String 255)      │  │ title (String 255)  │
│ project_id (FK -> proj) │            │ content (Text)          │  │ insight_type (Str)  │
│ paper_ids (JSON List)   │            │ paper_id (FK -> papers) │  │ content (Text)      │
│ created_at (DateTime)   │            │ project_id (FK -> proj) │  │ paper_id (FK)       │
│ updated_at (DateTime)   │            │ tags (JSON List)        │  │ paper_title (Str)   │
└───────────┬─────────────┘            │ created_at (DateTime)   │  │ page_number (Int)   │
            │                          │ updated_at (DateTime)   │  │ project_id (FK)     │
            ▼                          └─────────────────────────┘  │ tags (JSON List)    │
┌─────────────────────────┐                                         │ created_at (DateTime│
│        messages         │                                         └─────────────────────┘
├─────────────────────────┤
│ id (PK, String 36)      │
│ conversation_id (FK)    │
│ role (String 50)        │
│ content (Text)          │
│ citations (JSON List)   │
│ created_at (DateTime)   │
└─────────────────────────┘
```

---

## 2. Table Specifications

### 2.1 `papers`
Stores metadata and ingestion status for scientific publications.
- `status` values: `uploaded`, `processing`, `indexing`, `ready`, `failed`.
- `summary`: JSON object containing executive summary, methodology, datasets, results, limitations, and takeaways.
- `extracted_metadata`: JSON object containing structured variable extractions.

### 2.2 `document_chunks`
Stores segmented passages with section provenance.
- In PostgreSQL + pgvector: uses `vector(384)` with IVFFlat or HNSW indexing.
- In SQLite development mode: stored as JSON float array with numpy-accelerated cosine distance search.

### 2.3 `conversations` & `messages`
Maintains conversational RAG history.
- `paper_ids`: Scopes chat retrieval to specific papers or all indexed publications.
- `citations`: Stored JSON list of references containing `paper_id`, `paper_title`, `page_number`, `chunk_id`, `section`, `excerpt`, and `score`.

### 2.4 `research_projects` & `paper_projects`
Enables organizing literature into research workspaces. Supports many-to-many relationships between papers and projects.

### 2.5 `notes` & `saved_insights`
Stores user notes and extracted evidence bookmarks with explicit links to source papers and page numbers.
