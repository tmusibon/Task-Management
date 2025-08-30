import express from "express";
import { body } from "express-validator";
import { register, login, getProfile } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Registration route
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  register
);

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

// Get user profile route (protected)
router.get("/profile", authenticate, getProfile);

export default router;
