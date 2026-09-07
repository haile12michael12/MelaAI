export type TaskStatus = "todo" | "in_progress" | "completed" | "blocked";
export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

export interface SubtaskItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  project?: string;
  tags?: string[];
  recurring?: RecurrenceType;
  subtasks?: SubtaskItem[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type CalendarItemType = "event" | "reminder" | "task_deadline" | "holiday";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CalendarItemType;
  date: string; // YYYY-MM-DD
  endDate?: string;
  time?: string; // HH:mm
  recurring?: RecurrenceType | "yearly";
  isCompleted?: boolean;
  priority?: TaskPriority;
  category?: string;
  color?: string;
}

export interface ProductivitySummary {
  totalTasks: number;
  dueToday: number;
  overdue: number;
  upcoming: number;
  completed: number;
  urgentCount: number;
  highCount: number;
}
