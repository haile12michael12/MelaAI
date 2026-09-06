"use client";

import React, { useState, useMemo } from "react";
import {
  toEthiopianDate,
  ETHIOPIAN_HOLIDAYS,
  getUpcomingEthiopianHolidays,
} from "@/lib/utils/ethiopian-calendar";
import { Calendar as CalendarIcon, Sparkles, ChevronLeft, ChevronRight, Clock, Star } from "lucide-react";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const ethCurrent = useMemo(() => toEthiopianDate(selectedDate), [selectedDate]);
  const upcomingHolidays = useMemo(() => getUpcomingEthiopianHolidays(90, selectedDate), [selectedDate]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Unified Calendar & Ethiopian Holidays
        </h1>
        <p className="text-xs text-neutral-500">
          Ge&apos;ez calendar awareness, national & cultural holidays, Equb cycles & scheduled deadlines
        </p>
      </div>

      {/* Date Highlight Banner */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-900 to-teal-900 p-6 text-white shadow-md dark:border-emerald-900">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Today in Ethiopian Calendar (የዛሬው ቀን)
            </span>
            <p className="mt-1 text-3xl font-extrabold">{ethCurrent.formattedAm}</p>
            <p className="mt-1 text-xs text-emerald-200">{ethCurrent.formattedEn} (E.C.)</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
            <span className="text-[10px] uppercase text-emerald-300">Gregorian Parallel</span>
            <p className="mt-1 text-sm font-bold">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Holidays & Events */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* National & Cultural Holidays */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Upcoming Ethiopian Holidays & Feasts
            </h2>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Next 90 Days</span>
          </div>

          <div className="space-y-3">
            {upcomingHolidays.map(({ date, holiday, ethiopianDate }) => (
              <div
                key={holiday.nameEn}
                className="flex items-start justify-between rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Star className="h-5 w-5 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white">{holiday.nameEn}</h3>
                    <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">{holiday.nameAm}</p>
                    <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">{holiday.descriptionEn}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <p className="mt-1 text-[10px] text-neutral-400">{ethiopianDate.formattedEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Commitments */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Scheduled Financial Agenda</h2>
          <div className="space-y-3">
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Recurring Financial Day</span>
              <p className="mt-1 text-xs font-bold text-neutral-900 dark:text-white">Equb Round Contribution</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">15th of every month • 5,000 Br</p>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Telecom Package</span>
              <p className="mt-1 text-xs font-bold text-neutral-900 dark:text-white">Ethio Telecom Monthly Internet</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">Renews on the 1st of month • 900 Br</p>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800/80 dark:bg-neutral-900">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Edir Mutual Aid</span>
              <p className="mt-1 text-xs font-bold text-neutral-900 dark:text-white">Community Edir Membership</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">Last Sunday of month • 200 Br</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}