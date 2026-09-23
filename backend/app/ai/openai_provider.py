import logging
from typing import Optional
from app.ai.base import LLMProvider
from app.config.settings import settings

logger = logging.getLogger(__name__)


class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model_name = model_name or settings.OPENAI_MODEL
        self.client = None

        if self.api_key:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.api_key)
                logger.info(f"OpenAIProvider initialized with model {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI Client: {e}")
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
            raise RuntimeError("OpenAI API is not configured or unavailable.")

        try:
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=temperature,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"OpenAI generation failed: {e}")
            raise RuntimeError(f"OpenAI API Error: {str(e)}")
