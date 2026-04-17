import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // 1. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 2. Insert into database
    const query = `
      INSERT INTO candidates (name, email, password_hash) 
      VALUES ($1, $2, $3) RETURNING id, name, email
    `;
    const result = await pool.query(query, [name, email, passwordHash]);

    res.status(201).json({ message: "User created", user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // Unique violation error code
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Find user
    const userResult = await pool.query("SELECT * FROM candidates WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const user = userResult.rows[0];

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    // 3. Create Token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};