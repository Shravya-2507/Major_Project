import pool from "../config/db.js";

const parseFilters = (req) => {
  const source = req.method === "POST" ? req.body : req.query;

  const roleId = source.role_id ? Number(source.role_id) : null;
  const companyId = source.company_id ? Number(source.company_id) : null;
  const syllabusIds = source.syllabus_ids
    ? Array.isArray(source.syllabus_ids)
      ? source.syllabus_ids.map(Number)
      : String(source.syllabus_ids).split(",").map(Number)
    : null;

  return { roleId, companyId, syllabusIds };
};

export const getQuestions = async (req, res) => {
  try {
    const { roleId, companyId, syllabusIds } = parseFilters(req);

    if (!roleId && (!syllabusIds || syllabusIds.length === 0)) {
      return res.status(400).json({ 
        error: "Search criteria missing", 
        detail: "Provide at least role_id or syllabus_ids" 
      });
    }

    let query = `SELECT id, question_text, syllabus_id FROM questions WHERE 1=1`;
    const values = [];
    let counter = 1;

    if (roleId) {
      query += ` AND role_id = $${counter++}`;
      values.push(roleId);
    }

    if (companyId) {
      // Logic: Specific company questions OR general questions (NULL)
      query += ` AND (company_id = $${counter++} OR company_id IS NULL)`;
      values.push(companyId);
    }

    if (syllabusIds?.length) {
      query += ` AND syllabus_id = ANY($${counter++}::int[])`; // Cast to int array
      values.push(syllabusIds);
    }

    query += ` ORDER BY RANDOM() LIMIT 5`;

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};