import { NextRequest, NextResponse } from "next/server";
import {
  MelaProductivityEngine,
  DEFAULT_TASKS,
  DEFAULT_CALENDAR_EVENTS,
  CalendarEvent,
} from "@/lib/tasks/productivity";

let eventsStore: CalendarEvent[] = [...DEFAULT_CALENDAR_EVENTS];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const refDateStr = searchParams.get("date") || "2026-09-07";
    const refDate = new Date(refDateStr);

    const merged = MelaProductivityEngine.mergeTasksIntoCalendar(DEFAULT_TASKS, eventsStore, refDate);
    const weeklyPlan = MelaProductivityEngine.getWeeklyPlan(DEFAULT_TASKS, eventsStore, refDateStr);

    return NextResponse.json({
      events: merged,
      weeklyPlan,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, event, id } = body;

    if (action === "create_event") {
      const newEvent: CalendarEvent = {
        id: "ev_" + Date.now(),
        title: event.title,
        description: event.description || "",
        type: event.type || "event",
        date: event.date || new Date().toISOString().slice(0, 10),
        time: event.time || undefined,
        recurring: event.recurring || "none",
        isCompleted: false,
        priority: event.priority || "medium",
        category: event.category || "General",
        color: event.color || "#6366f1",
      };
      eventsStore.push(newEvent);
    } else if (action === "delete_event") {
      eventsStore = eventsStore.filter((e) => e.id !== id);
    }

    const merged = MelaProductivityEngine.mergeTasksIntoCalendar(DEFAULT_TASKS, eventsStore);
    return NextResponse.json({ success: true, events: merged });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
