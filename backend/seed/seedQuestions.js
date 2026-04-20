import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.codingQuestion.deleteMany(); // optional reset

  await prisma.codingQuestion.create({
    data: {
      title: "Two Sum",
      description: "Find indices of two numbers that add up to target.",
      difficulty: "easy",
      constraints: "1 <= n <= 10^5",
      tags: ["array", "hashmap"],

      sampleInput: "2 3",
      sampleOutput: "5",

      sampleTestCases: [
        { input: "2 3", output: "5" },
        { input: "10 20", output: "30" }
      ],

      hiddenTestCases: [
        { input: "5 5", output: "10" }
      ]
    }
  });

  console.log("✅ Seeded successfully");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());