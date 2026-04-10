from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

# Import your AI modules
from answer_evaluation import evaluate_answer
from topic_analysis import (
    analyze_topics,
    calculate_topic_performance,
    rank_topics,
    classify_topics
)
from pagerank import pagerank_topics

app = FastAPI()

# -----------------------------
# ✅ CORS (IMPORTANT for backend)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Request Models
# -----------------------------

class AnswerRequest(BaseModel):
    student_answer: str
    correct_answer: str


class Question(BaseModel):
    question: str
    answer: str
    topic: str


class TopicAnalysisRequest(BaseModel):
    questions: List[Question]
    user_answers: List[str]


# -----------------------------
# Routes
# -----------------------------

@app.get("/")
def home():
    return {"message": "AI Module API is running 🚀"}


# ✅ 1. Evaluate Single Answer
@app.post("/evaluate")
def evaluate(req: AnswerRequest):
    try:
        result = evaluate_answer(req.student_answer, req.correct_answer)
        return result

    except Exception as e:
        print("❌ AI ERROR:", str(e))
        return {
            "semantic_score": 0,
            "smith_score": 0,
            "final_score": 0,
            "result": "Error"
        }


# ✅ 2. Analyze Topics (Full Pipeline)
@app.post("/analyze-topics")
def analyze(req: TopicAnalysisRequest):
    try:
        questions = [q.dict() for q in req.questions]
        user_answers = req.user_answers

        # Step 1: Topic Scores
        topic_scores = analyze_topics(questions, user_answers)

        # Step 2: Average Performance
        topic_avg = calculate_topic_performance(topic_scores)

        # Step 3: Ranking
        ranked = rank_topics(topic_avg)

        # Step 4: Classification
        classified = classify_topics(topic_avg)

        # Step 5: PageRank Importance
        pagerank_scores = pagerank_topics(topic_avg)

        return {
            "topic_scores": topic_scores,
            "topic_average": topic_avg,
            "ranking": ranked,
            "classification": classified,
            "pagerank": pagerank_scores
        }

    except Exception as e:
        print("❌ TOPIC ANALYSIS ERROR:", str(e))
        return {
            "error": "Topic analysis failed"
        }