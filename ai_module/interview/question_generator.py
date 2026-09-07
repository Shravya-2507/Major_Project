import json
import re
import time

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
    - Llama 3.2:3b
    - Adaptive difficulty
    """

    # =====================================================
    # START TOTAL TIMER
    # =====================================================

    total_start = time.perf_counter()

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

    rag_start = time.perf_counter()

    context = retrieve_context(
        role=role,
        company=company,
        topic=topic
    )

    rag_time = time.perf_counter() - rag_start

    # =====================================================
    # HANDLE RAG CONTEXT
    # =====================================================

    if isinstance(context, dict):

        context = context.get(
            "context",
            ""
        )

    elif isinstance(context, list):

        context = "\n".join(
            str(item)
            for item in context
        )

    elif context is None:

        context = ""

    else:

        context = str(context)

    context = context.strip()

    if not context:

        context = (
            "No reference material available. "
            "Use general interview knowledge."
        )

    # Limit context to avoid unnecessarily large prompts
    if len(context) > 1000:

        context = context[:1000]

    print(
        f"RAG retrieval time: {rag_time:.2f} seconds"
    )

    print(
        f"RAG context characters: {len(context)}"
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

    REFERENCE MATERIAL:
    {context}

    CANDIDATE INFORMATION:
    Role: {role}
    Company: {company}
    Difficulty: {difficulty}
    Topic: {topic}
    Question Type: {question_type}
    Category: {category}

    DIFFICULTY:
    Easy: Basic definitions, fundamentals, simple examples.
    Medium: Practical implementation, debugging, real-world usage.
    Hard: Optimization, architecture decisions, advanced problem solving.

    COMPANY PROFILE:
    Description: {description}
    Interview Style: {interview_style}
    Main Focus: {focus}
    Preferred Topics: {preferred_topics}
    Coding Level: {coding_level}
    Behavioral Round: {behavioral}

    PREVIOUS PERFORMANCE:
    {performance}

    IMPORTANT:
    - Use previous questions only to avoid repetition and adjust difficulty.
    - Do NOT repeat or rephrase a previous question.
    - If a concept was already tested, choose a different concept, scenario, or aspect.

    ROLE GUIDELINES:
    Software Developer: DSA, OOP, System Design, Debugging.
    Python Developer: Python internals, OOP, Libraries, APIs, Performance.
    Full Stack Developer: Frontend, Backend, Database, APIs, Deployment.
    AI/ML Intern: ML algorithms, Preprocessing, Model evaluation, Feature engineering.
    Java Developer: Java, Spring Boot, JVM, Multithreading.

    STRICT RULES:
    - Generate exactly ONE question and ONE expected answer.
    - Match the requested role, difficulty, topic, and category.
    - Prefer reference material when relevant.
    - Follow the company's interview style.
    - Expected answer must be concise, technically correct, 20–35 words, maximum 2 sentences.
    - Include only important concepts a strong candidate should mention.
    - No code, markdown, bullets, explanations, multiple questions, or multiple answers.
    - Do not add text outside JSON or use code fences.
    - Return ONLY valid JSON with properly escaped quotation marks and no literal line breaks in string values.

    OUTPUT:
    {{
    "question": "Short interview question",
    "expected_answer": "Short technically correct answer."
    }}
    """

    # =====================================================
    # CALL LLAMA
    # =====================================================

    llm_start = time.perf_counter()

    try:

        response = ask_llama(prompt, 120)

    except Exception as error:

        print(
            "Llama question generation error:",
            error
        )

        response = None

    llm_time = time.perf_counter() - llm_start

    print(
        f"Llama generation time: {llm_time:.2f} seconds"
    )

    # =====================================================
    # FALLBACK
    # =====================================================

    if not response:

        total_time = time.perf_counter() - total_start

        print("\n========== PERFORMANCE ==========")
        print(
            f"RAG time: {rag_time:.2f} seconds"
        )
        print(
            f"LLM time: {llm_time:.2f} seconds"
        )
        print(
            f"Total time: {total_time:.2f} seconds"
        )
        print("=================================\n")

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

        json_text = response[
            start:end + 1
        ]

        # -------------------------------------------------
        # PARSE JSON
        # -------------------------------------------------

        data = json.loads(
            json_text
        )

        if not isinstance(data, dict):

            raise ValueError(
                "LLM response is not a JSON object"
            )

        question = str(
            data.get(
                "question",
                ""
            )
        ).strip()

        expected_answer = str(
            data.get(
                "expected_answer",
                ""
            )
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

    # Remove accidental newlines
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

    # =====================================================
    # PERFORMANCE
    # =====================================================

    total_time = time.perf_counter() - total_start

    print("\n========== PERFORMANCE ==========")
    print(
        f"RAG time: {rag_time:.2f} seconds"
    )
    print(
        f"LLM time: {llm_time:.2f} seconds"
    )
    print(
        f"Total time: {total_time:.2f} seconds"
    )
    print("=================================\n")

    return result