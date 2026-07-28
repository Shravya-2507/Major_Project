from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import logging
import traceback
#from resume import calculate_rag_semantic_match, generate_detailed_feedback
from resume.semantic_matcher import calculate_rag_semantic_match

from resume.resume_parser import parse_resume
from resume.ats_analyzer import analyze_ats
from resume.skill_extractor import compare_skills
from resume.experience_analyzer import analyze_experience
from resume.project_analyzer import analyze_projects
from resume.achievement_analyzer import analyze_achievements
from resume.feedback_generator import generate_feedback

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
    job_description: Optional[str] = None

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
# Refactored Version with Consistent Error Schema & Async Capability
@app.post("/analyze-resume")
async def analyze_resume(req: ResumeRequest):

    try:

        text = (req.text or "").strip()

        role = (req.role or "").strip()

        jd = (req.job_description or "").strip()

        if not text:

            return {
                "overall_score": 0,
                "error": "Resume text is empty."
            }

        # -------------------------------
        # Parse Resume
        # -------------------------------

        parsed_resume = parse_resume(text)

        # -------------------------------
        # ATS Analysis
        # -------------------------------

        ats_result = analyze_ats(parsed_resume)

        # -------------------------------
        # Skill Analysis
        # -------------------------------

        skill_result = compare_skills(
            text,
            jd if jd else role
        )

        # -------------------------------
        # Experience Analysis
        # -------------------------------

        experience_result = analyze_experience(text)

        # -------------------------------
        # Project Analysis
        # -------------------------------

        project_result = analyze_projects(text)

        # -------------------------------
        # Achievement Analysis
        # -------------------------------

        achievement_result = analyze_achievements(text)

        # -------------------------------
        # Semantic Matching
        # -------------------------------

        semantic_score = calculate_rag_semantic_match(
            text,
            role,
            jd
        )

        # -------------------------------
        # Final AI Feedback
        # -------------------------------

        report = generate_feedback(

            semantic_score,

            ats_result,

            skill_result,

            experience_result,

            project_result,

            achievement_result

        )

        return {

            "role": role,

            "evaluation_mode":
            "AI Resume Analyzer v2",

            "report": report,

            "ats_analysis": ats_result,

            "skill_analysis": skill_result,

            "experience_analysis": experience_result,

            "project_analysis": project_result,

            "achievement_analysis": achievement_result

        }

    except Exception as e:

        logging.error(traceback.format_exc())

        return {

            "overall_score": 0,

            "error": str(e),

            "message": "Resume analysis failed."

        }