LEVELS = ["Easy", "Medium", "Hard"]


def next_level(score):
    """Map a single score to a difficulty level."""
    if score >= 85:
        return "Hard"

    if score >= 65:
        return "Medium"

    return "Easy"


def _get_score(item):
    """Read a score from a history item, tolerating different key names."""
    for key in ("score", "final_score", "total_score"):
        value = item.get(key)

        if isinstance(value, (int, float)):
            return float(value)

    return None


def adjust_difficulty(history):
    """
    Decide the next difficulty from the candidate's recent trend.

    - Uses the last 3 scores, with the newest answer weighted most.
    - Moves only one level at a time (no Easy -> Hard jumps).

    history example:
    [
        {"score": 80, "difficulty": "Medium"},
        {"score": 90, "difficulty": "Hard"},
    ]
    """
    items = [i for i in (history or []) if isinstance(i, dict)]
    scores = [
        s for s in (_get_score(i) for i in items[-3:])
        if s is not None
    ]

    if not scores:
        return "Medium"

    weights = range(1, len(scores) + 1)  # newest answer counts most
    average = sum(s * w for s, w in zip(scores, weights)) / sum(weights)

    target = next_level(average)

    current = (
        items[-1].get("difficulty")
        or items[-1].get("level")
        or "Medium"
    )

    if current not in LEVELS:
        current = "Medium"

    current_index = LEVELS.index(current)
    target_index = LEVELS.index(target)

    if target_index > current_index:
        current_index += 1
    elif target_index < current_index:
        current_index -= 1

    return LEVELS[current_index]