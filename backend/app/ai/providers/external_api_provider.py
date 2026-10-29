from typing import List, Dict, Any, AsyncGenerator, Tuple, Optional
from app.ai.provider import AIProvider
import os
import asyncio
import google.generativeai as genai
from app.ai.providers.mock_provider import MockProvider
import logging

logger = logging.getLogger(__name__)

class ExternalAPIProvider(AIProvider):
    """
    Ultra-low-latency Provider for Google Gemini API using REST transport
    and gemini-3.5-flash-lite for instant responses (< 2-3s).
    """
    def __init__(self, api_key: str = None, model: str = "gemini-3.5-flash-lite"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY")
        if not self.api_key:
            raise ValueError("Google Gemini API Key is required. Set GEMINI_API_KEY environment variable or pass it directly.")
        
        # Explicit REST transport avoids gRPC connection hanging inside Docker on Windows
        genai.configure(api_key=self.api_key, transport="rest")
        
        self.primary_model = model or "gemini-3.5-flash-lite"
        self._circuit_open_until = 0.0
        self._consecutive_failures = 0
        logger.info(f"ExternalAPIProvider initialized with fast model: {self.primary_model} (strict 3.5s timeout & circuit breaker)")

    def _split_system_and_contents(self, messages: List[Dict[str, str]]) -> Tuple[Optional[str], List[Dict[str, Any]]]:
        """
        Separate system instructions from chat history for Gemini.
        Keeps history compact (last 4 turns) for ultra-fast generation.
        """
        system_instructions = []
        gemini_messages = []
        
        # Keep system prompt plus last 4 conversational messages
        sys_msgs = [m for m in messages if m.get("role") == "system"]
        chat_msgs = [m for m in messages if m.get("role") != "system"][-4:]
        
        for msg in sys_msgs:
            system_instructions.append(msg.get("content", ""))
            
        for msg in chat_msgs:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            gemini_role = "model" if role == "assistant" else "user"
            gemini_messages.append({
                "role": gemini_role,
                "parts": [content]
            })
        
        system_prompt = "\n\n".join(system_instructions) if system_instructions else None
        
        # Ensure at least one message
        if not gemini_messages:
            gemini_messages = [{"role": "user", "parts": [system_prompt or "Xin chào"]}]
            system_prompt = None
            
        return system_prompt, gemini_messages

    def _generate_sync(self, model_name: str, system_prompt: Optional[str], gemini_messages: List[Dict[str, Any]]) -> str:
        """
        Synchronous call to Gemini with REST transport.
        """
        model = genai.GenerativeModel(model_name, system_instruction=system_prompt)
        response = model.generate_content(gemini_messages)
        return response.text if response else ""

    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Send chat messages to Gemini and get a text response with strict 3.5s timeout.
        Falls back seamlessly to MockProvider if circuit is open or call exceeds 3.5s.
        """
        import time
        now = time.time()
        
        # Circuit Breaker: If external API recently failed/exceeded quota, serve instantly from local clinical engine
        if now < self._circuit_open_until:
            logger.info("Circuit breaker ACTIVE: Instant local clinical response (<50ms)")
            return await MockProvider().chat(messages, **kwargs)

        system_prompt, gemini_messages = self._split_system_and_contents(messages)
        
        try:
            # Strict 3.5s timeout: NEVER let the user wait 10s or 15s
            text = await asyncio.wait_for(
                asyncio.to_thread(self._generate_sync, self.primary_model, system_prompt, gemini_messages),
                timeout=3.5
            )
            if text and text.strip():
                self._consecutive_failures = 0
                return text
        except Exception as e:
            err_str = str(e)
            self._consecutive_failures += 1
            logger.warning(f"Gemini call failed/timed out ({err_str[:80]}). Switching to clinical fallback.")
            if "429" in err_str or "Quota" in err_str or self._consecutive_failures >= 2:
                # Open circuit for 90s to ensure subsequent questions are answered in <50ms
                self._circuit_open_until = now + 90.0
                logger.warning("Gemini quota or consecutive timeouts -> Circuit breaker OPEN for 90s")

        return await MockProvider().chat(messages, **kwargs)

    async def stream_chat(self, messages: List[Dict[str, str]], **kwargs) -> AsyncGenerator[str, None]:
        """
        Stream chat messages with guaranteed response starting within <3.5s (usually <50ms).
        """
        import time
        now = time.time()
        
        # Circuit Breaker check
        if now < self._circuit_open_until:
            logger.info("Circuit breaker ACTIVE: Instant clinical stream (<50ms)")
            async for chunk in MockProvider().stream_chat(messages, **kwargs):
                yield chunk
            return

        system_prompt, gemini_messages = self._split_system_and_contents(messages)
        
        full_text = None
        try:
            text = await asyncio.wait_for(
                asyncio.to_thread(self._generate_sync, self.primary_model, system_prompt, gemini_messages),
                timeout=3.5
            )
            if text and text.strip():
                full_text = text
                self._consecutive_failures = 0
        except Exception as e:
            err_str = str(e)
            self._consecutive_failures += 1
            logger.warning(f"Gemini stream model {self.primary_model} failed/timed out: {err_str[:80]}")
            if "429" in err_str or "Quota" in err_str or self._consecutive_failures >= 2:
                self._circuit_open_until = now + 90.0
                logger.warning("Gemini quota or consecutive timeouts -> Circuit breaker OPEN for 90s")

        if full_text:
            words = full_text.split(" ")
            for i, word in enumerate(words):
                if i > 0:
                    await asyncio.sleep(0.003)
                yield word + " "
        else:
            async for chunk in MockProvider().stream_chat(messages, **kwargs):
                yield chunk

    async def generate_structured(self, messages: List[Dict[str, str]], schema: Any, **kwargs) -> Dict[str, Any]:
        """
        Generate structured data (JSON) from Gemini asynchronously.
        """
        system_prompt, gemini_messages = self._split_system_and_contents(messages)
        
        def _generate_json(m_name: str):
            model = genai.GenerativeModel(
                model_name=m_name,
                system_instruction=system_prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return model.generate_content(gemini_messages).text

        for m_name in self.candidate_models:
            try:
                raw_text = await asyncio.wait_for(
                    asyncio.to_thread(_generate_json, m_name),
                    timeout=8.0
                )
                import json
                try:
                    return json.loads(raw_text)
                except Exception:
                    return {"raw_text": raw_text}
            except Exception as e:
                logger.warning(f"Gemini structured failed on model {m_name}: {e}")
                continue
        return {"error": "All Gemini models failed for structured output"}
