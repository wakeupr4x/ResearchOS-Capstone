# ResearchOS — System Architecture

## 1. High-Level Architectural Overview

ResearchOS is designed as a modular, full-stack literature intelligence workstation that automates the scientific research lifecycle: **Discovery → Ingestion → Understanding → Grounded QA → Extraction → Comparison → Cross-Paper Synthesis → Gap Analysis**.

```
                           ┌──────────────────────────────────────────────┐
                           │                  FRONTEND                    │
                           │   Next.js 14 + React 18 + Tailwind + Lucide  │
                           │  Dashboard • Library • Chat • Compare • Gaps │
                           └──────────────────────┬───────────────────────┘
                                                  │ REST API / JSON
                                                  ▼
                           ┌──────────────────────────────────────────────┐
                           │                FASTAPI API LAYER             │
                           │     Pydantic Schemas • Async Route Handlers  │
                           │         Background PDF Ingestion Queue       │
                           └──────────────────────┬───────────────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 ▼                                ▼                                ▼
        Document Service                  AI Orchestration                 Discovery Service
    (PyMuPDF Layout Parser,             (QueryRouter, RAG Engine,         (arXiv API Client,
     Section Header Heuristic,           Summary & Extraction,             Category Filters,
     Hierarchical Chunker)               Comparison & Gaps)                One-Click Importer)
                 │                                │
                 ▼                                ▼
        Dense Embedding Engine          Hybrid Evidence Retriever
     (SentenceTransformers Local         (Dense Vector Cosine + BM25
      all-MiniLM-L6-v2 384-dim)           Reciprocal Rank Fusion k=60)
                 │                                │
                 └────────────────┬───────────────┘
                                  ▼
                     ┌──────────────────────────┐
                     │   PERSISTENCE LAYER      │
                     │  Dual-Mode Architecture: │
                     │  • SQLite (Local Dev)    │
                     │  • PostgreSQL + pgvector │
                     │    (Production / Docker) │
                     └──────────────────────────┘
```

---

## 2. Frontend Layer (Next.js 14 App Router)

- **UI Framework**: React 18 with Next.js 14 App Router and TypeScript.
- **Design System**: Tailored dark-slate research aesthetic inspired by Linear and Notion, utilizing Tailwind CSS, Lucide icons, glassmorphic panels, and responsive grid layouts.
- **Client Architecture**:
  - `src/lib/api.ts`: Centralized, strictly-typed REST client communicating with the backend.
  - `src/types/index.ts`: Shared domain interfaces mirroring backend Pydantic DTOs.
  - `src/components/layout/AppShell.tsx`: Sticky sidebar navigation, top global search bar, and modal event dispatchers.
  - `src/app/papers/[id]/page.tsx`: Split-screen layout featuring an embedded document viewer on the left and an interactive AI tabbed research panel on the right (Overview, Chat, Summary, Extraction, Passages, Notes).

---

## 3. Backend Layer (FastAPI & Python 3.11)

- **FastAPI Framework**: Provides high-performance async request handling, auto-generated OpenAPI / Swagger documentation (`/docs`), and CORS security middleware.
- **Pydantic v2**: Strict input validation, data transfer schemas, and response serialization.
- **Background Tasks**: Non-blocking asynchronous PDF processing pipeline using FastAPI's `BackgroundTasks`, updating paper lifecycle status (`uploaded` → `processing` → `indexing` → `ready`).

---

## 4. Document Intelligence & Chunking Pipeline

1. **Ingestion & Validation**: PDF header verification, byte-length limits, and local storage isolation.
2. **Page & Section Extraction**:
   - PyMuPDF (`pymupdf`) extracts structured font metadata to identify header hierarchies (`Abstract`, `Introduction`, `Methodology`, `Results`, `Discussion`, `Limitations`, `Conclusion`).
   - Line and regular expression fallbacks handle documents with flattened or uniform font weights.
3. **Semantic Chunking**:
   - Chunks are generated on paragraph and sentence boundaries targeting 350–500 tokens with 50-token sliding overlap.
   - Every chunk retains immutable provenance: `paper_id`, `chunk_index`, `page_number`, `section_title`, and `token_count`.

---

## 5. Embeddings & Hybrid Retrieval Engine

- **Embeddings**: SentenceTransformers (`all-MiniLM-L6-v2`) computes 384-dimensional dense vectors locally on Apple Silicon MPS or CPU. Includes an offline deterministic semantic hash fallback for air-gapped environments.
- **Hybrid Retrieval**:
  - **Dense Semantic Retrieval**: Computes cosine similarity across normalized vector representations.
  - **Sparse Keyword Retrieval**: Substring and term frequency matching over title, abstract, and passage content.
  - **Reciprocal Rank Fusion (RRF)**: Combines dense and sparse rank lists using $RRF(d) = \sum \frac{1}{k + r_i}$ ($k=60$), prioritizing passages with both conceptual relevance and exact identifier matches.

---

## 6. AI Orchestration & Grounded LLM Layer

- **Modular LLM Provider**:
  - `GeminiProvider`: Connects to Google Gemini (`gemini-2.5-flash` or `gemini-1.5-flash`) via the `google-genai` SDK.
  - `OpenAIProvider`: Connects to OpenAI models (`gpt-4o-mini`, etc.).
  - `FallbackResearchProvider`: Deterministic local extraction and citation grounding engine when external API keys are omitted.
- **Grounded Verification Protocol**:
  - Prompts enforce strict attribution: every asserted fact must reference an inline bracket citation `[1]`, `[2]`.
  - Distinguishes **FACT**, **SYNTHESIS**, and **INFERENCE**.
  - Explicit notification when indexed evidence is insufficient.
