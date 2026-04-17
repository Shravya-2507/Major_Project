import pool from "../config/db.js";

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
    // We target questions where syllabus_id is present (VTU questions)
    const query = `
      SELECT id, question_text, expected_answer 
      FROM questions 
      WHERE syllabus_id IS NOT NULL 
      ORDER BY RANDOM() 
      LIMIT 10
    `;
    
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No VTU questions found." });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Selection Controller Error:", err.message);
    res.status(500).json({ error: "Failed to fetch VTU questions" });
  }
};