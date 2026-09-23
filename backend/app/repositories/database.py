import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config.settings import settings
from app.models.entities import Base

logger = logging.getLogger(__name__)

# Engine configuration depending on DB dialect
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initializes tables in database."""
    try:
        # If postgres, try to create pgvector extension if available
        if settings.DATABASE_URL.startswith("postgresql"):
            with engine.connect() as conn:
                from sqlalchemy import text
                try:
                    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                    conn.commit()
                    logger.info("pgvector extension initialized or already exists.")
                except Exception as ext_err:
                    logger.warning(f"Could not initialize pgvector extension: {ext_err}")

        Base.metadata.create_all(bind=engine)

        # Migrate sqlite missing columns if existing database file was created prior to new schema fields
        if settings.DATABASE_URL.startswith("sqlite"):
            with engine.connect() as conn:
                from sqlalchemy import text
                for col_name in ["extracted_tables", "extracted_figures"]:
                    try:
                        conn.execute(text(f"ALTER TABLE papers ADD COLUMN {col_name} JSON;"))
                        conn.commit()
                        logger.info(f"Added column {col_name} to papers table.")
                    except Exception:
                        pass

        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise e



def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
