import pool from "../config/db.js";
import axios from "axios";

const AI_API = process.env.AI_API_URL || "http://localhost:8000";

// Logic for fetching roles
export const getRoles = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, role_name FROM roles ORDER BY role_name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Selection Error (Roles):", err);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};
// Logic for fetching companies
export const getCompanies = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, company_name FROM companies ORDER BY company_name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Selection Error (Companies):", err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
};

export const getRolesByCompany = async (req, res) => {
  const { companyId } = req.params;
  
  try {
    const query = `
      SELECT r.id, r.role_name 
      FROM roles r
      INNER JOIN company_roles cr ON r.id = cr.role_id
      WHERE cr.company_id = $1
      ORDER BY r.role_name ASC`;
    
    const result = await pool.query(query, [companyId]);
    
    // If a company has no roles linked, return an empty array 
    // so the frontend can show "No roles available"
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch filtered roles" });
  }
};


export const getVtuQuestions = async (req, res) => {
  try {
    // 1. Fetch 3 random existing VTU questions from the database
    const existingResult = await pool.query(`
      SELECT
        q.id,
        q.question_text,
        q.expected_answer,
        q.syllabus_id,
        s.subject_name,
        s.module_name,
        s.topic_name
      FROM questions q
      JOIN vtu_syllabus s ON s.id = q.syllabus_id
      WHERE q.syllabus_id IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 3
    `);

    const questions = [...existingResult.rows];

    // 2. Fetch available VTU syllabus topics
    const syllabusResult = await pool.query(`
      SELECT id, subject_name, module_name, topic_name
      FROM vtu_syllabus
      ORDER BY RANDOM()
    `);

    // 3. Generate additional questions regardless of existing questions
    for (const syllabus of syllabusResult.rows) {
      if (questions.length >= 10) break;

      try {
        const aiResponse = await axios.post(
          `${AI_API}/generate-vtu-question`,
          {
            subject: syllabus.subject_name,
            module: syllabus.module_name,
            topic: syllabus.topic_name
          },
          { timeout: 120000 }
        );

        const generated = aiResponse.data;

        if (
          !generated.question?.trim() ||
          !generated.expected_answer?.trim()
        ) {
          continue;
        }

        // 4. Save the generated question and its expected answer
        const saved = await pool.query(
          `INSERT INTO questions (
            question_text,
            syllabus_id,
            difficulty_level,
            question_type,
            expected_answer,
            generated_by,
            category,
            ai_difficulty
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id, question_text, expected_answer, syllabus_id`,
          [
            generated.question.trim(),
            syllabus.id,
            String(generated.difficulty || "Medium").toLowerCase(),
            "technical",
            generated.expected_answer.trim(),
            "llama",
            syllabus.module_name,
            generated.difficulty || "Medium"
          ]
        );

        questions.push({
          ...saved.rows[0],
          subject_name: syllabus.subject_name,
          module_name: syllabus.module_name,
          topic_name: syllabus.topic_name
        });

      } catch (aiError) {
        console.error(
          `VTU generation failed for ${syllabus.topic_name}:`,
          aiError.response?.data || aiError.message
        );
      }
    }

    // 5. Return the combined questions
    if (questions.length === 0) {
      return res.status(404).json({
        message: "No VTU questions could be retrieved or generated."
      });
    }

    res.json(questions.slice(0, 10));

  } catch (err) {
    console.error("VTU question selection error:", err);
    res.status(500).json({
      error: "Failed to fetch VTU questions."
    });
  }
};
