import express from "express";
import { getRoles, getCompanies, getRolesByCompany, getVtuQuestions } from "../controllers/selectionController.js";

const router = express.Router();

router.get("/roles", getRoles);
router.get("/companies", getCompanies);

// NEW: This matches the fetch in your frontend when a company is picked
router.get("/companies/:companyId/roles", getRolesByCompany);
// routes/questionRoutes.js
router.get("/vtu-questions", getVtuQuestions);

export default router;