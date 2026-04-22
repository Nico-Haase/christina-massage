export type BookingStatus =
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
};

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTimeString(totalMinutes: number): string {
  const safeMinutes = Math.max(0, totalMinutes);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
  return toTimeString(toMinutes(time) + minutesToAdd);
}

export function formatTimeRange(start: string, durationMinutes: number): string {
  const end = addMinutesToTime(start, durationMinutes);
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
}

export function getDailyEvents(
  bookings: CalendarBooking[],
  blocks: CalendarBlock[]
): DailyEvent[] {
  const bookingEvents: DailyEvent[] = bookings.map((booking) => {
    const start = booking.booking_time.slice(0, 5);
    const end = addMinutesToTime(booking.booking_time, booking.duration_minutes).slice(0, 5);

    const normalizedStatus = String(booking.status ?? "").toLowerCase().trim();

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
        ? `Storniert${booking.service_name ? ` · ${booking.service_name}` : ""}${
            booking.full_name ? ` · ${booking.full_name}` : ""
          }`
        : `${booking.service_name ?? "Termin"}${
            booking.full_name ? ` · ${booking.full_name}` : ""
          }`,
    };
  });

  const blockEvents: DailyEvent[] = blocks.map((block) => ({
    type: "block",
    start: block.start_time.slice(0, 5),
    end: block.end_time.slice(0, 5),
    title: block.title?.trim() || "Blockiert",
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

export function getBookingEndTime(booking: Pick<CalendarBooking, "booking_time" | "duration_minutes">): string {
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