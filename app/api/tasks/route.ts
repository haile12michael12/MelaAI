import { NextRequest, NextResponse } from "next/server";
import {
  MelaProductivityEngine,
  DEFAULT_TASKS,
  TaskItem,
} from "@/lib/tasks/productivity";

let tasksStore: TaskItem[] = [...DEFAULT_TASKS];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // today, overdue, completed, all
    const project = searchParams.get("project");
    const refDate = searchParams.get("date") || "2026-09-07";

    let list = [...tasksStore];
    if (filter === "today") list = MelaProductivityEngine.getTodayTasks(list, refDate);
    else if (filter === "overdue") list = MelaProductivityEngine.getOverdueTasks(list, refDate);
    else if (filter === "completed") list = list.filter((t) => t.status === "completed");

    if (project && project !== "all") {
      list = list.filter((t) => t.project === project);
    }

    const summary = MelaProductivityEngine.getSummary(tasksStore, refDate);

    return NextResponse.json({
      tasks: list,
      summary,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, task, id, subtaskId, completed } = body;

    if (action === "create_task") {
      const newTask: TaskItem = {
        id: "task_" + Date.now(),
        title: task.title,
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate || undefined,
        project: task.project || "Personal",
        tags: task.tags || [],
        recurring: task.recurring || "none",
        subtasks: task.subtasks || [],
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      tasksStore.unshift(newTask);
    } else if (action === "toggle_complete") {
      tasksStore = tasksStore.map((t) => {
        if (t.id === id) {
          const isDone = t.status !== "completed";
          return {
            ...t,
            status: isDone ? "completed" : "todo",
            completedAt: isDone ? new Date().toISOString().slice(0, 10) : undefined,
            updatedAt: new Date().toISOString().slice(0, 10),
          };
        }
        return t;
      });
    } else if (action === "toggle_subtask") {
      tasksStore = tasksStore.map((t) => {
        if (t.id === id && t.subtasks) {
          const updatedSubtasks = t.subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st));
          return { ...t, subtasks: updatedSubtasks, updatedAt: new Date().toISOString().slice(0, 10) };
        }
        return t;
      });
    } else if (action === "update_task") {
      tasksStore = tasksStore.map((t) => (t.id === id ? { ...t, ...task, updatedAt: new Date().toISOString().slice(0, 10) } : t));
    } else if (action === "delete_task") {
      tasksStore = tasksStore.filter((t) => t.id !== id);
    }

    const summary = MelaProductivityEngine.getSummary(tasksStore);
    return NextResponse.json({ success: true, tasks: tasksStore, summary });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
