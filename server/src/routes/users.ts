import express, { Request, Response } from "express";
import { body } from "express-validator";
import { authenticate } from "../middleware/auth";

// Apply authentication middleware to all user routes
const router = express.Router();
router.use(authenticate);

// Get all users (for admin purposes)
router.get("/", (req, res) => {
  res.send("Get all users - Admin only");
});

// Get a specific user by ID
router.get("/:id", (req, res) => {
  res.send(`Get user with ID ${req.params.id}`);
});

// Update a specific user by ID
router.put(
  "/:id",
  [
    body("username")
      .optional()
      .notEmpty()
      .withMessage("Username cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  (req: Request, res: Response) => {
    res.send(`Update user with ID ${req.params.id}`);
  }
);

// Delete a specific user by ID
router.delete("/:id", (req, res) => {
  res.send(`Delete user with ID ${req.params.id}`);
});

export default router;
