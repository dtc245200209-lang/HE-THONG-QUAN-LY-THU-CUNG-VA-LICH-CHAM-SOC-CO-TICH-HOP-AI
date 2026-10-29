from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime
from app.db.base_class import Base
import uuid

class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, index=True)
    role = Column(String)
    selected_pet_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    conversation_id = Column(String, index=True)
    role = Column(String) # user or assistant
    content = Column(String)
    sources = Column(JSON, nullable=True)
    actions = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
