import json
import re

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
    Generate a single interview question and an expected answer using:
    - RAG knowledge base
    - Company interview profile
    - Llama 3.1
    - Adaptive difficulty
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
        context = (
            "No reference material available. "
            "Use general interview knowledge."
        )

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

Generate ONE interview question and its expected answer.

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

1. Generate exactly ONE interview question.

2. Generate ONE technically correct expected answer
   for that question.

3. The expected answer should contain the important
   concepts that a strong candidate should mention.

4. The expected answer should be concise but complete.

5. The question must match the requested difficulty.

6. Prefer the reference material whenever relevant.

7. Follow the company's interview style.

8. Make the question role-specific.

Examples:

Software Developer:
- DSA
- OOP
- System Design
- Debugging

Python Developer:
- Python internals
- OOP
- Libraries
- APIs
- Performance

Full Stack Developer:
- Frontend
- Backend
- Database
- APIs
- Deployment

AI/ML Intern:
- ML algorithms
- Preprocessing
- Model evaluation
- Feature engineering

Java Developer:
- Java
- Spring Boot
- JVM
- Multithreading

9. Do not generate multiple questions.

10. Return ONLY valid JSON.

Use exactly this format:

{{
    "question": "interview question here",
    "expected_answer": "technically correct expected answer here"
}}
"""

    # -----------------------------
    # Call Llama
    # -----------------------------

    response = ask_llama(prompt)

    # -----------------------------
    # Fallback
    # -----------------------------

    if not response:
        return {
            "question": (
                f"Explain an important {topic} concept "
                f"for a {role} interview."
            ),
            "expected_answer": (
                f"Provide a technically correct explanation "
                f"of the important concepts related to {topic}."
            ),
            "difficulty": difficulty,
            "topic": topic,
            "company": company,
            "role": role
        }

    # -----------------------------
    # Parse LLM JSON
    # -----------------------------

    try:
        response = response.strip()

        # Remove markdown code fences
        response = re.sub(
            r"```json\s*",
            "",
            response,
            flags=re.IGNORECASE
        )

        response = re.sub(
            r"```\s*",
            "",
            response
        )

        # Find JSON object
        match = re.search(
            r"\{.*\}",
            response,
            re.DOTALL
        )

        if not match:
            raise ValueError(
                "No JSON object found in LLM response"
            )

        data = json.loads(
            match.group(0)
        )

        question = str(
            data.get("question", "")
        ).strip()

        expected_answer = str(
            data.get("expected_answer", "")
        ).strip()

        # -----------------------------
        # Validate generated content
        # -----------------------------

        if not question:
            question = (
                f"Explain an important {topic} concept "
                f"for a {role} interview."
            )

        if not expected_answer:
            expected_answer = (
                f"Provide a technically correct explanation "
                f"of the important concepts related to {topic}."
            )

    except Exception as error:

        print(
            "Question generation JSON parsing error:",
            error
        )

        print(
            "Raw LLM response:",
            response
        )

        question = response.strip()

        expected_answer = (
            f"Provide a technically correct explanation "
            f"of the important concepts related to {topic}."
        )

    # -----------------------------
    # Clean question
    # -----------------------------

    for prefix in [
        "Here is your question:",
        "Question:",
        "Interview Question:"
    ]:
        question = question.replace(
            prefix,
            ""
        )

    question = question.strip()

    question = (
        question
        .split("\n")[0]
        .lstrip("0123456789.- ")
        .strip()
    )

    # -----------------------------
    # Return
    # -----------------------------

    return {
        "question": question,
        "expected_answer": expected_answer,
        "difficulty": difficulty,
        "topic": topic,
        "company": company,
        "role": role
    }

