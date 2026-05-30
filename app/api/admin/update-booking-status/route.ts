// =====================================================================
// app/api/admin/update-booking-status/route.ts  —  KOMPLETTE DATEI
// Diese Datei komplett ersetzen.
// =====================================================================
//
// Neu: Wird der Status auf "cancelled" gesetzt UND es gibt eine
//      google_event_id, dann wird der Termin auch im Kalender gelöscht.
// =====================================================================

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendCustomerCancelledEmail,
  sendCustomerConfirmedEmail,
} from "@/app/lib/email";
import { deleteCalendarEvent } from "@/app/lib/google";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

type UpdatedBooking = {
  id: string;
  full_name: string;
  email: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  status: string;
  google_event_id?: string | null;
};

export async function POST(req: Request) {
  try {
    const { bookingId, status } = await req.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { success: false, message: "Fehlende Daten." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc(
      "admin_update_booking_status",
      {
        p_booking_id: bookingId,
        p_status: status,
      }
    );

    if (error) {
      console.error("RPC Error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const booking: UpdatedBooking | undefined =
      Array.isArray(data) && data.length > 0 ? data[0] : undefined;

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Buchung nicht gefunden." },
        { status: 404 }
      );
    }

    // --- Google Kalender Eintrag löschen, wenn storniert ---
    // Die RPC liefert google_event_id evtl. nicht mit; holen wir uns sicher.
    if (status === "cancelled") {
      try {
        const { data: bookingRow } = await supabase
          .from("bookings")
          .select("google_event_id")
          .eq("id", bookingId)
          .single();

        const eventId = bookingRow?.google_event_id;
        if (eventId) {
          await deleteCalendarEvent(eventId);
        }
      } catch (calErr) {
        console.error("GOOGLE KALENDER LOESCHEN FEHLGESCHLAGEN:", calErr);
      }
    }

    // --- E-Mails an den Kunden ---
    try {
      if (status === "confirmed") {
        await sendCustomerConfirmedEmail({
          name: booking.full_name,
          email: booking.email,
          service: booking.service_name,
          date: booking.booking_date,
          time: booking.booking_time,
          duration: booking.duration_minutes,
        });
      } else if (status === "cancelled") {
        await sendCustomerCancelledEmail({
          name: booking.full_name,
          email: booking.email,
          service: booking.service_name,
          date: booking.booking_date,
          time: booking.booking_time,
          duration: booking.duration_minutes,
        });
      }
    } catch (mailError) {
      console.error("E-Mail Fehler:", mailError);
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "Status erfolgreich aktualisiert.",
    });
  } catch (err: any) {
    console.error("Server Error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Serverfehler." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Method GET not allowed. Use POST instead." },
    { status: 405 }
  );
}