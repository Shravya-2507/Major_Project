from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from ai_module.preprocess import clean_text

model = SentenceTransformer('all-MiniLM-L6-v2')

def semantic_score(ans, correct):
    ans = clean_text(ans)
    correct = clean_text(correct)

    emb1 = model.encode([ans])
    emb2 = model.encode([correct])

    return float(cosine_similarity(emb1, emb2)[0][0])