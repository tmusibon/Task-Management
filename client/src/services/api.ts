import axios from "axios";
import { Task, User } from "../types";

// Create an Axios instance with default settings
const api = axios.create({
  baseURL: process.env.REACT_API_URL || "http://localhost:3001/api",
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  getProfile: async (): Promise<User> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

// Tasks APIs
export const tasksAPI = {
  getTasks: async (filters?: Record<string, string>) => {
    const response = await api.get("/tasks", { params: filters });
    return response.data.tasks;
  },
  getTask: async (id: number) => {
    const response = await api.get(`/task/${id}`);
    return response.data.task;
  },
  createTask: async (task: Partial<Task>) => {
    const response = await api.post("/tasks", task);
    return response.data.task;
  },
  updateTask: async (id: number, task: Partial<Task>) => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data.task;
  },
  deleteTask: async (id: number) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  getTaskStats: async () => {
    const response = await api.get("/tasks/stats");
    return response.data.stats;
  },
};

export default api;
