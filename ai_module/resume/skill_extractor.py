import re


# ==========================================
# SKILL DATABASE
# ==========================================

# ==========================================
# SKILL DATABASE
# ==========================================

TECH_SKILLS = {

    "Languages": [
        "python","java","c","c++","c#","javascript","typescript",
        "go","rust","scala","r","kotlin","swift","php","ruby",
        "dart","matlab","perl"
    ],

    "Frontend": [
        "html","css","javascript","typescript","react","angular",
        "vue","next.js","redux","tailwind","bootstrap","jquery",
        "material ui","webpack"
    ],

    "Backend": [
        "node.js","express","fastapi","flask","django","spring",
        "spring boot","hibernate","asp.net","laravel","rest api",
        "graphql","microservices","web services"
    ],

    "Database": [
        "sql","mysql","postgresql","mongodb","oracle","sqlite",
        "redis","cassandra","dynamodb","firebase","nosql",
        "database management system","dbms"
    ],

    "Cloud & DevOps": [
        "aws","azure","gcp","docker","kubernetes","terraform",
        "jenkins","github actions","gitlab ci","ci/cd",
        "ansible","linux","shell scripting"
    ],

    "AI ML": [
        "machine learning","deep learning","artificial intelligence",
        "nlp","natural language processing","computer vision",
        "tensorflow","pytorch","keras","scikit-learn",
        "transformers","huggingface","opencv","llm",
        "generative ai","rag","vector database",
        "embeddings","semantic similarity","data mining",
        "statistics","predictive modeling"
    ],

    "Data Engineering": [
        "python","sql","hadoop","spark","pyspark",
        "kafka","airflow","etl","data pipeline",
        "data warehouse","snowflake","databricks",
        "big data","hive"
    ],

    "Data Analytics": [
        "excel","power bi","tableau","data visualization",
        "pandas","numpy","matplotlib","seaborn",
        "statistics","business intelligence"
    ],

    "Testing": [
        "testing","manual testing","automation testing",
        "selenium","pytest","junit","testng",
        "api testing","postman","jmeter"
    ],

    "Mobile Development": [
        "android","android studio","kotlin","java",
        "swift","ios","flutter","react native"
    ],

    "Security": [
        "cyber security","network security",
        "penetration testing","ethical hacking",
        "firewall","cryptography","owasp",
        "vulnerability assessment"
    ],

    "Tools": [
        "git","github","gitlab","bitbucket",
        "jira","postman","vs code","visual studio",
        "intellij","eclipse"
    ]

}



# ==========================================
# ROLE REQUIREMENTS
# ==========================================

ROLE_REQUIREMENTS = {

    "backend developer": [
        "java","python","node.js","sql",
        "spring boot","rest api","microservices",
        "docker","aws"
    ],

    "frontend developer": [
        "html","css","javascript",
        "react","typescript","redux"
    ],

    "full stack developer": [
        "react","javascript","node.js",
        "database","sql","docker"
    ],

    "java developer": [
        "java","spring","spring boot",
        "hibernate","sql","oracle",
        "microservices","rest api",
        "junit"
    ],

    "python developer": [
        "python","django","flask",
        "fastapi","sql","rest api"
    ],

    "software engineer": [
        "java","python","c++",
        "data structures","algorithms",
        "sql","git"
    ],

    "data scientist": [
        "python","sql","pandas",
        "numpy","machine learning",
        "statistics","tensorflow",
        "pytorch"
    ],

    "machine learning engineer": [
        "python","machine learning",
        "deep learning","tensorflow",
        "pytorch","mlops","docker"
    ],

    "data analyst": [
        "python","sql","excel",
        "tableau","power bi",
        "statistics","data visualization"
    ],

    "data engineer": [
    "python",
    "sql",
    "hadoop",
    "spark",
    "pyspark",
    "kafka",
    "etl",
    "airflow",
    "data pipeline",
    "data warehouse",
    "aws"
],

    "devops engineer": [
        "aws","docker","kubernetes",
        "jenkins","terraform",
        "linux","ci/cd"
    ],

    "cloud engineer": [
        "aws","azure","gcp",
        "docker","kubernetes",
        "terraform"
    ],

    "android developer": [
        "java","kotlin",
        "android","android studio"
    ],

    "ios developer": [
        "swift","ios",
        "xcode","objective c"
    ],

    "mobile developer": [
        "flutter","react native",
        "android","ios",
        "java","kotlin"
    ],

    "qa engineer": [
        "testing","selenium",
        "pytest","junit",
        "automation","postman"
    ],

    "cyber security engineer": [
        "network security",
        "penetration testing",
        "linux","firewall",
        "cryptography"
    ],

    "ui ux designer": [
        "figma","adobe xd",
        "wireframes","prototyping",
        "user research"
    ],

    "database administrator": [
        "sql","oracle",
        "mysql","postgresql",
        "database management",
        "backup","performance tuning"
    ],

    "business analyst": [
        "sql","excel",
        "power bi",
        "tableau",
        "data visualization",
        "business intelligence"
    ],

    "product manager": [
        "agile","scrum",
        "jira","product management",
        "analytics"
    ],
    "ai engineer": [
    "python",
    "machine learning",
    "deep learning",
    "nlp",
    "tensorflow",
    "pytorch",
    "transformers",
    "generative ai",
    "rag",
    "embeddings",
    "vector database"
],
}



