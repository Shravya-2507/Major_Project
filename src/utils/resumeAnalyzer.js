const companyKeywords = {
  google: [
    "data structures",
    "algorithms",
    "system design",
    "scalability",
    "distributed systems",
    "java",
    "python",
  ],
  amazon: [
    "leadership principles",
    "aws",
    "scalable systems",
    "java",
    "problem solving",
    "microservices",
  ],
  microsoft: [
    "c++",
    "azure",
    "system design",
    "oop",
    "cloud",
    "debugging",
  ],
};

export const analyzeResume = (resumeText, company) => {
  const keywords = companyKeywords[company] || [];

  const text = resumeText.toLowerCase();

  let matched = [];
  let missing = [];

  keywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  const score = Math.round((matched.length / keywords.length) * 100);

  let suggestions = [];

  if (score < 50) {
    suggestions.push("Add more relevant technical keywords.");
    suggestions.push("Include projects related to the company domain.");
  }

  if (missing.length > 0) {
    suggestions.push(
      `Try including keywords like: ${missing.slice(0, 4).join(", ")}`
    );
  }

  if (!text.includes("project")) {
    suggestions.push("Add at least 2 strong projects.");
  }

  if (!text.includes("experience")) {
    suggestions.push("Include internships or experience section.");
  }

  return {
    score,
    matched,
    missing,
    suggestions,
  };
};