from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class LLMProvider(ABC):
    @abstractmethod
    def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
    ) -> str:
        """Generates text from the LLM."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Returns True if the provider is properly configured with an API key."""
        pass
