import re

# ==========================================
# TECHNOLOGY STACK
# ==========================================

TECH_STACK = {

    "Frontend": [
        "react","angular","vue","html","css",
        "tailwind","bootstrap","javascript",
        "typescript","next.js"
    ],

    "Backend": [
        "python","fastapi","flask","django",
        "node.js","express","spring",
        "rest api","graphql","microservices"
    ],

    "Database":[
        "mysql","postgresql","mongodb",
        "sqlite","redis","firebase"
    ],

    "Cloud":[
        "aws","azure","gcp","docker",
        "kubernetes","render","vercel",
        "netlify"
    ],

    "AI/ML":[
        "tensorflow","pytorch","opencv",
        "machine learning","deep learning",
        "nlp","sentence transformers",
        "transformers","scikit-learn"
    ],

    "Testing":[
        "pytest","jest","junit",
        "selenium","postman"
    ]
}

# ==========================================
# PROJECT HEADERS
# ==========================================

PROJECT_HEADERS=[

    "project",

    "projects",

    "major project",

    "minor project",

    "academic project",

    "academic projects",

    "personal project",

    "personal projects"
]

STOP_HEADERS=[

    "experience",

    "education",

    "skills",

    "technical skills",

    "certifications",

    "achievements"

]

# ==========================================
# PROJECT EXTRACTION
# ==========================================

def extract_projects(resume_text):

    lines=[l.strip() for l in resume_text.split("\n")]

    projects=[]

    capture=False

    current=[]

    for line in lines:

        lower=line.lower()

        if any(h in lower for h in PROJECT_HEADERS):

            capture=True

            continue

        if capture:

            if any(h in lower for h in STOP_HEADERS):

                break

            if line=="":

                if current:

                    projects.append("\n".join(current))

                    current=[]

                continue

            current.append(line)

    if current:

        projects.append("\n".join(current))

    return projects

# ==========================================
# TECHNOLOGY DETECTION
# ==========================================

def detect_stack(project):

    stack={}

    text=project.lower()

    for category,skills in TECH_STACK.items():

        found=[]

        for skill in skills:

            if re.search(rf"\b{re.escape(skill)}\b",text):

                found.append(skill)

        stack[category]=found

    return stack

# ==========================================
# METRIC DETECTION
# ==========================================

def detect_metrics(project):

    patterns=[

        r"\d+%",

        r"\d+\+",

        r"\d+\s*users",

        r"\d+\s*ms",

        r"\d+x",

        r"\d+\s*records",

        r"\d+\s*requests",

        r"\d+\s*accuracy"

    ]

    metrics=[]

    lower=project.lower()

    for p in patterns:

        metrics.extend(re.findall(p,lower))

    return metrics

# ==========================================
# DEPLOYMENT DETECTION
# ==========================================

def deployment_detected(project):

    words=[

        "aws",

        "azure",

        "gcp",

        "docker",

        "kubernetes",

        "render",

        "vercel",

        "netlify",

        "hosted",

        "deployed"

    ]

    text=project.lower()

    return any(word in text for word in words)

# ==========================================
# GITHUB / LIVE DEMO
# ==========================================

def detect_links(project):

    github=bool(

        re.search(

            r"github\.com",

            project,

            re.IGNORECASE

        )

    )

    live=bool(

        re.search(

            r"https?://",

            project,

            re.IGNORECASE

        )

    )

    return github,live

# ==========================================
# PROJECT COMPLEXITY
# ==========================================
def estimate_complexity(stack, metrics, deployed, project_text):

    score = 0

    text = project_text.lower()


    # ==========================
    # Technology Depth
    # ==========================

    categories = sum(
        1 for values in stack.values()
        if values
    )


    score += categories * 8


    # ==========================
    # Backend Complexity
    # ==========================

    if stack["Backend"]:
        score += 15


    # ==========================
    # Database Usage
    # ==========================

    if stack["Database"]:
        score += 10


    # ==========================
    # AI/ML Complexity
    # ==========================

    if stack["AI/ML"]:

        score += 20


        if "model" in text:
            score += 5

        if "embedding" in text:
            score += 5

        if "semantic" in text:
            score += 5

        if "nlp" in text:
            score += 5



    # ==========================
    # Architecture Indicators
    # ==========================

    architecture_keywords = [

        "api",
        "authentication",
        "authorization",
        "jwt",
        "pipeline",
        "architecture",
        "microservice",
        "real time",
        "dashboard"

    ]


    for keyword in architecture_keywords:

        if keyword in text:
            score += 3



    # ==========================
    # Metrics
    # ==========================

    if metrics:
        score += 10



    # ==========================
    # Deployment Bonus
    # ==========================

    if deployed:
        score += 8



    score=min(score,100)



    if score >= 85:

        level="Excellent"

    elif score >= 70:

        level="High"

    elif score >= 50:

        level="Medium"

    else:

        level="Basic"



    return level,score
