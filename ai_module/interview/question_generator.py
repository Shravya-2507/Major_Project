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
    Generate a single interview question and expected answer using:
    - RAG knowledge base
    - Company interview profile
    - Llama 3.1
    - Adaptive difficulty
    """

    # =====================================================
    # SAFE DEFAULTS
    # =====================================================

    history = history or []

    role = role or "General"
    company = company or "General"
    topic = topic or "General"
    question_type = question_type or "Technical"
    category = category or "Conceptual"

    # =====================================================
    # ADAPTIVE DIFFICULTY
    # =====================================================

    difficulty = adjust_difficulty(history)

    performance = history[-3:] if history else []

    # =====================================================
    # RETRIEVE RELEVANT CONTEXT
    # =====================================================

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

    # =====================================================
    # COMPANY PROFILE
    # =====================================================

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

    # =====================================================
    # PROMPT
    # =====================================================

    prompt = f"""
You are an expert technical interviewer.

Generate exactly ONE interview question and ONE expected answer.

=====================================
REFERENCE MATERIAL
=====================================

{context}

=====================================

CANDIDATE INFORMATION
=====================================

Candidate Role:
{role}

Target Company:
{company}

Current Difficulty:
{difficulty}

Interview Topic:
{topic}

Question Type:
{question_type}

Question Category:
{category}

=====================================
DIFFICULTY GUIDELINES
=====================================

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

=====================================
COMPANY PROFILE
=====================================

Description:
{description}

Interview Style:
{interview_style}

Main Focus:
{focus}

Preferred Topics:
{preferred_topics}

Coding Level:
{coding_level}

Behavioral Round:
{behavioral}

Previous Candidate Performance:
{performance}

=====================================
ROLE GUIDELINES
=====================================

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

=====================================
STRICT INSTRUCTIONS
=====================================

1. Generate exactly ONE interview question.

2. Generate exactly ONE expected answer.

3. The question must be specific to the candidate role.

4. The question must match the requested difficulty.

5. Prefer the reference material whenever relevant.

6. Follow the company's interview style.

7. The expected answer MUST be concise.

8. The expected answer MUST contain 2-4 sentences maximum.

9. The expected answer MUST be less than 80 words.

10. The expected answer must contain only the important concepts
    that a strong candidate should mention.

11. Do NOT include code in expected_answer.

12. Do NOT include markdown in expected_answer.

13. Do NOT include bullet points in expected_answer.

14. Do NOT create multiple questions.

15. Do NOT create multiple answers.

16. Do NOT add explanations outside the JSON.

17. Do NOT add "Here is your question".

18. Do NOT use markdown code fences.

19. Return ONLY valid JSON.

20. JSON string values MUST NOT contain literal line breaks.

21. Escape quotation marks correctly inside JSON strings.

22. Keep expected_answer under 80 words.

=====================================
OUTPUT FORMAT
=====================================

Return exactly this JSON structure:

{{
    "question": "Short interview question",
    "expected_answer": "Short technically correct answer in 2-4 sentences."
}}
"""

    # =====================================================
    # CALL LLAMA
    # =====================================================

    try:
        response = ask_llama(prompt)

    except Exception as error:
        print(
            "Llama question generation error:",
            error
        )

        response = None

    # =====================================================
    # FALLBACK
    # =====================================================

    if not response:
        return {
            "question": (
                f"Explain an important {topic} concept "
                f"for a {role} interview."
            ),
            "expected_answer": (
                f"A strong answer should clearly explain "
                f"the important concepts related to {topic} "
                f"and their practical usage."
            ),
            "difficulty": difficulty,
            "topic": topic,
            "company": company,
            "role": role
        }

    # =====================================================
    # PARSE LLM JSON
    # =====================================================

    question = ""
    expected_answer = ""

    try:
        response = response.strip()

        print(
            "========== RAW LLAMA QUESTION RESPONSE =========="
        )
        print(response)
        print(
            "=================================================="
        )

        # -------------------------------------------------
        # REMOVE MARKDOWN CODE FENCES
        # -------------------------------------------------

        response = re.sub(
            r"^```json\s*",
            "",
            response,
            flags=re.IGNORECASE
        )

        response = re.sub(
            r"^```\s*",
            "",
            response
        )

        response = re.sub(
            r"\s*```$",
            "",
            response
        )

        response = response.strip()

        # -------------------------------------------------
        # FIND JSON OBJECT
        # -------------------------------------------------

        start = response.find("{")
        end = response.rfind("}")

        if start == -1 or end == -1 or end <= start:
            raise ValueError(
                "No valid JSON object found in LLM response"
            )

        json_text = response[start:end + 1]

        # -------------------------------------------------
        # PARSE JSON
        # -------------------------------------------------

        data = json.loads(json_text)

        if not isinstance(data, dict):
            raise ValueError(
                "LLM response is not a JSON object"
            )

        question = str(
            data.get("question", "")
        ).strip()

        expected_answer = str(
            data.get("expected_answer", "")
        ).strip()

        # -------------------------------------------------
        # VALIDATE QUESTION
        # -------------------------------------------------

        if not question:
            raise ValueError(
                "LLM returned an empty question"
            )

        # -------------------------------------------------
        # VALIDATE EXPECTED ANSWER
        # -------------------------------------------------

        if not expected_answer:
            raise ValueError(
                "LLM returned an empty expected answer"
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

        # -------------------------------------------------
        # FALLBACK QUESTION
        # -------------------------------------------------

        question = (
            f"Explain an important {topic} concept "
            f"for a {role} interview."
        )

        expected_answer = (
            f"A strong answer should clearly explain "
            f"the important concepts related to {topic} "
            f"and their practical usage."
        )

    # =====================================================
    # CLEAN QUESTION
    # =====================================================

    prefixes = [
        "Here is your question:",
        "Here is the interview question:",
        "Question:",
        "Interview Question:",
    ]

    for prefix in prefixes:
        if question.lower().startswith(
            prefix.lower()
        ):
            question = question[
                len(prefix):
            ].strip()

    # Remove accidental numbering
    question = re.sub(
        r"^\s*\d+[\.\)\-:]\s*",
        "",
        question
    ).strip()

    # Remove accidental newlines from question
    question = " ".join(
        question.split()
    ).strip()

    # =====================================================
    # CLEAN EXPECTED ANSWER
    # =====================================================

    expected_answer = " ".join(
        expected_answer.split()
    ).strip()

    # Remove accidental markdown
    expected_answer = re.sub(
        r"```.*?```",
        "",
        expected_answer,
        flags=re.DOTALL
    ).strip()

    # =====================================================
    # SAFETY LIMIT
    # =====================================================

    words = expected_answer.split()

    if len(words) > 80:
        expected_answer = " ".join(
            words[:80]
        ).rstrip(".,;:") + "."

        print(
            "Expected answer exceeded 80 words. "
            "Trimmed automatically."
        )

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    result = {
        "question": question,
        "expected_answer": expected_answer,
        "difficulty": difficulty,
        "topic": topic,
        "company": company,
        "role": role
    }

    print(
        "========== FINAL GENERATED QUESTION =========="
    )

    print(
        json.dumps(
            result,
            indent=2,
            ensure_ascii=False
        )
    )

    print(
        "==============================================="
    )

    return result