# ==========================================
# ALIASES
# ==========================================

ALIASES = {

    "nodejs":"node.js",
    "node js":"node.js",

    "reactjs":"react",
    "react.js":"react",

    "express.js":"express",

    "springboot":"spring boot",

    "postgres":"postgresql",

    "postgres sql":"postgresql",

    "rest apis":"rest api",

    "amazon web services":"aws",

    "google cloud":"gcp",

    "machine-learning":"machine learning",

    "deep-learning":"deep learning",

    "ci cd":"ci/cd"

}


# ==========================================
# NORMALIZE
# ==========================================

def normalize(text):

    if not text:
        return ""

    text = text.lower()

    for old, new in ALIASES.items():
        text = text.replace(old, new)

    return text



# ==========================================
# EXTRACT SKILLS
# ==========================================

def extract_skills(text):

    text = normalize(text)

    result = {}


    for category, skills in TECH_SKILLS.items():

        found = []

        for skill in skills:

            if re.search(
                rf"\b{re.escape(skill)}\b",
                text
            ):
                found.append(skill)


        result[category] = sorted(found)


    return result




# ==========================================
# ADD ROLE SKILLS
# ==========================================
def get_role_skills(role):

    role = role.lower().strip()

    required = []

    for key in ROLE_REQUIREMENTS:

        if key in role or role in key:
            required = ROLE_REQUIREMENTS[key]
            break


    role_skills = {
        category: []
        for category in TECH_SKILLS
    }


    for skill in required:

        for category, skills in TECH_SKILLS.items():

            if skill in skills:
                role_skills[category].append(skill)


    return role_skills



# ==========================================
# COMPARE SKILLS
# ==========================================

def compare_skills(
    resume_text,
    jd_text="",
    role=""
):

    # JD compulsory validation
    if not jd_text or not jd_text.strip():

        return {
            "error": "Job Description is required"
        }


    resume = extract_skills(resume_text)


    # Extract JD skills
    jd = extract_skills(jd_text)


    # Add role skills only if JD has very few skills

    role_skill_count = sum(
        len(v) for v in jd.values()
    )


    if role_skill_count < 5:

        role_skills = get_role_skills(role)


        for category in jd:

            jd[category] = list(
                set(
                    jd[category] +
                    role_skills[category]
                )
            )


    matched = []

    missing = []

    suggestions = []

    category_scores = {}



    for category in TECH_SKILLS:


        resume_set = set(
            resume[category]
        )


        jd_set = set(
            jd[category]
        )


        if not jd_set:
            continue



        category_matched = list(
            resume_set & jd_set
        )


        category_missing = list(
            jd_set - resume_set
        )



        matched.extend(
            category_matched
        )


        missing.extend(
            category_missing
        )



        category_scores[category] = round(

            len(category_matched) /
            len(jd_set) * 100,

            2

        )



        for skill in category_missing:

            suggestions.append({

                "skill": skill,

                "priority": priority(skill),

                "reason": get_reason(skill)

            })



    matched = list(set(matched))

    missing = list(set(missing))



    total = len(matched) + len(missing)


    coverage = round(

        len(matched) /
        total * 100,

        2

    ) if total else 100



    return {

        "matched": sorted(matched),

        "missing": sorted(missing),

        "coverage": coverage,

        "category_coverage": category_scores,

        "resume_skills": resume,

        "suggestions": suggestions,

        "recruiter_comment":
            recruiter_feedback(
                coverage,
                matched,
                missing
            )

    }



# ==========================================
# PRIORITY
# ==========================================

def priority(skill):

    high = {

        "python",
        "java",
        "fastapi",
        "docker",
        "aws",
        "postgresql",
        "microservices",
        "redis",
        "kubernetes"

    }


    return "High" if skill in high else "Medium"





# ==========================================
# REASONS
# ==========================================

def get_reason(skill):

    reasons = {

        "redis":
        "Useful for caching, sessions and high-performance applications.",

        "docker":
        "Important for containerization and deployment.",

        "kubernetes":
        "Used for managing containerized production systems.",

        "microservices":
        "Common architecture pattern in enterprise backend systems.",

        "aws":
        "Cloud deployment skills improve production readiness.",

        "tensorflow":
        "Used for deep learning model development.",

        "pytorch":
        "Popular framework for AI research and deployment.",

        "postgresql":
        "Widely used enterprise relational database."

    }


    return reasons.get(
        skill,
        "Relevant technology for the target role."
    )




# ==========================================
# RECRUITER FEEDBACK
# ==========================================

def recruiter_feedback(
    coverage,
    matched,
    missing
):

    if coverage >= 90:

        return (
            "Excellent technical alignment with the job description."
        )


    elif coverage >= 75:

        return (
            f"Strong skill match. Consider adding: "
            f"{', '.join(missing[:3])}."
            if missing
            else
            "Strong technical alignment with the role."
        )


    elif coverage >= 60:

        return (
            "Moderate alignment. Improve missing technical skills."
        )


    else:

        return (
            "Significant technical gaps detected. "
            "Strengthen the Skills section."
        )