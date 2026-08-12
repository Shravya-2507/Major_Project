from answer_evaluation import evaluate_answer


result = evaluate_answer(
    """
    A stack is a linear data structure that follows LIFO.
    Elements are inserted and removed from the top.
    """,

    """
    Stack is a data structure that follows Last In First Out.
    Push inserts elements and pop removes elements.
    """,

    role="Software Developer",
    company="Google"
)


print(result)