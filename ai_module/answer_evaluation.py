from semantic import semantic_score
from smith_waterman import smith_waterman


def get_result(score, role="General"):
    """
    Adjusts passing thresholds based on the role.
    """

    is_senior = any(
        word in role.lower()
        for word in ["senior", "lead", "architect", "expert"]
    )

    correct_threshold = 85 if is_senior else 75
    partial_threshold = 60 if is_senior else 50


    if score >= correct_threshold:
        return f"Correct ({role} Standard)"

    elif score >= partial_threshold:
        return "Partially Correct"

    else:
        return "Incorrect"



def evaluate_answer(
        ans,
        correct,
        role="General",
        company="General"
):

    print(
        f"DEBUG: Evaluating Role: {role}, Company: {company}"
    )


    # ==============================
    # 1. Semantic Understanding
    # MAIN AI COMPONENT
    # ==============================

    sem_scaled = semantic_score(
        ans,
        correct
    ) * 100



    # ==============================
    # 2. Smith-Waterman
    # SUPPORTING FEATURE ONLY
    # ==============================

    sw_scaled = smith_waterman(
        ans,
        correct
    ) * 100



    # ==============================
    # 3. Final Weighted Score
    #
    # Semantic      -> 90%
    # Smith-Waterman -> 10%
    #
    # ==============================

    raw_final = (
        0.90 * sem_scaled +
        0.10 * sw_scaled
    )


    # Prevent score overflow

    final_score = min(
        raw_final,
        100.0
    )


    return {

        # Main metric
        "semantic_score": round(
            sem_scaled,
            2
        ),


        # Supporting metric
        "keyword_match_score": round(
            sw_scaled,
            2
        ),


        "final_score": round(
            final_score,
            2
        ),


        "result": get_result(
            final_score,
            role
        ),


        "evaluation_method": {
            "semantic_weight": "90%",
            "keyword_weight": "10%"
        },


        "context": {
            "role": role,
            "company": company
        }
    }