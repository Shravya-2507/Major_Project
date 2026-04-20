import express from "express";

const router = express.Router();

// ============================
// MOCK DATA
// ============================
const mockQuestions = [
  { id: 101, question_text: "What is polymorphism in OOP?", expected_answer: "Polymorphism allows objects to be treated as instances of their parent class.", syllabus_id: 1, role_id: 1 },
  { id: 102, question_text: "Explain the difference between SQL and NoSQL.", expected_answer: "SQL is relational with structured schemas, NoSQL is non-relational for unstructured data.", syllabus_id: 2, role_id: 1 },
  { id: 103, question_text: "What is a closure in JavaScript?", expected_answer: "A closure is a function with access to its outer scope variables.", syllabus_id: 3, role_id: 2 },
  { id: 104, question_text: "Explain REST API principles.", expected_answer: "REST uses HTTP methods, is stateless, has uniform interface.", syllabus_id: 2, role_id: 2 },
  { id: 105, question_text: "What is the difference between process and thread?", expected_answer: "Process has own memory, threads share memory space.", syllabus_id: 1, role_id: 1 }
];

const mockSessions = {};
const mockAnswers = {};

// ============================
// POST /questions - Generate interview questions
// ============================
router.post("/questions", (req, res) => {
  const { roleId, companyId, syllabusIds, limit = 5 } = req.body;
  
  // Shuffle and return limited questions
  const shuffled = [...mockQuestions].sort(() => Math.random() - 0.5);
  const questions = shuffled.slice(0, Math.min(limit, mockQuestions.length));
  
  console.log(`📝 Generated ${questions.length} questions for roleId=${roleId}`);
  res.json(questions);
});

// ============================
// POST /evaluate - Evaluate answers (MOCK AI scoring)
// ============================
router.post("/evaluate", (req, res) => {
  const { candidateId, answers, roleId, companyId } = req.body;

  if (!candidateId || !answers?.length) {
    return res.status(400).json({ error: "candidateId and answers required" });
  }

  const sessionId = `session-${candidateId}-${Date.now()}`;
  const results = [];
  let totalScore = 0;

  for (const ans of answers) {
    // Find expected answer
    const question = mockQuestions.find(q => q.id === ans.questionId);
    const expected = question?.expected_answer || "";
    
    // Mock AI scoring (simple word overlap scoring)
    const userWords = (ans.answerText || "").toLowerCase().split(/\s+/);
    const expectedWords = expected.toLowerCase().split(/\s+/);
    const overlap = userWords.filter(w => expectedWords.includes(w)).length;
    const score = Math.min(10, Math.round((overlap / Math.max(expectedWords.length, 1)) * 10));
    
    results.push({
      questionId: ans.questionId,
      final_score: score,
      result: score >= 7 ? "Good understanding!" : score >= 4 ? "Partial understanding." : "Needs improvement.",
      semantic_score: score * 0.8,
      smith_score: score * 0.6
    });
    
    totalScore += score;
  }

  const overallScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;

  // Store in mock session
  mockSessions[sessionId] = { candidateId, results, overallScore, timestamp: new Date() };

  console.log(`✅ Evaluated ${results.length} answers. Session: ${sessionId}, Score: ${overallScore}`);

  res.json({
    sessionId,
    overallScore,
    results
  });
});

// ============================
// GET /analyze/:candidateId - Get report
// ============================
router.get("/analyze/:candidateId", (req, res) => {
  const { candidateId } = req.params;
  const { sessionId } = req.query;

  // Find session
  const session = sessionId ? mockSessions[sessionId] : Object.values(mockSessions).find(s => s.candidateId == candidateId);

  if (!session) {
    return res.status(404).json({ error: "No session found" });
  }

  res.json({
    report: {
      total_score: session.overallScore * 10,
      topic_averages: {
        "Technical": session.overallScore * 10,
        "Problem Solving": session.overallScore * 8,
        "Communication": session.overallScore * 9
      },
      classifications: {
        "Technical": session.overallScore >= 7 ? "Expert" : "Intermediate",
        "Problem Solving": session.overallScore >= 7 ? "Expert" : "Beginner"
      }
    },
    answers: session.results
  });
});

export default router;
console.log("✅ interviewRoutes loaded (MOCK MODE)");