// =====================================================================
// NEUE DATEI: app/api/bookings/cancel/route.ts
// =====================================================================
//
// Diese Route wird vom Kunden in "Meine Termine" aufgerufen, wenn er
// einen Termin stornieren möchte.
//
// Sie macht zwei Dinge:
//   1) setzt den Status der Buchung auf "cancelled" (mit Sicherheits-
//      checks: Buchung gehört wirklich dem aktuellen User)
//   2) löscht den zugehörigen Google-Kalender-Eintrag
//
// Aufruf vom Frontend mit fetch (siehe my-bookings/page.tsx unten).
// =====================================================================

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deleteCalendarEvent } from "@/app/lib/google";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Nicht autorisiert." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Supabase Konfiguration fehlt." },
        { status: 500 }
      );
    }

    // Auth-Client zur User-Erkennung (mit Bearer Token)
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "Ungültige Sitzung." },
        { status: 401 }
      );
    }

    const { bookingId, lateCancellation } = (await req.json()) as {
      bookingId: string;
      lateCancellation?: boolean;
    };

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Fehlende Buchungs-ID." },
        { status: 400 }
      );
    }

    // Admin-Client zum Schreiben & Lesen ohne RLS-Stolperfallen
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Erst Buchung holen und prüfen, ob sie diesem User gehört
    const { data: booking, error: fetchError } = await adminClient
      .from("bookings")
      .select("id, user_id, status, google_event_id")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { success: false, message: "Buchung nicht gefunden." },
        { status: 404 }
      );
    }

    if (booking.user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "Diese Buchung gehört nicht dir." },
        { status: 403 }
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Termin ist bereits storniert." },
        { status: 400 }
      );
    }

    // Status auf cancelled setzen
    const { error: updateError } = await adminClient
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_note: lateCancellation
          ? "Spät storniert - mögliche 10 € Ausfallpauschale"
          : "Kostenfrei storniert",
      })
      .eq("id", bookingId);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    // Google Kalender Eintrag löschen
    if (booking.google_event_id) {
      try {
        await deleteCalendarEvent(booking.google_event_id);
      } catch (calErr) {
        console.error("GOOGLE KALENDER LOESCHEN FEHLGESCHLAGEN:", calErr);
        // Storno bleibt trotzdem gültig
      }
    }

    return NextResponse.json({
      success: true,
      message: lateCancellation
        ? "Termin storniert. Hinweis: mögliche 10 € Ausfallpauschale."
        : "Termin erfolgreich storniert.",
    });
  } catch (err: any) {
    console.error("CANCEL ROUTE ERROR:", err);
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