import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksAPI } from "../services/api";
import { Task } from "../types";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaArrowLeft } from "react-icons/fa";

const IconLeft = FaArrowLeft as React.ComponentType<Record<string, unknown>>;

const taskSchema = Yup.object({
  title: Yup.string().required("Title is required").max(100, "Max 100 characters"),
  description: Yup.string().max(2000),
  status: Yup.string().oneOf(["pending", "in_progress", "completed"]).required(),
  priority: Yup.string().oneOf(["low", "medium", "high"]).required(),
  due_date: Yup.string().nullable(),
});

type TaskFormValues = {
  title: string;
  description: string;
  status: Task["status"];
  priority: Task["priority"];
  due_date: string;
};

const initialValues: TaskFormValues = {
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  due_date: "",
};

export const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const taskId = id ? parseInt(id, 10) : null;

  const { data: existingTask, isLoading: loadingTask } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => tasksAPI.getTask(taskId!),
    enabled: isEdit && !Number.isNaN(taskId!),
  });

  const createMutation = useMutation({
    mutationFn: (task: Partial<Task>) => tasksAPI.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
      queryClient.invalidateQueries({ queryKey: ["recentTasks"] });
      navigate("/tasks");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id: taskId, task }: { id: number; task: Partial<Task> }) =>
      tasksAPI.updateTask(taskId, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId!] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
      queryClient.invalidateQueries({ queryKey: ["recentTasks"] });
      navigate(`/tasks/${taskId}`);
    },
  });

  const defaultValues: TaskFormValues = existingTask
    ? {
        title: existingTask.title,
        description: existingTask.description || "",
        status: existingTask.status,
        priority: existingTask.priority,
        due_date: existingTask.due_date
          ? new Date(existingTask.due_date).toISOString().slice(0, 10)
          : "",
      }
    : initialValues;

  if (isEdit && (Number.isNaN(taskId!) || (loadingTask && !existingTask))) {
    return <div className="loading">Loading...</div>;
  }

  if (isEdit && !loadingTask && !existingTask) {
    return <div className="error">Task not found.</div>;
  }

  return (
    <div className="task-form-page">
      <Link to={isEdit ? `/tasks/${taskId}` : "/tasks"} className="btn-secondary back-link">
        <IconLeft /> Back
      </Link>
      <h1>{isEdit ? "Edit Task" : "New Task"}</h1>
      <Formik
        initialValues={defaultValues}
        validationSchema={taskSchema}
        enableReinitialize={true}
        onSubmit={async (values) => {
          const payload = {
            title: values.title,
            description: values.description || undefined,
            status: values.status,
            priority: values.priority,
            due_date: values.due_date ? new Date(values.due_date).toISOString() : undefined,
          };
          if (isEdit && taskId) {
            updateMutation.mutate({ id: taskId, task: payload });
          } else {
            createMutation.mutate(payload);
          }
        }}
      >
        {({ isSubmitting }) => {
          const mutating = createMutation.isPending || updateMutation.isPending;
          return (
            <Form className="task-form">
              {(createMutation.isError || updateMutation.isError) && (
                <div className="error-message">
                  {(createMutation.error as any)?.response?.data?.message ||
                    (updateMutation.error as any)?.response?.data?.message ||
                    "Something went wrong"}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <Field type="text" id="title" name="title" placeholder="Task title" />
                <ErrorMessage name="title" component="div" className="error" />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Optional description"
                />
                <ErrorMessage name="description" component="div" className="error" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <Field as="select" id="status" name="status">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Field>
                </div>
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <Field as="select" id="priority" name="priority">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Field>
                </div>
                <div className="form-group">
                  <label htmlFor="due_date">Due Date</label>
                  <Field type="date" id="due_date" name="due_date" />
                  <span className="form-hint">Past dates are shown as overdue until completed.</span>
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={isSubmitting || mutating}
                  className="btn-primary"
                >
                  {mutating ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
                </button>
                <Link to={isEdit ? `/tasks/${taskId}` : "/tasks"} className="btn-secondary">
                  Cancel
                </Link>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default TaskForm;
