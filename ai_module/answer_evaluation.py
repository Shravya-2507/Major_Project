from ai_module.semantic import semantic_score
from ai_module.smith_waterman import smith_waterman

def get_result(score):
    if score > 0.75:
        return "Correct"
    elif score > 0.5:
        return "Partially Correct"
    else:
        return "Incorrect"

def evaluate_answer(ans, correct):
    sem = semantic_score(ans, correct)
    sw = smith_waterman(ans, correct)

    final = 0.7 * sem + 0.3 * sw

    return {
        "semantic_score": round(sem, 2),
        "smith_score": round(sw, 2),
        "final_score": round(final, 2),
        "result": get_result(final)
    }

