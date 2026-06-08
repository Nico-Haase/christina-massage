// =====================================================================
// app/lib/booking-utils.ts  —  KOMPLETTE DATEI
// Alles markieren, löschen, das hier rein.
// =====================================================================
// Fix: Der 15-Min-Puffer gilt nur noch gegen andere BUCHUNGEN, nicht
// gegen BLOCKS. So gehen vor einem Block (z.B. Pilates 16-19 Uhr)
// keine Slots mehr unnötig verloren.
// =====================================================================

export type BookingStatus =
  | "requested"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "canceled"
  | "storniert"
  | "abgesagt"
  | string;

export type CalendarBooking = {
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  service_name?: string | null;
  full_name?: string | null;
  status?: BookingStatus | null;
};

export type CalendarBlock = {
  block_date: string;
  start_time: string;
  end_time: string;
  title?: string | null;
};

export type DailyEvent = {
  type: "booking" | "block" | "cancelled";
  start: string;
  end: string;
  title: string;
  subtitle?: string;
};

export type DayStatus = "free" | "busy" | "closed";

export type SlotAvailability = {
  time: string;
  unavailable: boolean;
};

// --- Zentrale Konfiguration ---
export const WORK_DAY_START = "09:00";
export const WORK_DAY_LAST_START = "19:00";
export const SLOT_STEP_MINUTES = 15;
export const BUFFER_MINUTES = 15; // nur zwischen Massagen, nicht vor Blocks

