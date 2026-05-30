// =====================================================================
// NEUE DATEI: app/api/google/callback/route.ts
// =====================================================================
// Hierher schickt Google Christina nach der Anmeldung zurück.
// Die Route zeigt das Refresh Token an, das du dann EINMALIG
// in die .env.local einträgst (als GOOGLE_REFRESH_TOKEN).
//
// WICHTIG: Diese Route nur zum einmaligen Einrichten nutzen.
// Nachdem das Token in der .env.local steht, brauchst du sie nicht mehr.
// =====================================================================

import { NextResponse } from "next/server";
import { getOAuthClient } from "@/app/lib/google";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { success: false, message: "Kein Code von Google erhalten." },
      { status: 400 }
    );
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return new NextResponse(
        `<html><body style="font-family: sans-serif; padding: 40px;">
          <h2>Kein Refresh Token erhalten</h2>
          <p>Das passiert, wenn du dich schon einmal angemeldet hast.
          Geh zu <a href="https://myaccount.google.com/permissions">
          myaccount.google.com/permissions</a>, entferne den Zugriff
          der App "Christina Massage" und versuche es erneut über
          /api/google/connect.</p>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // Token im Klartext anzeigen, damit du es in die .env.local kopieren kannst
    return new NextResponse(
      `<html><body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
        <h2>✅ Verbindung erfolgreich!</h2>
        <p>Kopiere die folgende Zeile in deine <code>.env.local</code>:</p>
        <pre style="background:#f4f4f4; padding:16px; border-radius:8px; word-break:break-all; white-space:pre-wrap;">GOOGLE_REFRESH_TOKEN=${refreshToken}</pre>
        <p>Danach den Dev-Server neu starten (Strg+C, dann <code>npm run dev</code>).</p>
        <p style="color:#888; font-size:13px;">Diese Seite zeigt einen geheimen Schlüssel –
        schließe sie danach und teile sie mit niemandem.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error: any) {
    console.error("GOOGLE CALLBACK ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Fehler beim Token-Tausch." },
      { status: 500 }
    );
  }
}