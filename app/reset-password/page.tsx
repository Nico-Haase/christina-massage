"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Language = "de" | "hu";

export default function ResetPasswordPage() {
  const [language, setLanguage] = useState<Language>("de");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [ready, setReady] = useState(false);

  const t =
    language === "de"
      ? {
          brand: "Christina Massage",
          title: "Passwort zurücksetzen",
          subtitle: "Bitte gib dein neues Passwort ein.",
          preparing: "Vorbereitung läuft...",
          newPassword: "Neues Passwort",
          repeatPassword: "Passwort wiederholen",
          newPasswordPlaceholder: "Neues Passwort",
          repeatPasswordPlaceholder: "Passwort wiederholen",
          save: "Neues Passwort speichern",
          saving: "Wird gespeichert...",
          backToLogin: "Zurück zum Login",
          emptyFields: "Bitte beide Passwortfelder ausfüllen.",
          minLength: "Das Passwort muss mindestens 6 Zeichen haben.",
          mismatch: "Die Passwörter stimmen nicht überein.",
          success:
            "Passwort erfolgreich geändert. Du kannst dich jetzt einloggen.",
        }
      : {
          brand: "Christina Massage",
          title: "Jelszó visszaállítása",
          subtitle: "Kérjük add meg az új jelszavadat.",
          preparing: "Előkészítés folyamatban...",
          newPassword: "Új jelszó",
          repeatPassword: "Jelszó ismétlése",
          newPasswordPlaceholder: "Új jelszó",
          repeatPasswordPlaceholder: "Jelszó ismétlése",
          save: "Új jelszó mentése",
          saving: "Mentés...",
          backToLogin: "Vissza a bejelentkezéshez",
          emptyFields: "Kérjük töltsd ki mindkét jelszó mezőt.",
          minLength: "A jelszónak legalább 6 karakterből kell állnia.",
          mismatch: "A két jelszó nem egyezik.",
          success:
            "A jelszó sikeresen megváltozott. Most már bejelentkezhetsz.",
        };

  useEffect(() => {
    const prepareRecoverySession = async () => {
      try {
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.replace("#", ""));
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setReady(true);
      }
    };

    prepareRecoverySession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!password.trim() || !repeatPassword.trim()) {
      setMessageType("error");
      setMessage(t.emptyFields);
      return;
    }

    if (password.length < 6) {
      setMessageType("error");
      setMessage(t.minLength);
      return;
    }

    if (password !== repeatPassword) {
      setMessageType("error");
      setMessage(t.mismatch);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }

    setMessageType("success");
    setMessage(t.success);
    setPassword("");
    setRepeatPassword("");
  };

  const messageStyles =
    messageType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : messageType === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-stone-200 bg-stone-50 text-stone-700";

  return (
    <div className="min-h-screen bg-[#f6efe5] px-4 py-10 text-stone-800">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
              {t.brand}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-900">
              {t.title}
            </h1>
            <p className="mt-2 text-sm text-stone-600">{t.subtitle}</p>
          </div>

          <div className="rounded-full border border-[#d8d0c2] bg-white p-1">
            <button
              onClick={() => setLanguage("de")}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                language === "de"
                  ? "bg-stone-800 text-white"
                  : "text-stone-700"
              }`}
            >
              DE
            </button>
            <button
              onClick={() => setLanguage("hu")}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                language === "hu"
                  ? "bg-stone-800 text-white"
                  : "text-stone-700"
              }`}
            >
              HU
            </button>
          </div>
        </div>

        {!ready ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
            {t.preparing}
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                {t.newPassword}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 pr-14 outline-none focus:border-[#567a57]"
                  placeholder={t.newPasswordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-stone-600 hover:bg-stone-100"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                {t.repeatPassword}
              </label>
              <div className="relative">
                <input
                  type={showRepeatPassword ? "text" : "password"}
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 pr-14 outline-none focus:border-[#567a57]"
                  placeholder={t.repeatPasswordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-stone-600 hover:bg-stone-100"
                >
                  {showRepeatPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#405e3f] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? t.saving : t.save}
            </button>
          </form>
        )}

        {message && (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${messageStyles}`}
          >
            {message}
          </div>
        )}

        <Link
          href="/booking?auth=1&mode=login"
          className="mt-6 inline-block text-sm font-medium text-[#405e3f] underline"
        >
          {t.backToLogin}
        </Link>
      </div>
    </div>
  );
}