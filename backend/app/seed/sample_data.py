import os
import uuid
import logging
from datetime import datetime
import pymupdf  # PyMuPDF
from sqlalchemy.orm import Session
from app.models.entities import Paper, DocumentChunk, ResearchProject, Conversation, Message, Note, SavedInsight
from app.services.chunking_service import ChunkingService
from app.services.embedding_service import embedding_service
from app.repositories.vector_store import VectorStoreRepository

logger = logging.getLogger(__name__)

SAMPLE_PAPERS_DATA = [
    {
        "title": "Self-Correcting Retrieval-Augmented Generation for Clinical Question Answering",
        "authors": ["Dr. Elena Rostova", "Marcus Vance", "Sarah Chen"],
        "publication_year": 2024,
        "journal": "Journal of Biomedical Informatics (Open Access)",
        "doi": "10.1016/j.jbi.2024.104512",
        "tags": ["Clinical AI", "RAG", "Self-Correction", "Healthcare"],
        "sections": [
            ("Abstract", """Abstract—Retrieval-Augmented Generation (RAG) models have emerged as standard architectures for domain-specific question answering. However, hallucination risks remain unacceptable in clinical domains. We introduce Med-CorrectRAG, a self-correcting RAG pipeline that evaluates factual consistency and recalibrates retrieved evidence using confidence-weighted ranking. On clinical benchmarks, our system reduces medical hallucinations by 38.4% while improving citation precision by 24.1% over naive dense retrieval."""),
            ("Introduction", """1. Introduction
Clinical decision support requires extreme precision. When general-purpose LLMs generate medical diagnoses or treatment dosages without grounding, severe patient safety hazards arise. While basic retrieval architectures inject PubMed excerpts into the LLM context, naive semantic similarity often retrieves superficially related but factually irrelevant clinical trials. In this work, we formalize the problem of active evidence verification and introduce a multi-stage confidence scoring layer."""),
            ("Methodology", """2. Methodology
Med-CorrectRAG operates in three distinct phases:
1. Hierarchical Clinical Chunking: Medical guidelines and clinical trial reports are parsed with semantic section boundaries preserved.
2. Dual-Encoder Reranking: Query embeddings generated via BioLinkBERT are matched against indexed chunks and subsequently scored via a cross-encoder reranker.
3. Iterative Hallucination Critique: Candidate answers undergo automated self-critique checking whether each asserted medical fact is directly supported by an indexed source chunk."""),
            ("Dataset & Benchmarks", """3. Experiments & Datasets
We evaluate our system on three standard medical QA benchmarks:
- PubMedQA: 1,000 biomedical expert-annotated questions with labeled reasoning.
- MedQA-USMLE: 1,273 four-option multiple choice medical examination questions.
- BioASQ-11b: Diagnostic assertion split with expert gold-standard citation lists."""),
            ("Results", """4. Results & Empirical Findings
Med-CorrectRAG achieves an accuracy of 82.4% on MedQA (compared to 71.2% for standard baseline RAG) and an F1 score of 89.1% on PubMedQA. Most importantly, citation recall reached 94.6%, ensuring that clinical recommendations were traceable to peer-reviewed trial literature. Inference latency averaged 410ms on an A100 GPU."""),
            ("Limitations & Conclusion", """5. Limitations and Future Work
Primary limitations include dependency on high-quality clinical knowledge bases and degraded performance on rare pediatric syndromes with sparse training data. Furthermore, table and dosage chart extraction remains an open challenge. Future work will extend Med-CorrectRAG to multi-modal radiology reports and real-time electronic health record (EHR) integration."""),
        ]
    },
    {
        "title": "Benchmarking Small Language Models on Domain-Specific Document Extraction",
        "authors": ["Kenji Sato", "David Miller", "Amina Al-Mansoor"],
        "publication_year": 2024,
        "journal": "Transactions of the Association for Computational Linguistics",
        "doi": "10.1162/tacl_a_00589",
        "tags": ["Small LLMs", "Document Intelligence", "Quantization", "Efficiency"],
        "sections": [
            ("Abstract", """Abstract—Deploying large language models with hundreds of billions of parameters in edge or enterprise private clouds is constrained by inference budget and hardware memory limits. In this paper, we present an exhaustive benchmark of modern Small Language Models (SLMs, 1B to 8B parameters) on structured scientific information extraction. We evaluate Llama-3-8B, Phi-3-mini, and Mistral-7B across complex extraction tasks, demonstrating that 4-bit quantized SLMs fine-tuned with Low-Rank Adaptation (LoRA) match or exceed proprietary frontier models on specialized schema extraction while reducing inference costs by 87%."""),
            ("Introduction", """1. Introduction
Enterprise research teams frequently process tens of thousands of PDF publications and technical patents annually. Sending these documents through commercial API endpoints introduces prohibitive recurring expenses and privacy compliance issues. Small Language Models present an attractive on-premise alternative. However, empirical literature lacks rigorous benchmarks assessing whether SLMs can reliably parse nested JSON schemas and extract experimental parameters without syntax degradation."""),
            ("Methodology & Experimental Setup", """2. Architecture and Quantization
We benchmark three leading open-weights model families:
- Phi-3-Mini (3.8B parameters, 128k context window)
- Llama-3-8B (8B parameters, 8k context window)
- Mistral-7B-Instruct-v0.3 (7.3B parameters, 32k context window)
Each model is evaluated in three precision formats: FP16 unquantized, AWQ 4-bit, and GGUF Q4_K_M. Fine-tuning is performed using QLoRA with rank r=32 and alpha=64 over 10,000 annotated scientific papers."""),
            ("Results & Efficiency", """3. Comparative Results
Fine-tuned Llama-3-8B achieved an extraction F1 score of 91.2% on experimental metrics, outperforming base GPT-4o (89.5%) on domain-specific terminology. Phi-3-mini achieved 86.8% F1 with a throughput of 142 tokens/sec on an Apple M3 Max unified memory chip. 4-bit quantization resulted in less than 1.2% degradation in schema validity across all test sets."""),
            ("Limitations & Discussion", """4. Limitations and Future Work
While SLMs excel at single-paper extraction, they exhibit context degradation on multi-document cross-referencing exceeding 16,000 tokens. In addition, reasoning over multi-column tables with merged cells requires explicit vision pre-processing. Subsequent research should investigate hybrid visual-language SLMs for dense technical layout understanding."""),
        ]
    },
    {
        "title": "Knowledge Graph Augmented Hybrid Search in Dense Biomedical Corpora",
        "authors": ["Michael Chang", "Sophia Patel", "Liam O'Connor"],
        "publication_year": 2023,
        "journal": "NeurIPS Proceedings on Graph Learning & Information Retrieval",
        "doi": "10.48550/arXiv.2311.09452",
        "tags": ["Knowledge Graphs", "Hybrid Search", "Biomedical NLP", "Dense Retrieval"],
        "sections": [
            ("Abstract", """Abstract—Dense vector retrieval maps text passages into continuous representation spaces, excelling at semantic synonymy but frequently failing on multi-hop associative queries and exact identifier matching. In this paper, we propose Graph-HybridSearch, a unified retrieval architecture integrating Neo4j-style biological knowledge graphs with dense BM25 and vector indices. Evaluated across 2.4 million biomedical papers, our hybrid framework demonstrates a 31.8% gain in multi-hop question retrieval recall over vector-only search."""),
            ("Introduction", """1. Introduction
Scientific research discovery requires resolving complex associative questions, such as: 'Which kinase inhibitors targeting the EGFR L858R mutation show efficacy in non-small cell lung cancer with secondary T790M resistance?' Standard dense semantic search returns papers discussing EGFR inhibitors in general, but fails to isolate the precise intersection of biological entities. Graph-structured retrieval explicitly models gene-disease-drug relations."""),
            ("Methodology & Graph Fusion", """2. System Architecture
Graph-HybridSearch employs a three-tier reciprocal rank fusion (RRF):
1. Sparse Lexical Tier: BM25 index over title, abstract, and full-text keywords.
2. Dense Semantic Tier: BGE-large-en-v1.5 dense vector embeddings.
3. Structured Graph Traversal: Subgraph expansion from identified entity nodes (genes, diseases, compounds) using Graph Neural Network (GNN) entity linkers.
The resulting candidates are combined using Reciprocal Rank Fusion with rank parameter k=60."""),
            ("Evaluation & Findings", """3. Experimental Findings
On the BioMed-MultiHop benchmark (consisting of 5,000 two-hop and three-hop biomedical queries), Graph-HybridSearch achieved Recall@10 of 88.4%, compared to 56.6% for pure dense retrieval and 62.1% for BM25. Mean reciprocal rank (MRR) improved from 0.48 to 0.76. Graph traversal introduced a modest 22ms overhead per query."""),
            ("Limitations & Conclusion", """4. Limitations and Open Questions
Maintaining and updating the biological entity graph requires continuous entity normalization as new chemical entities and disease ontologies are registered. Incomplete graph links can lead to blind spots. We intend to explore dynamic LLM-driven graph extraction directly from newly published preprints."""),
        ]
    }
]


