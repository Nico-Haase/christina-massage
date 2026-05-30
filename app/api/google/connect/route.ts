// =====================================================================
// NEUE DATEI: app/api/google/connect/route.ts
// =====================================================================
// Diese Route ruft Christina EINMAL im Browser auf, um sich anzumelden.
// Sie leitet zum Google-Anmeldebildschirm weiter.
// Aufruf: http://localhost:3000/api/google/connect
// =====================================================================

import { NextResponse } from "next/server";
import { getOAuthClient } from "@/app/lib/google";

export async function GET() {
  const oauth2Client = getOAuthClient();

  const url = oauth2Client.generateAuthUrl({
    // "offline" sorgt dafür, dass wir ein Refresh Token bekommen
    access_type: "offline",
    // "consent" erzwingt, dass das Refresh Token wirklich mitkommt
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
  });

  return NextResponse.redirect(url);
}