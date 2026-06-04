from app.embedding import get_embedding
from app.qdrant_db import client

COLLECTION_NAME = "agroeco"

def retrieve(question):

    query_vector = get_embedding(question)

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=3
    )

    contexts = []

    for point in results.points:
        contexts.append(
            point.payload["text"]
        )

    return "\n".join(contexts)