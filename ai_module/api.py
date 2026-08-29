from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import logging
import traceback

from resume.semantic_matcher import calculate_rag_semantic_match
from resume.resume_parser import parse_resume
from resume.ats_analyzer import analyze_ats
from resume.skill_extractor import compare_skills
from resume.experience_analyzer import analyze_experience
from resume.project_analyzer import analyze_projects
from resume.achievement_analyzer import analyze_achievements
from resume.feedback_generator import generate_feedback

from interview.question_generator import generate_question
from interview.interview_feedback import generate_interview_report

from answer_evaluation import evaluate_answer


from topic_analysis import (
    analyze_topics,
    calculate_topic_performance,
    rank_topics,
    classify_topics
)

from pagerank import pagerank_topics


# =========================================================
# APP SETUP
# =========================================================

app = FastAPI()

logging.basicConfig(level=logging.INFO)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# MODELS
# =========================================================

class AnswerRequest(BaseModel):
    question: str
    student_answer: str
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


class QuestionGenerationRequest(BaseModel):
    role: str
    company: str = "General"
    topic: str
    question_type: str = "Technical"
    category: str = "Conceptual"

    # Avoid mutable default list
    history: List[dict] = Field(default_factory=list)


class AdaptiveQuestionRequest(BaseModel):
    role: str
    company: str = "General"
    question_type: str = "Technical"
    questions: List[Question]
    user_answers: List[str]


# =========================================================
# FINAL INTERVIEW EVALUATION
# =========================================================

class InterviewEvaluationItem(BaseModel):
    question: str
    student_answer: str
    topic: str = "General"

    # Scores obtained from /evaluate
    llm_score: float
    smith_waterman_score: float
    final_score: float


class FinalInterviewEvaluationRequest(BaseModel):
    role: str = "General"
    company: str = "General"
    answers: List[InterviewEvaluationItem]


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def home():
    return {
        "message": "AI Module API is running 🚀"
    }


# =========================================================
# EVALUATE SINGLE ANSWER
# =========================================================

@app.post("/evaluate")
def evaluate(req: AnswerRequest):

    try:

        result = evaluate_answer(
            req.student_answer,
            question=req.question,
            role=req.role,
            company=req.company
        )

        return {
            "success": True,
            "llm_score": result.get("llm_score", 0),
            "smith_waterman_score": result.get(
                "smith_waterman_score", 0
            ),
            "final_score": result.get("final_score", 0)
        }

    except Exception:

        logging.error(traceback.format_exc())

        return {
            "success": False,
            "error": "Evaluation failed"
        }


# =========================================================
# FINAL EVALUATION OF ALL ANSWERS
# =========================================================

@app.post("/evaluate-interview")
def evaluate_interview(
    req: FinalInterviewEvaluationRequest
):

    try:

        if not req.answers:

            return {
                "success": False,
                "error": "No answers provided"
            }

        logging.info(
            f"Final interview evaluation: "
            f"{len(req.answers)} answers"
        )

        # =================================================
        # PREPARE QUESTIONS
        # =================================================

        questions = []

        for item in req.answers:

            questions.append({
                "question": item.question,
                "topic": item.topic
            })

        # =================================================
        # USE SCORES ALREADY CALCULATED BY /evaluate
        # =================================================

        evaluations = []

        for item in req.answers:

            # Safety: keep scores between 0 and 100

            llm_score = max(
                0,
                min(float(item.llm_score), 100)
            )

            smith_waterman_score = max(
                0,
                min(float(item.smith_waterman_score), 100)
            )

            final_score = max(
                0,
                min(float(item.final_score), 100)
            )

            evaluations.append({

                "question":
                    item.question,

                "student_answer":
                    item.student_answer,

                "topic":
                    item.topic,

                "llm_score":
                    round(
                        llm_score,
                        2
                    ),

                "smith_waterman_score":
                    round(
                        smith_waterman_score,
                        2
                    ),

                "final_score":
                    round(
                        final_score,
                        2
                    )
            })

        # =================================================
        # GENERATE FINAL INTERVIEW REPORT
        # =================================================
        #
        # IMPORTANT:
        # This does NOT call evaluate_answer().
        #
        # It uses the scores already calculated by /evaluate
        # and generates ONE detailed overall feedback report.
        #

        report = generate_interview_report(

            role=req.role,

            company=req.company,

            questions=questions,

            evaluations=evaluations

        )

        # =================================================
        # RETURN FINAL REPORT
        # =================================================

        return report

    except Exception as e:

        logging.error(
            traceback.format_exc()
        )

        return {

            "success": False,

            "error":
                str(e),

            "message":
                "Final interview evaluation failed"

        }


# =========================================================
# TOPIC ANALYSIS
# =========================================================

