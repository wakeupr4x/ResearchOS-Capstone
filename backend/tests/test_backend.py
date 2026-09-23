import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.repositories.database import SessionLocal, init_db
from app.models.entities import Paper, DocumentChunk
from app.services.chunking_service import ChunkingService
from app.services.embedding_service import embedding_service
from app.repositories.vector_store import VectorStoreRepository
from app.rag.rag_service import RAGService
from app.services.research_orchestrator import ResearchOrchestrator


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()
    # TestClient will trigger lifespan (including seeding)
    yield


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ResearchOS"


def test_dashboard_stats(client):
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["papers_count"] >= 3
    assert data["projects_count"] >= 1
    assert data["indexed_chunks_count"] > 0


def test_list_papers(client):
    response = client.get("/api/papers")
    assert response.status_code == 200
    papers = response.json()
    assert len(papers) >= 3
    assert any("Clinical" in p["title"] or "Language" in p["title"] for p in papers)


def test_paper_detail(client):
    response = client.get("/api/papers")
    paper_id = response.json()[0]["id"]

    detail_res = client.get(f"/api/papers/{paper_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == paper_id
    assert len(detail["chunks"]) > 0


def test_rag_pipeline():
    db = SessionLocal()
    try:
        rag = RAGService(db)
        answer, citations, suggested_questions = rag.answer_query("How does Med-CorrectRAG reduce medical hallucinations?")
        assert len(answer) > 20
        assert len(citations) > 0
        assert len(suggested_questions) > 0
        assert any("Med-CorrectRAG" in cit.paper_title or "Clinical" in cit.paper_title for cit in citations)
    finally:
        db.close()



def test_paper_summary(client):
    papers = client.get("/api/papers").json()
    paper_id = papers[0]["id"]

    res = client.post(f"/api/papers/{paper_id}/summary")
    assert res.status_code == 200
    summary = res.json()
    assert "executive_summary" in summary
    assert "methodology" in summary
    assert len(summary["key_takeaways"]) > 0


def test_paper_extraction(client):
    papers = client.get("/api/papers").json()
    paper_id = papers[0]["id"]

    res = client.post(f"/api/papers/{paper_id}/extract")
    assert res.status_code == 200
    extracted = res.json()
    assert "research_problem" in extracted
    assert "dataset" in extracted
    assert "models_algorithms" in extracted


def test_paper_comparison(client):
    papers = client.get("/api/papers").json()
    assert len(papers) >= 2
    p_ids = [papers[0]["id"], papers[1]["id"]]

    res = client.post("/api/compare", json={"paper_ids": p_ids, "focus_aspect": "all"})
    assert res.status_code == 200
    comp = res.json()
    assert len(comp["papers"]) == 2
    assert len(comp["matrix"]) > 0
    assert "synthesis" in comp


def test_literature_review(client):
    papers = client.get("/api/papers").json()
    p_ids = [p["id"] for p in papers[:2]]

    res = client.post("/api/literature-review", json={"paper_ids": p_ids, "theme_focus": "RAG Accuracy"})
    assert res.status_code == 200
    lit = res.json()
    assert "key_themes" in lit
    assert "methodological_progression" in lit


def test_research_gaps(client):
    papers = client.get("/api/papers").json()
    p_ids = [p["id"] for p in papers[:2]]

    res = client.post("/api/research-gaps", json={"paper_ids": p_ids})
    assert res.status_code == 200
    gaps = res.json()
    assert len(gaps["potential_gaps"]) > 0
    assert "disclaimer" in gaps


def test_chat_endpoint(client):
    papers = client.get("/api/papers").json()
    p_ids = [papers[0]["id"]]

    res = client.post("/api/chat", json={
        "content": "What benchmarks were evaluated in the study?",
        "paper_ids": p_ids,
    })
    assert res.status_code == 200
    chat_res = res.json()
    assert "conversation_id" in chat_res
    assert len(chat_res["message"]["content"]) > 10
    assert len(chat_res["message"]["citations"]) > 0


def test_projects_crud(client):
    res = client.post("/api/projects", json={
        "name": "Test Frontier Project",
        "description": "Testing project creation",
        "tags": ["Test"],
    })
    assert res.status_code == 200
    proj = res.json()
    proj_id = proj["id"]

    list_res = client.get("/api/projects")
    assert any(p["id"] == proj_id for p in list_res.json())

    del_res = client.delete(f"/api/projects/{proj_id}")
    assert del_res.status_code == 200


def test_notes_crud(client):
    res = client.post("/api/notes", json={
        "title": "Test Finding Note",
        "content": "Important empirical detail noted here.",
        "tags": ["Observation"],
    })
    assert res.status_code == 200
    note = res.json()
    note_id = note["id"]

    list_res = client.get("/api/notes")
    assert any(n["id"] == note_id for n in list_res.json())

    del_res = client.delete(f"/api/notes/{note_id}")
    assert del_res.status_code == 200


def test_insights_crud(client):
    res = client.post("/api/insights", json={
        "title": "Significant F1 gain",
        "insight_type": "result",
        "content": "Observed 91.2% F1 on extraction benchmark.",
        "tags": ["F1", "Benchmark"],
    })
    assert res.status_code == 200
    insight = res.json()
    insight_id = insight["id"]

    list_res = client.get("/api/insights")
    assert any(i["id"] == insight_id for i in list_res.json())

    del_res = client.delete(f"/api/insights/{insight_id}")
    assert del_res.status_code == 200


def test_citations_export(client):
    papers = client.get("/api/papers").json()
    paper_id = papers[0]["id"]
    res = client.get(f"/api/papers/{paper_id}/citations")
    assert res.status_code == 200
    cit = res.json()
    assert "@article{" in cit["bibtex"]
    assert cit["paper_id"] == paper_id
    assert len(cit["apa"]) > 10


def test_presentation_generator(client):
    papers = client.get("/api/papers").json()
    p_ids = [papers[0]["id"]]
    res = client.post("/api/presentation", json={"paper_ids": p_ids, "mode": "student"})
    assert res.status_code == 200
    pres = res.json()
    assert len(pres["slides"]) >= 4
    assert pres["slides"][0]["title"] != ""


def test_collaboration_endpoints(client):
    ws_res = client.get("/api/collaboration/workspaces")
    assert ws_res.status_code == 200
    assert len(ws_res.json()) >= 1

    ann_res = client.post("/api/collaboration/annotations", json={
        "paper_id": "test-p",
        "user_name": "Test User",
        "page_number": 1,
        "highlight_text": "Groundbreaking result",
        "comment": "Needs peer confirmation",
    })
    assert ann_res.status_code == 200
    assert ann_res.json()["user_name"] == "Test User"

