from sentence_transformers import SentenceTransformer

model = SentenceTransformer(
    "BAAI/bge-m3"
)

def get_embedding(text):
    return model.encode(text).tolist()