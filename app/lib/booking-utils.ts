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

export function getTodayString(): string {
  return formatDateKey(new Date());
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
    const end = addMinutesToTime(
      booking.booking_time,
      booking.duration_minutes
    ).slice(0, 5);

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

  return [...bookingEvents, ...blockEvents].sort((a, b) => {
    if (a.start !== b.start) return a.start.localeCompare(b.start);
    if (a.type === b.type) return a.end.localeCompare(b.end);

    const order: Record<DailyEvent["type"], number> = {
      booking: 0,
      block: 1,
      cancelled: 2,
    };

    return order[a.type] - order[b.type];
  });
}

export function getDayStatus(
  dateKey: string,
  bookings: CalendarBooking[],
  blocks: CalendarBlock[]
): DayStatus {
  const activeBookings = bookings.filter(
    (booking) => booking.booking_date === dateKey && !isCancelledStatus(booking.status)
  );

  const dayBlocks = blocks.filter((block) => block.block_date === dateKey);

  const fullyClosed = dayBlocks.some(
    (block) => block.start_time <= "00:00" && block.end_time >= "23:59"
  );

  if (fullyClosed) return "closed";
  if (activeBookings.length > 0 || dayBlocks.length > 0) return "busy";
  return "free";
}

export function getSlotAvailability(
  selectedDate: string,
  durationMinutes: number,
  bookings: CalendarBooking[],
  blocks: CalendarBlock[],
  options?: {
    dayStart?: string;
    dayEnd?: string;
    stepMinutes?: number;
  }
): string[] {
  const dayStart = options?.dayStart ?? "09:00";
  const dayEnd = options?.dayEnd ?? "18:00";
  const stepMinutes = options?.stepMinutes ?? 15;

  const now = new Date();
  const todayKey = formatDateKey(now);

  const relevantBookings = bookings.filter(
    (booking) =>
      booking.booking_date === selectedDate && !isCancelledStatus(booking.status)
  );

  const relevantBlocks = blocks.filter(
    (block) => block.block_date === selectedDate
  );

  const slots: string[] = [];
  const startMinutes = toMinutes(dayStart);
  const endMinutes = toMinutes(dayEnd);

  for (
    let current = startMinutes;
    current + durationMinutes <= endMinutes;
    current += stepMinutes
  ) {
    const slotStart = toTimeString(current);
    const slotEnd = toTimeString(current + durationMinutes);

    if (selectedDate === todayKey) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (current <= currentMinutes) continue;
    }

    const overlapsBooking = relevantBookings.some((booking) =>
      isTimeRangeOverlapping(
        slotStart,
        slotEnd,
        booking.booking_time,
        getBookingEndTime(booking)
      )
    );

    if (overlapsBooking) continue;

    const overlapsBlock = relevantBlocks.some((block) =>
      isTimeRangeOverlapping(slotStart, slotEnd, block.start_time, block.end_time)
    );

    if (overlapsBlock) continue;

    slots.push(slotStart);
  }

  return slots;
}