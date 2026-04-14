from preprocess import clean_text

def smith_waterman(s1, s2):
    s1, s2 = clean_text(s1), clean_text(s2)

    m, n = len(s1), len(s2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    max_score = 0

    for i in range(1, m+1):
        for j in range(1, n+1):
            score = 2 if s1[i-1] == s2[j-1] else -1
            dp[i][j] = max(
                0,
                dp[i-1][j-1] + score,
                dp[i-1][j] - 1,
                dp[i][j-1] - 1
            )
            max_score = max(max_score, dp[i][j])

    return max_score / max(len(s1), len(s2))