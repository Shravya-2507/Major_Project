from fastapi import FastAPI
from pydantic import BaseModel
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

<<<<<<< Updated upstream
# =============================
# AI MODULE IMPORTS
# =============================
=======
from interview.question_generator import generate_question

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
# =============================
=======

class QuestionGenerationRequest(BaseModel):
    role: str
    company: str = "General"
    topic: str
    question_type: str = "Technical"
    category: str = "Conceptual"
    history: List[dict] = []


class AdaptiveQuestionRequest(BaseModel):
    role: str
    company: str = "General"
    question_type: str = "Technical"

    questions: List[Question]
    user_answers: List[str]


# =========================================================
# NEW MODEL
# FINAL INTERVIEW EVALUATION
# =========================================================

class InterviewEvaluationItem(BaseModel):
    question: str
    correct_answer: str
    student_answer: str
    topic: str = "General"


class FinalInterviewEvaluationRequest(BaseModel):
    role: str = "General"
    company: str = "General"

    answers: List[InterviewEvaluationItem]


# =========================================================
>>>>>>> Stashed changes
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
            req.correct_answer,
            role=req.role,
            company=req.company
        )

        return result

    except Exception:

        logging.error(traceback.format_exc())

        return {
            "error": "Evaluation failed"
        }


# =========================================================
# FINAL EVALUATION OF ALL 10 ANSWERS
# =========================================================

@app.post("/evaluate-interview")
def evaluate_interview(
    req: FinalInterviewEvaluationRequest
):

    try:

        if not req.answers:

            return {
                "error": "No answers provided"
            }

        logging.info(
            f"Evaluating final interview: "
            f"{len(req.answers)} answers"
        )

        results = []

        total_score = 0

        # =================================================
        # EVALUATE EACH ANSWER
        # =================================================

        for index, item in enumerate(req.answers):

            logging.info(
                f"Evaluating question {index + 1}"
            )

            result = evaluate_answer(

                item.student_answer,

                item.correct_answer,

                role=req.role,

                company=req.company
            )

            score = float(
                result.get("final_score", 0)
            )

            total_score += score

            results.append({

                "question_number": index + 1,

                "question": item.question,

                "topic": item.topic,

                "student_answer":
                    item.student_answer,

                "correct_answer":
                    item.correct_answer,

                "score": round(
                    score,
                    2
                ),

                "llm_score":
                    result.get(
                        "llm_score",
                        0
                    ),

                "smith_waterman_score":
                    result.get(
                        "smith_waterman_score",
                        result.get(
                            "keyword_match_score",
                            0
                        )
                    ),

                "result":
                    result.get(
                        "result",
                        "Unknown"
                    ),

                "feedback":
                    result.get(
                        "feedback",
                        ""
                    ),

                "strengths":
                    result.get(
                        "strengths",
                        []
                    ),

                "missing_concepts":
                    result.get(
                        "missing_concepts",
                        []
                    )
            })


        # =================================================
        # TOTAL SCORE
        # =================================================

        question_count = len(results)

        total_score = (
            total_score / question_count
        )


        # =================================================
        # SCORE CLASSIFICATION
        # =================================================

        if total_score >= 85:

            overall_result = "Excellent"

        elif total_score >= 75:

            overall_result = "Very Good"

        elif total_score >= 65:

            overall_result = "Good"

        elif total_score >= 50:

            overall_result = "Needs Improvement"

        else:

            overall_result = "Beginner"


        # =================================================
        # TOPIC PERFORMANCE
        # =================================================

        topic_scores = {}

        for item in results:

            topic = item["topic"]

            if topic not in topic_scores:

                topic_scores[topic] = []

            topic_scores[topic].append(
                item["score"]
            )


        topic_average = {}

        for topic, scores in topic_scores.items():

            topic_average[topic] = round(
                sum(scores) / len(scores),
                2
            )


        # =================================================
        # STRONG / WEAK TOPICS
        # =================================================

        strongest_topic = None
        weakest_topic = None

        if topic_average:

            strongest_topic = max(
                topic_average,
                key=topic_average.get
            )

            weakest_topic = min(
                topic_average,
                key=topic_average.get
            )


        # =================================================
        # COLLECT STRENGTHS
        # =================================================

        strengths = []

        for item in results:

            for strength in item.get(
                "strengths",
                []
            ):

                if strength not in strengths:

                    strengths.append(
                        strength
                    )


        # =================================================
        # COLLECT MISSING CONCEPTS
        # =================================================

        missing_concepts = []

        for item in results:

            for concept in item.get(
                "missing_concepts",
                []
            ):

                if concept not in missing_concepts:

                    missing_concepts.append(
                        concept
                    )


        # =================================================
        # QUESTION FEEDBACK
        # =================================================

        question_feedback = []

        for item in results:

            question_feedback.append({

                "question_number":
                    item["question_number"],

                "topic":
                    item["topic"],

                "score":
                    item["score"],

                "result":
                    item["result"],

                "feedback":
                    item["feedback"],

                "strengths":
                    item["strengths"],

                "missing_concepts":
                    item["missing_concepts"]

            })


        # =================================================
        # FINAL RESPONSE
        # =================================================

        return {

            "success": True,

            "role": req.role,

            "company": req.company,

            "total_questions":
                question_count,

            "total_score":
                round(
                    total_score,
                    2
                ),

            "percentage":
                round(
                    total_score,
                    2
                ),

            "overall_result":
                overall_result,

            "strongest_topic":
                strongest_topic,

            "weakest_topic":
                weakest_topic,

            "topic_scores":
                topic_average,

            "strengths":
                strengths,

            "missing_concepts":
                missing_concepts,

            "question_feedback":
                question_feedback,

            "answers":
                results,

            "evaluation_method": {

                "llm_weight": "80%",

                "smith_waterman_weight":
                    "20%",

                "description":
                    "Each answer is evaluated using LLM semantic understanding and Smith-Waterman sequence similarity. The final interview score is the average of all individual answer scores."

            }

        }

    except Exception as e:

        logging.error(
            traceback.format_exc()
        )

        return {

            "success": False,

            "error": str(e),

            "message":
                "Final interview evaluation failed"

        }


# =========================================================
# TOPIC ANALYSIS
# =========================================================

@app.post("/analyze-topics")
def analyze(req: TopicAnalysisRequest):

    try:

        if len(req.questions) != len(
            req.user_answers
        ):

            return {
                "error":
                    "Mismatch in questions and answers"
            }

<<<<<<< Updated upstream
        questions = [q.model_dump() for q in req.questions]
=======
        if not req.questions:

            return {
                "error":
                    "No questions provided"
            }
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
            "topic_scores": topic_scores,
            "topic_average": topic_avg,
            "ranking": ranked,
            "classification": classified,
            "pagerank": pagerank_scores
=======

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

>>>>>>> Stashed changes
        }

    except Exception as e:

        logging.error(
            traceback.format_exc()
        )

        return {

            "error": str(e),

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

            "error": str(e),

            "message":
                "Resume analysis failed."

<<<<<<< Updated upstream
=======
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

            "error": str(e)

        }


# =========================================================
# NEXT ADAPTIVE QUESTION
# =========================================================

@app.post("/next-question")
def next_question(
    req: AdaptiveQuestionRequest
):

    try:

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
                "score": score
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
                question["difficulty"],

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

            "error": str(e),

            "message":
                "Adaptive question generation failed"

>>>>>>> Stashed changes
        }