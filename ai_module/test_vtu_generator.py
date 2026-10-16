
from vtu_question_generator import generate_vtu_question

result = generate_vtu_question(
    subject="Database Management Systems",
    module="SQL",
    topic="Joins"
)

print("\nGenerated VTU Question:")
print(result["question"])

print("\nExpected Answer:")
print(result["expected_answer"])

print("\nDifficulty:")
print(result["difficulty"])

print("\nRetrieved Sources:")
for source in result["sources"]:
    print(source)