export function toMinutes(time: string): number {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

export function toTimeString(totalMinutes: number): string {
  const safeMinutes = Math.max(0, totalMinutes);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayString(): string {
  return formatDateKey(new Date());
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function getNextWorkingDay(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  while (isWeekend(next)) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export function getMonthStart(baseDate: Date): Date {
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
}

export function getMonthEnd(baseDate: Date): Date {
  return new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
}

export function getMonthMatrix(baseDate: Date): Date[][] {
  const monthStart = getMonthStart(baseDate);
  const monthEnd = getMonthEnd(baseDate);

  const start = new Date(monthStart);
  const startDay = start.getDay();
  const mondayOffset = (startDay + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);

  const end = new Date(monthEnd);
  const endDay = end.getDay();
  const sundayOffset = (7 - endDay) % 7;
  end.setDate(end.getDate() + sundayOffset);

  const weeks: Date[][] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
  return toTimeString(toMinutes(time) + minutesToAdd);
}

export function formatTimeRange(start: string, durationMinutes: number): string {
  const end = addMinutesToTime(start, durationMinutes);
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
}

export function getBookingEndTime(
  booking: Pick<CalendarBooking, "booking_time" | "duration_minutes">
): string {
  return addMinutesToTime(booking.booking_time, booking.duration_minutes);
}

export function isTimeRangeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB);
  return aStart < bEnd && bStart < aEnd;
}

export function isBookingOverlappingBlock(
  booking: Pick<CalendarBooking, "booking_time" | "duration_minutes">,
  block: Pick<CalendarBlock, "start_time" | "end_time">
): boolean {
  return isTimeRangeOverlapping(
    booking.booking_time,
    getBookingEndTime(booking),
    block.start_time,
    block.end_time
  );
}

export function isBookingOverlappingBooking(
  bookingA: Pick<CalendarBooking, "booking_time" | "duration_minutes">,
  bookingB: Pick<CalendarBooking, "booking_time" | "duration_minutes">
): boolean {
  return isTimeRangeOverlapping(
    bookingA.booking_time,
    getBookingEndTime(bookingA),
    bookingB.booking_time,
    getBookingEndTime(bookingB)
  );
}

function isCancelledStatus(status?: string | null): boolean {
  const normalized = String(status ?? "").toLowerCase().trim();
  return (
    normalized === "cancelled" ||
    normalized === "canceled" ||
    normalized === "storniert" ||
    normalized === "abgesagt"
  );
}

export function getDailyEvents(
  bookings: CalendarBooking[],
  blocks: CalendarBlock[]
): DailyEvent[] {
  const bookingEvents: DailyEvent[] = bookings.map((booking) => {
    const start = booking.booking_time.slice(0, 5);
    const end = getBookingEndTime(booking).slice(0, 5);
    const cancelled = isCancelledStatus(booking.status);
    return {
      type: cancelled ? "cancelled" : "booking",
      start,
      end,
      title: cancelled
        ? `Storniert${booking.service_name ? ` · ${booking.service_name}` : ""}`
        : booking.service_name ?? "Termin",
      subtitle: booking.full_name ?? undefined,
    };
  });

  const blockEvents: DailyEvent[] = blocks.map((block) => ({
    type: "block",
    start: block.start_time.slice(0, 5),
    end: block.end_time.slice(0, 5),
    title: block.title?.trim() || "Blockiert",
    subtitle: undefined,
  }));

  const order: Record<DailyEvent["type"], number> = {
    booking: 0,
    block: 1,
    cancelled: 2,
  };

  return [...bookingEvents, ...blockEvents].sort((a, b) => {
    if (a.start !== b.start) return a.start.localeCompare(b.start);
    if (a.type !== b.type) return order[a.type] - order[b.type];
    return a.end.localeCompare(b.end);
  });
}

export function getDayStatus(
  dateKey: string,
  bookings: CalendarBooking[],
  blocks: CalendarBlock[],
  durationMinutes = 60
): DayStatus {
  const date = parseDateKey(dateKey);

  if (isWeekend(date)) {
    return "closed";
  }

  const dayBlocks = blocks.filter((block) => block.block_date === dateKey);

  const fullyClosed = dayBlocks.some(
    (block) => block.start_time <= "00:00" && block.end_time >= "23:59"
  );

  if (fullyClosed) {
    return "closed";
  }

  const slots = getSlotAvailability(dateKey, durationMinutes, bookings, blocks, {
    dayStart: WORK_DAY_START,
    lastStart: WORK_DAY_LAST_START,
    stepMinutes: SLOT_STEP_MINUTES,
  });

  if (slots.length === 0) {
    return "closed";
  }

  const hasFreeSlot = slots.some((slot) => !slot.unavailable);
  return hasFreeSlot ? "free" : "busy";
}

export function getSlotAvailability(
  selectedDate: string,
  durationMinutes: number,
  bookings: CalendarBooking[],
  blocks: CalendarBlock[],
  options?: {
    dayStart?: string;
    lastStart?: string;
    stepMinutes?: number;
  }
): SlotAvailability[] {
  const date = parseDateKey(selectedDate);

  if (isWeekend(date)) {
    return [];
  }

  const dayStart = options?.dayStart ?? WORK_DAY_START;
  const lastStart = options?.lastStart ?? WORK_DAY_LAST_START;
  const stepMinutes = options?.stepMinutes ?? SLOT_STEP_MINUTES;

  const now = new Date();
  const todayKey = formatDateKey(now);

  const relevantBookings = bookings.filter(
    (booking) =>
      booking.booking_date === selectedDate &&
      !isCancelledStatus(booking.status)
  );

  const relevantBlocks = blocks.filter(
    (block) => block.block_date === selectedDate
  );

  const fullDayClosed = relevantBlocks.some(
    (block) => block.start_time <= "00:00" && block.end_time >= "23:59"
  );

  if (fullDayClosed) {
    return [];
  }

  const slots: SlotAvailability[] = [];
  const startMinutes = toMinutes(dayStart);
  const lastStartMinutes = toMinutes(lastStart);

  for (
    let current = startMinutes;
    current <= lastStartMinutes;
    current += stepMinutes
  ) {
    const slotStart = toTimeString(current);
    // Zwei separate Endzeitpunkte: einmal mit Puffer (für Vergleich
    // mit anderen Buchungen) und einmal ohne (für Blocks).
    const slotEndWithBuffer = toTimeString(
      current + durationMinutes + BUFFER_MINUTES
    );
    const slotEndPure = toTimeString(current + durationMinutes);

    let unavailable = false;

    if (selectedDate === todayKey) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (current <= currentMinutes) {
        unavailable = true;
      }
    }

    // Bestehende Buchungen werden um den Puffer verlängert, damit
    // zwischen zwei Massagen 15 Min frei bleiben.
    const overlapsBooking = relevantBookings.some((booking) => {
      const bookingStart = booking.booking_time.slice(0, 5);
      const bookingEnd = toTimeString(
        toMinutes(booking.booking_time) +
          Number(booking.duration_minutes) +
          BUFFER_MINUTES
      );
      return isTimeRangeOverlapping(
        slotStart,
        slotEndWithBuffer,
        bookingStart,
        bookingEnd
      );
    });

    if (overlapsBooking) {
      unavailable = true;
    }

    // Bei Blocks KEIN Puffer - Christina plant ihre Pausen selbst
    const overlapsBlock = relevantBlocks.some((block) =>
      isTimeRangeOverlapping(
        slotStart,
        slotEndPure,
        block.start_time,
        block.end_time
      )
    );

    if (overlapsBlock) {
      unavailable = true;
    }

    slots.push({
      time: slotStart,
      unavailable,
    });
  }

  return slots;
}