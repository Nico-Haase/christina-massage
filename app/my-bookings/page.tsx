"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Booking = {
  id: string;
  service_name: string;
  duration_minutes: number;
  price_eur: number;
  booking_date: string;
  booking_time: string;
  status: string;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setBookings([]);
      setMessage("Bitte zuerst einloggen.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, service_name, duration_minutes, price_eur, booking_date, booking_time, status"
      )
      .eq("user_id", session.user.id)
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });

    if (error) {
      setBookings([]);
      setMessage(error.message);
    } else {
      setBookings(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const canCancelFree = (bookingDate: string, bookingTime: string) => {
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00`);
    const now = new Date();
    const diffMs = bookingDateTime.getTime() - now.getTime();
    return diffMs >= 24 * 60 * 60 * 1000;
  };

  const cancelBooking = async (booking: Booking) => {
    const freeCancellation = canCancelFree(
      booking.booking_date,
      booking.booking_time
    );

    const confirmText = freeCancellation
      ? "Möchtest du diesen Termin wirklich stornieren?"
      : "Dieser Termin liegt innerhalb von 24 Stunden. Bei späterer Absage kann eine Ausfallpauschale von 10 € berechnet werden. Trotzdem stornieren?";

    if (!window.confirm(confirmText)) return;

    // Aktuellen Auth-Token holen, um die Route zu authentifizieren
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setMessage("Bitte zuerst einloggen.");
      return;
    }

    // Storno über die neue Server-Route (löscht auch im Google Kalender)
    const response = await fetch("/api/bookings/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        bookingId: booking.id,
        lateCancellation: !freeCancellation,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      setMessage(result.message || "Fehler beim Stornieren.");
      return;
    }

    setMessage(result.message);
    loadBookings();
  };

  return (
    <div className="min-h-screen bg-[#f6efe5] p-6 md:p-10">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-neutral-900">
            Meine Termine
          </h1>

          <Link
            href="/booking"
            className="rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Neuer Termin
          </Link>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            {message}
          </div>
        )}

        {loading ? (
          <p className="mt-6 text-neutral-600">Lade Termine...</p>
        ) : bookings.length === 0 ? (
          <p className="mt-6 text-neutral-600">Noch keine Termine vorhanden.</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {bookings.map((booking) => {
              const freeCancellation = canCancelFree(
                booking.booking_date,
                booking.booking_time
              );

              return (
                <div
                  key={booking.id}
                  className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900">
                        {booking.service_name}
                      </h2>
                      <p className="mt-2 text-neutral-600">
                        {booking.booking_date} · {booking.booking_time} Uhr
                      </p>
                      <p className="text-neutral-600">
                        {booking.duration_minutes} Minuten · {booking.price_eur} €
                      </p>
                      <p className="mt-2 text-sm text-neutral-500">
                        Status: {booking.status}
                      </p>
                    </div>

                    {(booking.status === "requested" ||
                      booking.status === "confirmed") && (
                      <button
                        onClick={() => cancelBooking(booking)}
                        className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        {freeCancellation
                          ? "Kostenfrei stornieren"
                          : "Termin stornieren"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}