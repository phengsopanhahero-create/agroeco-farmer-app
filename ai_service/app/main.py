from fastapi import FastAPI
from pydantic import BaseModel

from app.rag import retrieve
from app.llm import generate_answer

app = FastAPI()

class ChatRequest(BaseModel):
    question: str

@app.post("/api/chat")
def chat(req: ChatRequest):

    context = retrieve(req.question)

    answer = generate_answer(
        req.question,
        context
    )

    return {
        "answer": answer
    }