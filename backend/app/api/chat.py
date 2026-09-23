import uuid
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.entities import Conversation, Message
from app.schemas.dto import ChatRequest, ChatResponse, ConversationResponse, MessageDTO
from app.rag.rag_service import RAGService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Chat & Conversations"])


@router.post("/chat", response_model=ChatResponse)
def send_chat_message(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Research chat endpoint.
    Performs hybrid RAG over selected papers or the entire library,
    grounds answer in evidence, and attaches traceable citations.
    """
    conv_id = request.conversation_id
    if not conv_id:
        # Create conversation
        title_snippet = request.content[:40] + ("..." if len(request.content) > 40 else "")
        conv = Conversation(
            id=str(uuid.uuid4()),
            title=title_snippet or "Research Chat",
            project_id=request.project_id,
            paper_ids=request.paper_ids or [],
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conv_id = conv.id
    else:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found.")
        if request.paper_ids:
            conv.paper_ids = request.paper_ids

    # 1. Store user message
    user_msg = Message(
        id=str(uuid.uuid4()),
        conversation_id=conv_id,
        role="user",
        content=request.content,
        citations=[],
    )
    db.add(user_msg)
    db.commit()

    # 2. Run RAG
    rag_service = RAGService(db)
    target_paper_ids = request.paper_ids if request.paper_ids else (conv.paper_ids if conv.paper_ids else None)

    answer, citations, suggested_questions = rag_service.answer_query(
        query=request.content,
        paper_ids=target_paper_ids,
        mode=request.mode or "professional",
        use_web_research=request.use_web_research or False,
    )

    # 3. Store assistant message
    citations_data = [c.model_dump() for c in citations]
    assistant_msg = Message(
        id=str(uuid.uuid4()),
        conversation_id=conv_id,
        role="assistant",
        content=answer,
        citations=citations_data,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatResponse(
        conversation_id=conv_id,
        message=MessageDTO(
            id=assistant_msg.id,
            conversation_id=assistant_msg.conversation_id,
            role=assistant_msg.role,
            content=assistant_msg.content,
            citations=citations,
            suggested_questions=suggested_questions,
            created_at=assistant_msg.created_at,
        ),
        suggested_questions=suggested_questions,
    )



@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(db: Session = Depends(get_db)):
    """Lists all research conversations ordered by last update."""
    conversations = db.query(Conversation).order_by(Conversation.updated_at.desc()).all()
    return conversations


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Retrieves conversation thread and messages."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return conv


@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Deletes conversation history."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted."}
