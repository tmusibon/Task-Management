import { Pool, QueryResult } from "pg";
import db from "../config/db";

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date?: Date;
  category_id?: number;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export class TaskModel {
  private db: Pool;

  constructor() {
    this.db = db;
  }

  async create(task: Task): Promise<Task> {
    const query = `
      INSERT INTO tasks (title, description, status, priority, due_date, category_id, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      task.title,
      task.description || null,
      task.status,
      task.priority,
      task.due_date || null,
      task.category_id || null,
      task.user_id,
    ];

    const result: QueryResult = await this.db.query(query, values);
    return result.rows[0];
  }

  async findById(id: number, userId: number): Promise<Task | null> {
    const query = `
      SELECT t.*, c.name as category_name
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1 AND t.user_id = $2
    `;
    const result: QueryResult = await this.db.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  async findAll(userId: number, filters: any = {}): Promise<Task[]> {
    let query = `
      SELECT t.*, c.name as category_name
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;

    const values: any[] = [userId];
    let paramIndex = 2;

    if (filters.status) {
      query += ` AND t.status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.priority) {
      query += ` AND t.priority = $${paramIndex}`;
      values.push(filters.priority);
      paramIndex++;
    }

    if (filters.category_id) {
      query += ` AND t.category_id = $${paramIndex}`;
      values.push(filters.category_id);
      paramIndex++;
    }

    query += " ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC";

    const result: QueryResult = await this.db.query(query, values);
    return result.rows;
  }

  async update(
    id: number,
    userId: number,
    task: Partial<Task>
  ): Promise<Task | null> {
    // Build dynamic query based on provided fields
    const setValues: string[] = [];
    const queryValues: any[] = [];
    let paramIndex = 1;

    Object.entries(task).forEach(([key, value]) => {
      if (key !== "id" && key !== "user_id" && key !== "created_at") {
        setValues.push(`${key} = $${paramIndex}`);
        queryValues.push(value);
        paramIndex++;
      }
    });

    // Add updated_at timestamp
    setValues.push(`updated_at = $${paramIndex}`);
    queryValues.push(new Date());
    paramIndex++;

    // Add WHERE conditions
    queryValues.push(id);
    queryValues.push(userId);

    const query = `
      UPDATE tasks
      SET ${setValues.join(", ")}
      WHERE id = $${paramIndex - 1} AND user_id = $${paramIndex}
      RETURNING *
    `;

    const result: QueryResult = await this.db.query(query, queryValues);
    return result.rows[0] || null;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const query =
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id";
    const result: QueryResult = await this.db.query(query, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async getTaskStats(userId: number): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_tasks,
        SUM(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks
      FROM tasks
      WHERE user_id = $1
    `;

    const result: QueryResult = await this.db.query(query, [userId]);
    return result.rows[0];
  }
}

export default new TaskModel();
