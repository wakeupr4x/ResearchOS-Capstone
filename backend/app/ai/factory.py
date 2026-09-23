import logging
from app.ai.base import LLMProvider
from app.ai.groq_provider import GroqProvider
from app.ai.gemini_provider import GeminiProvider
from app.ai.openai_provider import OpenAIProvider
from app.ai.fallback_provider import FallbackResearchProvider
from app.config.settings import settings

logger = logging.getLogger(__name__)


def get_llm_provider() -> LLMProvider:
    """
    Returns the configured LLM provider.
    Prioritizes Groq, then Gemini, then OpenAI, then Fallback.
    """
    provider_type = (settings.LLM_PROVIDER or "groq").lower()

    if provider_type == "groq" and settings.GROQ_API_KEY:
        try:
            groq_p = GroqProvider(api_key=settings.GROQ_API_KEY, model_name=settings.GROQ_MODEL)
            if groq_p.is_available():
                return groq_p
        except Exception as e:
            logger.warning(f"Failed initializing Groq: {e}")

    if provider_type == "gemini" and settings.GEMINI_API_KEY:
        try:
            gemini = GeminiProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.GEMINI_MODEL)
            if gemini.is_available():
                return gemini
        except Exception as e:
            logger.warning(f"Failed initializing Gemini: {e}")

    elif provider_type == "openai" and settings.OPENAI_API_KEY:
        try:
            openai_p = OpenAIProvider(api_key=settings.OPENAI_API_KEY, model_name=settings.OPENAI_MODEL)
            if openai_p.is_available():
                return openai_p
        except Exception as e:
            logger.warning(f"Failed initializing OpenAI: {e}")

    # If groq key is set regardless of provider_type, use Groq
    if settings.GROQ_API_KEY:
        try:
            groq_p = GroqProvider(api_key=settings.GROQ_API_KEY, model_name=settings.GROQ_MODEL)
            if groq_p.is_available():
                return groq_p
        except Exception:
            pass

    logger.info("Using FallbackResearchProvider (local grounded research synthesis).")
    return FallbackResearchProvider()