@app.post("/analyze-topics")
def analyze(
    req: TopicAnalysisRequest
):

    try:

        if len(req.questions) != len(
            req.user_answers
        ):

            return {
                "error":
                    "Mismatch in questions and answers"
            }

        if not req.questions:

            return {
                "error":
                    "No questions provided"
            }

        questions = [
            q.model_dump()
            for q in req.questions
        ]

        topic_scores = analyze_topics(
            questions,
            req.user_answers
        )

        topic_avg = calculate_topic_performance(
            topic_scores
        )

        ranked = rank_topics(
            topic_avg
        )

        classified = classify_topics(
            topic_avg
        )

        pagerank_scores = pagerank_topics(
            topic_avg
        )

        return {

            "topic_scores":
                topic_scores,

            "topic_average":
                topic_avg,

            "topic_performance":
                topic_avg,

            "ranking":
                ranked,

            "ranked_topics":
                ranked,

            "classification":
                classified,

            "classifications":
                classified,

            "pagerank":
                pagerank_scores

        }

    except Exception as e:

        logging.error(
            traceback.format_exc()
        )

        return {

            "error":
                str(e),

            "message":
                "Topic analysis failed"

        }


# =========================================================
# RESUME ANALYSIS
# =========================================================

@app.post("/analyze-resume")
async def analyze_resume(
    req: ResumeRequest
):

    try:

        text = (
            req.text or ""
        ).strip()

        role = (
            req.role or ""
        ).strip()

        jd = (
            req.job_description or ""
        ).strip()

        if not text:

            return {

                "overall_score": 0,

                "error":
                    "Resume text is empty."

            }

        parsed_resume = parse_resume(
            text
        )

        ats_result = analyze_ats(
            parsed_resume
        )

        skill_result = compare_skills(
            text,
            jd if jd else role
        )

        experience_result = analyze_experience(
            text
        )

        project_result = analyze_projects(
            text
        )

        achievement_result = analyze_achievements(
            text
        )

        semantic_score = (
            calculate_rag_semantic_match(
                text,
                role,
                jd
            )
        )

        report = generate_feedback(

            semantic_score,

            ats_result,

            skill_result,

            experience_result,

            project_result,

            achievement_result

        )

        return {

            "role":
                role,

            "evaluation_mode":
                "AI Resume Analyzer v2",

            "report":
                report,

            "ats_analysis":
                ats_result,

            "skill_analysis":
                skill_result,

            "experience_analysis":
                experience_result,

            "project_analysis":
                project_result,

            "achievement_analysis":
                achievement_result

        }

    except Exception as e:

        logging.error(
            traceback.format_exc()
        )

        return {

            "overall_score": 0,

            "error":
                str(e),

            "message":
                "Resume analysis failed."

        }


# =========================================================
# GENERATE QUESTION
# =========================================================

@app.post("/generate-question")
def generate_interview_question(
    req: QuestionGenerationRequest
):

    try:

        question = generate_question(

            role=req.role,

            company=req.company or "General",

            topic=req.topic,

            history=req.history,

            question_type=req.question_type,

            category=req.category

        )

        return {

            "question":
                question,

            "role":
                req.role,

            "company":
                req.company or "General",

            "topic":
                req.topic,

            "question_type":
                req.question_type,

            "category":
                req.category

        }

    except Exception as e:

        logging.error(
            traceback.format_exc()
        )

        return {

            "error":
                str(e)

        }


# =========================================================
# NEXT ADAPTIVE QUESTION
# =========================================================

@app.post("/next-question")
def next_question(
    req: AdaptiveQuestionRequest
):

    try:

        if not req.questions:

            return {
                "error":
                    "No previous questions provided"
            }

        if len(req.questions) != len(
            req.user_answers
        ):

            return {
                "error":
                    "Mismatch in questions and answers"
            }

        questions = [
            q.model_dump()
            for q in req.questions
        ]

        topic_scores = analyze_topics(
            questions,
            req.user_answers
        )

        topic_avg = calculate_topic_performance(
            topic_scores
        )

        if not topic_avg:

            return {
                "error":
                    "Unable to analyze topics"
            }

        pagerank = pagerank_topics(
            topic_avg
        )

        weakest_topic = min(
            topic_avg,
            key=topic_avg.get
        )

        score = topic_avg[
            weakest_topic
        ]

        history = [
            {
                "score":
                    score
            }
        ]

        question = generate_question(

            role=req.role,

            company=req.company or "General",

            topic=weakest_topic,

            history=history,

            question_type=req.question_type

        )

        return {

            "next_question":
                question,

            "topic":
                weakest_topic,

            "difficulty":
                question.get(
                    "difficulty"
                ),

            "topic_scores":
                topic_avg,

            "pagerank":
                pagerank

        }

    except Exception as e:

        logging.error(
            traceback.format_exc()
        )

        return {

            "error":
                str(e),

            "message":
                "Adaptive question generation failed"

        }