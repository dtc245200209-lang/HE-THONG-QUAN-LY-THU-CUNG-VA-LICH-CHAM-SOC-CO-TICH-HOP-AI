from abc import ABC, abstractmethod
from typing import List, Dict, Any

class AIProvider(ABC):
    @abstractmethod
    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        pass
        
    @abstractmethod
    async def stream_chat(self, messages: List[Dict[str, str]], **kwargs):
        pass

    @abstractmethod
    async def generate_structured(self, messages: List[Dict[str, str]], schema: Any, **kwargs) -> Dict[str, Any]:
        pass

class EmbeddingProvider(ABC):
    @abstractmethod
    async def embed(self, text: str) -> List[float]:
        pass

    @abstractmethod
    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        pass
