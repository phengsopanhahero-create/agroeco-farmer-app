import json

from app.embedding import get_embedding
from app.qdrant_db import client

with open(
    "data/farming_knowledge.json",
    encoding="utf8"
) as f:
    docs = json.load(f)

points = []

for doc in docs:

    points.append({
        "id": doc["id"],
        "vector": get_embedding(doc["text"]),
        "payload": {
            "text": doc["text"]
        }
    })

client.upsert(
    collection_name="agroeco",
    points=points
)

print("Data Loaded")