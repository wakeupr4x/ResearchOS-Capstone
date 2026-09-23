# ResearchOS 🔬
### AI-Powered Research & Knowledge Intelligence Platform

ResearchOS is a full-stack, production-grade AI literature intelligence platform built for researchers, scientists, and engineers. It moves beyond standard document chatbots by supporting the entire scientific research lifecycle: **Discover → Ingest → Understand → Grounded QA → Extract → Compare → Synthesize → Identify Gaps → Organize Research**.

---

## Table of Contents
1. [Problem Statement & Vision](#problem-statement--vision)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [RAG Pipeline & Evidence Grounding](#rag-pipeline--evidence-grounding)
6. [Database Design](#database-design)
7. [Repository Structure](#repository-structure)
8. [Installation & Setup](#installation--setup)
9. [Running Locally](#running-locally)
10. [API Documentation](#api-documentation)
11. [Testing & Evaluation](#testing--evaluation)
12. [Future Scope](#future-scope)
13. [License](#license)

---

## Problem Statement & Vision

Modern researchers face an exponential deluge of scientific literature. General-purpose conversational LLMs suffer from severe factual hallucinations, lack document page-level traceability, cannot reliably parse complex academic PDF layouts, and cannot perform multi-paper comparative synthesis without context degradation.

**ResearchOS** bridges this gap by providing:
- **Zero-Fabrication Research Grounding**: Every asserted finding cites exact paper sections and page numbers (`[1] Paper Title — Page X`).
- **Layout-Aware PDF Intelligence**: Hierarchical section detection (`Abstract`, `Methodology`, `Datasets`, `Results`, `Limitations`) preserving document provenance.
- **Hybrid Reciprocal Rank Fusion (RRF)**: Combines 384-dimensional dense semantic representations with sparse lexical keyword matching.
- **Cross-Paper Synthesis**: Side-by-side comparative matrices, automated literature reviews, and evidence-backed potential research gap identification.
- **Offline & Zero-Config Ready**: Runs completely on local embeddings and local deterministic research synthesis out of the box, with instant configuration switches to Google Gemini or OpenAI.

---

## Key Features

- 📊 **Research Dashboard**: Literature statistics, recent publications, active projects, recent chat threads, and saved findings.
- 🔎 **Academic Discovery**: Live arXiv search with category filters (cs.AI, cs.CL, cs.LG, q-bio, etc.) and one-click library saving.
- 📚 **Paper Library**: Full-text repository with tag filters, favorites, list/grid views, and multi-paper select actions.
- 📄 **Split-Screen Paper Workspace**: Embedded PDF document viewer on the left side-by-side with an interactive tabbed AI research panel (Overview, Chat, Summary, Extraction, Passages, Notes).
- 💬 **Research Chat**: Conversational RAG with flexible scope (Search Entire Library, Project Scope, or Single Paper), inline citation badges, and source preview cards.
- ⚖️ **Multi-Paper Comparison Matrix**: Side-by-side comparative table analyzing 2–4 papers across core problems, methodologies, datasets, results, and limitations.
- 📝 **Literature Review Synthesis**: Thematic synthesis across papers comparing agreements, contradictions, and methodological progressions.
- 💡 **Potential Research Gap Analysis**: AI-assisted hypothesis identification highlighting observed underexplored areas and repeated author limitations with supporting evidence.
- 🗂️ **Research Projects & Notes**: Organize publications into research workspaces with Markdown notes and bookmarked findings.

---

## System Architecture

```
                    ┌────────────────────────────────────────┐
                    │          NEXT.JS 14 FRONTEND           │
                    │   React 18 + TypeScript + Tailwind     │
                    └───────────────────┬────────────────────┘
                                        │ REST API / JSON
                                        ▼
                    ┌────────────────────────────────────────┐
                    │          FASTAPI API BACKEND           │
                    │       Python 3.11 + Pydantic v2        │
                    └───────────────────┬────────────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
  Document Service               Research Service               Discovery Service
 (PyMuPDF Extraction,          (QueryRouter, Hybrid RAG,       (Live arXiv API,
  Section Detection,            Summary & Extraction,           Metadata Parsing,
  Semantic Chunking)            Comparison & Gap Analysis)      One-Click Importer)
         │                              │
         ▼                              ▼
  Dense Embeddings              Context Reranker
 (SentenceTransformers         (Reciprocal Rank Fusion
  all-MiniLM-L6-v2)             k=60 Dense + Sparse)
         │                              │
         └──────────────┬───────────────┘
                        ▼
          ┌───────────────────────────┐
          │     STORAGE / DATABASE    │
          │   SQLite Vector (Local)   │
          │             OR            │
          │  PostgreSQL + pgvector    │
          └───────────────────────────┘
```

For in-depth details, see [`docs/architecture.md`](docs/architecture.md).

---

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide React icons.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, Uvicorn, PyMuPDF (`fitz`), NumPy, SciPy.
- **Embeddings**: `sentence-transformers` (`all-MiniLM-L6-v2`, 384-dimensional dense vectors, local & offline).
- **AI / LLM Orchestration**:
  - Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`) via `google-genai` SDK.
  - OpenAI API (`gpt-4o-mini`, `gpt-4o`) via `openai` SDK.
  - Built-in Local Grounded Research Synthesis Fallback (zero external dependencies).
- **Database**:
  - **Local Development**: Automatic SQLite with vector storage & NumPy cosine similarity.
  - **Production / Docker**: PostgreSQL 16 with `pgvector`.
- **Search & Discovery**: Live arXiv REST API, BM25-style lexical matching, dense vector retrieval, Reciprocal Rank Fusion.

---

## RAG Pipeline & Evidence Grounding

ResearchOS enforces strict academic grounding rules:
1. **Hierarchical Extraction**: Papers are parsed into structured pages with font-size based section detection.
2. **Provenance Preservation**: Chunks (~400 tokens with 50-token overlap) retain page numbers, section titles, and paper IDs.
3. **Hybrid RRF**: Combines dense semantic similarity with sparse keyword matching.
4. **Traceable Citations**: Generated answers map assertions to exact source tags `[1]`, `[2]`, displaying paper titles, page numbers, and verbatim excerpts.
5. **No Hallucinations**: When evidence is missing, the system explicitly reports insufficient literature context.

For detailed pipeline documentation, see [`docs/rag.md`](docs/rag.md).

---

## Repository Structure

```
ResearchOS - Capstone/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application & lifespan startup
│   │   ├── config/settings.py       # Pydantic environment configuration
│   │   ├── api/                     # REST endpoints (papers, chat, research, discovery, etc.)
│   │   ├── models/entities.py       # SQLAlchemy database entities
│   │   ├── schemas/dto.py           # Pydantic v2 DTO models
│   │   ├── services/                # Document extraction, chunking, embedding, storage
│   │   ├── ai/                      # Modular LLM providers (Gemini, OpenAI, Fallback)
│   │   ├── rag/rag_service.py       # Hybrid RRF RAG pipeline
│   │   ├── repositories/            # Database session and vector store repository
│   │   └── seed/sample_data.py      # Demo paper PDF generator & seeder
│   ├── tests/test_backend.py        # Pytest test suite (14 test cases)
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/                     # Next.js 14 App Router pages
│   │   │   ├── page.tsx             # Dashboard
│   │   │   ├── discover/page.tsx    # Academic discovery (arXiv)
│   │   │   ├── library/page.tsx     # Paper library (grid/list, multi-select)
│   │   │   ├── papers/[id]/page.tsx # Split-screen PDF viewer & AI research panel
│   │   │   ├── chat/page.tsx        # Research Chat with citations
│   │   │   ├── compare/page.tsx     # Multi-paper comparison matrix
│   │   │   ├── insights/page.tsx    # Findings, literature review & research gaps
│   │   │   ├── projects/page.tsx    # Research projects
│   │   │   ├── notes/page.tsx       # Research notes
│   │   │   └── settings/page.tsx    # System health & provider configuration
│   │   ├── components/              # AppShell, Sidebar, TopNav, UploadModal
│   │   ├── lib/api.ts               # Typed API client
│   │   └── types/index.ts           # TypeScript domain interfaces
│   ├── package.json
│   └── tailwind.config.js
│
├── evaluation/
│   ├── eval_rag.py                  # RAG citation & grounding evaluation benchmark
│   └── test_queries.json            # Ground-truth test queries
│
├── docs/
│   ├── architecture.md              # System architecture documentation
│   ├── rag.md                       # RAG pipeline & grounding documentation
│   ├── database.md                  # Database schema & entity documentation
│   └── api.md                       # REST API endpoint reference
│
├── scripts/
│   ├── start_all.sh                 # Starts both backend & frontend with cleanup
│   ├── start_backend.sh             # Starts FastAPI backend
│   ├── start_frontend.sh            # Starts Next.js frontend
│   └── run_tests.sh                 # Executes backend tests, eval, and frontend build
│
├── docker-compose.yml               # PostgreSQL + pgvector Docker compose configuration
├── .env.example
└── README.md
```

---

## Installation & Setup

### Prerequisites
- **Python 3.11**
- **Node.js v18+ or v20+**
- (Optional) **Docker** for running PostgreSQL with pgvector

### Quick Setup

1. **Clone the repository**:
   ```bash
   cd "ResearchOS - Capstone"
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example backend/.env
   ```
   *(Optional: Add your `GEMINI_API_KEY` or `OPENAI_API_KEY` in `backend/.env` to enable cloud frontier models. If omitted, the built-in local research engine runs automatically).*

3. **Install Dependencies**:
   - Backend:
     ```bash
     cd backend
     ~/.local/bin/uv venv --python 3.11 .venv
     source .venv/bin/activate
     pip install -r requirements.txt
     cd ..
     ```
   - Frontend:
     ```bash
     cd frontend
     npm install
     cd ..
     ```

---

## Running Locally

### Option 1: Start Both Frontend and Backend (Recommended)
```bash
./scripts/start_all.sh
```
This boots:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Option 2: Start Separately
- In Terminal 1 (Backend):
  ```bash
  ./scripts/start_backend.sh
  ```
- In Terminal 2 (Frontend):
  ```bash
  ./scripts/start_frontend.sh
  ```

### Option 3: Production PostgreSQL via Docker Compose
To run PostgreSQL with `pgvector`:
```bash
docker compose up -d postgres
```
Then set `DATABASE_URL=postgresql://researchos:researchos_secret@localhost:5432/researchos` in `backend/.env`.

---

## Testing & Evaluation

Execute the complete verification pipeline:
```bash
./scripts/run_tests.sh
```

This runs:
1. **Pytest Backend Test Suite** (14 automated tests covering health, stats, papers CRUD, RAG QA, summaries, extractions, comparison, literature review, gaps, projects, notes, and insights).
2. **RAG Evaluation Suite** (`evaluation/eval_rag.py`), reporting citation precision, grounding recall, and query latency across benchmark clinical and architectural queries.
3. **Frontend Production Build** (`npm run build`), verifying TypeScript types and static page generation.

---

## Future Scope

- 🌐 Cross-document citation graph visualization (D3/Canvas).
- 👁️ Multimodal scientific layout understanding for complex charts, tables, and mathematical formulas.
- 📑 Automated BibTeX export and LaTeX integration.
- 🤖 Autonomous multi-agent literature synthesizers.

---

## License

Apache 2.0. Built for scientific research and literature intelligence.
