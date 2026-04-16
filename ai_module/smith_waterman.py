from preprocess import clean_text

def smith_waterman(s1, s2):
    s1 = clean_text(s1).split()
    s2 = clean_text(s2).split()

    m, n = len(s1), len(s2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    max_score = 0

    match, mismatch, gap = 2, -1, -1

    for i in range(1, m+1):
        for j in range(1, n+1):
            score = match if s1[i-1] == s2[j-1] else mismatch

            dp[i][j] = max(
                0,
                dp[i-1][j-1] + score,
                dp[i-1][j] + gap,
                dp[i][j-1] + gap
            )

            max_score = max(max_score, dp[i][j])

    max_possible = min(m, n) * match
    return 0 if max_possible == 0 else max_score / max_possible