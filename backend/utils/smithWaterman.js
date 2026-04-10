export function smithWaterman(a, b) {
  if (!a || !b) return 0;

  const clean = str =>
    str.toLowerCase().replace(/[^\w\s]/g, "");

  const tokensA = clean(a).split(/\s+/);
  const tokensB = clean(b).split(/\s+/);

  const match = 2, mismatch = -1, gap = -1;
  const m = tokensA.length, n = tokensB.length;

  const dp = Array(m + 1)
    .fill()
    .map(() => Array(n + 1).fill(0));

  let maxScore = 0;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const score =
        tokensA[i - 1] === tokensB[j - 1] ? match : mismatch;

      dp[i][j] = Math.max(
        0,
        dp[i - 1][j - 1] + score,
        dp[i - 1][j] + gap,
        dp[i][j - 1] + gap
      );

      maxScore = Math.max(maxScore, dp[i][j]);
    }
  }

  const maxPossible = Math.min(m, n) * match;
  return maxPossible === 0 ? 0 : maxScore / maxPossible;
}