import { smithWaterman } from "../utils/smithWaterman.js";

function simpleSimilarity(a, b) {
  const setA = new Set(a.toLowerCase().split(" "));
  const setB = new Set(b.toLowerCase().split(" "));
  return [...setA].filter(x => setB.has(x)).length / setB.size;
}

export function evaluateAnswer(user, ideal) {
  const semantic = simpleSimilarity(user, ideal);
  const structural = smithWaterman(user, ideal);

  return 0.6 * semantic + 0.4 * structural;
}