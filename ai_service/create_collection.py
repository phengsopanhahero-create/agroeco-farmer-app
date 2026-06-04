from app.qdrant_db import client
from qdrant_client.models import (
    VectorParams,
    Distance
)

client.create_collection(
    collection_name="agroeco",
    vectors_config=VectorParams(
        size=1024,
        distance=Distance.COSINE
    )
)

print("Collection Created")