import ollama

MODEL = "aisingapore/Gemma-SEA-LION-v3-9B-IT"

def generate_answer(
    question,
    context
):

    response = ollama.chat(
        model=MODEL,
        messages=[
            {
                "role":"system",
                "content":"""
You are AgroEco Farmer Assistant.

Answer in Khmer if the question is Khmer.
Use provided context.
If context is missing, say you don't know.
"""
            },
            {
                "role":"user",
                "content":f"""
Context:
{context}

Question:
{question}
"""
            }
        ]
    )

    return response["message"]["content"]