def create_sample_pdf(file_path: str, title: str, authors: list, sections: list) -> int:
    """Generates a real PDF file using PyMuPDF."""
    doc = pymupdf.open()

    # Cover / First page
    page = doc.new_page(width=595, height=842)  # A4

    y = 60
    # Title
    page.insert_text((50, y), title[:60], fontsize=16, fontname="helv", color=(0.1, 0.1, 0.2))
    if len(title) > 60:
        y += 22
        page.insert_text((50, y), title[60:120], fontsize=16, fontname="helv", color=(0.1, 0.1, 0.2))

    y += 30
    # Authors
    author_str = ", ".join(authors)
    page.insert_text((50, y), f"Authors: {author_str}", fontsize=10, fontname="helv", color=(0.3, 0.3, 0.4))

    y += 35
    for sec_title, sec_text in sections:
        if y > 720:
            page = doc.new_page(width=595, height=842)
            y = 60

        # Section Heading
        page.insert_text((50, y), sec_title, fontsize=12, fontname="helv", color=(0.15, 0.25, 0.4))
        y += 18

        # Section Body (wrap lines)
        lines = sec_text.splitlines()
        for l in lines:
            words = l.split()
            current_line = []
            for w in words:
                current_line.append(w)
                if len(" ".join(current_line)) > 80:
                    if y > 780:
                        page = doc.new_page(width=595, height=842)
                        y = 60
                    page.insert_text((50, y), " ".join(current_line), fontsize=9, fontname="helv", color=(0.1, 0.1, 0.1))
                    y += 13
                    current_line = []
            if current_line:
                if y > 780:
                    page = doc.new_page(width=595, height=842)
                    y = 60
                page.insert_text((50, y), " ".join(current_line), fontsize=9, fontname="helv", color=(0.1, 0.1, 0.1))
                y += 13
        y += 15

    page_count = doc.page_count
    doc.save(file_path)
    doc.close()
    return page_count


