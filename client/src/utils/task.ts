/** True when the task has a due date before today and is not completed. */
export function isOverdue(task: { due_date?: string; status: string }): boolean {
  if (!task.due_date || task.status === "completed") return false;
  const due = new Date(task.due_date);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return due < today;
}
