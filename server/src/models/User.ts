import { Pool, QueryResult } from "pg";
import bcrypt from "bcrypt";
import db from "../config/db";

export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

export class UserModel {
  private db: Pool;

  constructor() {
    this.db = db;
  }
  async create(user: User): Promise<UserDTO> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    const query = `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, username, email, created_at
    `;
    const values = [user.username, user.email, hashedPassword];
    const result: QueryResult = await this.db.query(query, values);
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
    SELECT * FROM users WHERE email = $1
    `;
    const result: QueryResult = await this.db.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<UserDTO | null> {
    const query = `
    SELECT id, username, email, created_at FROM users WHERE id = $1
    `;
    const result: QueryResult = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}

export default new UserModel();
