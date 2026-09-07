import { TaskItem, CalendarEvent, ProductivitySummary } from "./types";
import { ETHIOPIAN_HOLIDAYS, getUpcomingEthiopianHolidays, toEthiopianDate } from "../utils/ethiopian-calendar";

export const DEFAULT_TASKS: TaskItem[] = [
  {
    id: "t1",
    title: "Pay monthly Equb contribution via Telebirr",
    description: "Send 5,000 ETB for the September cycle payout pool",
    status: "todo",
    priority: "urgent",
    dueDate: "2026-09-07", // Today in test context
    project: "Finance & Equb",
    tags: ["finance", "telebirr", "equb"],
    recurring: "monthly",
    subtasks: [
      { id: "st1", title: "Check Telebirr balance", completed: true },
      { id: "st2", title: "Transfer 5,000 ETB to Equb admin", completed: false },
      { id: "st3", title: "Save transaction receipt", completed: false },
    ],
    createdAt: "2026-09-01",
    updatedAt: "2026-09-07",
  },
  {
    id: "t2",
    title: "Finalize tech portfolio architecture and documentation",
    description: "Complete system design artifacts, diagrams, and README walkthrough",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-09-08", // Tomorrow
    project: "Tech & Portfolio",
    tags: ["coding", "architecture", "portfolio"],
    recurring: "none",
    subtasks: [
      { id: "st4", title: "Draft system component diagram", completed: true },
      { id: "st5", title: "Write API endpoint specs", completed: true },
      { id: "st6", title: "Run end-to-end integration tests", completed: false },
    ],
    createdAt: "2026-09-02",
    updatedAt: "2026-09-07",
  },
  {
    id: "t3",
    title: "Review monthly electricity & Ethio Telecom package",
    description: "Verify utility usage and renew high-speed internet data bundle",
    status: "todo",
    priority: "high",
    dueDate: "2026-09-05", // Overdue in test context
    project: "Personal & Home",
    tags: ["bills", "utilities", "telecom"],
    recurring: "monthly",
    createdAt: "2026-09-01",
    updatedAt: "2026-09-05",
  },
  {
    id: "t4",
    title: "Prepare for Meskel festival family gathering",
    description: "Coordinate holiday travel logistics, dinner menu, and traditional bonfire event",
    status: "todo",
    priority: "medium",
    dueDate: "2026-09-26",
    project: "Personal & Home",
    tags: ["holiday", "family", "culture"],
    recurring: "none",
    createdAt: "2026-09-04",
    updatedAt: "2026-09-07",
  },
  {
    id: "t5",
    title: "Reconcile weekly ledger transactions in MELA Finance",
    description: "Categorize supermarket receipts and transport ride expenditures",
    status: "completed",
    priority: "low",
    dueDate: "2026-09-06",
    project: "Finance & Equb",
    tags: ["finance", "ledger"],
    recurring: "weekly",
    createdAt: "2026-08-30",
    updatedAt: "2026-09-06",
    completedAt: "2026-09-06",
  },
];

export const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "ev1",
    title: "MELA Engineering Sprint Planning",
    description: "Weekly milestone review and feature scoping",
    type: "event",
    date: "2026-09-07",
    time: "10:00",
    priority: "high",
    category: "Work",
    color: "#6366f1",
  },
  {
    id: "ev2",
    title: "Equb Monthly Payout Ceremony",
    description: "Drawing the September winner pool",
    type: "event",
    date: "2026-09-15",
    time: "17:00",
    recurring: "monthly",
    priority: "urgent",
    category: "Finance",
    color: "#10b981",
  },
  {
    id: "ev3",
    title: "Renew Telecom Home Internet Bundle",
    description: "Monthly fiber data renewal",
    type: "reminder",
    date: "2026-09-10",
    time: "09:00",
    recurring: "monthly",
    isCompleted: false,
    priority: "medium",
    category: "Utilities",
    color: "#f59e0b",
  },
];

export class MelaProductivityEngine {
  /**
   * Filter tasks due today (based on reference date YYYY-MM-DD).
   */
  static getTodayTasks(tasks: TaskItem[], refDateStr: string = "2026-09-07"): TaskItem[] {
    return tasks.filter((t) => t.dueDate === refDateStr && t.status !== "completed");
  }

  /**
   * Filter overdue tasks (dueDate < refDate and status !== completed).
   */
  static getOverdueTasks(tasks: TaskItem[], refDateStr: string = "2026-09-07"): TaskItem[] {
    return tasks.filter((t) => {
      if (!t.dueDate || t.status === "completed") return false;
      return t.dueDate < refDateStr;
    });
  }

