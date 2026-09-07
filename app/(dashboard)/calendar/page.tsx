"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  toEthiopianDate,
  ETHIOPIAN_HOLIDAYS,
  getUpcomingEthiopianHolidays,
} from "@/lib/utils/ethiopian-calendar";
import {
  CalendarEvent,
  CalendarItemType,
  TaskPriority,
} from "@/lib/tasks/types";
import {
  DEFAULT_TASKS,
  DEFAULT_CALENDAR_EVENTS,
  MelaProductivityEngine,
} from "@/lib/tasks/productivity";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  Star,
  ListOrdered,
  CalendarDays,
} from "lucide-react";

export default function CalendarDashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date("2026-09-07"));
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "agenda">("month");
  const [events, setEvents] = useState<CalendarEvent[]>(DEFAULT_CALENDAR_EVENTS);

  // Add event modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    type: "event" as CalendarItemType,
    date: "2026-09-07",
    time: "14:00",
    priority: "medium" as TaskPriority,
    category: "General",
  });

  const refDateStr = currentDate.toISOString().slice(0, 10);
  const ethCurrent = useMemo(() => toEthiopianDate(currentDate), [currentDate]);

  // Merge events with task deadlines and Ethiopian holidays
  const allMergedEvents = useMemo(() => {
    return MelaProductivityEngine.mergeTasksIntoCalendar(DEFAULT_TASKS, events, currentDate);
  }, [events, currentDate]);

  const weeklyPlan = useMemo(() => {
    return MelaProductivityEngine.getWeeklyPlan(DEFAULT_TASKS, events, refDateStr);
  }, [events, refDateStr]);

  // Create event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    const newEv: CalendarEvent = {
      id: "ev_" + Date.now(),
      title: eventForm.title.trim(),
      description: eventForm.description.trim() || undefined,
      type: eventForm.type,
      date: eventForm.date,
      time: eventForm.time || undefined,
      priority: eventForm.priority,
      category: eventForm.category,
      color: eventForm.type === "reminder" ? "#f59e0b" : "#6366f1",
      isCompleted: false,
    };

    setEvents((prev) => [...prev, newEv]);
    setIsAddModalOpen(false);
  };

  // Month grid helpers
  const monthMatrix = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const matrix: { date: Date; dateStr: string; isCurrentMonth: boolean; events: CalendarEvent[] }[] = [];

    // Pad leading days
    const startDayIndex = firstDay.getDay(); // 0 = Sun
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const dateStr = d.toISOString().slice(0, 10);
      matrix.push({
        date: d,
        dateStr,
        isCurrentMonth: false,
        events: allMergedEvents.filter((e) => e.date === dateStr),
      });
    }

    // Days in current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().slice(0, 10);
      matrix.push({
        date: d,
        dateStr,
        isCurrentMonth: true,
        events: allMergedEvents.filter((e) => e.date === dateStr),
      });
    }

    // Pad trailing days to 35 or 42 cells
    const remaining = 35 - matrix.length;
    if (remaining > 0) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        const dateStr = d.toISOString().slice(0, 10);
        matrix.push({
          date: d,
          dateStr,
          isCurrentMonth: false,
          events: allMergedEvents.filter((e) => e.date === dateStr),
        });
      }
    }

    return matrix;
  }, [currentDate, allMergedEvents]);

  // Day View items
  const dayEvents = useMemo(() => {
    return allMergedEvents.filter((e) => e.date === refDateStr);
  }, [allMergedEvents, refDateStr]);

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") next.setMonth(next.getMonth() - 1);
    else if (viewMode === "week") next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "month") next.setMonth(next.getMonth() + 1);
    else if (viewMode === "week") next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Unified Calendar & Schedule
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Ethiopian & Gregorian parallel schedule, reminders, and synced task deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="flex items-center rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
            {[
              { id: "month", label: "Month" },
              { id: "week", label: "Week" },
              { id: "day", label: "Day" },
              { id: "agenda", label: "Agenda" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as any)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  viewMode === v.id
                    ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Parallel Calendar Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-300/40 bg-gradient-to-r from-emerald-950 via-teal-950 to-neutral-950 p-6 text-white shadow-xl dark:border-emerald-800/40">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Star className="h-3.5 w-3.5 fill-emerald-400" />
              Ethiopian Calendar Date (የኢትዮጵያ ቀን)
            </span>
            <p className="mt-1 text-3xl font-extrabold">{ethCurrent.formattedAm}</p>
            <p className="mt-0.5 text-xs text-emerald-300">{ethCurrent.formattedEn} (E.C.)</p>
          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase text-emerald-300">Gregorian Timeline</span>
            <p className="mt-0.5 text-sm font-bold">
              {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Navigation Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="rounded-xl border border-neutral-200 p-1.5 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="rounded-xl border border-neutral-200 p-1.5 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setCurrentDate(new Date("2026-09-07"))}
          className="rounded-xl bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
        >
          Today
        </button>
      </div>

      {/* VIEW 1: MONTH VIEW */}
      {viewMode === "month" && (
        <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-neutral-200 text-center text-xs font-bold text-neutral-500 dark:border-neutral-800">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-3">
                {day}
              </div>
            ))}
          </div>

          {/* Month Cells Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-neutral-100 dark:divide-neutral-800">
            {monthMatrix.map((cell, idx) => {
              const isToday = cell.dateStr === "2026-09-07";
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentDate(cell.date);
                    setViewMode("day");
                  }}
                  className={`min-h-[110px] p-2 transition cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                    !cell.isCurrentMonth ? "bg-neutral-50/50 text-neutral-400 dark:bg-neutral-950/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isToday ? "bg-indigo-600 text-white" : "text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    {cell.events.length > 0 && (
                      <span className="text-[10px] font-semibold text-neutral-400">{cell.events.length}</span>
                    )}
                  </div>

                  <div className="mt-1.5 space-y-1">
                    {cell.events.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        title={ev.title}
                        className="truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-2xs"
                        style={{ backgroundColor: ev.color || "#6366f1" }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {cell.events.length > 3 && (
                      <span className="text-[9px] font-bold text-neutral-400">+{cell.events.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK VIEW */}
      {viewMode === "week" && (
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
            {weeklyPlan.map((day) => (
              <div key={day.date} className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-3 dark:border-neutral-800 dark:bg-neutral-800/40">
                <div className="border-b border-neutral-200 pb-2 text-center dark:border-neutral-700">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">{day.dayName}</span>
                </div>

                <div className="mt-3 space-y-2">
                  {day.tasks.map((t) => (
                    <div key={t.id} className="rounded-xl border border-indigo-200 bg-white p-2 text-xs shadow-2xs dark:border-indigo-950 dark:bg-neutral-900">
                      <span className="text-[9px] font-bold uppercase text-indigo-600 dark:text-indigo-400">Task Deadline</span>
                      <p className="mt-0.5 font-bold text-neutral-900 dark:text-white leading-tight">{t.title}</p>
                    </div>
                  ))}

                  {day.events.map((ev) => (
                    <div key={ev.id} className="rounded-xl border border-emerald-200 bg-white p-2 text-xs shadow-2xs dark:border-emerald-950 dark:bg-neutral-900">
                      <span className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">{ev.type}</span>
                      <p className="mt-0.5 font-bold text-neutral-900 dark:text-white leading-tight">{ev.title}</p>
                      {ev.time && <span className="text-[10px] text-neutral-400">{ev.time}</span>}
                    </div>
                  ))}

                  {day.totalItems === 0 && (
                    <p className="py-4 text-center text-[11px] text-neutral-400">No commitments</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: DAY VIEW */}
      {viewMode === "day" && (
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Schedule for {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h3>
              <p className="text-xs text-neutral-500">{dayEvents.length} items scheduled</p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-neutral-100 dark:divide-neutral-800">
            {dayEvents.length === 0 ? (
              <p className="py-8 text-center text-xs text-neutral-400">No events or deadlines for this day.</p>
            ) : (
              dayEvents.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-xs"
                      style={{ backgroundColor: ev.color || "#6366f1" }}
                    >
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{ev.title}</h4>
                      <p className="text-xs text-neutral-400">{ev.type.toUpperCase()} {ev.time ? `• ${ev.time}` : ""} {ev.category ? `• ${ev.category}` : ""}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {ev.date}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: AGENDA VIEW */}
      {viewMode === "agenda" && (
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Chronological Agenda</h3>
              <p className="text-xs text-neutral-500">Upcoming events, reminders, task deadlines & holidays</p>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {allMergedEvents.slice(0, 20).map((ev) => (
              <div key={ev.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: ev.color || "#6366f1" }}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{ev.title}</h4>
                    <p className="text-xs text-neutral-400">{ev.type.toUpperCase()} {ev.category ? `• ${ev.category}` : ""}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">{ev.date}</span>
                  {ev.time && <p className="text-[11px] text-neutral-400">{ev.time}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Create Calendar Event / Reminder</h3>

            <form onSubmit={handleSaveEvent} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Title</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Sprint Planning / Telebirr Bill"
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Type</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as CalendarItemType })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="event">Event</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
                  <input
                    type="text"
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    placeholder="e.g. Work, Finance"
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Date</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Time (Optional)</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
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
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
