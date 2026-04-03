export function smithWaterman(a, b) {
  const match = 2, mismatch = -1, gap = -1;
  const m = a.length, n = b.length;
  let dp = Array(m+1).fill().map(() => Array(n+1).fill(0));
  let maxScore = 0;

  for (let i=1;i<=m;i++){
    for (let j=1;j<=n;j++){
      let score = a[i-1] === b[j-1] ? match : mismatch;
      dp[i][j] = Math.max(
        0,
        dp[i-1][j-1] + score,
        dp[i-1][j] + gap,
        dp[i][j-1] + gap
      );
      maxScore = Math.max(maxScore, dp[i][j]);
    }
  }

  return maxScore / (Math.max(m,n)+1);
}