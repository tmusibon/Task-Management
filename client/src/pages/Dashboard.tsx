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

export const Dashboard: React.FC = () => {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery<TaskStats>({
    queryKey: ["taskStats"],
    queryFn: tasksAPI.getTaskStats,
  });

  const { data: recenTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["recentTasks"],
    queryFn: tasksAPI.getRecentTasks,
  });

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
            <FaTasks size={30} />
          </div>
          <div className="stat-content">
            <h3>Total Tasks</h3>
            <p className="stat-value">{stats?.total_tasks || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaCheckCircle size={30} color="green" />
          </div>
          <div className="stat-content">
            <h3>Completed Tasks</h3>
            <p className="stat-value">{stats?.completed_tasks || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FaClock size={30} color="orange" />
          </div>
          <div className="stat-content">
            <h3>Pending Tasks</h3>
            <p className="stat-value">{stats?.pending_tasks || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon overdue">
            <FaExclamationTriangle size={30} color="red" />
          </div>
          <div className="stat-content">
            <h3>Overdue Tasks</h3>
            <p className="stat-value">{stats?.overdue_tasks || 0}</p>
          </div>
        </div>
      </div>
      <div className="recent-tasks">
        <h2>Recent Tasks</h2>
        {tasksLoading ? (
          <div className="loading">Loading tasks...</div>
        ) : recenTasks && recenTasks.length > 0 ? (
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {recenTasks.map((task: any) => (
                <tr key={task.id}>
                  <td>
                    <Link to={`/tasks/${task.id}`}>{task.title}</Link>
                  </td>
                  <td>{task.status}</td>
                  <td>{new Date(task.due_date).toLocaleDateString()}</td>
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
