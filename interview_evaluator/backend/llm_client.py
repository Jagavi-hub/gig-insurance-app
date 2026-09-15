import os
import json
import re
from typing import Dict, Any, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class LLMClient:
    """
    Unified LLM wrapper supporting OpenAI API (gpt-4o-mini default, swappable)
    and an intelligent offline heuristic engine when OPENAI_API_KEY is not configured.
    Includes defensive JSON sanitization, schema validation, and automatic 1-retry logic.
    """
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.client = None
        
        if self.api_key:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.api_key)
            except Exception as e:
                print(f"[LLMClient] Warning: Could not initialize OpenAI client ({e}). Running in fallback mode.")
                self.client = None

    @property
    def is_live(self) -> bool:
        return self.client is not None and bool(self.api_key)

    def _sanitize_json(self, raw_text: str) -> str:
        """Strip markdown fences (```json ... ```) and leading/trailing whitespace."""
        text = raw_text.strip()
        # Remove ```json ... ``` or ``` ... ```
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines).strip()
        
        # Regex search for the outermost {...} or [...] if there's conversational preamble
        json_match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
            
        return text

    def call_llm_json(
        self,
        system_prompt: str,
        user_prompt: str,
        fallback_fn: Optional[Any] = None,
        max_retries: int = 1
    ) -> Dict[str, Any]:
        """
        Invokes LLM demanding STRICT JSON output.
        Retries once if JSON parse fails.
        Falls back gracefully if OpenAI is unavailable or offline.
        """
        # If no client or API key, run intelligent local heuristic fallback
        if not self.is_live:
            if fallback_fn:
                return fallback_fn()
            return {"error": "LLM client not configured with API key and no fallback provided"}

        current_user_prompt = user_prompt
        for attempt in range(max_retries + 1):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                f"{system_prompt}\n\n"
                                "CRITICAL CONSTRAINT: You MUST respond ONLY with valid, raw JSON. "
                                "Do NOT include markdown formatting like ```json, no explanations, no chat preamble."
                            )
                        },
                        {"role": "user", "content": current_user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2
                )
                raw_content = response.choices[0].message.content or ""
                cleaned_content = self._sanitize_json(raw_content)
                parsed_json = json.loads(cleaned_content)
                return parsed_json
            except (json.JSONDecodeError, Exception) as e:
                if attempt < max_retries:
                    print(f"[LLMClient] Parse failed on attempt {attempt+1}: {e}. Retrying once...")
                    current_user_prompt = (
                        f"{user_prompt}\n\n"
                        f"[NOTE: Your previous output failed JSON decoding with error: {str(e)}. "
                        f"Output ONLY valid raw parseable JSON!]"
                    )
                else:
                    print(f"[LLMClient] Max retries reached. Error: {e}")
                    if fallback_fn:
                        print("[LLMClient] Triggering offline heuristic fallback...")
                        return fallback_fn()
                    raise RuntimeError(f"Failed to obtain valid JSON from LLM: {e}")

# Global singleton client
llm_client = LLMClient()
