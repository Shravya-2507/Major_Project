# Major_Project
Sentence Transformers → understand meaning
Smith–Waterman algorithm → check structure/keywords

ai_module/
│── preprocess.py          👈 text cleaning
│── smith_waterman.py     👈 alignment algorithm
│── semantic.py           👈 sentence transformer logic
│── answer_evaluation.py  👈 combines everything
│── pagerank.py           👈 candidate ranking


answer_evaluation.py
      ↓
semantic.py + smith_waterman.py
      ↓
preprocess.py

We followed a modular design where preprocessing, semantic similarity, and sequence alignment are implemented as separate components and integrated in a final evaluation module