# ==========================================
# RECRUITER FEEDBACK
# ==========================================

def recruiter_feedback(stack, metrics, deployed, github, live):

    strengths = []

    improvements = []

    # --------------------
    # Technology Strengths
    # --------------------

    if stack["Backend"]:
        strengths.append(
            "Backend technologies demonstrate strong software engineering capability."
        )

    if stack["Frontend"]:
        strengths.append(
            "Frontend technologies indicate full-stack development experience."
        )

    if stack["Database"]:
        strengths.append(
            "Database integration is clearly demonstrated."
        )

    if stack["Cloud"]:
        strengths.append(
            "Cloud and deployment technologies improve industry readiness."
        )

    if stack["AI/ML"]:
        strengths.append(
            "AI/ML technologies add strong technical depth."
        )

    # --------------------
    # Deployment
    # --------------------

    if deployed:
        strengths.append(
            "Project has been deployed using modern cloud/container technologies."
        )
    else:
        improvements.append(
            "Deploy the project using AWS, Azure, Render, Vercel or Docker."
        )

    # --------------------
    # GitHub
    # --------------------

    if github:
        strengths.append(
            "GitHub repository available for recruiter verification."
        )
    else:
        improvements.append(
            "Include the GitHub repository link."
        )

    # --------------------
    # Live Demo
    # --------------------

    if live:
        strengths.append(
            "Live project/demo link improves recruiter confidence."
        )
    else:
        improvements.append(
            "Consider hosting the project and adding a live demo link."
        )

    # --------------------
    # Metrics
    # --------------------

    if metrics:
        strengths.append(
            "Project contains measurable achievements."
        )
    else:
        improvements.append(
            "Include measurable impact such as response time, users served, accuracy or throughput."
        )

    # --------------------
    # Testing
    # --------------------

    if not stack["Testing"]:
        improvements.append(
            "Mention testing tools such as PyTest, Jest or Postman."
        )

    return strengths, improvements


# ==========================================
# MAIN ANALYSIS
# ==========================================

def analyze_projects(resume_text):

    projects = extract_projects(resume_text)

    if not projects:

        return {

            "project_score": 0,

            "projects": [],

            "improvements": [
                "No project section detected."
            ]
        }

    output = []

    overall = 0

    for project in projects:

        stack = detect_stack(project)

        metrics = detect_metrics(project)

        deployed = deployment_detected(project)

        github, live = detect_links(project)

        complexity, score = estimate_complexity(
            stack,
            metrics,
            deployed,
            project
        )

        strengths, improvements = recruiter_feedback(
            stack,
            metrics,
            deployed,
            github,
            live
        )

        categories_used = sum(
            1
            for values in stack.values()
            if values
        )

        recruiter_comment = ""

        if score >= 90:

            recruiter_comment = (
                "Excellent project demonstrating production-ready engineering practices."
            )

        elif score >= 75:

            recruiter_comment = (
                "Strong technical project with good industry relevance."
            )

        elif score >= 60:

            recruiter_comment = (
                "Good project. Add deployment, metrics and testing to strengthen it."
            )

        else:

            recruiter_comment = (
                "Project requires additional technical depth and implementation details."
            )

        output.append({

            "title": project.split("\n")[0],

            "complexity": complexity,

            "score": score,

            "technology_stack": stack,

            "technology_categories": categories_used,

            "deployment": deployed,

            "github_available": github,

            "live_demo": live,

            "metrics": metrics,

            "strengths": strengths,

            "improvements": improvements,

            "recruiter_comment": recruiter_comment

        })

        overall += score

    average = round(overall / len(output), 2)

    return {

        "project_score": average,

        "projects": output
    }