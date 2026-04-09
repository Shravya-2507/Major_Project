import networkx as nx

def pagerank_topics(topic_avg):
    G = nx.Graph()

    topics = list(topic_avg.keys())

    # Add nodes
    for topic in topics:
        G.add_node(topic)

    # Connect topics
    for i in range(len(topics)):
        for j in range(i+1, len(topics)):
            t1, t2 = topics[i], topics[j]

            score_diff = abs(topic_avg[t1] - topic_avg[t2])
            weight = 1 / (1 + score_diff)

            G.add_edge(t1, t2, weight=weight)

    ranks = nx.pagerank(G)
    return ranks