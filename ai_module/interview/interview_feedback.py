import logging
import traceback
from typing import List

from llama.llama_client import ask_llama


def generate_interview_report(
    role: str,
    company: str,
    questions: List[dict],
    evaluations: List[dict]
):
    """
    Generate a detailed final interview report after all questions
    have been evaluated.

    Each evaluation is expected to contain:
    - llm_score
    - smith_waterman_score
    - final_score
    - result
    - feedback
    - strengths
    - missing_concepts
    """

    try:
        if not evaluations:
            return {
                "overall_score": 0,
                "result": "No evaluation data available",
                "summary": "No answers were submitted.",
                "strengths": [],
                "weaknesses": [],
                "recommendations": [],
                "question_results": []
            }

        # ---------------------------------------
        # Calculate total score
        # ---------------------------------------

        scores = [
            float(e.get("final_score", 0))
            for e in evaluations
        ]

        overall_score = sum(scores) / len(scores)

        # ---------------------------------------
        # Collect strengths and weaknesses
        # ---------------------------------------

        strengths = []
        weaknesses = []

        for evaluation in evaluations:

            strengths.extend(
                evaluation.get("strengths", [])
            )

            weaknesses.extend(
                evaluation.get("missing_concepts", [])
            )

        # Remove duplicates while preserving order
        strengths = list(dict.fromkeys(strengths))
        weaknesses = list(dict.fromkeys(weaknesses))

        # ---------------------------------------
        # Prepare answer information for LLM
        # ---------------------------------------

        interview_data = []

        for index, evaluation in enumerate(evaluations):

            question = ""

            if index < len(questions):
                question = questions[index].get(
                    "question",
                    ""
                )

            interview_data.append({
                "question_number": index + 1,
                "question": question,
                "final_score": evaluation.get(
                    "final_score",
                    0
                ),
                "llm_score": evaluation.get(
                    "llm_score",
                    0
                ),
                "smith_waterman_score": evaluation.get(
                    "smith_waterman_score",
                    evaluation.get(
                        "keyword_match_score",
                        0
                    )
                ),
                "result": evaluation.get(
                    "result",
                    ""
                ),
                "feedback": evaluation.get(
                    "feedback",
                    ""
                ),
                "strengths": evaluation.get(
                    "strengths",
                    []
                ),
                "missing_concepts": evaluation.get(
                    "missing_concepts",
                    []
                )
            })

        # ---------------------------------------
        # LLM Final Analysis
        # ---------------------------------------

        prompt = f"""
You are an expert technical interview evaluator.

Prepare a detailed final interview feedback report.

Candidate Role:
{role}

Target Company:
{company}

Overall Score:
{round(overall_score, 2)}/100

Interview contained:
{len(evaluations)} questions.

Individual Evaluation Data:
{interview_data}

Generate feedback covering:

1. Overall performance
2. Technical knowledge
3. Strong areas
4. Weak areas
5. Concepts the candidate needs to improve
6. Answer quality
7. Interview readiness
8. Specific recommendations for improvement
9. Final assessment

Important:

- Base the report ONLY on the evaluation data provided.
- Do not invent skills, weaknesses, or concepts that are not supported by the evaluation data.
- Do not penalize the candidate for information that was not required by the interview questions.
- Do not assume that missing information is a weakness unless it appears in the evaluation data.
- Mention both strong and weak areas when supported by the data.
- Consider the LLM score, Smith-Waterman score, and final score.
- Explain why the candidate received the overall score.
- Give practical, specific recommendations based on the missing concepts.
- Keep the feedback detailed but easy for a student to understand.
- Do not give generic recommendations unrelated to the evaluation data.
"""

        llm_feedback = ask_llama(prompt)

        if not llm_feedback:
            llm_feedback = (
                "Detailed AI feedback could not be generated."
            )

        # ---------------------------------------
        # Question-by-question results
        # ---------------------------------------

        question_results = []

        for index, evaluation in enumerate(evaluations):

            question_text = ""

            if index < len(questions):
                question_text = questions[index].get(
                    "question",
                    ""
                )

            question_results.append({
                "question_number": index + 1,
                "question": question_text,
                "score": round(
                    float(
                        evaluation.get(
                            "final_score",
                            0
                        )
                    ),
                    2
                ),
                "llm_score": evaluation.get(
                    "llm_score",
                    0
                ),
                "smith_waterman_score": evaluation.get(
                    "smith_waterman_score",
                    evaluation.get(
                        "keyword_match_score",
                        0
                    )
                ),
                "result": evaluation.get(
                    "result",
                    "Unknown"
                ),
                "feedback": evaluation.get(
                    "feedback",
                    ""
                ),
                "strengths": evaluation.get(
                    "strengths",
                    []
                ),
                "missing_concepts": evaluation.get(
                    "missing_concepts",
                    []
                )
            })

        # ---------------------------------------
        # Final Report
        # ---------------------------------------

        if overall_score >= 85:
            classification = "Excellent"
        elif overall_score >= 75:
            classification = "Good"
        elif overall_score >= 60:
            classification = "Average"
        elif overall_score >= 40:
            classification = "Needs Improvement"
        else:
            classification = "Beginner"

        return {
            "overall_score": round(
                overall_score,
                2
            ),

            "classification": classification,

            "total_questions": len(
                evaluations
            ),

            "summary": llm_feedback,

            "strengths": strengths,

            "weaknesses": weaknesses,

            "recommendations": [],

            "question_results": question_results,

            "evaluation_method": {
                "llm_weight": "80%",
                "smith_waterman_weight": "20%"
            },

            "role": role,

            "company": company
        }

    except Exception as e:

        logging.error(
            traceback.format_exc()
        )

        return {
            "overall_score": round(
                sum(
                    float(
                        e.get(
                            "final_score",
                            0
                        )
                    )
                    for e in evaluations
                ) / len(evaluations)
                if evaluations
                else 0,
                2
            ),
            "classification": "Evaluation Error",
            "total_questions": len(evaluations),
            "summary": "Unable to generate detailed AI feedback.",
            "strengths": [],
            "weaknesses": [],
            "recommendations": [],
            "question_results": []
        }