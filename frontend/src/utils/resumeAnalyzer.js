export function analyzeResume(text) {
  if (!text) {
    return {
      score: 0,
      suggestions: ["Upload a valid resume"],
      foundKeywords: [],
    };
  }

  const keywords = [
    "javascript",
    "react",
    "node",
    "mongodb",
    "sql",
    "python",
    "java",
    "api",
    "git",
    "docker",
  ];

  const lower = text.toLowerCase();

  let score = 0;
  let found = [];

  keywords.forEach((k) => {
    if (lower.includes(k)) {
      score += 10;
      found.push(k);
    }
  });

  let suggestions = [];

  if (found.length < 5) {
    suggestions.push("Add more technical skills relevant to job roles");
  }

  if (!lower.includes("project")) {
    suggestions.push("Include at least 2 projects with description");
  }

  if (!lower.includes("experience")) {
    suggestions.push("Add internship or experience section");
  }

  if (!lower.includes("education")) {
    suggestions.push("Add education details");
  }

  if (score > 80) {
    suggestions.push("Great resume! Minor improvements needed");
  }

  return {
    score,
    suggestions,
    foundKeywords: found,
  };
}