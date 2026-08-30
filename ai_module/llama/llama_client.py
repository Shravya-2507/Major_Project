import ollama

MODEL_NAME = "llama3.1"


def ask_llama(prompt: str):

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        options={
            # Prevent Ollama from generating an unnecessarily
            # large final response.
            "num_predict": 400,

            # Slightly faster / more deterministic output.
            "temperature": 0.2,
        }
    )

    return response["message"]["content"]

