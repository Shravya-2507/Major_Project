import re

REQUIRED_SECTIONS = [
    "summary",
    "skills",
    "experience",
    "education"
]

OPTIONAL_SECTIONS = [
    "projects",
    "certifications"
]


def has_section(section_name, sections, resume_text):

    # Parsed section exists
    if sections:

        section_aliases = {
            "education": [
                "education",
                "academic",
                "academic details",
                "qualification"
            ],
            "experience": [
                "experience",
                "work experience",
                "professional experience"
            ],
            "skills": [
                "skills",
                "technical skills",
                "technologies"
            ],
            "projects": [
                "projects",
                "project"
            ],
            "summary": [
                "summary",
                "profile",
                "objective"
            ]
        }

        for key, value in sections.items():

            key_lower = key.lower()

            if key_lower in section_aliases.get(section_name, []):

                if value:
                    return True

    # Fallback search in resume text
    patterns = {
        "summary": [
            "summary",
            "professional summary",
            "profile",
            "objective"
        ],
        "skills": [
            "skills",
            "technical skills",
            "core skills",
            "technologies"
        ],
        "experience": [
            "experience",
            "work experience",
            "professional experience",
            "employment"
        ],
        "education": [
            "education",
            "academic",
            "academic details",
            "academic background",
            "qualification",
            "qualifications",
            "university",
            "college",
            "school",
            "bachelor",
            "master",
            "b.e",
            "b.tech",
            "m.e",
            "m.tech",
            "degree"
        ],
        "projects": [
            "projects",
            "project",
            "academic projects",
            "personal projects"
        ],
        "certifications": [
            "certifications",
            "certificates",
            "licenses"
        ]
    }

    resume_lower = resume_text.lower()

    return any(keyword in resume_lower for keyword in patterns[section_name])


def analyze_ats(parsed_resume):

    score = 100

    strengths = []

    improvements = []

    info = {}

    sections = parsed_resume.get("sections", {})

    resume_text = parsed_resume.get("raw_text", "").lower()

    # -----------------------
    # CONTACT DETAILS
    # -----------------------

    if parsed_resume.get("email"):

        strengths.append("Professional email detected.")

        info["email"] = True

    else:

        score -= 8

        improvements.append("Add a professional email address.")

        info["email"] = False

    if parsed_resume.get("phone"):

        strengths.append("Phone number detected.")

        info["phone"] = True

    else:

        score -= 5

        improvements.append("Add a contact number.")

        info["phone"] = False

    if parsed_resume.get("github"):

        strengths.append("GitHub profile detected.")

        info["github"] = True

    else:

        score -= 2

        improvements.append("Include your GitHub profile.")

        info["github"] = False

    if parsed_resume.get("linkedin"):

        strengths.append("LinkedIn profile detected.")

        info["linkedin"] = True

    else:

        score -= 2

        improvements.append("Include your LinkedIn profile.")

        info["linkedin"] = False

    # -----------------------
    # REQUIRED SECTIONS
    # -----------------------

    for section in REQUIRED_SECTIONS:

        if has_section(section, sections, resume_text):

            strengths.append(f"{section.title()} section found.")

        else:

            score -= 8

            improvements.append(
                f"Missing '{section.title()}' section."
            )

    # -----------------------
    # OPTIONAL SECTIONS
    # -----------------------

    for section in OPTIONAL_SECTIONS:

        if not has_section(section, sections, resume_text):

            score -= 2

            improvements.append(
                f"Consider adding a '{section.title()}' section."
            )

    # -----------------------
    # WORD COUNT
    # -----------------------

    words = parsed_resume.get("word_count", 0)

    if words < 200:

        score -= 8

        improvements.append(
            f"Resume contains only {words} words. Add more project details and achievements."
        )

    elif words > 900:

        score -= 5

        improvements.append(
            "Resume is too lengthy. Keep it within 1-2 pages."
        )

    else:

        strengths.append("Resume length is appropriate.")

    # -----------------------
    # ACHIEVEMENTS
    # -----------------------

    metrics = parsed_resume.get("metrics_count", 0)

    if metrics == 0:

        score -= 10

        improvements.append(
            "Add measurable achievements (%, users, latency, accuracy, revenue etc.)."
        )

    elif metrics < 3:

        score -= 4

        improvements.append(
            "Include more quantified achievements."
        )

    else:

        strengths.append(
            "Resume contains measurable achievements."
        )

    # -----------------------
    # ACTION VERBS
    # -----------------------

    action_verbs = [
        "developed",
        "implemented",
        "architected",
        "engineered",
        "optimized",
        "designed",
        "built",
        "deployed",
        "created",
        "automated"
    ]

    verb_count = sum(
        resume_text.count(v)
        for v in action_verbs
    )

    if verb_count >= 5:

        strengths.append(
            "Strong action verbs improve resume impact."
        )

    elif verb_count == 0:

        score -= 5

        improvements.append(
            "Use stronger action verbs such as Architected, Engineered, Optimized and Designed."
        )

    # -----------------------
    # ATS FORMAT
    # -----------------------

    if re.search(r"\b(table|image|graphic)\b", resume_text):

        improvements.append(
            "Avoid tables or images since some ATS systems cannot parse them."
        )

    score = max(0, min(score, 100))

    return {

        "ats_score": score,

        "strengths": strengths,

        "improvements": improvements,

        "details": info
    }