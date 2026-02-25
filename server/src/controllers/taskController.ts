import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { TaskModel, Task } from "../models/Task";

export const createTask = async (req: Request, res: Response) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { title, description, status, priority, due_date, category_id } =
      req.body;
    const newTask = await new TaskModel().create({
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      due_date: due_date ? new Date(due_date) : undefined,
      category_id,
      user_id: req.user.id,
    });
    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (err) {
    console.error("Create task error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // Extract filters from query parameters
    const { status, priority, category_id } = req.query;
    const filters: any = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category_id) filters.category_id = category_id;

    const tasks = await new TaskModel().findAll(req.user.id, filters);
    res.status(200).json({ tasks });
  } catch (err) {
    console.error("Get tasks error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const taskId = parseInt(req.params.id, 10);
    const task = await new TaskModel().findById(taskId, req.user.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ task });
  } catch (err) {
    console.error("Get task error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const taskId = parseInt(req.params.id, 10);
    const { title, description, status, priority, due_date, category_id } =
      req.body;

    // prepare updated data
    const updateData: Partial<Task> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (due_date !== undefined) updateData.due_date = new Date(due_date);
    if (category_id !== undefined) updateData.category_id = category_id;

    const updateTask = await new TaskModel().update(
      taskId,
      req.user.id,
      updateData
    );

    if (!updateTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updateTask });
  } catch (err) {
    console.error("Update task error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const taskId = parseInt(req.params.id, 10);
    const deleted = await new TaskModel().delete(taskId, req.user.id);

    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete task error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTaskStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const stats = await new TaskModel().getTaskStats(req.user.id);
    res.status(200).json({ stats });
  } catch (err) {
    console.error("Get task stats error", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRecentTasks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);
    const tasks = await new TaskModel().findRecent(req.user.id, limit);
    res.status(200).json({ tasks });
  } catch (err) {
    console.error("Get recent tasks error", err);
    res.status(500).json({ message: "Server error" });
  }
};
