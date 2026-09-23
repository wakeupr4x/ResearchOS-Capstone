import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.settings import settings
from app.repositories.database import init_db, SessionLocal
from app.seed.sample_data import seed_database
from app.api.papers import router as papers_router
from app.api.chat import router as chat_router
from app.api.research import router as research_router
from app.api.discovery import router as discovery_router
from app.api.projects import router as projects_router
from app.api.notes import router as notes_router
from app.api.insights import router as insights_router
from app.api.stats import router as stats_router
from app.api.collaboration import router as collaboration_router


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("researchos")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ResearchOS Backend...")
    # Initialize database tables and vector extensions
    init_db()

    # Seed sample papers and data for demo / offline operation
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    logger.info("ResearchOS Backend startup complete.")
    yield
    logger.info("ResearchOS Backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ResearchOS: Full-stack AI Research Assistant & Literature Intelligence Platform",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(papers_router)
app.include_router(chat_router)
app.include_router(research_router)
app.include_router(discovery_router)
app.include_router(projects_router)
app.include_router(notes_router)
app.include_router(insights_router)
app.include_router(stats_router)
app.include_router(collaboration_router)



@app.get("/")
def root():
    return {
        "message": "Welcome to ResearchOS AI Research Intelligence API",
        "docs": "/docs",
        "health": "/api/health",
        "version": settings.VERSION,
    }
