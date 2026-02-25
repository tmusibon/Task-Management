import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tasksAPI } from "../services/api";
import { Task } from "../types";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { FaSort, FaPlus } from "react-icons/fa";
import { isOverdue } from "../utils/task";

const IconSort = FaSort as React.ComponentType<Record<string, unknown>>;
const IconPlus = FaPlus as React.ComponentType<Record<string, unknown>>;

export const TaskList: React.FC = () => {
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
  });

  const [sortBy, setSortBy] = useState<keyof Task>("due_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = useQuery<Task[]>({
    queryKey: ["tasks", filters],
    queryFn: () => tasksAPI.getTasks(filters),
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSort = (field: keyof Task) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const sortedTasks = tasks
    ? [...tasks].sort((a, b) => {
        if (sortBy === "due_date") {
          const dateA = a.due_date
            ? new Date(a.due_date).getTime()
            : Number.MAX_SAFE_INTEGER;
          const dateB = b.due_date
            ? new Date(b.due_date).getTime()
            : Number.MAX_SAFE_INTEGER;
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        } else if (sortBy === "priority") {
          const priorityMap = { low: 1, medium: 2, high: 3 };
          const priorityA = priorityMap[a.priority];
          const priorityB = priorityMap[b.priority];
          return sortOrder === "asc"
            ? priorityA - priorityB
            : priorityB - priorityA;
        } else {
          const valueA = a[sortBy] || "";
          const valueB = b[sortBy] || "";
          return sortOrder === "asc"
            ? valueA.toString().localeCompare(valueB.toString())
            : valueB.toString().localeCompare(valueA.toString());
        }
      })
    : [];

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await tasksAPI.deleteTask(taskId);
        refetch();
      } catch (err) {
        console.error("Failed to delete task", err);
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error loading tasks.</div>;
  }

  return (
    <div className="task-list-page">
      <div className="page-header">
        <h1>Tasks</h1>
        <Link to="/tasks/new" className="btn-primary">
          <IconPlus /> New Task
        </Link>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {sortedTasks.length > 0 ? (
        <div className="tasks-table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("title")}>
                  Title <IconSort />
                </th>
                <th onClick={() => handleSort("status")}>
                  Status <IconSort />
                </th>
                <th onClick={() => handleSort("priority")}>
                  Priority <IconSort />
                </th>
                <th onClick={() => handleSort("due_date")}>
                  Due Date <IconSort />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>
                    <span className={`status-badge ${task.status}`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    {task.due_date ? (
                      <>
                        {format(new Date(task.due_date), "MMM dd, yyyy")}
                        {isOverdue(task) && (
                          <span className="overdue-badge">Overdue</span>
                        )}
                      </>
                    ) : (
                      "No due date"
                    )}
                  </td>
                  <td className="actions">
                    <Link to={`/tasks/${task.id}`} className="btn-view">
                      View
                    </Link>
                    <Link to={`/tasks/edit/${task.id}`} className="btn-edit">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>
            No tasks found. Try adjusting your filters or create a new task.
          </p>
          <Link to="/tasks/new" className="btn-primary">
            Create Task
          </Link>
        </div>
      )}
    </div>
  );
};

export default TaskList;
