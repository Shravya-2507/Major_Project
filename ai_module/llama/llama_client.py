import ollama
import time
from typing import Optional


MODEL_NAME = "llama3.2:3b"


def ask_llama(
    prompt: str,
    max_tokens: int = 120,
    response_format: Optional[str] = "json"
):
    try:
        start_time = time.perf_counter()

        chat_options = {
            "model": MODEL_NAME,

            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            "options": {
                "temperature": 0,
                "num_predict": max_tokens,
                "num_ctx": 1024,
                "num_batch": 512,
                "num_thread": 6,
            },

            "keep_alive": "30m",
        }

        if response_format:
            chat_options["format"] = response_format

        response = ollama.chat(
            **chat_options
        )

        total_time = time.perf_counter() - start_time

        print("\n========== OLLAMA METRICS ==========")

        print(
            "Load duration:",
            round(
                response.get("load_duration", 0) / 1_000_000_000,
                2
            ),
            "seconds"
        )

        print(
            "Prompt eval duration:",
            round(
                response.get("prompt_eval_duration", 0) / 1_000_000_000,
                2
            ),
            "seconds"
        )

        print(
            "Generation duration:",
            round(
                response.get("eval_duration", 0) / 1_000_000_000,
                2
            ),
            "seconds"
        )

        print(
            "Prompt tokens:",
            response.get("prompt_eval_count", 0)
        )

        print(
            "Generated tokens:",
            response.get("eval_count", 0)
        )

        print(
            "Python request duration:",
            round(total_time, 2),
            "seconds"
        )

        print("====================================\n")

        return response["message"]["content"]

    except Exception as error:

        print("\n========== OLLAMA ERROR ==========")
        print("Error:", str(error))
        print("==================================\n")

        return None