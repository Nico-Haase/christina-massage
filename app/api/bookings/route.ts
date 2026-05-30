// =====================================================================
// app/api/bookings/route.ts  —  KOMPLETTE DATEI
// Diese Datei komplett ersetzen (alles markieren, löschen, das hier rein).
//
// Enthält:
//   - die ursprüngliche Buchungs-Logik
//   - 15-Min-Raster + 15-Min-Puffer (Aufgabe 1, serverseitig)
//   - Google-Kalender-Eintrag bei neuer Buchung (Aufgabe 2)
// =====================================================================

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendCustomerBookingRequestEmail,
  sendOwnerNewBookingEmail,
} from "@/app/lib/email";
import { createCalendarEvent } from "@/app/lib/google";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- Arbeitszeit-Konstanten (müssen mit booking-utils.ts übereinstimmen) ---
const BUFFER_MINUTES = 15;
const DAY_START_MINUTES = 9 * 60;   // 09:00 frühester Start
const LAST_START_MINUTES = 19 * 60; // 19:00 spätester Start

function errorResponse(
  message: string,
  status = 500,
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...extra,
    },
    { status }
  );
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
) {
  return startA < endB && endA > startB;
}

function isWeekend(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);
  const day = date.getDay();
  return day === 0 || day === 6;
}

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return errorResponse("Supabase ENV Variablen fehlen.", 500, {
        hasUrl: !!supabaseUrl,
        hasServiceRoleKey: !!supabaseServiceRoleKey,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await req.json();

    const {
      user_id,
      name,
      email,
      service,
      date,
      time,
      duration,
      price,
      accepted_terms,
    } = body ?? {};

    if (
      !user_id ||
      !name ||
      !email ||
      !service ||
      !date ||
      !time ||
      duration === undefined ||
      price === undefined
    ) {
      return errorResponse("Fehlende Pflichtfelder.", 400);
    }

    if (!accepted_terms) {
      return errorResponse("AGB wurden nicht akzeptiert.", 400);
    }

    if (isWeekend(date)) {
      return errorResponse("Am Wochenende sind keine Termine buchbar.", 400);
    }

    const numericDuration = Number(duration);
    const numericPrice = Number(price);

    if (
      Number.isNaN(numericDuration) ||
      numericDuration <= 0 ||
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      return errorResponse("Dauer oder Preis sind ungültig.", 400);
    }

    const requestedStart = timeToMinutes(time);
    const requestedEnd = requestedStart + numericDuration;
    const requestedEndWithBuffer = requestedEnd + BUFFER_MINUTES;

    // Start muss im erlaubten Fenster liegen (09:00 - 19:00)
    if (
      requestedStart < DAY_START_MINUTES ||
      requestedStart > LAST_START_MINUTES
    ) {
      return errorResponse(
        "Dieser Termin liegt außerhalb der Arbeitszeiten.",
        400
      );
    }

    // Start muss auf einem 15-Minuten-Raster liegen
    if (requestedStart % 15 !== 0) {
      return errorResponse("Ungültige Startzeit.", 400);
    }

    const { data: existingBookings, error: existingBookingsError } =
      await supabaseAdmin
        .from("bookings")
        .select("id, booking_time, duration_minutes, status")
        .eq("booking_date", date)
        .in("status", ["requested", "confirmed"]);

    if (existingBookingsError) {
      console.error("BOOKINGS SELECT ERROR:", existingBookingsError);
      return errorResponse(existingBookingsError.message, 500);
    }

    const { data: existingBlocks, error: existingBlocksError } =
      await supabaseAdmin
        .from("blocked_times")
        .select("id, start_time, end_time, title, block_type")
        .eq("block_date", date);

    if (existingBlocksError) {
      console.error("BLOCKS SELECT ERROR:", existingBlocksError);
      return errorResponse(existingBlocksError.message, 500);
    }

    // Bestehende Buchungen werden um den Puffer verlängert,
    // damit nach jeder Massage 15 Min frei bleiben.
    const overlapsBooking = (existingBookings ?? []).some((booking) => {
      const bookingStart = timeToMinutes(booking.booking_time);
      const bookingEnd =
        bookingStart + Number(booking.duration_minutes) + BUFFER_MINUTES;
      return rangesOverlap(
        requestedStart,
        requestedEndWithBuffer,
        bookingStart,
        bookingEnd
      );
    });

    if (overlapsBooking) {
      return errorResponse(
        "Dieser Termin wurde gerade bereits vergeben.",
        409
      );
    }

    const overlapsBlock = (existingBlocks ?? []).some((block) => {
      const blockStart = timeToMinutes(block.start_time);
      const blockEnd = timeToMinutes(block.end_time);
      return rangesOverlap(
        requestedStart,
        requestedEnd,
        blockStart,
        blockEnd
      );
    });

    if (overlapsBlock) {
      return errorResponse("Dieser Zeitraum ist blockiert.", 409);
    }

    const insertPayload = {
      user_id,
      full_name: name,
      email,
      service_name: service,
      booking_date: date,
      booking_time: time,
      duration_minutes: numericDuration,
      price_eur: numericPrice,
      status: "requested",
      accepted_terms: true,
    };

    const { data: insertedBooking, error: insertError } = await supabaseAdmin
      .from("bookings")
      .insert([insertPayload])
      .select()
      .single();

    if (insertError) {
      console.error("BOOKING INSERT ERROR:", insertError);
      return errorResponse(insertError.message, 500);
    }

    // --- Google Kalender: Termin in Christinas Kalender anlegen ---
    // Schlägt das fehl, bleibt die Buchung trotzdem gültig.
    try {
      const googleEventId = await createCalendarEvent({
        summary: `${service} – ${name}`,
        description:
          `Buchung über die Webseite\n` +
          `Kunde: ${name}\n` +
          `E-Mail: ${email}\n` +
          `Dauer: ${numericDuration} Min\n` +
          `Preis: ${numericPrice} €`,
        date,
        time,
        durationMinutes: numericDuration,
      });

      if (googleEventId) {
        await supabaseAdmin
          .from("bookings")
          .update({ google_event_id: googleEventId })
          .eq("id", insertedBooking.id);
      }
    } catch (calErr) {
      console.error("GOOGLE KALENDER EINTRAG FEHLGESCHLAGEN:", calErr);
    }

    // --- E-Mails verschicken ---
    try {
      await sendCustomerBookingRequestEmail({
        name,
        email,
        service,
        date,
        time,
        duration: numericDuration,
        price: numericPrice,
      });

      await sendOwnerNewBookingEmail({
        name,
        email,
        service,
        date,
        time,
        duration: numericDuration,
        price: numericPrice,
      });
    } catch (mailError) {
      console.error("BOOKING MAIL ERROR:", mailError);
    }

    return NextResponse.json({
      success: true,
      message: "Buchung erfolgreich gespeichert.",
      booking: insertedBooking,
    });
  } catch (error: any) {
    console.error("API /api/bookings SERVER ERROR:", error);
    return errorResponse(error?.message || "Serverfehler.", 500);
  }
}

export async function GET() {
  return errorResponse("Method GET not allowed. Use POST instead.", 405);
}