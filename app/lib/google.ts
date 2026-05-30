// =====================================================================
// NEUE DATEI: app/lib/google.ts
// =====================================================================
// Zentrale Stelle für Google-Kalender. Nutzt das Refresh Token aus
// der .env.local, um Termine in Christinas Kalender anzulegen/zu löschen.
// =====================================================================

import { google } from "googleapis";

// OAuth-Client aus den .env-Werten bauen
export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Liefert einen einsatzbereiten Kalender-Client.
// Nutzt das dauerhafte Refresh Token aus der .env.local.
function getCalendarClient() {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

type CalendarEventInput = {
  summary: string;       // Titel im Kalender, z.B. "Schwedische Massage – Max Mustermann"
  description?: string;  // Details
  date: string;          // "2026-06-01"
  time: string;          // "10:15"
  durationMinutes: number;
};

// Hilfsfunktion: aus Datum + Uhrzeit + Dauer ein Start/Ende im ISO-Format bauen
function buildStartEnd(date: string, time: string, durationMinutes: number) {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);

  // Lokale Zeit in Deutschland; Google bekommt die Zeitzone explizit mit
  const startISO = `${date}T${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:00`;

  const endTotal = hours * 60 + minutes + durationMinutes;
  const endH = Math.floor(endTotal / 60);
  const endM = endTotal % 60;
  const endISO = `${date}T${String(endH).padStart(2, "0")}:${String(
    endM
  ).padStart(2, "0")}:00`;

  return { startISO, endISO };
}

// Termin im Kalender anlegen. Gibt die Google-Event-ID zurück,
// die wir in der Datenbank speichern (um später löschen zu können).
export async function createCalendarEvent(
  input: CalendarEventInput
): Promise<string | null> {
  try {
    const calendar = getCalendarClient();
    const { startISO, endISO } = buildStartEnd(
      input.date,
      input.time,
      input.durationMinutes
    );

    const response = await calendar.events.insert({
      calendarId: "primary", // Christinas Hauptkalender
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: { dateTime: startISO, timeZone: "Europe/Berlin" },
        end: { dateTime: endISO, timeZone: "Europe/Berlin" },
      },
    });

    return response.data.id ?? null;
  } catch (error) {
    console.error("GOOGLE CALENDAR CREATE ERROR:", error);
    return null; // Buchung soll trotzdem klappen, auch wenn Kalender hakt
  }
}

// Termin aus dem Kalender löschen (bei Storno)
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  try {
    const calendar = getCalendarClient();
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
    return true;
  } catch (error) {
    console.error("GOOGLE CALENDAR DELETE ERROR:", error);
    return false;
  }
}