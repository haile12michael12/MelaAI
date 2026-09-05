"use client";

import React from "react";
import type { TaskItem } from "@/types/tasks";
import { EmptyState } from "./empty-state";
import { CheckSquare, CheckCircle2, Circle, Plus, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface TasksWidgetProps {
  tasks: TaskItem[];
  onToggleTask?: (id: string) => void;
  onAddTask?: () => void;
}

export function TasksWidget({ tasks, onToggleTask, onAddTask }: TasksWidgetProps) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-neutral-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Upcoming Tasks</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">To-dos & Reminders</p>
        </div>
        <div className="flex items-center gap-2">
          {onAddTask && (
            <button
              onClick={onAddTask}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              title="Add Task"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <Link
            href="/tasks"
            className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Tasks <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="my-auto">
          <EmptyState
            icon={<CheckSquare className="h-5 w-5" />}
            title="All tasks completed"
            description="You're all caught up! Add a new task to stay organized."
            actionLabel="Add Task"
            onAction={onAddTask}
          />
        </div>
      ) : (
        <div className="mt-4 space-y-2 overflow-y-auto max-h-56 pr-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask?.(task.id)}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-100 p-2.5 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60"
            >
              <div className="flex items-center gap-2.5">
                {task.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
                )}
                <span
                  className={`text-xs font-medium ${
                    task.completed ? "text-neutral-400 line-through dark:text-neutral-500" : "text-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  {task.title}
                </span>
              </div>
              {task.dueDate && <span className="text-[10px] text-neutral-400">{task.dueDate}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
