"use client";

import {
  formatDateKey,
  getMonthMatrix,
  getMonthStart,
} from "@/app/lib/booking-utils";

type DayMeta = {
  status: "free" | "busy" | "closed";
  label: string;
  bookingCount: number;
  blockCount: number;
  freeSlots: number;
};

type MonthlyCalendarProps = {
  visibleMonth: Date;
  selectedDate: string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: string) => void;
  getDayMeta: (date: string) => DayMeta;
};

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function MonthlyCalendar({
  visibleMonth,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  getDayMeta,
}: MonthlyCalendarProps) {
  const monthStart = getMonthStart(visibleMonth);
  const monthLabel = monthStart.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });
  const weeks = getMonthMatrix(visibleMonth);

  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          ←
        </button>

        <h3 className="text-lg font-semibold capitalize text-stone-900 md:text-2xl">
          {monthLabel}
        </h3>

        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          →
        </button>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-stone-500">
        {weekdayLabels.map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-2 space-y-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((date) => {
              const dateKey = formatDateKey(date);
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isSelected = selectedDate === dateKey;
              const meta = getDayMeta(dateKey);

              const statusClasses =
                meta.status === "free"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : meta.status === "busy"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-red-300 bg-red-100 text-red-900";

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => onSelectDate(dateKey)}
                  className={`min-h-[118px] rounded-2xl border p-2 text-left transition md:min-h-[138px] md:p-3 ${
                    isCurrentMonth
                      ? statusClasses
                      : "border-stone-200 bg-stone-50 text-stone-400"
                  } ${isSelected ? "ring-2 ring-stone-800" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold md:text-base">
                      {date.getDate()}
                    </span>

                    {isCurrentMonth &&
                      (meta.bookingCount > 0 || meta.blockCount > 0) && (
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold">
                          {meta.bookingCount + meta.blockCount}
                        </span>
                      )}
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] leading-4 md:text-xs">
                    <div className="font-semibold">{meta.label}</div>

                    {meta.bookingCount > 0 && (
                      <div>Termine: {meta.bookingCount}</div>
                    )}

                    {meta.blockCount > 0 && <div>Blöcke: {meta.blockCount}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-xs">
        <div className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-800">
          Grün = freie Termine
        </div>
        <div className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-800">
          Rot = ausgebucht / geschlossen
        </div>
      </div>
    </div>
  );
}