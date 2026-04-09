from answer_evaluation import evaluate_answer

# ✅ Step 1: Group scores by topic
def analyze_topics(questions, user_answers):
    topic_scores = {}

    for i in range(len(questions)):
        q = questions[i]
        ans = user_answers[i]

        result = evaluate_answer(ans, q["answer"])
        score = result["final_score"]

        topic = q["topic"]

        if topic not in topic_scores:
            topic_scores[topic] = []

        topic_scores[topic].append(score)

    return topic_scores


# ✅ Step 2: Average score per topic
def calculate_topic_performance(topic_scores):
    topic_avg = {}

    for topic, scores in topic_scores.items():
        topic_avg[topic] = round(sum(scores) / len(scores), 2)

    return topic_avg


# ✅ Step 3: Rank topics
def rank_topics(topic_avg):
    return sorted(topic_avg.items(), key=lambda x: x[1], reverse=True)


# ✅ Step 4: Classify topics
def classify_topics(topic_avg):
    result = {}

    for topic, score in topic_avg.items():
        if score > 0.75:
            result[topic] = "Strong"
        elif score > 0.5:
            result[topic] = "Moderate"
        else:
            result[topic] = "Needs Improvement"

    return result
