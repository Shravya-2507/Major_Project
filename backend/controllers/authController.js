import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "major_project_secret";

const serializeUser = (user) => ({
  id: user.id,
  name: user.name || user.full_name || user.email,
  email: user.email,
});

export const userSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const existing = await pool.query("SELECT id FROM candidates WHERE email=$1", [email]);

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const inserted = await pool.query(
      `INSERT INTO candidates (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, passwordHash]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: serializeUser(inserted.rows[0]),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};

export const adminSignup = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    const existing = await pool.query(
      "SELECT admin_id FROM admin_users WHERE email=$1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO admin_users
      (full_name,email,password_hash)
      VALUES($1,$2,$3)
      RETURNING admin_id,full_name,email`,
      [full_name, email, passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: result.rows[0].admin_id,
        full_name: result.rows[0].full_name,
        email: result.rows[0].email,
      },
    });

  } catch (err) {
  console.error("ADMIN SIGNUP ERROR:");
  console.error(err);
  console.error(err.message);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message,
  });
}
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT id, name, email, password_hash FROM candidates WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash || "");

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user.id, role: "user" }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      role: "user",
      user: serializeUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT admin_id, full_name, email, password_hash
       FROM admin_users
       WHERE email=$1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const admin = result.rows[0];

    const valid = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: admin.admin_id,
        role: "admin",
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      token,
      role: "admin",
      admin: {
        id: admin.admin_id,
        full_name: admin.full_name,
        email: admin.email,
      },
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};