"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  TaskItem,
  TaskPriority,
  TaskStatus,
  RecurrenceType,
} from "@/lib/tasks/types";
import {
  DEFAULT_TASKS,
  MelaProductivityEngine,
} from "@/lib/tasks/productivity";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  AlertCircle,
  Clock,
  Tag,
  Folder,
  Repeat,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";

export default function TasksDashboardPage() {
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
  const [filter, setFilter] = useState<"all" | "today" | "overdue" | "completed">("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [naturalCommand, setNaturalCommand] = useState("");

  // Modals & form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    dueDate: "2026-09-08",
    project: "Personal",
    recurring: "none" as RecurrenceType,
    subtasksInput: "",
  });

  const refDateStr = "2026-09-07";
  const summary = useMemo(() => MelaProductivityEngine.getSummary(tasks, refDateStr), [tasks]);

  const projects = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => { if (t.project) set.add(t.project); });
    return ["all", ...Array.from(set)];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status / time filter
      if (filter === "today" && (t.dueDate !== refDateStr || t.status === "completed")) return false;
      if (filter === "overdue" && (!t.dueDate || t.dueDate >= refDateStr || t.status === "completed")) return false;
      if (filter === "completed" && t.status !== "completed") return false;
      if (filter === "all" && t.status === "completed") return false; // Default active

      // Project filter
      if (selectedProject !== "all" && t.project !== selectedProject) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = (t.description || "").toLowerCase().includes(q);
        const matchTags = (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }

      return true;
    });
  }, [tasks, filter, selectedProject, searchQuery]);

  // Toggle task complete
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
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
      })
    );
  };

  // Toggle subtask
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.subtasks) {
          const updatedSubtasks = t.subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st));
          return { ...t, subtasks: updatedSubtasks, updatedAt: new Date().toISOString().slice(0, 10) };
        }
        return t;
      })
    );
  };

  // Natural Language Task Creation
  const handleRunNaturalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalCommand.trim()) return;

    const parsed = MelaProductivityEngine.parseNaturalLanguageTask(naturalCommand, refDateStr);
    const newTask: TaskItem = {
      id: "task_" + Date.now(),
      title: parsed.title,
      description: `Created via MELA Command: "${naturalCommand}"`,
      status: "todo",
      priority: parsed.priority,
      dueDate: parsed.dueDate,
      project: parsed.project,
      recurring: "none",
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setTasks((prev) => [newTask, ...prev]);
    setNaturalCommand("");
  };

  // Save Modal Task
  const handleSaveModalTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    const subtasks = taskForm.subtasksInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((title, idx) => ({ id: "st_" + Date.now() + "_" + idx, title, completed: false }));

    const newTask: TaskItem = {
      id: "task_" + Date.now(),
      title: taskForm.title.trim(),
      description: taskForm.description.trim() || undefined,
      status: "todo",
      priority: taskForm.priority,
      dueDate: taskForm.dueDate || undefined,
      project: taskForm.project,
      recurring: taskForm.recurring,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setTasks((prev) => [newTask, ...prev]);
    setTaskForm({ title: "", description: "", priority: "medium", dueDate: "2026-09-08", project: "Personal", recurring: "none", subtasksInput: "" });
    setIsAddModalOpen(false);
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
      case "high":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
      case "medium":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300";
      default:
        return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Personal Tasks & Priorities
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Unified priority organizer with subtasks, recurring routines & calendar sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/calendar"
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-xs transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          >
            <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Open Calendar</span>
          </Link>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-2xl border p-4 text-left transition ${
            filter === "all"
              ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20"
              : "border-neutral-200/80 bg-white dark:border-neutral-800/80 dark:bg-neutral-900"
          }`}
        >
          <span className="text-[11px] font-medium text-neutral-500">Active Tasks</span>
          <p className="mt-1 text-2xl font-extrabold text-neutral-900 dark:text-white">{summary.totalTasks - summary.completed}</p>
        </button>

        <button
          onClick={() => setFilter("today")}
          className={`rounded-2xl border p-4 text-left transition ${
            filter === "today"
              ? "border-teal-600 bg-teal-50/50 dark:border-teal-500 dark:bg-teal-950/20"
              : "border-neutral-200/80 bg-white dark:border-neutral-800/80 dark:bg-neutral-900"
          }`}
        >
          <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">Due Today</span>
          <p className="mt-1 text-2xl font-extrabold text-teal-600 dark:text-teal-400">{summary.dueToday}</p>
        </button>

        <button
          onClick={() => setFilter("overdue")}
          className={`rounded-2xl border p-4 text-left transition ${
            filter === "overdue"
              ? "border-red-600 bg-red-50/50 dark:border-red-500 dark:bg-red-950/20"
              : "border-neutral-200/80 bg-white dark:border-neutral-800/80 dark:bg-neutral-900"
          }`}
        >
          <span className="text-[11px] font-medium text-red-600 dark:text-red-400">Overdue</span>
          <p className="mt-1 text-2xl font-extrabold text-red-600 dark:text-red-400">{summary.overdue}</p>
        </button>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800/80 dark:bg-neutral-900">
          <span className="text-[11px] font-medium text-neutral-500">Urgent/High</span>
          <p className="mt-1 text-2xl font-extrabold text-amber-500">{summary.urgentCount + summary.highCount}</p>
        </div>

        <button
          onClick={() => setFilter("completed")}
          className={`rounded-2xl border p-4 text-left transition ${
            filter === "completed"
              ? "border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/20"
              : "border-neutral-200/80 bg-white dark:border-neutral-800/80 dark:bg-neutral-900"
          }`}
        >
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Completed</span>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{summary.completed}</p>
        </button>
      </div>

      {/* MELA Natural Command Prompt */}
      <form onSubmit={handleRunNaturalCommand} className="relative">
        <div className="flex items-center gap-2 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-2 shadow-xs dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <Sparkles className="ml-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <input
            type="text"
            value={naturalCommand}
            onChange={(e) => setNaturalCommand(e.target.value)}
            placeholder="Ask MELA: e.g. 'Create a task to finish my portfolio tomorrow' or 'Prepare presentation Friday'..."
            className="flex-1 bg-transparent px-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden dark:text-white"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            Create Task
          </button>
        </div>
      </form>

      {/* Filter and Search Bar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          {projects.map((proj) => (
            <button
              key={proj}
              onClick={() => setSelectedProject(proj)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition ${
                selectedProject === proj
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {proj === "all" ? "All Projects" : proj}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-xl border border-neutral-200 bg-white py-1.5 pl-8 pr-3 text-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-200 p-8 text-center dark:border-neutral-800">
            <CheckCircle2 className="mx-auto h-8 w-8 text-neutral-400" />
            <p className="mt-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">No tasks match this filter</p>
            <p className="text-xs text-neutral-400">All caught up or try switching project views.</p>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isOverdue = t.dueDate && t.dueDate < refDateStr && t.status !== "completed";
            const isDueToday = t.dueDate === refDateStr && t.status !== "completed";
            const isExpanded = expandedTaskId === t.id;
            const completedSubtasks = (t.subtasks || []).filter((st) => st.completed).length;

            return (
              <div
                key={t.id}
                className={`rounded-3xl border p-5 shadow-xs transition ${
                  t.status === "completed"
                    ? "border-neutral-200/60 bg-neutral-50/50 opacity-70 dark:border-neutral-800/60 dark:bg-neutral-900/30"
                    : isOverdue
                    ? "border-red-200 bg-white dark:border-red-950 dark:bg-neutral-900"
                    : "border-neutral-200/80 bg-white dark:border-neutral-800/80 dark:bg-neutral-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTask(t.id)}
                      className="mt-0.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {t.status === "completed" ? (
                        <CheckSquare className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>

                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          t.status === "completed" ? "line-through text-neutral-400" : "text-neutral-900 dark:text-white"
                        }`}
                      >
                        {t.title}
                      </h3>

                      {t.description && (
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                          {t.description}
                        </p>
                      )}

                      {/* Metadata row */}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getPriorityBadge(t.priority)}`}>
                          {t.priority}
                        </span>

                        {t.project && (
                          <span className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            <Folder className="h-3 w-3" /> {t.project}
                          </span>
                        )}

                        {t.dueDate && (
                          <span
                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                              isOverdue
                                ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300"
                                : isDueToday
                                ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                            }`}
                          >
                            <Clock className="h-3 w-3" /> Due {t.dueDate} {isOverdue && "(Overdue!)"}
                          </span>
                        )}

                        {t.recurring && t.recurring !== "none" && (
                          <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                            <Repeat className="h-3 w-3" /> {t.recurring}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {t.subtasks && t.subtasks.length > 0 && (
                      <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
                        className="flex items-center gap-1 rounded-xl bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                      >
                        <span>{completedSubtasks}/{t.subtasks.length} Subtasks</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    )}

                    <button
                      onClick={() => setTasks((prev) => prev.filter((item) => item.id !== t.id))}
                      className="p-1 text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Subtasks */}
                {isExpanded && t.subtasks && (
                  <div className="mt-4 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Subtasks Checklist</span>
                    <div className="mt-2 space-y-2">
                      {t.subtasks.map((st) => (
                        <div key={st.id} className="flex items-center gap-2.5 text-xs">
                          <button onClick={() => handleToggleSubtask(t.id, st.id)}>
                            {st.completed ? (
                              <CheckSquare className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Square className="h-4 w-4 text-neutral-400" />
                            )}
                          </button>
                          <span className={st.completed ? "line-through text-neutral-400" : "text-neutral-800 dark:text-neutral-200"}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Create New Task</h3>

            <form onSubmit={handleSaveModalTask} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Finish portfolio documentation"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Add context or notes..."
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Project</label>
                  <input
                    type="text"
                    value={taskForm.project}
                    onChange={(e) => setTaskForm({ ...taskForm, project: e.target.value })}
                    placeholder="e.g. Work, Finance"
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Recurrence</label>
                  <select
                    value={taskForm.recurring}
                    onChange={(e) => setTaskForm({ ...taskForm, recurring: e.target.value as RecurrenceType })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="none">No Recurrence</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Subtasks (1 per line)</label>
                <textarea
                  rows={2}
                  value={taskForm.subtasksInput}
                  onChange={(e) => setTaskForm({ ...taskForm, subtasksInput: e.target.value })}
                  placeholder="Subtask item 1&#10;Subtask item 2"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
