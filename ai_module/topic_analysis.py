# =========================================================
# ANALYZE TOPICS USING EXISTING SCORES
# =========================================================

def analyze_topics(questions):
    topic_scores = {}

    for question in questions:

        topic = question.get(
            "topic",
            "General"
        )

        score = float(
            question.get("score", 0)
        )

        if topic not in topic_scores:
            topic_scores[topic] = []

        topic_scores[topic].append(score)

    return topic_scores


# =========================================================
# AVERAGE TOPIC PERFORMANCE
# =========================================================

def calculate_topic_performance(topic_scores):

    topic_avg = {}

    for topic, scores in topic_scores.items():

        if scores:
            topic_avg[topic] = round(
                sum(scores) / len(scores),
                2
            )

    return topic_avg


# =========================================================
# RANK TOPICS
# =========================================================

def rank_topics(topic_avg):

    return sorted(
        topic_avg.items(),
        key=lambda x: x[1],
        reverse=True
    )


# =========================================================
# CLASSIFY TOPICS
# =========================================================

def classify_topics(topic_avg):

    result = {}

    for topic, score in topic_avg.items():

        if score >= 75:
            result[topic] = "Strong"

        elif score >= 60:
            result[topic] = "Moderate"

        elif score >= 40:
            result[topic] = "Average"

        else:
            result[topic] = "Needs Improvement"

    return result