# ResearchOS — RAG Pipeline & Evidence Grounding

## 1. The RAG Lifecycle

ResearchOS implements a strict, citation-aware Retrieval-Augmented Generation (RAG) architecture:

```
[ User Query ]
       │
       ▼
[ Query Preprocessing & Normalization ]
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
[ Query Embedding (SentenceTransformers) ]   [ Lexical Query Terms (Sparse) ]
       │                                         │
       ▼                                         ▼
[ Dense Vector Similarity Search ]           [ Keyword Matching ]
       │                                         │
       └────────────────────┬────────────────────┘
                            ▼
           [ Reciprocal Rank Fusion (RRF k=60) ]
                            │
                            ▼
              [ Scope & Metadata Filtering ]
         (Filter by selected paper IDs or project)
                            │
                            ▼
               [ Top-K Context Assembly ]
     [SOURCE 1]: Title (Page 4, Methodology)...
     [SOURCE 2]: Title (Page 7, Results)...
                            │
                            ▼
                 [ LLM Generation Prompt ]
            (Factual grounding system instructions)
                            │
                            ▼
               [ Citation Extraction & UI ]
       Answer with inline [1], [2] + Citation Cards
```

---

## 2. Ingestion & Indexing Details

### 2.1 PDF Extraction (`DocumentService`)
- Uses PyMuPDF to extract text blocks, line coordinates, and font sizes.
- Detects section headings using header size heuristics and regex dictionary matching (`Abstract`, `Introduction`, `Methodology`, `Datasets`, `Results`, `Limitations`, `Conclusion`).
- Extracts abstract and document metadata.

### 2.2 Hierarchical Semantic Chunking (`ChunkingService`)
- Splits paragraphs into token-bounded passages (~350–500 tokens).
- Applies a 50-token sliding overlap between adjacent chunks to maintain context across sentence boundaries.
- Tags each chunk with:
  - `paper_id`: Parent paper UUID
  - `page_number`: 1-indexed document page
  - `section`: Detected section header
  - `token_count`: Estimated token size
  - `chunk_index`: Monotonically increasing index

### 2.3 Dense Vector Embeddings (`EmbeddingService`)
- Encodes chunk text with `all-MiniLM-L6-v2` into 384-dimensional unit-normalized float vectors.
- Embeddings are computed locally on Apple Silicon MPS or CPU.

---

## 3. Hybrid Retrieval & Reranking (`VectorStoreRepository`)

Standard dense retrieval often fails on exact scientific identifiers (e.g., specific drug names, model variants, or benchmark names like `MedQA-USMLE`), while keyword search struggles with conceptual synonymy.

ResearchOS implements **Hybrid Reciprocal Rank Fusion (RRF)**:
1. **Dense Passages**: Retrieves candidate passages ordered by cosine distance:
   $$\text{sim}(q, c) = \frac{\mathbf{q} \cdot \mathbf{c}}{\|\mathbf{q}\| \|\mathbf{c}\|}$$
2. **Sparse Passages**: Retrieves candidates containing query n-grams, scored by log-scaled term frequency.
3. **Fusion Ranking**:
   $$RRF\_Score(d) = \sum_{m \in \{dense, sparse\}} \frac{1}{60 + \text{rank}_m(d)}$$

---

## 4. Citation Grounding Rules

To eliminate hallucinated claims in scientific research:
1. **Source Labeling**: Every retrieved chunk in context is prefaced by:
   `[SOURCE N]: Paper Title (Section: X, Page Y)`
2. **Fact vs. Inference**: LLM system prompt mandates that empirical numbers, dataset names, and methodologies must cite their exact source tag.
3. **No Fabrication**: If retrieved context lacks the necessary facts to answer the question, the system must state that the indexed literature is insufficient rather than generating ungrounded extrapolations.
4. **Interactive UI Cards**: Citations are presented as clickable badges and cards displaying the paper title, page number, and the exact supporting excerpt.
