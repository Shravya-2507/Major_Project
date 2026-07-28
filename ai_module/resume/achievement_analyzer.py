import re

METRIC_PATTERNS = {
    "percentage": r"\d+(\.\d+)?%",
    "users": r"\d+\+?\s*(users|customers|clients|downloads|requests|transactions)",
    "scale": r"\d+\+?\s*(k|m|million|billion)",
    "latency": r"\d+\s*(ms|milliseconds|seconds|sec)",
    "time": r"\d+\s*(days|weeks|months|hours)",
    "accuracy": r"\d+(\.\d+)?%\s*(accuracy|precision|recall|f1)",
    "money": r"\$?\d+\+?\s*(k|m|million|billion)?",
    "throughput": r"\d+\s*(qps|rps|fps)"
}

IMPACT_VERBS = [
    "improved",
    "optimized",
    "reduced",
    "increased",
    "accelerated",
    "enhanced",
    "boosted",
    "scaled",
    "saved",
    "automated",
    "decreased",
    "achieved"
]


def extract_metrics(text):

    text = text.lower()

    metrics = []

    for category, pattern in METRIC_PATTERNS.items():

        matches = re.findall(pattern, text)

        if matches:

            metrics.append({
                "category": category,
                "count": len(matches)
            })

    return metrics


def detect_impact_lines(text):

    lines = [x.strip() for x in text.split("\n") if x.strip()]

    impact = []

    for line in lines:

        lower = line.lower()

        if any(v in lower for v in IMPACT_VERBS):

            impact.append(line)

    return impact


def achievement_score(metrics, impact_lines):

    score = 40

    metric_count = sum(m["count"] for m in metrics)

    score += metric_count * 8

    score += len(impact_lines) * 4

    score = min(score, 100)

    return score


def classify(score):

    if score >= 90:
        return "Outstanding"

    if score >= 75:
        return "Strong"

    if score >= 60:
        return "Good"

    if score >= 45:
        return "Average"

    return "Weak"


def recruiter_feedback(score, metrics, impact):

    strengths = []

    improvements = []

    if metrics:

        strengths.append(
            "Resume includes measurable achievements which significantly improve recruiter confidence."
        )

    else:

        improvements.append(
            "Add percentages, user counts, latency improvements, accuracy, or business impact wherever possible."
        )

    if impact:

        strengths.append(
            "Strong impact-oriented language detected."
        )

    else:

        improvements.append(
            "Use impact verbs like 'Improved', 'Reduced', 'Optimized', or 'Scaled'."
        )

    if score >= 85:

        strengths.append(
            "Excellent use of quantified achievements."
        )

    elif score >= 60:

        improvements.append(
            "Increase the number of quantified achievements across projects."
        )

    else:

        improvements.append(
            "Most resume bullets describe work but not its measurable outcome."
        )

    return strengths, improvements


def improvement_examples():

    return [

        {
            "before":
            "Developed a web application.",

            "after":
            "Developed a web application serving over 5,000 users while reducing response time by 35%."
        },

        {
            "before":
            "Built a chatbot.",

            "after":
            "Built an NLP chatbot achieving 91% intent recognition accuracy."
        },

        {
            "before":
            "Designed a dashboard.",

            "after":
            "Designed a reporting dashboard that reduced manual reporting time by 60%."
        }

    ]


def analyze_achievements(resume_text):

    metrics = extract_metrics(resume_text)

    impact = detect_impact_lines(resume_text)

    score = achievement_score(metrics, impact)

    strengths, improvements = recruiter_feedback(
        score,
        metrics,
        impact
    )

    return {

        "achievement_score": score,

        "rating": classify(score),

        "metric_summary": metrics,

        "impact_lines": impact,

        "strengths": strengths,

        "improvements": improvements,

        "rewrite_examples": improvement_examples()
    }