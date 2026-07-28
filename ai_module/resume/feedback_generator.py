from collections import Counter


def calculate_overall_score(
    semantic_score,
    ats_score,
    skill_coverage,
    experience_score,
    project_score,
    achievement_score
):

    weights = {
        "semantic": 0.20,
        "ats": 0.15,
        "skills": 0.20,
        "experience": 0.20,
        "projects": 0.15,
        "achievement": 0.10
    }

    score = (
        semantic_score * weights["semantic"] +
        ats_score * weights["ats"] +
        skill_coverage * weights["skills"] +
        experience_score * weights["experience"] +
        project_score * weights["projects"] +
        achievement_score * weights["achievement"]
    )

    return round(score, 2)


def hiring_recommendation(score):

    if score >= 90:
        return "Strong Hire"

    if score >= 80:
        return "Hire"

    if score >= 70:
        return "Shortlist"

    if score >= 60:
        return "Consider"

    return "Needs Improvement"


def interview_probability(score):

    if score >= 90:
        return "95%"

    if score >= 80:
        return "85%"

    if score >= 70:
        return "70%"

    if score >= 60:
        return "55%"

    return "30%"


def recruiter_summary(
    overall,
    missing_skills,
    strengths,
    improvements
):

    summary = []

    if overall >= 85:

        summary.append(
            "This resume demonstrates excellent technical capability and is well aligned with the target role."
        )

    elif overall >= 70:

        summary.append(
            "The resume demonstrates solid engineering skills with a few areas requiring improvement."
        )

    else:

        summary.append(
            "The resume has a reasonable technical foundation but requires significant enhancement before applying."
        )

    if missing_skills:

        summary.append(
            f"The primary technical gaps are: {', '.join(missing_skills)}."
        )

    if len(strengths) > len(improvements):

        summary.append(
            "Overall, the candidate presents a positive technical profile."
        )

    else:

        summary.append(
            "Addressing the suggested improvements would considerably increase recruiter confidence."
        )

    return " ".join(summary)


def collect_strengths(*modules):

    result = []

    for module in modules:

        result.extend(module.get("strengths", []))

    counter = Counter(result)

    return [x for x, _ in counter.most_common(10)]


def collect_improvements(*modules):

    result = []

    for module in modules:

        result.extend(module.get("improvements", []))

    counter = Counter(result)

    return [x for x, _ in counter.most_common(12)]


def rewritten_bullets(experience_analysis):

    bullets = []

    for item in experience_analysis["analysis"]:

        bullets.append({

            "before": item["original"],

            "after": item["rewritten"]

        })

    return bullets


def interview_questions(skill_analysis):

    questions = []

    mapping = {

        "python": [
            "Explain decorators in Python.",
            "What is the GIL?"
        ],

        "fastapi": [
            "Explain dependency injection in FastAPI.",
            "Difference between FastAPI and Flask?"
        ],

        "react": [
            "Explain Virtual DOM.",
            "Difference between state and props?"
        ],

        "docker": [
            "Explain Docker volumes.",
            "Difference between Docker image and container?"
        ],

        "postgresql": [
            "Explain indexing.",
            "Difference between clustered and non-clustered indexes?"
        ],

        "mongodb": [
            "Difference between MongoDB and PostgreSQL?"
        ],

        "redis": [
            "Why is Redis used for caching?"
        ],

        "aws": [
            "Explain EC2 and S3.",
            "What is IAM?"
        ],

        "machine learning": [
            "Difference between overfitting and underfitting."
        ],

        "tensorflow": [
            "Explain backpropagation."
        ]
    }

    for skill in skill_analysis["matched"]:

        if skill in mapping:

            questions.extend(mapping[skill])

    return questions[:10]


def generate_feedback(

    semantic_score,

    ats,

    skills,

    experience,

    projects,

    achievements

):

    overall = calculate_overall_score(

        semantic_score,

        ats["ats_score"],

        skills["coverage"],

        experience["experience_score"],

        projects["project_score"],

        achievements["achievement_score"]

    )

    strengths = collect_strengths(

        ats,

        experience,

        projects,

        achievements

    )

    improvements = collect_improvements(

        ats,

        experience,

        projects,

        achievements

    )

    return {

        "overall_score": overall,

        "semantic_match": semantic_score,

        "ats_score": ats["ats_score"],

        "skill_coverage": skills["coverage"],

        "experience_score": experience["experience_score"],

        "project_score": projects["project_score"],

        "achievement_score": achievements["achievement_score"],

        "matched_skills": skills["matched"],

        "missing_skills": skills["missing"],

        "strengths": strengths,

        "areas_for_improvement": improvements,

        "rewritten_bullets": rewritten_bullets(experience),

        "interview_questions": interview_questions(skills),

        "recruiter_summary": recruiter_summary(

            overall,

            skills["missing"],

            strengths,

            improvements

        ),

        "hiring_recommendation": hiring_recommendation(overall),

        "interview_probability": interview_probability(overall)
    }