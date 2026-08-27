import json
import re

from llama.llama_client import ask_llama
from smith_waterman import smith_waterman

<<<<<<< Updated upstream
def get_result(score, role="General"):
    """
    Adjusts passing thresholds based on the role.
    Example: Senior roles require higher accuracy (85+) to be 'Correct'.
    """
    # Dynamic thresholds based on role seniority
    is_senior = any(word in role.lower() for word in ["senior", "lead", "architect", "expert"])
    
    correct_threshold = 85 if is_senior else 75
    partial_threshold = 60 if is_senior else 50

    if score >= correct_threshold:
        return f"Correct ({role} Standard)"
    elif score >= partial_threshold:
        return "Partially Correct"
    else:
        return "Incorrect"

def evaluate_answer(ans, correct, role="General", company="General"):
    print(f"DEBUG: Evaluating for Role: {role} at Company: {company}") # Add this
    # ... rest of your code
    # 1. Scale raw scores to 100
    sem_scaled = semantic_score(ans, correct) * 100
    sw_scaled = smith_waterman(ans, correct) * 100

    # 2. Weighted calculation
    # You could even adjust weights based on role here 
    # (e.g., higher Smith-Waterman for roles requiring exact syntax)
    raw_final = (0.7 * sem_scaled) + (0.3 * sw_scaled)

    # ✅ THE CLAMP: Ensure final_score is never > 100
    final_score = min(raw_final, 100.0)

    return {
        "semantic_score": round(sem_scaled, 2),
        "smith_score": round(sw_scaled, 2),
        "final_score": round(final_score, 2),
        "result": get_result(final_score, role),
=======

# ============================================================
# LLM EVALUATION
# ============================================================

def llm_evaluate_answer(
    question,
    answer,
    role="General",
    company="General"
):
    """
    Evaluate a candidate's interview answer using Llama.

    The LLM evaluates:
    - Correctness
    - Concept coverage
    - Technical accuracy
    - Relevance
    - Completeness

    Returns a score from 0-100.
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

Evaluate the answer based on:

1. Technical correctness
2. Concept understanding
3. Important concept coverage
4. Relevance to the question
5. Completeness
6. Accuracy of terminology
7. Quality of explanation

Do NOT give credit merely because the candidate
uses words similar to the question.

The answer must demonstrate actual understanding.

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
IMPORTANT
========================================

Return ONLY valid JSON.

Use exactly this format:

{{
    "score": 0,
    "feedback": "short explanation",
    "strengths": ["strength 1", "strength 2"],
    "missing_concepts": ["concept 1", "concept 2"]
}}

The score MUST be a number between 0 and 100.
"""

    response = ask_llama(prompt)

    if not response:
        return {
            "score": 0,
            "feedback": "LLM evaluation failed.",
            "strengths": [],
            "missing_concepts": []
        }

    # --------------------------------------------------------
    # Extract JSON safely
    # --------------------------------------------------------

    try:
        response = response.strip()

        # Remove markdown code fences if Llama adds them
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

        # Find JSON object if extra text exists
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

            "feedback":
                data.get(
                    "feedback",
                    "No feedback provided."
                ),

            "strengths":
                data.get(
                    "strengths",
                    []
                ),

            "missing_concepts":
                data.get(
                    "missing_concepts",
                    []
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
            "feedback":
                "Unable to parse LLM evaluation.",
            "strengths": [],
            "missing_concepts": []
        }


# ============================================================
# MAIN ANSWER EVALUATION
# ============================================================

def evaluate_answer(
    ans,
    correct=None,
    question="",
    role="General",
    company="General"
):
    """
    Evaluate one interview answer.

    Evaluation:

        LLM             -> 80%
        Smith-Waterman  -> 20%

    `correct` is optional.

    For dynamically generated questions, the LLM
    evaluates the answer directly against the question.

    If an expected answer exists, Smith-Waterman
    compares the candidate answer against it.

    If expected answer does not exist, the LLM feedback
    is used as the reference text for Smith-Waterman.
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
    # Validate answer
    # ========================================================

    if not ans or not str(ans).strip():

        return {
            "llm_score": 0,
            "smith_waterman_score": 0,
            "final_score": 0,

            "result": "Incorrect",

            "feedback":
                "No answer was provided.",

            "strengths": [],

            "missing_concepts": [],

            "evaluation_method": {
                "llm_weight": "80%",
                "smith_waterman_weight": "20%"
            },

            "context": {
                "role": role,
                "company": company
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
    # 2. Smith-Waterman
    # ========================================================

    # Normally use the database expected answer.
    reference_text = correct

    # --------------------------------------------------------
    # For AI-generated questions, expected_answer may be NULL.
    #
    # In that case use the LLM feedback as supporting reference.
    # --------------------------------------------------------

    if not reference_text:

        reference_text = (
            llm_result.get("feedback", "")
        )

        missing = llm_result.get(
            "missing_concepts",
            []
        )

        if missing:
            reference_text += " " + " ".join(
                str(item)
                for item in missing
            )

    # --------------------------------------------------------
    # Calculate Smith-Waterman score
    # --------------------------------------------------------

    if reference_text:

        try:

            sw_score = smith_waterman(
                str(ans),
                str(reference_text)
            ) * 100

        except Exception as error:

            print(
                "Smith-Waterman error:",
                error
            )

            sw_score = 0

    else:

        sw_score = 0

    sw_score = max(
        0,
        min(float(sw_score), 100)
    )

    # ========================================================
    # 3. FINAL SCORE
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
    # 4. Classification
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
    # Return
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

        # Keep old name for frontend compatibility
        "keyword_match_score": round(
            sw_score,
            2
        ),

        "final_score": round(
            final_score,
            2
        ),

        "result": result,

        "feedback":
            llm_result.get(
                "feedback",
                "No feedback."
            ),

        "strengths":
            llm_result.get(
                "strengths",
                []
            ),

        "missing_concepts":
            llm_result.get(
                "missing_concepts",
                []
            ),

        "evaluation_method": {
            "llm_weight": "80%",
            "smith_waterman_weight": "20%"
        },

>>>>>>> Stashed changes
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