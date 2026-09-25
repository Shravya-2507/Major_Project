from llama.llama_client import ask_llama


def generate_job_description(role: str) -> str:
    role = (role or "").strip()

    if not role:
        raise ValueError("A target role is required")

    prompt = f"""
You are a hiring specialist creating a realistic entry-level job description for a student placement system.

Target role: {role}

Write one complete, role-specific job description for a fresher or early-career candidate.
Include these plain-text sections:
Job Title
Role Overview
Responsibilities
Required Technical Skills
Preferred Skills
Education and Qualifications
Experience Level
Technologies and Tools
Soft Skills

Use technologies and responsibilities that genuinely fit the target role. Keep the content practical and suitable for resume ATS matching. Do not require senior-level experience or unrelated technologies.
Return only the job description as normal plain text. Do not return JSON, markdown code fences, commentary, or placeholders.
"""

    generated = ask_llama(prompt, max_tokens=500, response_format=None)
    job_description = (generated or "").strip()

    if not job_description:
        raise RuntimeError("The AI service returned an empty job description")

    return job_description
