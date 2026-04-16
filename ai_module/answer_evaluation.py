from semantic import semantic_score
from smith_waterman import smith_waterman

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
        "context": {
            "role": role,
            "company": company
        }
    }