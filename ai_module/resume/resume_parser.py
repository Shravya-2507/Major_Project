import re

# ======================================================
# SECTION HEADERS
# ======================================================

SECTION_HEADERS = {

    "summary": [
        "professional summary",
        "summary",
        "profile",
        "objective",
        "career objective",
        "about me"
    ],

    "skills": [
        "technical skills",
        "technical skill",
        "skills",
        "skill set",
        "technical expertise",
        "technologies",
        "tech stack",
        "tools and technologies",
        "tools",
        "programming languages",
        "technical profile"
    ],

    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "employment",
        "work history",
        "internship",
        "internships",
        "industry experience",
        "professional history"
    ],

    "projects": [
        "projects",
        "project",
        "academic projects",
        "personal projects",
        "college projects",
        "project experience"
    ],

    "education": [
        "education",
        "academic background",
        "academic details",
        "academic detail",
        "qualifications",
        "qualification",
        "educational qualification",
        "educational details",
        "academic history",
        "degree",
        "college"
    ],

    "certifications": [
        "certifications",
        "certificate",
        "certificates",
        "licenses",
        "courses",
        "training"
    ]
}
# ======================================================
# CONTACT INFO
# ======================================================

def extract_email(text):

    match = re.search(
        r'[\w\.-]+@[\w\.-]+\.\w+',
        text,
        re.I
    )

    return match.group(0) if match else None


def extract_phone(text):

    match = re.search(
        r'(\+?\d[\d\s\-\(\)]{8,}\d)',
        text
    )

    return match.group(0) if match else None


def extract_links(text):

    github = None
    linkedin = None

    g = re.search(
        r'github\.com/[^\s]+',
        text,
        re.I
    )

    if g:
        github = g.group(0)

    l = re.search(
        r'linkedin\.com/[^\s]+',
        text,
        re.I
    )

    if l:
        linkedin = l.group(0)

    return github, linkedin

# ======================================================
# SECTION SPLITTING
# ======================================================

def split_sections(text):

    sections = {

        "summary":[],

        "skills":[],

        "experience":[],

        "projects":[],

        "education":[],

        "certifications":[]
    }

    current = None

    lines = text.split("\n")

    for raw in lines:

        line = raw.strip()

        if not line:
            continue

        low = line.lower()

        detected = False

        for section, headers in SECTION_HEADERS.items():

            for header in headers:

                if header in low:

                    current = section

                    detected = True

                    break

            if detected:
                break

        if detected:
            continue

        if current:

            sections[current].append(line)

    return sections

# ======================================================
# METRICS
# ======================================================

def count_metrics(text):

    patterns = [

        r"\d+%",

        r"\d+\+",

        r"\d+\s*users",

        r"\d+\s*ms",

        r"\d+\s*x",

        r"\d+\s*k",

        r"\d+\s*m",

        r"\d+\s*million",

        r"\d+\s*billion"

    ]

    total = 0

    for pattern in patterns:

        total += len(
            re.findall(
                pattern,
                text.lower()
            )
        )

    return total

# ======================================================
# EXPERIENCE DETECTION
# ======================================================

def count_experience_years(text):

    matches = re.findall(

        r'(\d+)\+?\s*years',

        text.lower()

    )

    if matches:

        return max(

            [int(x) for x in matches]

        )

    return 0

# ======================================================
# PROJECT COUNT
# ======================================================

def estimate_projects(project_lines):

    count = 0

    for line in project_lines:

        if len(line) > 25:

            count += 1

    return max(1, count) if project_lines else 0

# ======================================================
# MAIN PARSER
# ======================================================

def parse_resume(text):

    sections = split_sections(text)

    email = extract_email(text)

    phone = extract_phone(text)

    github, linkedin = extract_links(text)

    return {

        "sections": sections,

        "email": email,

        "phone": phone,

        "github": github,

        "linkedin": linkedin,

        "word_count": len(text.split()),

        "metrics_count": count_metrics(text),

        "experience_years": count_experience_years(text),

        "project_count": estimate_projects(
            sections["projects"]
        ),

        "experience_count": len(
            sections["experience"]
        )
    }