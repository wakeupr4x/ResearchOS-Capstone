import logging
from typing import Optional
from app.ai.base import LLMProvider
from app.config.settings import settings

logger = logging.getLogger(__name__)


class GeminiProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        self.client = None

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info(f"GeminiProvider initialized with model {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to initialize Google GenAI Client: {e}")
                self.client = None

    def is_available(self) -> bool:
        return self.client is not None

    def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
    ) -> str:
        if not self.is_available():
            raise RuntimeError("Gemini API is not configured or unavailable.")

        try:
            from google.genai import types

            config = types.GenerateContentConfig(
                temperature=temperature,
                system_instruction=system_instruction,
            )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )
            return response.text or ""
        except Exception as e:
            logger.error(f"Gemini generation failed: {e}")
            raise RuntimeError(f"Gemini API Error: {str(e)}")
