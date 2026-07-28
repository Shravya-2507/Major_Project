import re

# -----------------------------
# Strong action verbs
# -----------------------------

HIGH_IMPACT_VERBS = [
    "architected", "engineered", "optimized", "designed",
    "led", "developed", "implemented", "built",
    "created", "automated", "deployed", "integrated",
    "improved", "scaled", "migrated", "spearheaded",
    "managed", "delivered", "configured"
]

# -----------------------------
# Weak verbs
# -----------------------------

WEAK_VERBS = [
    "worked", "helped", "assisted",
    "participated", "responsible",
    "supported"
]

# -----------------------------
# Technologies
# -----------------------------

TECH = [
    "python","java","fastapi","django","flask",
    "react","node.js","express",
    "postgresql","mysql","mongodb","redis",
    "docker","aws","azure","gcp",
    "kubernetes","tensorflow","pytorch",
    "rest api","graphql"
]

# -----------------------------
# Extract experience lines
# -----------------------------

def get_experience_lines(resume_text):

    lines = []

    inside_experience = False

    stop_headers = [
        "education",
        "projects",
        "skills",
        "certifications"
    ]

    for raw in resume_text.split("\n"):

        line = raw.strip()

        if not line:
            continue

        lower = line.lower()

        if "experience" in lower:
            inside_experience = True
            continue

        if any(h in lower for h in stop_headers):
            inside_experience = False

        if not inside_experience:
            continue

        if line.startswith(("•", "-", "*")):
            lines.append(line)
            continue

        if any(lower.startswith(v) for v in HIGH_IMPACT_VERBS + WEAK_VERBS):
            lines.append(line)

    return lines

# -----------------------------
# Metrics
# -----------------------------

def detect_metrics(line):

    patterns = [

        r"\d+%",

        r"\d+\+",

        r"\d+\s*users",

        r"\d+\s*ms",

        r"\d+x",

        r"\d+\s*million",

        r"\d+\s*records",

        r"\d+\s*requests",

        r"\d+\s*projects"
    ]

    metrics = []

    for p in patterns:

        metrics.extend(re.findall(p, line.lower()))

    return metrics

# -----------------------------
# Action verb
# -----------------------------

def detect_action_verb(line):

    lower = line.lower()

    for verb in HIGH_IMPACT_VERBS:

        if re.search(rf"\b{re.escape(verb)}\b", lower):

            return verb, "High"

    for verb in WEAK_VERBS:

        if re.search(rf"\b{re.escape(verb)}\b", lower):

            return verb, "Low"

    return None, "Medium"

# -----------------------------
# Technologies
# -----------------------------

def detect_technologies(line):

    found = []

    lower = line.lower()

    for tech in TECH:

        if re.search(rf"\b{re.escape(tech)}\b", lower):

            found.append(tech)

    return found

# -----------------------------
# Score
# -----------------------------

def ownership_score(level):

    if level == "High":
        return 10

    if level == "Medium":
        return 6

    return 3

# -----------------------------
# Rewrite suggestion
# -----------------------------

def rewrite_bullet(line):

    improved = line

    replacements = {

        "built":"Engineered",

        "developed":"Engineered",

        "created":"Designed and implemented",

        "worked":"Contributed to",

        "helped":"Collaborated on",

        "implemented":"Successfully implemented"
    }

    for old, new in replacements.items():

        improved = re.sub(
            old,
            new,
            improved,
            flags=re.IGNORECASE
        )

    if not detect_metrics(improved):

        improved += " while improving scalability and maintainability."

    return improved

# -----------------------------
# Recruiter comment
# -----------------------------

def recruiter_comment(score, metrics):

    if score >= 11:

        return (
            "Excellent experience bullet with strong ownership and measurable impact."
        )

    if score >= 8:

        return (
            "Strong technical contribution. Adding more measurable business impact would strengthen this point."
        )

    if score >= 5:

        return (
            "Reasonable experience description but should use stronger action verbs."
        )

    return (
        "This experience sounds passive. Focus on what you personally achieved."
    )

# -----------------------------
# Main Analysis
# -----------------------------

def analyze_experience(resume_text):

    bullets = get_experience_lines(resume_text)

    analysis = []

    strengths = []

    improvements = []

    total = 0

    if not bullets:

        return {

            "experience_score":0,

            "analysis":[],

            "strengths":[],

            "improvements":[
                "No recognizable experience section found."
            ]
        }

    for bullet in bullets:

        verb, level = detect_action_verb(bullet)

        score = ownership_score(level)

        metrics = detect_metrics(bullet)

        tech = detect_technologies(bullet)

        if metrics:
            score += 2

        if len(tech) >= 2:
            score += 1

        total += score

        if level == "High":

            strengths.append(
                f"Strong ownership: {verb.title()} used effectively."
            )

        if level == "Low":

            improvements.append(
                f"Replace passive wording in: '{bullet[:60]}...'"
            )

        if not metrics:

            improvements.append(
                f"Add measurable impact to: '{bullet[:60]}...'"
            )

        analysis.append({

            "original": bullet,

            "action_verb": verb,

            "ownership": level,

            "technologies": tech,

            "metrics": metrics,

            "score": score,

            "rewritten": rewrite_bullet(bullet),

            "recruiter_comment": recruiter_comment(
                score,
                metrics
            )

        })

        # Maximum possible score per bullet:
    # 10 (ownership) + 2 (metrics) + 1 (technologies) = 13

    max_score = len(bullets) * 13

    experience_score = round(
        (total / max_score) * 100,
        2
    )

    return {

        "experience_score": experience_score,

        "analysis": analysis,

        "strengths": strengths,

        "improvements": improvements

    }