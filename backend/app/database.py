import os
import tempfile
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

db_url = settings.DATABASE_URL
# When deployed on Vercel, the filesystem is read-only except /tmp
if os.environ.get("VERCEL") and "sqlite" in db_url:
    tmp_db = os.path.join(tempfile.gettempdir(), "database.db").replace("\\", "/")
    db_url = f"sqlite:///{tmp_db}"

# SQLite specific connect_args to allow multithreaded queries in FastAPI
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency yielding a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
