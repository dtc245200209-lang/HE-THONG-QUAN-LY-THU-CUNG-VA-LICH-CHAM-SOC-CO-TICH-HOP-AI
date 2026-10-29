from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class Source(BaseModel):
    document_id: str
    title: str
    section: Optional[str] = None
    page: Optional[int] = None

class ActionItem(BaseModel):
    tool: str
    parameters: Dict[str, Any]

class AIChatRequest(BaseModel):
    conversation_id: Optional[str] = "default_conv"
    message: str
    pet_id: Optional[str] = None
    messages: Optional[List[Dict[str, str]]] = None

class AIChatResponse(BaseModel):
    message_id: str
    answer: str
    intent: Optional[str] = None
    sources: List[Source] = Field(default_factory=list)
    actions: List[ActionItem] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