def seed_database(db: Session, force: bool = False):
    """Seeds the database with sample papers, projects, notes, and conversations."""
    existing_papers = db.query(Paper).count()
    if existing_papers > 0 and not force:
        logger.info("Database already contains papers. Skipping seed.")
        return

    logger.info("Seeding database with realistic sample research papers and projects...")
    storage_dir = "./data/storage/sample_papers"
    os.makedirs(storage_dir, exist_ok=True)

    created_papers = []
    chunker = ChunkingService()
    vector_repo = VectorStoreRepository(db)

    for data in SAMPLE_PAPERS_DATA:
        safe_name = data["title"][:25].lower().replace(" ", "_") + ".pdf"
        pdf_path = os.path.join(storage_dir, safe_name)

        # Generate real PDF on disk
        page_count = create_sample_pdf(
            file_path=pdf_path,
            title=data["title"],
            authors=data["authors"],
            sections=data["sections"],
        )

        abstract = data["sections"][0][1] if data["sections"] else "Sample research paper abstract."

        paper = Paper(
            id=str(uuid.uuid4()),
            title=data["title"],
            authors=data["authors"],
            abstract=abstract,
            publication_year=data["publication_year"],
            journal=data["journal"],
            doi=data["doi"],
            source="upload",
            file_path=pdf_path,
            status="ready",
            page_count=page_count,
            tags=data["tags"],
            is_favorite=True,
        )
        db.add(paper)
        db.commit()
        db.refresh(paper)
        created_papers.append(paper)

        # Generate chunks directly from the structured sections
        mock_pages = []
        for idx, (sec_title, sec_text) in enumerate(data["sections"], start=1):
            mock_pages.append({
                "page_number": min(idx, page_count),
                "text": sec_text,
                "section": sec_title,
            })

        chunks = chunker.chunk_document(paper_id=paper.id, pages=mock_pages)
        if chunks:
            embeddings = embedding_service.embed_texts([c.content for c in chunks])
            for c, emb in zip(chunks, embeddings):
                c.embedding = emb
            vector_repo.add_chunks(chunks)

    # Create a Sample Research Project
    project = ResearchProject(
        id=str(uuid.uuid4()),
        name="Clinical AI & RAG Benchmarking",
        description="Investigation into retrieval-augmented generation architectures, clinical grounding, and small language model extraction efficiency.",
        tags=["Clinical AI", "RAG", "LLM Benchmarks"],
    )
    project.papers = created_papers
    db.add(project)
    db.commit()
    db.refresh(project)

    # Create Sample Research Notes
    note1 = Note(
        id=str(uuid.uuid4()),
        title="Med-CorrectRAG Architecture Analysis",
        content="""## Key Takeaways on Self-Correcting RAG
- The two-stage verification (BioLinkBERT reranker + iterative hallucination critique) reduces medical error rates by 38.4%.
- Latency overhead is acceptable (410ms on A100 GPU).
- Need to investigate if this can be combined with SLMs like Llama-3-8B to reduce inference costs.""",
        paper_id=created_papers[0].id,
        project_id=project.id,
        tags=["Architecture", "Med-CorrectRAG"],
    )
    note2 = Note(
        id=str(uuid.uuid4()),
        title="SLM Quantization Feasibility",
        content="""## Quantization Observations
- AWQ 4-bit and GGUF Q4_K_M suffer less than 1.2% degradation on scientific schema extraction.
- Throughput on Apple Silicon (M3 Max) reaches 142 tokens/s for Phi-3-mini.
- Viable for private edge deployment without cloud API costs.""",
        paper_id=created_papers[1].id,
        project_id=project.id,
        tags=["Quantization", "Edge Deployment"],
    )
    db.add_all([note1, note2])

    # Create Sample Saved Insights
    insight1 = SavedInsight(
        id=str(uuid.uuid4()),
        title="Hallucination Reduction via Dual Reranking",
        insight_type="result",
        content="Med-CorrectRAG achieved 82.4% accuracy on MedQA and reduced clinical hallucinations by 38.4% using confidence-weighted verification.",
        paper_id=created_papers[0].id,
        paper_title=created_papers[0].title,
        page_number=1,
        project_id=project.id,
        tags=["Clinical", "Hallucination Reduction"],
    )
    insight2 = SavedInsight(
        id=str(uuid.uuid4()),
        title="Graph Hybrid Search Recall Gains",
        insight_type="finding",
        content="Integrating biological entity knowledge graphs with dense RRF retrieval achieved an 88.4% Recall@10 on multi-hop biomedical queries (vs 56.6% vector-only).",
        paper_id=created_papers[2].id,
        paper_title=created_papers[2].title,
        page_number=1,
        project_id=project.id,
        tags=["Knowledge Graphs", "Hybrid Search"],
    )
    db.add_all([insight1, insight2])

    # Create Sample Conversation Thread with Citations
    conv = Conversation(
        id=str(uuid.uuid4()),
        title="Evaluating Clinical RAG vs Dense Retrieval",
        project_id=project.id,
        paper_ids=[p.id for p in created_papers],
    )
    db.add(conv)
    db.commit()

    msg1 = Message(
        id=str(uuid.uuid4()),
        conversation_id=conv.id,
        role="user",
        content="How does Med-CorrectRAG reduce hallucinations in clinical question answering compared to naive RAG?",
        citations=[],
    )
    msg2 = Message(
        id=str(uuid.uuid4()),
        conversation_id=conv.id,
        role="assistant",
        content="""Based on the retrieved research context:

- **Fact**: Med-CorrectRAG introduces an active evidence verification pipeline combining BioLinkBERT dual-encoder reranking and an iterative hallucination critique layer [1].
- **Fact**: On clinical benchmarks including PubMedQA, MedQA-USMLE, and BioASQ-11b, this self-correcting RAG pipeline reduces medical hallucinations by 38.4% while improving citation precision by 24.1% over naive dense retrieval [1].
- **Fact**: The system achieved 82.4% accuracy on MedQA (compared to 71.2% for standard baseline RAG) with citation recall reaching 94.6% [2].

### Sources & Evidence:
- [1] Self-Correcting Retrieval-Augmented Generation for Clinical Question Answering — Page 1 (Abstract & Methodology)
- [2] Self-Correcting Retrieval-Augmented Generation for Clinical Question Answering — Page 2 (Results & Empirical Findings)""",
        citations=[
            {
                "paper_id": created_papers[0].id,
                "paper_title": created_papers[0].title,
                "page_number": 1,
                "section": "Abstract",
                "excerpt": "We introduce Med-CorrectRAG, a self-correcting RAG pipeline that evaluates factual consistency... reduces medical hallucinations by 38.4%...",
                "score": 0.94,
            },
            {
                "paper_id": created_papers[0].id,
                "paper_title": created_papers[0].title,
                "page_number": 2,
                "section": "Results",
                "excerpt": "Med-CorrectRAG achieves an accuracy of 82.4% on MedQA (compared to 71.2% for standard baseline RAG)...",
                "score": 0.91,
            },
        ],
    )
    db.add_all([msg1, msg2])
    db.commit()

    logger.info("Sample research papers, project, notes, insights, and conversation seeded successfully!")
