from ai_module.topic_analysis import analyze_topics, calculate_topic_performance
from ai_module.pagerank import pagerank_topics

questions = [
    {"question": "What is normalization?", "answer": "reduces redundancy", "topic": "DBMS"},
    {"question": "What is OOP?", "answer": "object oriented programming", "topic": "Programming"}
]

answers = [
    "removes duplicate data",
    "classes and objects"
]

print("Running test...")   # 👈 ADD THIS

# Step 1
topic_scores = analyze_topics(questions, answers)

# Step 2
topic_avg = calculate_topic_performance(topic_scores)

# Step 3
pagerank_scores = pagerank_topics(topic_avg)

# Step 4
final_ranking = {}

for topic in topic_avg:
    final_score = 0.6 * topic_avg[topic] + 0.4 * pagerank_scores[topic]
    final_ranking[topic] = round(final_score, 2)

print("Topic Avg:", topic_avg)
print("PageRank:", pagerank_scores)
print("Final Ranking:", final_ranking)