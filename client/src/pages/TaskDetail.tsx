import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { tasksAPI } from "../services/api";
import { format } from "date-fns";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import { isOverdue } from "../utils/task";

const IconLeft = FaArrowLeft as React.ComponentType<Record<string, unknown>>;
const IconEdit = FaEdit as React.ComponentType<Record<string, unknown>>;
const IconTrash = FaTrash as React.ComponentType<Record<string, unknown>>;

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const taskId = parseInt(id!, 10);

  const { data: task, isLoading, error } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => tasksAPI.getTask(taskId),
    enabled: !Number.isNaN(taskId),
  });

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await tasksAPI.deleteTask(taskId);
      navigate("/tasks");
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  if (Number.isNaN(taskId)) {
    return <div className="error">Invalid task ID.</div>;
  }
  if (isLoading) return <div className="loading">Loading...</div>;
  if (error || !task) return <div className="error">Task not found.</div>;

  return (
    <div className="task-detail">
      <div className="detail-actions">
        <Link to="/tasks" className="btn-secondary">
          <IconLeft /> Back to Tasks
        </Link>
        <div className="detail-buttons">
          <Link to={`/tasks/edit/${task.id}`} className="btn-primary">
            <IconEdit /> Edit
          </Link>
          <button onClick={handleDelete} className="btn-delete">
            <IconTrash /> Delete
          </button>
        </div>
      </div>
      <div className="detail-card">
        <h1>{task.title}</h1>
        <div className="detail-meta">
          <span className={`status-badge ${task.status}`}>
            {task.status.replace("_", " ")}
          </span>
          <span className={`priority-badge ${task.priority}`}>
            {task.priority}
          </span>
          {task.due_date && (
            <span className="due-date">
              Due: {format(new Date(task.due_date), "MMM dd, yyyy")}
            </span>
          )}
          {isOverdue(task) && (
            <span className="overdue-badge">Overdue</span>
          )}
        </div>
        {task.description && (
          <div className="detail-description">
            <h3>Description</h3>
            <p>{task.description}</p>
          </div>
        )}
        {task.category_name && (
          <p className="detail-category">Category: {task.category_name}</p>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
