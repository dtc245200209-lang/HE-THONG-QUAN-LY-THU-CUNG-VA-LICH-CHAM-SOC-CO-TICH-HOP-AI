from typing import Any
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

import os
from app.core.config import settings

# Bật SQL_ECHO=true nếu muốn SQLAlchemy in toàn bộ câu lệnh raw SQL ra terminal
sql_echo = os.getenv("SQL_ECHO", "false").lower() in ("true", "1", "yes")

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True, echo=sql_echo)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
