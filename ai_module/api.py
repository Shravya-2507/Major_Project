from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import logging
import traceback

# =============================
# AI MODULE IMPORTS
# =============================
from answer_evaluation import evaluate_answer
from topic_analysis import (
    analyze_topics,
    calculate_topic_performance,
    rank_topics,
    classify_topics
)
from pagerank import pagerank_topics

# =============================
# APP SETUP
# =============================
app = FastAPI()
logging.basicConfig(level=logging.INFO)

# =============================
# CORS
# =============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================
# MODELS
# =============================
class AnswerRequest(BaseModel):
    student_answer: str
    correct_answer: str
    role: str = "General"
    company: str = "General"


class Question(BaseModel):
    question: str
    answer: str
    topic: str


class TopicAnalysisRequest(BaseModel):
    questions: List[Question]
    user_answers: List[str]


class ResumeRequest(BaseModel):
    text: str
    role: str = "General"

# =============================
# ROOT
# =============================
@app.get("/")
def home():
    return {"message": "AI Module API is running 🚀"}

# =============================
# EVALUATE ANSWER
# =============================
@app.post("/evaluate")
def evaluate(req: AnswerRequest):
    try:
        return evaluate_answer(
            req.student_answer,
            req.correct_answer,
            role=req.role,
            company=req.company
        )
    except Exception:
        logging.error(traceback.format_exc())
        return {"error": "Evaluation failed"}

# =============================
# TOPIC ANALYSIS
# =============================
@app.post("/analyze-topics")
def analyze(req: TopicAnalysisRequest):
    try:
        if len(req.questions) != len(req.user_answers):
            return {"error": "Mismatch in questions and answers"}

        questions = [q.model_dump() for q in req.questions]

        topic_scores = analyze_topics(questions, req.user_answers)
        topic_avg = calculate_topic_performance(topic_scores)
        ranked = rank_topics(topic_avg)
        classified = classify_topics(topic_avg)
        pagerank_scores = pagerank_topics(topic_avg)

        return {
            "topic_scores": topic_scores,
            "topic_average": topic_avg,
            "ranking": ranked,
            "classification": classified,
            "pagerank": pagerank_scores
        }

    except Exception as e:
        logging.error(traceback.format_exc())
        return {
            "error": str(e),
            "message": "Topic analysis failed"
        }

# =============================
# RESUME ANALYSIS
# =============================
@app.post("/analyze-resume")
def analyze_resume(req: ResumeRequest):
    try:
        text = (req.text or "").lower().strip()
        role = (req.role or "").lower()

        if not text:
            return {"score": 0, "feedback": ["Empty resume"]}

        ROLE_REQUIREMENTS = {
            "backend": {
                "must_have": ["node", "express", "api", "database"],
                "nice_to_have": ["jwt", "authentication", "rest", "mongodb", "sql"],
                "soft_skills": ["problem solving", "communication"]
            },
            "data scientist": {
                "must_have": ["python", "machine learning", "pandas", "numpy"],
                "nice_to_have": ["statistics", "visualization", "data analysis"],
                "soft_skills": ["problem solving", "analytical thinking"]
            },
            "software engineer": {
                "must_have": ["data structures", "algorithms", "system design"],
                "nice_to_have": ["api", "projects", "development"],
                "soft_skills": ["problem solving", "coding"]
            }
        }

        role_key = "software engineer"
        for r in ROLE_REQUIREMENTS:
            if r in role:
                role_key = r

        rules = ROLE_REQUIREMENTS[role_key]

        score = 100
        feedback = []

        for skill in rules["must_have"]:
            if skill not in text:
                score -= 15
                feedback.append(f"Missing core skill: {skill}")

        for skill in rules["nice_to_have"]:
            if skill not in text:
                score -= 6
                feedback.append(f"Add skill: {skill}")

        for skill in rules["soft_skills"]:
            if skill in text:
                score += 2

        if "project" not in text:
            score -= 10
            feedback.append("Add projects experience")

        if "intern" not in text:
            score -= 12
            feedback.append("Add internship experience")

        if not any(w in text for w in ["built", "developed", "led", "optimized"]):
            score -= 8
            feedback.append("Add measurable achievements")

        if any(w in text for w in ["built", "developed", "led"]):
            score += 3

        if any(char.isdigit() for char in text):
            score += 3

        score = max(0, min(100, score))

        return {
            "role_detected": role_key,
            "score": round(score, 2),
            "feedback": list(set(feedback))
        }

    except Exception as e:
        return {
            "score": 0,
            "error": str(e),
            "message": "Resume analysis failed"
        }