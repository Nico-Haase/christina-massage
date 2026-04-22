"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import MonthlyCalendar from "../components/booking/MonthlyCalendar";
import {
  CalendarBlock,
  CalendarBooking,
  getDailyEvents,
  getDayStatus,
  getMonthEnd,
  getMonthStart,
  getTodayString,
} from "@/app/lib/booking-utils";

type BookingStatus = "requested" | "confirmed" | "cancelled";

type Booking = {
  id: string;
  full_name: string;
  email: string;
  service_name: string;
  duration_minutes: number;
  price_eur: number;
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  created_at?: string;
};

type BlockedTime = {
  id: string;
  block_date: string;
  start_time: string;
  end_time: string;
  title: string;
  block_type: string;
  note: string | null;
  created_at?: string;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionEmail, setSessionEmail] = useState("");

  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const [monthBookings, setMonthBookings] = useState<CalendarBooking[]>([]);
  const [monthBlocks, setMonthBlocks] = useState<CalendarBlock[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );

  const [blockDate, setBlockDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState("13:00");
  const [endTime, setEndTime] = useState("14:15");
  const [title, setTitle] = useState("Mittagspause");
  const [blockType, setBlockType] = useState("pause");
  const [note, setNote] = useState("");

  const setStatusMessage = (
    text: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  const messageStyles =
    messageType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : messageType === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-stone-200 bg-stone-50 text-stone-700";

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) =>
      a.booking_time.localeCompare(b.booking_time)
    );
  }, [bookings]);

  const sortedBlockedTimes = useMemo(() => {
    return [...blockedTimes].sort((a, b) =>
      a.start_time.localeCompare(b.start_time)
    );
  }, [blockedTimes]);

  const dailyEvents = useMemo(() => {
    return getDailyEvents(
      bookings.map((item) => ({
        booking_date: item.booking_date,
        booking_time: item.booking_time,
        duration_minutes: item.duration_minutes,
        service_name: item.service_name,
        full_name: item.full_name,
        status: item.status,
      })),
      blockedTimes.map((item) => ({
        block_date: item.block_date,
        start_time: item.start_time,
        end_time: item.end_time,
        title: item.title,
        block_type: item.block_type,
        note: item.note,
      }))
    );
  }, [bookings, blockedTimes]);

  const loadMonthData = async (month: Date) => {
    const monthStart = getMonthStart(month);
    const monthEnd = getMonthEnd(month);

    const startKey = `${monthStart.getFullYear()}-${`${monthStart.getMonth() + 1}`.padStart(2, "0")}-${`${monthStart.getDate()}`.padStart(2, "0")}`;
    const endKey = `${monthEnd.getFullYear()}-${`${monthEnd.getMonth() + 1}`.padStart(2, "0")}-${`${monthEnd.getDate()}`.padStart(2, "0")}`;

    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        "id, booking_date, booking_time, duration_minutes, service_name, full_name, email, price_eur, status"
      )
      .gte("booking_date", startKey)
      .lte("booking_date", endKey)
      .in("status", ["requested", "confirmed"]);

    if (bookingsError) {
      setStatusMessage(bookingsError.message, "error");
      return;
    }

    const { data: blocksData, error: blocksError } = await supabase
      .from("blocked_times")
      .select("id, block_date, start_time, end_time, title, block_type, note")
      .gte("block_date", startKey)
      .lte("block_date", endKey);

    if (blocksError) {
      setStatusMessage(blocksError.message, "error");
      return;
    }

    setMonthBookings((bookingsData ?? []) as CalendarBooking[]);
    setMonthBlocks((blocksData ?? []) as CalendarBlock[]);
  };

  const loadDayData = async (date: string) => {
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        "id, full_name, email, service_name, duration_minutes, price_eur, booking_date, booking_time, status, created_at"
      )
      .eq("booking_date", date)
      .order("booking_time", { ascending: true });

    if (bookingsError) {
      setStatusMessage(bookingsError.message, "error");
      return;
    }

    const { data: blocksData, error: blocksError } = await supabase
      .from("blocked_times")
      .select(
        "id, block_date, start_time, end_time, title, block_type, note, created_at"
      )
      .eq("block_date", date)
      .order("start_time", { ascending: true });

    if (blocksError) {
      setStatusMessage(blocksError.message, "error");
      return;
    }

    setBookings((bookingsData ?? []) as Booking[]);
    setBlockedTimes((blocksData ?? []) as BlockedTime[]);
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.href = "/booking?auth=1";
        return;
      }

      setSessionEmail(session.user.email ?? "");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error || !profile?.is_admin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await loadMonthData(visibleMonth);
      await loadDayData(selectedDate);
      setLoading(false);
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadMonthData(visibleMonth);
  }, [visibleMonth, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !selectedDate) return;
    loadDayData(selectedDate);
    setBlockDate(selectedDate);
  }, [selectedDate, isAdmin]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/booking?auth=1";
  };

  const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
) => {
  setSaving(true);
  setStatusMessage("", "info");

  try {
    const response = await fetch("/api/update-booking-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId, status }),
    });

    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setStatusMessage(
        result?.message || "Status konnte nicht aktualisiert werden.",
        "error"
      );
      return;
    }

    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );

    if (status === "confirmed") {
      setStatusMessage(
        "Buchung bestätigt und Bestätigungs-E-Mail gesendet.",
        "success"
      );
    } else if (status === "cancelled") {
      setStatusMessage(
        "Buchung storniert und Stornierungs-E-Mail gesendet.",
        "success"
      );
    } else {
      setStatusMessage("Buchungsstatus erfolgreich aktualisiert.", "success");
    }

    await loadDayData(selectedDate);
    await loadMonthData(visibleMonth);
  } catch (error) {
    setSaving(false);
    setStatusMessage("Es ist ein unerwarteter Fehler aufgetreten.", "error");
  }
};

  const createBlockedTime = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("", "info");

    if (!blockDate || !startTime || !endTime || !title.trim()) {
      setStatusMessage("Bitte alle Pflichtfelder ausfüllen.", "error");
      return;
    }

    if (startTime >= endTime) {
      setStatusMessage("Die Endzeit muss nach der Startzeit liegen.", "error");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("blocked_times").insert([
      {
        block_date: blockDate,
        start_time: startTime,
        end_time: endTime,
        title: title.trim(),
        block_type: blockType,
        note: note.trim() || null,
        created_by: user?.id ?? null,
      },
    ]);

    setSaving(false);

    if (error) {
      setStatusMessage(error.message, "error");
      return;
    }

    setStatusMessage("Sperrzeit erfolgreich angelegt.", "success");
    await loadMonthData(visibleMonth);
    await loadDayData(selectedDate);

    setTitle("Mittagspause");
    setBlockType("pause");
    setNote("");
  };

  const deleteBlockedTime = async (blockId: string) => {
    setSaving(true);

    const { error } = await supabase
      .from("blocked_times")
      .delete()
      .eq("id", blockId);

    setSaving(false);

    if (error) {
      setStatusMessage(error.message, "error");
      return;
    }

    await loadMonthData(visibleMonth);
    await loadDayData(selectedDate);
    setStatusMessage("Sperrzeit gelöscht.", "success");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6efe5] px-6 py-16 text-stone-800">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          Admin-Bereich wird geladen...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f6efe5] px-6 py-16 text-stone-800">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <h1 className="text-2xl font-semibold text-stone-900">
            Kein Zugriff
          </h1>
          <p className="mt-3 text-stone-600">
            Du bist nicht als Admin freigeschaltet.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-2xl bg-[#405e3f] px-5 py-3 text-sm font-semibold text-white"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6efe5] text-stone-800">
      <header className="sticky top-0 z-50 border-b border-[#6f7d58] bg-[#7a8662]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Link
            href="/"
            className="text-sm font-medium text-white hover:text-[#f5efe3]"
          >
            ← Zurück zur Startseite
          </Link>

          <div className="flex flex-col items-center">
            <img
              src="/logo-christina-massage.png"
              alt="Christina Massage Logo"
              className="h-14 w-auto object-contain sm:h-16 md:h-20"
            />
          </div>

          <button
            onClick={handleLogout}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-stone-800"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="px-4 py-6 sm:px-6 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-900">
              Termine & Pausen verwalten
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Eingeloggt als: <strong>{sessionEmail}</strong>
            </p>

            {message && (
              <div
                className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${messageStyles}`}
              >
                {message}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-2xl font-semibold text-stone-900">
                Monatsübersicht
              </h2>

              <div className="mt-5">
                <MonthlyCalendar
                  visibleMonth={visibleMonth}
                  selectedDate={selectedDate}
                  onPrevMonth={() =>
                    setVisibleMonth(
                      new Date(
                        visibleMonth.getFullYear(),
                        visibleMonth.getMonth() - 1,
                        1
                      )
                    )
                  }
                  onNextMonth={() =>
                    setVisibleMonth(
                      new Date(
                        visibleMonth.getFullYear(),
                        visibleMonth.getMonth() + 1,
                        1
                      )
                    )
                  }
                  onSelectDate={(date) => setSelectedDate(date)}
                 getDayMeta={(date) => {
  const dayBookings = monthBookings.filter(
    (booking) => booking.booking_date === date
  );

  const dayBlocks = monthBlocks.filter(
    (block) => block.block_date === date
  );

  const status = getDayStatus(date, dayBookings, dayBlocks);

  return {
    status,
    freeSlots:
      status === "free"
        ? 9
        : status === "busy"
        ? Math.max(0, 9 - dayBookings.filter((booking) => {
            const normalizedStatus = String(booking.status ?? "")
              .toLowerCase()
              .trim();

            return !(
              normalizedStatus === "cancelled" ||
              normalizedStatus === "canceled" ||
              normalizedStatus === "storniert" ||
              normalizedStatus === "abgesagt"
            );
          }).length)
        : 0,
  };
}}
                />
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h2 className="text-2xl font-semibold text-stone-900">
                  Pause / Sperrzeit anlegen
                </h2>

                <form onSubmit={createBlockedTime} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      Datum
                    </label>
                    <input
                      type="date"
                      value={blockDate}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-[#567a57]"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-700">
                        Startzeit
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-[#567a57]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-700">
                        Endzeit
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-[#567a57]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      Titel
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-[#567a57]"
                      placeholder="z. B. Mittagspause"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      Typ
                    </label>
                    <select
                      value={blockType}
                      onChange={(e) => setBlockType(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-[#567a57]"
                    >
                      <option value="pause">Pause</option>
                      <option value="closed">Geschlossen</option>
                      <option value="vacation">Urlaub</option>
                      <option value="full-day">Ganzer Tag</option>
                      <option value="other">Sonstiges</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      Notiz
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-[#567a57]"
                      rows={4}
                      placeholder="Optional"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-2xl bg-[#405e3f] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    Sperrzeit speichern
                  </button>
                </form>
              </div>
            </section>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-2xl font-semibold text-stone-900">
                Buchungen am {selectedDate}
              </h2>

              <div className="mt-5 space-y-4">
                {sortedBookings.length === 0 ? (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                    Für dieses Datum liegen noch keine Buchungen vor.
                  </div>
                ) : (
                  sortedBookings.map((booking) => {
                    const statusClass =
                      booking.status === "confirmed"
                        ? "bg-emerald-100 text-emerald-800"
                        : booking.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800";

                    const statusLabel =
                      booking.status === "confirmed"
                        ? "Bestätigt"
                        : booking.status === "cancelled"
                        ? "Storniert"
                        : "Offen";

                    return (
                      <div
                        key={booking.id}
                        className="rounded-2xl border border-stone-200 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-lg font-semibold text-stone-900">
                              {booking.booking_time} · {booking.full_name}
                            </div>
                            <div className="mt-1 text-sm text-stone-600">
                              {booking.service_name}
                            </div>
                            <div className="mt-1 text-sm text-stone-600">
                              {booking.duration_minutes} Min · {booking.price_eur} €
                            </div>
                            <div className="mt-1 text-sm text-stone-600">
                              {booking.email}
                            </div>

                            <div className="mt-3">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                              >
                                {statusLabel}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                updateBookingStatus(booking.id, "confirmed")
                              }
                              disabled={saving}
                              className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                            >
                              Bestätigen
                            </button>
                            <button
                              onClick={() =>
                                updateBookingStatus(booking.id, "cancelled")
                              }
                              disabled={saving}
                              className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                            >
                              Stornieren
                            </button>
                            <button
                              onClick={() =>
                                updateBookingStatus(booking.id, "requested")
                              }
                              disabled={saving}
                              className="rounded-xl bg-stone-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                            >
                              Offen
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h2 className="text-2xl font-semibold text-stone-900">
                  Tagesübersicht {selectedDate}
                </h2>

                <div className="mt-5 space-y-3">
                  {dailyEvents.length === 0 ? (
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                      Für dieses Datum sind keine Einträge vorhanden.
                    </div>
                  ) : (
                    dailyEvents.map((event, index) => (
                      <div
                        key={`${event.type}-${event.start}-${index}`}
                        className={`rounded-2xl border p-4 ${
                          event.type === "booking"
                            ? "border-red-200 bg-red-50"
                            : "border-amber-200 bg-amber-50"
                        }`}
                      >
                        <div className="text-sm font-semibold text-stone-900">
                          {event.start} – {event.end}
                        </div>
                        <div className="mt-1 text-sm text-stone-700">
                          {event.title}
                        </div>
                        {event.subtitle && (
                          <div className="mt-1 text-xs text-stone-500">
                            {event.subtitle}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h2 className="text-2xl font-semibold text-stone-900">
                  Sperrzeiten am {selectedDate}
                </h2>

                <div className="mt-5 space-y-4">
                  {sortedBlockedTimes.length === 0 ? (
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                      Für dieses Datum sind keine Sperrzeiten eingetragen.
                    </div>
                  ) : (
                    sortedBlockedTimes.map((block) => (
                      <div
                        key={block.id}
                        className="rounded-2xl border border-stone-200 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-lg font-semibold text-stone-900">
                              {block.start_time} – {block.end_time}
                            </div>
                            <div className="mt-1 text-sm text-stone-600">
                              {block.title} · {block.block_type}
                            </div>
                            {block.note && (
                              <div className="mt-1 text-sm text-stone-600">
                                {block.note}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => deleteBlockedTime(block.id)}
                            disabled={saving}
                            className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}