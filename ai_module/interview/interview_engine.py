def next_level(score, current_level="Medium"):
    """
    Adaptive interview difficulty engine.

    Score comes from AI answer evaluation:
    - Semantic similarity
    - Concept coverage
    - LLM evaluation

    Difficulty changes dynamically.
    """

    if score >= 85:
        return "Hard"

    elif score >= 65:
        return "Medium"

    else:
        return "Easy"



def adjust_difficulty(history):
    """
    Decides next question difficulty based on
    candidate performance trend.

    history example:
    [
        {"score":80, "level":"Medium"},
        {"score":90, "level":"Hard"},
        {"score":55, "level":"Medium"}
    ]
    """

    if not history:
        return "Medium"


    recent_scores = [
        item.get("score",0)
        for item in history[-3:]
    ]


    average = sum(recent_scores) / len(recent_scores)


    if average >= 85:
        return "Hard"


    elif average >= 65:
        return "Medium"


    else:
        return "Easy"