  /**
   * Calculate productivity summary stats.
   */
  static getSummary(tasks: TaskItem[], refDateStr: string = "2026-09-07"): ProductivitySummary {
    const today = this.getTodayTasks(tasks, refDateStr);
    const overdue = this.getOverdueTasks(tasks, refDateStr);
    const completed = tasks.filter((t) => t.status === "completed").length;
    const urgentCount = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;
    const highCount = tasks.filter((t) => t.priority === "high" && t.status !== "completed").length;
    const upcoming = tasks.filter((t) => t.dueDate && t.dueDate > refDateStr && t.status !== "completed").length;

    return {
      totalTasks: tasks.length,
      dueToday: today.length,
      overdue: overdue.length,
      upcoming,
      completed,
      urgentCount,
      highCount,
    };
  }

  /**
   * Generate 7-day Weekly Plan with daily task and event distribution.
   */
  static getWeeklyPlan(
    tasks: TaskItem[],
    events: CalendarEvent[],
    startDateStr: string = "2026-09-07"
  ): { date: string; dayName: string; tasks: TaskItem[]; events: CalendarEvent[]; totalItems: number }[] {
    const start = new Date(startDateStr);
    const days: { date: string; dayName: string; tasks: TaskItem[]; events: CalendarEvent[]; totalItems: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const dateStr = current.toISOString().slice(0, 10);
      const dayName = current.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

      const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
      const dayEvents = events.filter((e) => e.date === dateStr);

      days.push({
        date: dateStr,
        dayName,
        tasks: dayTasks,
        events: dayEvents,
        totalItems: dayTasks.length + dayEvents.length,
      });
    }

    return days;
  }

  /**
   * Merges tasks into unified calendar items alongside custom events and Ethiopian holidays.
   */
  static mergeTasksIntoCalendar(
    tasks: TaskItem[],
    customEvents: CalendarEvent[],
    refDate: Date = new Date("2026-09-07")
  ): CalendarEvent[] {
    const merged: CalendarEvent[] = [...customEvents];

    // 1. Add Task Deadlines
    for (const t of tasks) {
      if (t.dueDate) {
        merged.push({
          id: `task_dl_${t.id}`,
          title: `📋 Deadline: ${t.title}`,
          description: t.description,
          type: "task_deadline",
          date: t.dueDate,
          priority: t.priority,
          isCompleted: t.status === "completed",
          category: t.project || "Task",
          color: t.priority === "urgent" ? "#ef4444" : t.priority === "high" ? "#f97316" : "#6366f1",
        });
      }
    }

    // 2. Add Ethiopian Cultural & National Holidays
    const holidays = getUpcomingEthiopianHolidays(120, refDate);
    for (const h of holidays) {
      merged.push({
        id: `hol_${h.holiday.nameEn.replace(/\s+/g, "_")}_${h.date.toISOString().slice(0, 10)}`,
        title: `⭐ ${h.holiday.nameEn} (${h.holiday.nameAm})`,
        description: h.holiday.descriptionEn,
        type: "holiday",
        date: h.date.toISOString().slice(0, 10),
        priority: "medium",
        category: "Ethiopian Holiday",
        color: "#059669",
      });
    }

    return merged.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Parses natural language task creation command.
   * e.g. "Create a task to finish my portfolio tomorrow" -> title: "Finish my portfolio", dueDate: "2026-09-08"
   */
  static parseNaturalLanguageTask(
    command: string,
    refDateStr: string = "2026-09-07"
  ): { title: string; dueDate?: string; priority: TaskItem["priority"]; project?: string } {
    const q = command.toLowerCase().trim();
    const ref = new Date(refDateStr);

    let dueDate: string | undefined = undefined;
    let priority: TaskItem["priority"] = "medium";
    let project = "Personal";

    if (q.includes("tomorrow")) {
      const tom = new Date(ref);
      tom.setDate(ref.getDate() + 1);
      dueDate = tom.toISOString().slice(0, 10);
    } else if (q.includes("today")) {
      dueDate = refDateStr;
    } else if (q.includes("next week")) {
      const nextW = new Date(ref);
      nextW.setDate(ref.getDate() + 7);
      dueDate = nextW.toISOString().slice(0, 10);
    }

    if (q.includes("urgent") || q.includes("asap")) priority = "urgent";
    else if (q.includes("important") || q.includes("high priority")) priority = "high";

    if (q.includes("portfolio") || q.includes("code") || q.includes("dev")) project = "Tech & Portfolio";
    else if (q.includes("equb") || q.includes("bill") || q.includes("money") || q.includes("finance")) project = "Finance & Equb";
    else if (q.includes("work") || q.includes("client")) project = "Work";

    // Clean up title
    let title = command
      .replace(/^create (a )?task (to )?/i, "")
      .replace(/^add (a )?task (to )?/i, "")
      .replace(/ tomorrow/i, "")
      .replace(/ today/i, "")
      .replace(/ next week/i, "")
      .trim();

    if (title.length > 0) {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    } else {
      title = "New Task";
    }

    return { title, dueDate, priority, project };
  }
}
