import express from "express";
import { body } from "express-validator";
import { authenticate } from "../middleware/auth";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getTaskStats,
  getRecentTasks,
} from "../controllers/taskController";

// Apply authentication middleware to all task routes
const router = express.Router();
router.use(authenticate);

// Stats and recent must be before /:id
router.get("/stats", getTaskStats);
router.get("/recent", getRecentTasks);

// Create a new task
router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").optional().isString(),
    body("status")
      .optional()
      .isIn(["pending", "in_progress", "completed"])
      .withMessage("Invalid status"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Invalid priority"),
    body("due_date").optional().isISO8601().toDate(),
    body("category_id")
      .optional()
      .isInt()
      .withMessage("Category ID must be an integer"),
  ],
  createTask
);

// Get all tasks with optional filters
router.get("/", getTasks);

// Get a specific task by ID
router.get("/:id", getTask);

// Update a specific task by ID
router.put(
  "/:id",
  [
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().isString(),
    body("status")
      .optional()
      .isIn(["pending", "in_progress", "completed"])
      .withMessage("Invalid status"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Invalid priority"),
    body("due_date").optional().isISO8601().toDate(),
    body("category_id")
      .optional()
      .isInt()
      .withMessage("Category ID must be an integer"),
  ],
  updateTask
);

// Delete a specific task by ID
router.delete("/:id", deleteTask);

export default router;
