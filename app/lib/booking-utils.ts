export const WORKING_SLOTS = [
  "09:00",
  "10:15",
  "11:30",
  "12:45",
  "14:00",
  "15:15",
  "16:30",
  "17:45",
  "19:00",
] as const;

export const LAST_END_TIME_MINUTES = 20 * 60 + 15;

export type CalendarBooking = {
  id: string;
  booking_date: string;
  booking_time: string;
  duration: number;
  service?: string;
  name?: string;
  status?: string | null;
};

export type CalendarBlock = {
  id: string;
  block_date: string;
  start_time: string;
  end_time: string;
  title?: string;
};

export type DailyEvent = {
  type: "booking" | "block" | "cancelled";
  start: string;
  end: string;
  title: string;
};

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${`${hours}`.padStart(2, "0")}:${`${minutes}`.padStart(2, "0")}`;
}

export function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
) {
  return startA < endB && endA > startB;
}

export function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateString: string) {
  return new Date(`${dateString}T12:00:00`);
}

export function getTodayString() {
  return formatDateKey(new Date());
}

export function isWeekend(dateString: string) {
  const date = parseDateKey(dateString);
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isPastDate(dateString: string) {
  const today = getTodayString();
  return dateString < today;
}

export function getNextWorkingDay(startDate: Date) {
  const next = new Date(startDate);

  while (true) {
    const day = next.getDay();
    if (day !== 0 && day !== 6) return next;
    next.setDate(next.getDate() + 1);
  }
}

export function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getMonthMatrix(baseDate: Date) {
  const firstDayOfMonth = getMonthStart(baseDate);
  const lastDayOfMonth = getMonthEnd(baseDate);

  const start = new Date(firstDayOfMonth);
  const weekday = start.getDay();
  const diffToMonday = weekday === 0 ? 6 : weekday - 1;
  start.setDate(start.getDate() - diffToMonday);

  const end = new Date(lastDayOfMonth);
  const endWeekday = end.getDay();
  const diffToSunday = endWeekday === 0 ? 0 : 7 - endWeekday;
  end.setDate(end.getDate() + diffToSunday);

  const weeks: Date[][] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i += 1) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

export function getSlotAvailability(
  dateString: string,
  duration: number,
  bookings: CalendarBooking[],
  blocks: CalendarBlock[]
) {
  return WORKING_SLOTS.map((slot) => {
    const slotStart = timeToMinutes(slot);
    const slotEnd = slotStart + duration;

    if (isPastDate(dateString)) {
      return {
        time: slot,
        unavailable: true,
        reason: "past" as const,
      };
    }

    if (isWeekend(dateString)) {
      return {
        time: slot,
        unavailable: true,
        reason: "weekend" as const,
      };
    }

    if (slotEnd > LAST_END_TIME_MINUTES) {
      return {
        time: slot,
        unavailable: true,
        reason: "after_hours" as const,
      };
    }

    const overlapsBooking = bookings.some((booking) => {
      const bookingStart = timeToMinutes(booking.booking_time);
      const bookingEnd = bookingStart + booking.duration_minutes;
      return rangesOverlap(slotStart, slotEnd, bookingStart, bookingEnd);
    });

    if (overlapsBooking) {
      return {
        time: slot,
        unavailable: true,
        reason: "booking" as const,
      };
    }

    const overlapsBlock = blocks.some((block) => {
      const blockStart = timeToMinutes(block.start_time);
      const blockEnd = timeToMinutes(block.end_time);
      return rangesOverlap(slotStart, slotEnd, blockStart, blockEnd);
    });

    if (overlapsBlock) {
      return {
        time: slot,
        unavailable: true,
        reason: "block" as const,
      };
    }

    return {
      time: slot,
      unavailable: false,
      reason: "free" as const,
    };
  });
}

export function getDailyEvents(
  bookings: CalendarBooking[],
  blocks: CalendarBlock[]
): DailyEvent[] {
  const bookingEvents: DailyEvent[] = bookings.map((booking) => {
    const start = booking.booking_time.slice(0, 5);

    const [hours, minutes] = booking.booking_time.split(":").map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + booking.duration, 0, 0);

    const end = `${String(endDate.getHours()).padStart(2, "0")}:${String(
      endDate.getMinutes()
    ).padStart(2, "0")}`;

    const normalizedStatus = (booking.status ?? "").toLowerCase();

    const isCancelled =
      normalizedStatus === "cancelled" ||
      normalizedStatus === "canceled" ||
      normalizedStatus === "storniert" ||
      normalizedStatus === "abgesagt";

    return {
      type: isCancelled ? "cancelled" : "booking",
      start,
      end,
      title: isCancelled
        ? `Storniert${booking.service ? ` · ${booking.service}` : ""}`
        : `${booking.service ?? "Termin"}${booking.name ? ` · ${booking.name}` : ""}`,
    };
  });

  const blockEvents: DailyEvent[] = blocks.map((block) => ({
    type: "block",
    start: block.start_time.slice(0, 5),
    end: block.end_time.slice(0, 5),
    title: block.title || "Blockiert",
  }));

  return [...bookingEvents, ...blockEvents].sort((a, b) =>
    a.start.localeCompare(b.start)
  );
}

export function isFullDayBlocked(blocks: CalendarBlock[]) {
  return blocks.some((block) => {
    const blockStart = timeToMinutes(block.start_time);
    const blockEnd = timeToMinutes(block.end_time);
    const isClosedType =
      block.block_type === "closed" ||
      block.block_type === "vacation" ||
      block.block_type === "full-day";

    return isClosedType && blockStart <= 0 && blockEnd >= 23 * 60 + 59;
  });
}

export function getDayStatus(
  dateString: string,
  bookings: CalendarBooking[],
  blocks: CalendarBlock[],
  previewDuration = 45
) {
  if (isPastDate(dateString)) {
    return {
      status: "closed" as const,
      freeSlots: 0,
      bookingCount: bookings.length,
      blockCount: blocks.length,
      label: "Vergangen",
    };
  }

  if (isWeekend(dateString)) {
    return {
      status: "closed" as const,
      freeSlots: 0,
      bookingCount: bookings.length,
      blockCount: blocks.length,
      label: "Geschlossen",
    };
  }

  if (isFullDayBlocked(blocks)) {
    return {
      status: "closed" as const,
      freeSlots: 0,
      bookingCount: bookings.length,
      blockCount: blocks.length,
      label: "Gesperrt",
    };
  }

  const slots = getSlotAvailability(dateString, previewDuration, bookings, blocks);
  const freeSlots = slots.filter((slot) => !slot.unavailable).length;

  if (freeSlots <= 0) {
    return {
      status: "busy" as const,
      freeSlots: 0,
      bookingCount: bookings.length,
      blockCount: blocks.length,
      label: "Ausgebucht",
    };
  }

  return {
    status: "free" as const,
    freeSlots,
    bookingCount: bookings.length,
    blockCount: blocks.length,
    label: `${freeSlots} frei`,
  };
}