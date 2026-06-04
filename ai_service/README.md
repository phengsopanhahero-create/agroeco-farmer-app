Next.js App
│
├── User types text
│       ↓
│   /api/chat
│
├── User records voice
│       ↓
│   /api/voice-to-text
│       ↓
│   Whisper converts voice to text
│       ↓
│   /api/chat
│
└── AI answers from your mini app data
# flow

Whisper voice → text
BGE-M3 embedding
RAG search
LLM answer

# Folder structure
ai_service/
├── main.py #FastAPI server
├── llm.py #use Qwen3(Qwen/Qwen3-4B-Instruct-2507) https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507 or SEA-LION connection (aisingapore/Gemma-SEA-LION-v3-9B) https://huggingface.co/aisingapore/Gemma-SEA-LION-v3-9B
├── rag.py #RAG pipeline
├── embedding.py #BGE-M3 embeddings (BAAI/bge-m3) https://huggingface.co/BAAI/bge-m3
├── qdrant_db.py #Qdrant connection
├── whisper_stt.py #Voice → text (https://github.com/openai/whisper.git)
├── ingest.py #Push app data into Qdrant
├── requirements.txt
├── .env
└── uploads/ #store temporary audio

# architecture
Telegram Mini App
        ↓
Next.js
        ↓
Python ai_service
        ↓
Ollama
        ↓
Qwen3 / SEA-LION

# example
User asks:
"តើធ្វើដូចម្តេចដើម្បីបង្កើតកសិដ្ឋាន?"

↓

RAG searches app data

↓

Python sends:
Context + Question

↓

Ollama Qwen3 generates answer

↓

Return answer to Next.js

mmm

## How to Use

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai_service
```

---

### 2. Create Virtual Environment

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

Linux/Mac:

```bash
python -m venv venv
source venv/bin/activate
```

---

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Install Ollama

Download and install Ollama:

https://ollama.com/download

Verify installation:

```bash
ollama list
```

---

### 5. Download SEA-LION Model

```bash
ollama pull aisingapore/Gemma-SEA-LION-v3-9B-IT
```

Verify:

```bash
ollama list
```

Expected:

```text
NAME
aisingapore/Gemma-SEA-LION-v3-9B-IT
```

---

### 6. Configure Environment Variables

Create a `.env` file in the root directory:

```env
QDRANT_URL=YOUR_QDRANT_URL
QDRANT_API_KEY=YOUR_API_KEY

COLLECTION_NAME=agroeco
MODEL_NAME=aisingapore/Gemma-SEA-LION-v3-9B-IT
```

---

### 7. Create Qdrant Collection

Run once:

```bash
python create_collection.py
```

Expected:

```text
Collection Created
```

---

### 8. Load Farming Knowledge

Update:

```text
data/farming_knowledge.json
```

Then run:

```bash
python ingest.py
```

Expected:

```text
Data Loaded
```

---

### 9. Start AI Service

```bash
uvicorn app.main:app --reload
```

Expected:

```text
Uvicorn running on http://127.0.0.1:8000
```

---

### 10. Open API Documentation

Open in browser:

```text
http://127.0.0.1:8000/docs
```

Swagger UI will display all available APIs.

---

### 11. Test Chat API

Select:

```text
POST /api/chat
```

Click:

```text
Try it out
```

Example request:

```json
{
  "question": "របៀបដាំស្រូវ"
}
```

Example response:

```json
{
  "answer": "ការដាំស្រូវត្រូវរៀបចំដីឱ្យបានល្អ..."
}
```

---

## Updating Knowledge Base

When adding new agricultural information:

1. Update:

```text
data/farming_knowledge.json
```

2. Re-run:

```bash
python ingest.py
```

This updates the vector database with the latest farming knowledge.

---

## Common Commands

Start API:

```bash
uvicorn app.main:app --reload
```

Load Knowledge:

```bash
python ingest.py
```

Create Collection:

```bash
python create_collection.py
```

Check Installed Models:

```bash
ollama list
```

Download SEA-LION:

```bash
ollama pull aisingapore/Gemma-SEA-LION-v3-9B-IT
```

---

## Troubleshooting

### Model Not Found

```text
Error: model not found
```

Fix:

```bash
ollama pull aisingapore/Gemma-SEA-LION-v3-9B-IT
```

### Collection Not Found

```text
Collection agroeco not found
```

Fix:

```bash
python create_collection.py
```

### No Data Returned

Fix:

```bash
python ingest.py
```

### API Not Running

Start:

```bash
uvicorn app.main:app --reload
```
