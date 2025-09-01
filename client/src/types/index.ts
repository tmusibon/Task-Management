export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date?: string;
  category_id?: number;
  category_name?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  high_priority_tasks: number;
  overdue_tasks: number;
}
