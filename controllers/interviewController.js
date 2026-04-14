import pool from "../config/db.js";
import { evaluateAnswer } from "../services/evaluationService.js";
import axios from "axios";

// 1. Generate Questions (Flexible for Job-Seekers and VTU Practice)
export const generateQuestions = async (req, res) => {
  try {
    const { roleId, companyId, syllabusIds } = req.body;

    // Start with a base query that is always true
    let query = `SELECT * FROM questions WHERE 1=1`;
    const values = [];
    let counter = 1;

    // 1. Filter by Role if provided
    if (roleId) {
      query += ` AND role_id = $${counter++}`;
      values.push(roleId);
    }

    // 2. Filter by Company if provided (OR generic questions for that role)
    if (companyId) {
      query += ` AND (company_id = $${counter++} OR company_id IS NULL)`;
      values.push(companyId);
    }

    // 3. Filter by Syllabus/Subject (Crucial for VTU Practice Mode)
    if (syllabusIds && syllabusIds.length > 0) {
      query += ` AND syllabus_id = ANY($${counter++})`;
      values.push(syllabusIds);
    }

    // 4. Randomize and limit
    query += ` ORDER BY RANDOM() LIMIT 5`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No questions found matching these criteria." });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error generating questions:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};