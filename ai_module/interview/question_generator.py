from llama.llama_client import ask_llama
from rag.retrieve import retrieve_context
from interview.company_profiles import COMPANY_STYLE
from interview.interview_engine import adjust_difficulty
def generate_question(
    role,
    company,
    topic,
    history=None,
    question_type="Technical",
    category="Conceptual"
):
    
    """
    Generate a single interview question using:
    - RAG knowledge base
    - Company interview profile
    - Llama 3.1
    """
    # -----------------------------
    # Adaptive Difficulty
    # -----------------------------
    
    difficulty = adjust_difficulty(
        history or []
    )
    performance = history[-3:] if history else []

    # -----------------------------
    # Retrieve relevant context
    # -----------------------------
    context = retrieve_context(
        role=role,
        company=company,
        topic=topic
    )
    if not context:
        context = "No reference material available. Use general interview knowledge."
    # -----------------------------
    # Company Profile
    # -----------------------------
    profile = COMPANY_STYLE.get(
    company.lower() if company else "",
    {}
    )

    interview_style = ", ".join(
        profile.get("interview_style", [])
    )

    focus = ", ".join(
        profile.get("focus", [])
    )

    preferred_topics = ", ".join(
        profile.get("preferred_topics", [])
    )

    coding_level = profile.get(
        "coding_level",
        "Intermediate"
    )

    behavioral = (
        "Yes"
        if profile.get("behavioral", False)
        else "No"
    )

    description = profile.get(
        "description",
        "General technical interview."
    )

    # -----------------------------
    # Prompt
    # -----------------------------
    prompt = f"""
You are an expert technical interviewer.

Generate ONE interview question.

=====================================
REFERENCE MATERIAL
=====================================

{context}

=====================================

Candidate Role:
{role}

Target Company:
{company}

Current Difficulty Level:
{difficulty}

Difficulty Guidelines:

Easy:
- Basic definitions
- Fundamental concepts
- Simple examples

Medium:
- Practical implementation
- Debugging
- Real-world usage

Hard:
- Optimization
- Architecture decisions
- Advanced problem solving

Interview Topic:
{topic}

Question Type:
{question_type}

Question Category:
{category}

Available Categories:
- Conceptual
- Coding
- Debugging
- System Design
- Scenario Based
=====================================
COMPANY PROFILE
=====================================

Description:
{description}

Interview Style:
{interview_style}

Main Focus:
{focus}

Previous Candidate Performance:
{performance}

Preferred Topics:
{preferred_topics}

Coding Level:
{coding_level}

Behavioral Round:
{behavioral}

=====================================
INSTRUCTIONS
=====================================

1. Generate ONLY ONE interview question.

2. Do NOT generate the answer.
Do not include:
- Answer
- Explanation
- Code solution
- Markdown formatting
- Numbering

3. Question must match the requested difficulty.

4. Prefer the reference material whenever relevant.

5. Follow the company's interview style.

6. If insufficient reference material is available, generate a realistic interview question based on company expectations.

7. Make the question role-specific.
Examples:
- Software Developer → DSA, OOP, system design, debugging
- Python Developer → Python internals, libraries, APIs
- Full Stack Developer → frontend, backend, database, deployment
- AI/ML Intern → ML algorithms, preprocessing, model evaluation
- Java Developer → Java, Spring Boot, JVM, multithreading

8. Keep the question concise.

Return ONLY the interview question.
"""

    question = ask_llama(prompt)

    if not question:
        question = (
            f"Explain an important {topic} concept "
            f"for a {role} interview."
        )

    for prefix in [
        "Here is your question:",
        "Question:",
        "Interview Question:"
    ]:
        question = question.replace(prefix, "")
    question=question.strip()
    question = question.split("\n")[0]
    question=question.lstrip("0123456789.- ")
    return {
    "question": question,
    "difficulty": difficulty,
    "topic": topic,
    "company": company,
    "role": role
}

    