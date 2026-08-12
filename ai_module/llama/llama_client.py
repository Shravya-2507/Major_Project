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
        ]
    )

    return response["message"]["content"]