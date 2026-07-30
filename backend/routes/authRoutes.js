import express from "express";

import {
  userSignup,
  userLogin,
  adminSignup,
  adminLogin,
} from "../controllers/authController.js";

const router = express.Router();

/*
========================
USER
========================
*/

router.post("/signup", userSignup);
router.post("/login", userLogin);

/*
========================
ADMIN
========================
*/

router.post("/admin/signup", adminSignup);
router.post("/admin/login", adminLogin);

export default router;