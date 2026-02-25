import React from "react";
import { useQuery } from "@tanstack/react-query";
import { tasksAPI } from "../services/api";
import { TaskStats } from "../types";
import { Link } from "react-router-dom";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

type IconProps = { size?: number; color?: string };
const TaskIcon = FaTasks as React.ComponentType<IconProps>;
const CheckIcon = FaCheckCircle as React.ComponentType<IconProps>;
const ClockIcon = FaClock as React.ComponentType<IconProps>;
const AlertIcon = FaExclamationTriangle as React.ComponentType<IconProps>;

export const Dashboard: React.FC = () => {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery<TaskStats>({
    queryKey: ["taskStats"],
    queryFn: tasksAPI.getTaskStats,
  });

  const { data: recentTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["recentTasks"],
    queryFn: tasksAPI.getRecentTasks,
  });

  // Coerce stats from API (PostgreSQL may return counts as strings)
  const totalTasks = Number(stats?.total_tasks) || 0;
  const completedTasks = Number(stats?.completed_tasks) || 0;
  const pendingTasks = Number(stats?.pending_tasks) || 0;
  const overdueTasks = Number(stats?.overdue_tasks) || 0;

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (isError) {
    return <div className="error">Error loading dashboard data.</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <TaskIcon size={30} />
          </div>
          <div className="stat-content">
            <h3>Total Tasks</h3>
            <p className="stat-value">{totalTasks}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckIcon size={30} color="green" />
          </div>
          <div className="stat-content">
            <h3>Completed Tasks</h3>
            <p className="stat-value">{completedTasks}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <ClockIcon size={30} color="orange" />
          </div>
          <div className="stat-content">
            <h3>Pending Tasks</h3>
            <p className="stat-value">{pendingTasks}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon overdue">
            <AlertIcon size={30} color="red" />
          </div>
          <div className="stat-content">
            <h3>Overdue Tasks</h3>
            <p className="stat-value">{overdueTasks}</p>
          </div>
        </div>
      </div>
      <div className="recent-tasks">
        <h2>Recent Tasks</h2>
        {tasksLoading ? (
          <div className="loading">Loading tasks...</div>
        ) : recentTasks && recentTasks.length > 0 ? (
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map((task: any) => (
                <tr key={task.id}>
                  <td>
                    <Link to={`/tasks/${task.id}`}>{task.title}</Link>
                  </td>
                  <td>{task.status?.replace("_", " ") ?? "—"}</td>
                  <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No recent tasks found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
