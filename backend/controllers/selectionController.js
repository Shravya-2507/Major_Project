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