import json
import re

from llama.llama_client import ask_llama
from smith_waterman import smith_waterman


# ============================================================
# LLM SCORE EVALUATION
# ============================================================

def llm_evaluate_answer(
    question,
    answer,
    role="General",
    company="General"
):
    """
    Evaluate one interview answer using Llama.

    The LLM returns:
    - score
    - ideal_answer

    Individual feedback is NOT generated here.
    Detailed feedback is generated only by interview_feedback.py
    after the complete interview is submitted.
    """

    prompt = f"""
You are an expert technical interviewer.

Evaluate the candidate's answer to the interview question.

========================================
INTERVIEW CONTEXT
========================================

Role:
{role}

Company:
{company}

========================================
QUESTION
========================================

{question}

========================================
CANDIDATE ANSWER
========================================

{answer}

========================================
EVALUATION CRITERIA
========================================

Evaluate ONLY:

1. Technical correctness
2. Concept understanding
3. Important concept coverage
4. Relevance
5. Completeness
6. Technical accuracy
7. Quality of explanation

Do NOT give credit simply because the candidate
uses words similar to the question.

The candidate must demonstrate actual understanding.

========================================
SCORING
========================================

90-100:
Excellent answer.
Correct, complete and technically strong.

75-89:
Good answer.
Mostly correct with minor omissions.

60-74:
Partially correct.
Shows understanding but misses important concepts.

40-59:
Weak answer.
Some relevant knowledge but significant gaps.

0-39:
Incorrect or irrelevant answer.

========================================
IDEAL ANSWER
========================================

Generate a concise expert/reference answer.

The ideal answer must be based ONLY on:

- The interview question
- Candidate role
- Target company
- General technical knowledge

Do NOT use the candidate answer to construct
the ideal answer.

Do NOT copy, paraphrase, or adapt the candidate answer.

========================================
IMPORTANT
========================================

Return ONLY valid JSON.

Use exactly this format:

{{
    "score": 0,
    "ideal_answer": "concise technically correct ideal answer"
}}

The score MUST be a number between 0 and 100.
"""


    response = ask_llama(prompt)

    if not response:
        return {
            "score": 0,
            "ideal_answer": ""
        }


    # ========================================================
    # SAFE JSON PARSING
    # ========================================================

    try:

        response = response.strip()

        # Remove markdown code fences
        response = re.sub(
            r"```json\s*",
            "",
            response,
            flags=re.IGNORECASE
        )

        response = re.sub(
            r"```\s*",
            "",
            response
        )

        # Find JSON object
        match = re.search(
            r"\{.*\}",
            response,
            re.DOTALL
        )

        if match:
            response = match.group(0)

        data = json.loads(response)

        score = float(
            data.get("score", 0)
        )

        score = max(
            0,
            min(score, 100)
        )

        return {
            "score": score,
            "ideal_answer": data.get(
                "ideal_answer",
                ""
            )
        }


    except Exception as error:

        print(
            "LLM JSON parsing error:",
            error
        )

        print(
            "Raw LLM response:",
            response
        )

        return {
            "score": 0,
            "ideal_answer": ""
        }


# ============================================================
# MAIN ANSWER EVALUATION
# ============================================================

