import { smithWaterman } from "../utils/smithWaterman.js";

// simple keyword similarity
function keywordMatch(a, b) {
  const setA = new Set(a.toLowerCase().split(" "));
  const setB = new Set(b.toLowerCase().split(" "));
  return [...setA].filter(x => setB.has(x)).length / setB.size;
}

export function evaluateAnswer(userAnswer, expectedAnswer) {
  const swScore = smithWaterman(userAnswer, expectedAnswer); // 0–1
  const kwScore = keywordMatch(userAnswer, expectedAnswer);  // 0–1

  // weighted score
  const finalScore = (0.7 * swScore + 0.3 * kwScore) * 10;

  let feedback = "Needs improvement";
  if (finalScore > 8) feedback = "Excellent";
  else if (finalScore > 5) feedback = "Good";

  return {
    score: Number(finalScore.toFixed(2)),
    feedback
  };
}