def evaluate_answer(
    ans,
    question="",
    role="General",
    company="General"
):
    """
    Evaluate one interview answer.

    Evaluation:

        LLM             -> 80%
        Smith-Waterman  -> 20%

    This function ONLY calculates the individual score.

    Detailed interview feedback is generated later by:

        interview_feedback.py

    through /evaluate-interview.
    """

    print(
        "=============================================="
    )

    print(
        "DEBUG: Evaluating Interview Answer"
    )

    print(
        f"Role: {role}"
    )

    print(
        f"Company: {company}"
    )

    print(
        f"Question: {question}"
    )

    print(
        f"Candidate Answer: {ans}"
    )

    print(
        "=============================================="
    )


    # ========================================================
    # VALIDATE ANSWER
    # ========================================================

    if not ans or not str(ans).strip():

        return {
            "llm_score": 0,
            "smith_waterman_score": 0,
            "keyword_match_score": 0,
            "final_score": 0,
            "result": "Incorrect",
            "ideal_answer": "",
            "evaluation_method": {
                "llm_weight": "80%",
                "smith_waterman_weight": "20%"
            }
        }


    # ========================================================
    # VALIDATE QUESTION
    # ========================================================

    if not question or not str(question).strip():

        return {
            "llm_score": 0,
            "smith_waterman_score": 0,
            "keyword_match_score": 0,
            "final_score": 0,
            "result": "Evaluation Failed",
            "ideal_answer": "",
            "evaluation_method": {
                "llm_weight": "80%",
                "smith_waterman_weight": "20%"
            }
        }


    # ========================================================
    # 1. LLM EVALUATION
    # ========================================================

    llm_result = llm_evaluate_answer(
        question=question,
        answer=ans,
        role=role,
        company=company
    )

    llm_score = float(
        llm_result.get("score", 0)
    )


    # ========================================================
    # 2. GET IDEAL ANSWER
    # ========================================================

    ideal_answer = llm_result.get(
        "ideal_answer",
        ""
    )


    # ========================================================
    # 3. SMITH-WATERMAN
    # ========================================================

    sw_score = 0.0

    if ideal_answer:

        try:

            sw_score = smith_waterman(
                str(ans),
                str(ideal_answer)
            ) * 100

        except Exception as error:

            print(
                "Smith-Waterman error:",
                error
            )

            sw_score = 0.0


    sw_score = max(
        0,
        min(float(sw_score), 100)
    )


    # ========================================================
    # 4. FINAL SCORE
    #
    # LLM             = 80%
    # Smith-Waterman  = 20%
    # ========================================================

    final_score = (
        0.80 * llm_score
        +
        0.20 * sw_score
    )

    final_score = max(
        0,
        min(final_score, 100)
    )


    # ========================================================
    # 5. CLASSIFICATION
    # ========================================================

    result = get_result(
        final_score,
        role
    )


    # ========================================================
    # DEBUG
    # ========================================================

    print(
        "========== EVALUATION RESULT =========="
    )

    print(
        f"LLM Score: {llm_score:.2f}"
    )

    print(
        f"Smith-Waterman Score: {sw_score:.2f}"
    )

    print(
        f"Final Score: {final_score:.2f}"
    )

    print(
        f"Result: {result}"
    )

    print(
        "========================================"
    )


    # ========================================================
    # RETURN
    # ========================================================

    return {

        "llm_score": round(
            llm_score,
            2
        ),

        "smith_waterman_score": round(
            sw_score,
            2
        ),

        # Backward compatibility
        "keyword_match_score": round(
            sw_score,
            2
        ),

        "final_score": round(
            final_score,
            2
        ),

        "result": result,

        # Needed internally for scoring/debugging
        # but NOT displayed as individual feedback
        "ideal_answer": ideal_answer,

        "evaluation_method": {
            "llm_weight": "80%",
            "smith_waterman_weight": "20%"
        },

        "context": {
            "role": role,
            "company": company
        }
    }


# ============================================================
# RESULT CLASSIFICATION
# ============================================================

def get_result(
    score,
    role="General"
):
    """
    Classify candidate performance.
    """

    is_senior = any(
        word in role.lower()
        for word in [
            "senior",
            "lead",
            "architect",
            "expert"
        ]
    )

    correct_threshold = (
        85 if is_senior else 75
    )

    partial_threshold = (
        60 if is_senior else 50
    )

    if score >= correct_threshold:

        return (
            f"Correct ({role} Standard)"
        )

    elif score >= partial_threshold:

        return "Partially Correct"

    else:

        return "Incorrect"
