"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import MonthlyCalendar from "../components/booking/MonthlyCalendar";
import {
  CalendarBlock,
  CalendarBooking,
  getDailyEvents,
  getDayStatus,
  getMonthEnd,
  getMonthStart,
  getNextWorkingDay,
  getSlotAvailability,
  getTodayString,
  parseDateKey,
} from "@/app/lib/booking-utils";

type Language = "de" | "hu";

type DurationOption = {
  duration: number;
  price: number;
};

type Service = {
  key: string;
  name: {
    de: string;
    hu: string;
  };
  options: DurationOption[];
};

type StatusType = "success" | "error" | "info";

const services: Service[] = [
  {
    key: "swedish",
    name: { de: "Schwedische Massage", hu: "Svédmasszázs" },
    options: [
      { duration: 60, price: 60 },
      { duration: 90, price: 90 },
      { duration: 120, price: 120 },
    ],
  },
  {
    key: "back-neck",
    name: { de: "Rücken / Nacken", hu: "Hát / Nyak" },
    options: [
      { duration: 45, price: 45 },
      { duration: 60, price: 60 },
      { duration: 75, price: 75 },
    ],
  },
  {
    key: "individual",
    name: { de: "Individuelle Massage", hu: "Egyéni masszázs" },
    options: [
      { duration: 60, price: 60 },
      { duration: 90, price: 90 },
      { duration: 120, price: 120 },
    ],
  },
  {
    key: "foot",
    name: { de: "Fußmassage", hu: "Talpmasszázs" },
    options: [
      { duration: 45, price: 45 },
      { duration: 60, price: 60 },
    ],
  },
  {
    key: "lymph",
    name: { de: "Lymphdrainage", hu: "Nyirokelvezetés" },
    options: [
      { duration: 60, price: 60 },
      { duration: 90, price: 90 },
    ],
  },
  {
    key: "vagus",
    name: { de: "Vagus / Stressabbau", hu: "Vagus / stresszoldás" },
    options: [
      { duration: 45, price: 45 },
      { duration: 60, price: 60 },
    ],
  },
  {
    key: "champi",
    name: {
      de: "Champi – Indische Kopfmassage",
      hu: "Champi – indiai fejmasszázs",
    },
    options: [{ duration: 45, price: 45 }],
  },
  {
    key: "scar-treatment",
    name: { de: "Narbenbehandlung", hu: "Hegkezelés" },
    options: [
      { duration: 30, price: 30 },
      { duration: 60, price: 60 },
    ],
  },
];

export default function BookingPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<Language>("de");
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(null);

  const [calendarBookings, setCalendarBookings] = useState<CalendarBooking[]>(
    []
  );
  const [calendarBlockedTimes, setCalendarBlockedTimes] = useState<
    CalendarBlock[]
  >([]);
  const [dailyBookings, setDailyBookings] = useState<CalendarBooking[]>([]);
  const [dailyBlockedTimes, setDailyBlockedTimes] = useState<CalendarBlock[]>(
    []
  );

  const [showAuth, setShowAuth] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionEmail, setSessionEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<StatusType>("info");

  const t = useMemo(() => {
    return {
      back: language === "de" ? "Zurück zur Startseite" : "Vissza a főoldalra",
      onlineBooking:
        language === "de" ? "Online Buchung" : "Online foglalás",
      title: language === "de" ? "Termin buchen" : "Időpontfoglalás",
      subtitle:
        language === "de"
          ? "Wähle zuerst einen Tag im Kalender, dann Behandlung, Dauer und eine freie Uhrzeit."
          : "Először válassz napot a naptárban, majd kezelést, időtartamot és szabad időpontot.",
      loginRequired:
        language === "de"
          ? "Login oder Registrierung sind vor der Buchung verpflichtend."
          : "Foglalás előtt a bejelentkezés vagy regisztráció kötelező.",
      stepCalendar:
        language === "de" ? "1. Tag auswählen" : "1. Nap kiválasztása",
      stepService:
        language === "de" ? "2. Behandlung wählen" : "2. Kezelés kiválasztása",
      stepDuration:
        language === "de" ? "3. Dauer auswählen" : "3. Időtartam kiválasztása",
      stepTime:
        language === "de" ? "4. Uhrzeit auswählen" : "4. Időpont kiválasztása",
      conditionsTitle:
        language === "de"
          ? "Buchungs- und Stornobedingungen"
          : "Foglalási és lemondási feltételek",
      conditionsText:
        language === "de"
          ? "Termine können bis 24 Stunden vorher kostenfrei abgesagt werden. Bei späterer Absage oder Nichterscheinen kann eine Ausfallpauschale von 10 € berechnet werden."
          : "Az időpontok legkésőbb 24 órával korábban díjmentesen lemondhatók. Későbbi lemondás vagy meg nem jelenés esetén 10 € rendelkezésre állási díj számítható fel.",
      authTitle:
        language === "de"
          ? "Einloggen oder registrieren"
          : "Bejelentkezés vagy regisztráció",
      authText:
        language === "de"
          ? "Vor der Buchung ist ein Konto nötig."
          : "Foglalás előtt fiók szükséges.",
      authButton:
        language === "de"
          ? "Login / Registrierung"
          : "Bejelentkezés / Regisztráció",
      loggedInAs:
        language === "de" ? "Eingeloggt als" : "Bejelentkezve mint",
      loggedInText:
        language === "de"
          ? "Du kannst jetzt deinen Termin verbindlich anfragen."
          : "Most már véglegesítheted az időpontfoglalási kérelmedet.",
      logout: language === "de" ? "Logout" : "Kijelentkezés",
      acceptTerms:
        language === "de"
          ? "Ich akzeptiere die Buchungs- und Stornobedingungen."
          : "Elfogadom a foglalási és lemondási feltételeket.",
      summary: language === "de" ? "Zusammenfassung" : "Összegzés",
      service: language === "de" ? "Behandlung" : "Kezelés",
      durationPrice:
        language === "de" ? "Dauer & Preis" : "Időtartam és ár",
      appointment: language === "de" ? "Termin" : "Időpont",
      choosePlease:
        language === "de" ? "Bitte wählen" : "Kérjük válassz",
      requestNow:
        language === "de" ? "Termin jetzt anfragen" : "Időpont kérése",
      saving: language === "de" ? "Wird gespeichert..." : "Mentés...",
      myBookings: language === "de" ? "Meine Termine" : "Időpontjaim",
      myBookingsText:
        language === "de"
          ? "Bereits gebuchte Termine kannst du unter /my-bookings verwalten und stornieren."
          : "A már lefoglalt időpontokat a /my-bookings oldalon kezelheted és lemondhatod.",
      close: language === "de" ? "Schließen" : "Bezárás",
      account: language === "de" ? "Konto" : "Fiók",
      register: language === "de" ? "Registrieren" : "Regisztráció",
      login: language === "de" ? "Einloggen" : "Bejelentkezés",
      name: language === "de" ? "Name" : "Név",
      email: "E-Mail",
      password: language === "de" ? "Passwort" : "Jelszó",
      fullNamePlaceholder:
        language === "de" ? "Vor- und Nachname" : "Teljes név",
      emailPlaceholder:
        language === "de" ? "deine@email.de" : "email@pelda.hu",
      passwordPlaceholder:
        language === "de" ? "Passwort" : "Jelszó",
      alreadyHaveAccount:
        language === "de"
          ? "Schon ein Konto? Jetzt einloggen"
          : "Van már fiókod? Bejelentkezés",
      noAccount:
        language === "de"
          ? "Noch kein Konto? Jetzt registrieren"
          : "Még nincs fiókod? Regisztráció",
      unavailable:
        language === "de" ? "Nicht verfügbar" : "Nem elérhető",
      selected: language === "de" ? "Ausgewählt" : "Kiválasztva",
      free: language === "de" ? "Frei" : "Szabad",
      blocked: language === "de" ? "Blockiert" : "Lezárva",
      authSuccessRegister:
        language === "de"
          ? "Registrierung erfolgreich. Bitte prüfe gegebenenfalls dein Postfach."
          : "Sikeres regisztráció. Kérjük ellenőrizd a postaládádat.",
      authSuccessLogin:
        language === "de" ? "Erfolgreich eingeloggt." : "Sikeres bejelentkezés.",
      bookingSuccess:
        language === "de"
          ? "Dein Termin wurde erfolgreich angefragt."
          : "Az időpontkérés sikeresen elküldve.",
      bookingError:
        language === "de"
          ? "Fehler bei der Buchung."
          : "Hiba történt a foglalás során.",
      duplicateError:
        language === "de"
          ? "Dieser Termin wurde gerade von jemand anderem gebucht. Bitte wähle eine andere Uhrzeit."
          : "Ezt az időpontot éppen most más foglalta le. Kérjük válassz másik időpontot.",
      dailyOverview:
        language === "de" ? "Tagesübersicht" : "Napi áttekintés",
      noEvents:
        language === "de"
          ? "Für diesen Tag gibt es noch keine Einträge."
          : "Erre a napra még nincs bejegyzés.",
      calendarLoading:
        language === "de" ? "Kalender wird geladen..." : "Naptár betöltése...",
    };
  }, [language]);

  const selectedService = services[selectedServiceIndex];
  const selectedOption = selectedService.options[selectedOptionIndex];

  const bookingReady = useMemo(() => {
    return isLoggedIn && acceptedTerms && !!selectedSlotTime && !!selectedDate;
  }, [isLoggedIn, acceptedTerms, selectedSlotTime, selectedDate]);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getSlotAvailability(
      selectedDate,
      selectedOption.duration,
      dailyBookings,
      dailyBlockedTimes
    );
  }, [selectedDate, selectedOption.duration, dailyBookings, dailyBlockedTimes]);

  const dailyEvents = useMemo(() => {
    return getDailyEvents(dailyBookings, dailyBlockedTimes);
  }, [dailyBookings, dailyBlockedTimes]);

  const setStatusMessage = (text: string, type: StatusType = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  useEffect(() => {
    const nextWorkingDay = getNextWorkingDay(new Date());
    const todayKey = getTodayString();
    const isTodayWeekend =
      parseDateKey(todayKey).getDay() === 0 ||
      parseDateKey(todayKey).getDay() === 6;

    const startDate = isTodayWeekend
      ? nextWorkingDay
      : new Date(`${todayKey}T12:00:00`);

    const startKey = `${startDate.getFullYear()}-${`${startDate.getMonth() + 1}`.padStart(
      2,
      "0"
    )}-${`${startDate.getDate()}`.padStart(2, "0")}`;

    setVisibleMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    setSelectedDate(startKey);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    if (params.get("auth") === "1") {
      setShowAuth(true);
    }

    if (params.get("mode") === "login") {
      setIsRegisterMode(false);
      setShowAuth(true);
    }

    if (params.get("confirmed") === "1") {
      setIsRegisterMode(false);
      setShowAuth(true);
      setStatusMessage(
        language === "de"
          ? "E-Mail bestätigt. Bitte jetzt einloggen."
          : "Az email megerősítve. Kérjük most jelentkezz be.",
        "success"
      );
    }
  }, [language]);

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIsLoggedIn(true);
        setSessionEmail(session.user.email ?? "");
        setEmail(session.user.email ?? "");
        if (session.user.user_metadata?.full_name) {
          setFullName(session.user.user_metadata.full_name);
        }
      } else {
        setIsLoggedIn(false);
        setSessionEmail("");
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setSessionEmail(session.user.email ?? "");
        setEmail(session.user.email ?? "");
        if (session.user.user_metadata?.full_name) {
          setFullName(session.user.user_metadata.full_name);
        }
      } else {
        setIsLoggedIn(false);
        setSessionEmail("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadMonthData = async () => {
      setCalendarLoading(true);

      const monthStart = getMonthStart(visibleMonth);
      const monthEnd = getMonthEnd(visibleMonth);

      const startKey = `${monthStart.getFullYear()}-${`${monthStart.getMonth() + 1}`.padStart(2, "0")}-${`${monthStart.getDate()}`.padStart(2, "0")}`;
      const endKey = `${monthEnd.getFullYear()}-${`${monthEnd.getMonth() + 1}`.padStart(2, "0")}-${`${monthEnd.getDate()}`.padStart(2, "0")}`;

      try {
        const response = await fetch(
          `/api/booking-availability?start=${startKey}&end=${endKey}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok) {
          setCalendarBookings([]);
          setCalendarBlockedTimes([]);
          return;
        }

        setCalendarBookings(result.bookings ?? []);
        setCalendarBlockedTimes(result.blocks ?? []);
      } catch {
        setCalendarBookings([]);
        setCalendarBlockedTimes([]);
      } finally {
        setCalendarLoading(false);
      }
    };

    loadMonthData();
  }, [visibleMonth]);

  useEffect(() => {
    if (!selectedDate) return;

    const loadDayData = async () => {
      try {
        const response = await fetch(
          `/api/booking-availability?date=${selectedDate}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok) {
          setDailyBookings([]);
          setDailyBlockedTimes([]);
          setSelectedSlotTime(null);
          return;
        }

        setDailyBookings(result.bookings ?? []);
        setDailyBlockedTimes(result.blocks ?? []);
        setSelectedSlotTime(null);
      } catch {
        setDailyBookings([]);
        setDailyBlockedTimes([]);
        setSelectedSlotTime(null);
      }
    };

    loadDayData();
  }, [selectedDate, selectedOption.duration]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("", "info");
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        setStatusMessage(
          language === "de"
            ? "Bitte E-Mail und Passwort eingeben."
            : "Kérjük add meg az email címet és a jelszót.",
          "error"
        );
        return;
      }

      if (isRegisterMode) {
        if (!fullName.trim()) {
          setStatusMessage(
            language === "de"
              ? "Bitte deinen Namen eingeben."
              : "Kérjük add meg a nevedet.",
            "error"
          );
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (error) {
          setStatusMessage(error.message, "error");
          return;
        }

        setShowAuth(false);
        setIsRegisterMode(false);
        setStatusMessage(
          language === "de"
            ? "Registrierung erfolgreich. Bitte bestätige zuerst deine E-Mail und logge dich danach ein."
            : "Sikeres regisztráció. Kérjük először erősítsd meg az emailedet, majd jelentkezz be.",
          "success"
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setStatusMessage(error.message, "error");
          return;
        }

        setShowAuth(false);
        setStatusMessage(t.authSuccessLogin, "success");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    setStatusMessage("", "info");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setShowAuth(true);
      setStatusMessage(
        language === "de"
          ? "Bitte zuerst einloggen oder registrieren."
          : "Kérjük először jelentkezz be vagy regisztrálj.",
        "error"
      );
      return;
    }

    if (!selectedDate || !selectedSlotTime) {
      setStatusMessage(
        language === "de"
          ? "Bitte zuerst einen Tag und eine freie Uhrzeit auswählen."
          : "Kérjük először válassz napot és szabad időpontot.",
        "error"
      );
      return;
    }

    if (!acceptedTerms) {
      setStatusMessage(
        language === "de"
          ? "Bitte akzeptiere zuerst die Buchungsbedingungen."
          : "Kérjük fogadd el a foglalási feltételeket.",
        "error"
      );
      return;
    }

    const selectedSlot = availableSlots.find((slot) => slot.time === selectedSlotTime);

    if (!selectedSlot) {
      setStatusMessage(
        language === "de"
          ? "Dieser Zeitraum ist nicht verfügbar."
          : "Ez az időpont nem elérhető.",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const user = session.user;
      const finalName =
        fullName || user.user_metadata?.full_name || "Unbekannter Kunde";

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          name: finalName,
          email: user.email ?? email.trim(),
          service: selectedService.name[language],
          date: selectedDate,
          time: selectedSlotTime,
          duration: selectedOption.duration,
          price: selectedOption.price,
          accepted_terms: acceptedTerms,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (
          result?.message?.includes("duplicate key") ||
          result?.message?.includes("23505")
        ) {
          setStatusMessage(t.duplicateError, "error");
        } else {
          setStatusMessage(result?.message || t.bookingError, "error");
        }

        await (async () => {
          try {
            const refreshResponse = await fetch(
              `/api/booking-availability?date=${selectedDate}`,
              { cache: "no-store" }
            );
            const refreshResult = await refreshResponse.json();
            if (refreshResponse.ok) {
              setDailyBookings(refreshResult.bookings ?? []);
              setDailyBlockedTimes(refreshResult.blocks ?? []);
            }
          } catch {}
        })();

        return;
      }

      setStatusMessage(t.bookingSuccess, "success");
      setAcceptedTerms(false);
      setSelectedSlotTime(null);

      try {
        const refreshResponse = await fetch(
          `/api/booking-availability?date=${selectedDate}`,
          { cache: "no-store" }
        );
        const refreshResult = await refreshResponse.json();
        if (refreshResponse.ok) {
          setDailyBookings(refreshResult.bookings ?? []);
          setDailyBlockedTimes(refreshResult.blocks ?? []);
        }
      } catch {}

      setTimeout(() => {
        router.push("/my-bookings");
      }, 800);
    } catch (error) {
      console.error(error);
      setStatusMessage(
        language === "de"
          ? "Es ist ein unerwarteter Fehler aufgetreten."
          : "Váratlan hiba történt.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAcceptedTerms(false);
    setStatusMessage(
      language === "de" ? "Erfolgreich ausgeloggt." : "Sikeres kijelentkezés.",
      "success"
    );
  };

  const messageStyles =
    messageType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : messageType === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-stone-200 bg-stone-50 text-stone-700";

  return (
    <div className="min-h-screen bg-[#f6efe5] text-stone-800">
      <header className="sticky top-0 z-50 border-b border-[#6f7d58] bg-[#7a8662]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Link
            href="/"
            className="text-sm font-medium text-white hover:text-[#f5efe3]"
          >
            ← {t.back}
          </Link>

          <div className="flex flex-col items-center">
            <img
              src="/logo-christina-massage.png"
              alt="Christina Massage Logo"
              className="h-14 w-auto object-contain sm:h-16 md:h-20"
            />
          </div>

          <div className="rounded-full border border-[#d8d0c2] bg-white/90 p-1">
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
      </header>

      <div className="min-h-[calc(100vh-88px)] p-4 sm:p-6 md:p-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="border-b border-stone-200 px-5 py-5 sm:px-6 md:px-8">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
                    {t.onlineBooking}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
                    {t.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-stone-600 md:text-base">
                    {t.subtitle}
                  </p>
                </div>

                <div className="w-fit rounded-2xl bg-[#eef3e6] px-4 py-3 text-sm font-medium text-[#556246]">
                  {t.loginRequired}
                </div>
              </div>
            </div>

            <div className="grid gap-8 px-5 py-6 sm:px-6 md:px-8 md:py-8">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  {t.stepCalendar}
                </h2>

                <div className="mt-4">
                  {calendarLoading ? (
                    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600">
                      {t.calendarLoading}
                    </div>
                  ) : (
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
                        const dayBookings = calendarBookings.filter(
                          (booking) => booking.booking_date === date
                        );
                        const dayBlocks = calendarBlockedTimes.filter(
                          (block) => block.block_date === date
                        );

                        const status = getDayStatus(date, dayBookings, dayBlocks);

                        return {
                          status,
                          label:
                            status === "closed"
                              ? "Geschlossen"
                              : status === "busy"
                              ? "Belegt"
                              : "Frei",
                          bookingCount: dayBookings.length,
                          blockCount: dayBlocks.length,
                          freeSlots: 0,
                        };
                      }}
                    />
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  {t.stepService}
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {services.map((service, index) => (
                    <button
                      key={service.key}
                      onClick={() => {
                        setSelectedServiceIndex(index);
                        setSelectedOptionIndex(0);
                        setSelectedSlotTime(null);
                      }}
                      className={`rounded-3xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                        index === selectedServiceIndex
                          ? "border-[#405e3f] bg-[#405e3f] text-white"
                          : "border-stone-200 bg-white text-stone-900"
                      }`}
                    >
                      <div className="text-base font-semibold">
                        {service.name[language]}
                      </div>
                      <div
                        className={`mt-2 text-sm ${
                          index === selectedServiceIndex
                            ? "text-white/70"
                            : "text-stone-500"
                        }`}
                      >
                        {service.options.map((o) => `${o.duration} Min`).join(" / ")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  {t.stepDuration}
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {selectedService.options.map((option, index) => (
                    <button
                      key={`${selectedService.key}-${option.duration}`}
                      onClick={() => {
                        setSelectedOptionIndex(index);
                        setSelectedSlotTime(null);
                      }}
                      className={`rounded-3xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                        index === selectedOptionIndex
                          ? "border-[#567a57] bg-[#eef3e6] text-[#2e3a28]"
                          : "border-stone-200 bg-white text-stone-900"
                      }`}
                    >
                      <div className="text-base font-semibold">
                        {option.duration} Min
                      </div>
                      <div className="mt-5 text-xl font-semibold">
                        {option.price} €
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                <h2 className="text-lg font-semibold text-stone-900">
                  {t.dailyOverview}
                </h2>

                {!selectedDate ? (
                  <p className="mt-3 text-sm text-stone-600">{t.choosePlease}</p>
                ) : dailyEvents.length === 0 ? (
                  <p className="mt-3 text-sm text-stone-600">{t.noEvents}</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {dailyEvents.map((event, index) => (
                      <div
                        key={`${event.type}-${event.start}-${index}`}
                        className={`rounded-2xl border p-4 ${
                          event.type === "booking"
                            ? "border-red-200 bg-red-50"
                            : event.type === "cancelled"
                            ? "border-stone-300 bg-stone-100"
                            : "border-amber-200 bg-amber-50"
                        }`}
                      >
                        <div
                          className={`text-sm font-semibold ${
                            event.type === "cancelled"
                              ? "text-stone-600"
                              : "text-stone-900"
                          }`}
                        >
                          {event.start} – {event.end}
                        </div>
                        <div
                          className={`mt-1 text-sm ${
                            event.type === "cancelled"
                              ? "text-stone-500"
                              : "text-stone-700"
                          }`}
                        >
                          {event.title}
                        </div>
                        {event.subtitle && (
                          <div className="mt-1 text-xs text-stone-500">
                            {event.subtitle}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  {t.stepTime}
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlotTime(slot)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        selectedSlotTime === slot
                          ? "border-[#567a57] bg-[#eef3e6] text-[#2e3a28] shadow-sm"
                          : "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400"
                      }`}
                    >
                      <div className="text-lg font-semibold">{slot}</div>
                      <div className="mt-1 text-xs uppercase tracking-wide">
                        {selectedSlotTime === slot ? t.selected : t.free}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="font-semibold text-amber-900">
                  {t.conditionsTitle}
                </h3>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  {t.conditionsText}
                </p>
              </div>

              {!isLoggedIn ? (
                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900">
                        {t.authTitle}
                      </h3>
                      <p className="mt-1 text-sm text-stone-600">
                        {t.authText}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowAuth(true);
                        setStatusMessage("", "info");
                      }}
                      className="rounded-2xl bg-[#405e3f] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      {t.authButton}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-[#cfd8bf] bg-[#eef3e6] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#2e3a28]">
                        {t.loggedInAs} {sessionEmail}
                      </h3>
                      <p className="mt-1 text-sm text-[#556246]">
                        {t.loggedInText}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-stone-800"
                    >
                      {t.logout}
                    </button>
                  </div>

                  <label className="mt-4 flex items-start gap-3 rounded-2xl bg-white p-4 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded"
                    />
                    <span>{t.acceptTerms}</span>
                  </label>

                  <button
                    onClick={handleBookingSubmit}
                    disabled={!bookingReady || loading}
                    className={`mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                      bookingReady && !loading
                        ? "bg-[#405e3f] text-white hover:opacity-90"
                        : "cursor-not-allowed bg-stone-300 text-stone-500"
                    }`}
                  >
                    {loading ? t.saving : t.requestNow}
                  </button>

                  {!bookingReady && (
                    <div className="mt-3 rounded-2xl bg-white p-4 text-sm text-stone-700">
                      {!isLoggedIn
                        ? language === "de"
                          ? "Bitte zuerst einloggen oder registrieren."
                          : "Kérjük először jelentkezz be vagy regisztrálj."
                        : !selectedDate
                        ? language === "de"
                          ? "Bitte zuerst einen Tag auswählen."
                          : "Kérjük először válassz napot."
                        : !selectedSlotTime
                        ? language === "de"
                          ? "Bitte eine freie Uhrzeit auswählen."
                          : "Kérjük válassz szabad időpontot."
                        : !acceptedTerms
                        ? language === "de"
                          ? "Bitte die Buchungsbedingungen bestätigen."
                          : "Kérjük fogadd el a foglalási feltételeket."
                        : ""}
                    </div>
                  )}
                </div>
              )}

              {message && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${messageStyles}`}
                >
                  {message}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-[#405e3f] p-6 text-white shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                {t.summary}
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-[#d6e2cf] bg-white/10 p-4">
                  <div className="text-sm text-white/70">{t.service}</div>
                  <div className="mt-1 text-lg font-semibold">
                    {selectedService.name[language]}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d6e2cf] bg-white/10 p-4">
                  <div className="text-sm text-white/70">{t.durationPrice}</div>
                  <div className="mt-1 text-lg font-semibold">
                    {selectedOption.duration} Min
                  </div>
                  <div className="text-white/80">{selectedOption.price} €</div>
                </div>

                <div className="rounded-2xl border border-[#d6e2cf] bg-white/10 p-4">
                  <div className="text-sm text-white/70">{t.appointment}</div>
                  <div className="mt-1 text-lg font-semibold">
                    {selectedDate || "-"}
                  </div>
                  <div className="text-white/80">
                    {selectedSlotTime
                      ? `${selectedSlotTime} Uhr`
                      : t.choosePlease}
                  </div>
                </div>
              </div>

              <Link
                href="/my-bookings"
                className="mt-4 block text-center text-sm underline text-white/80 hover:text-white"
              >
                {t.myBookings}
              </Link>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3 className="text-lg font-semibold text-stone-900">
                {t.myBookings}
              </h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                {t.myBookingsText}
              </p>
            </div>
          </aside>
        </div>
      </div>

      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
                  {t.account}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                  {isRegisterMode ? t.register : t.login}
                </h2>
              </div>

              <button
                onClick={() => setShowAuth(false)}
                className="rounded-xl bg-stone-100 px-3 py-2 text-sm text-stone-700"
              >
                {t.close}
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              {isRegisterMode && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    {t.name}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-[#567a57]"
                    placeholder={t.fullNamePlaceholder}
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-[#567a57]"
                  placeholder={t.emailPlaceholder}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  {t.password}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-[#567a57]"
                  placeholder={t.passwordPlaceholder}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#405e3f] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {loading
                  ? t.saving
                  : isRegisterMode
                  ? t.register
                  : t.login}
              </button>
            </form>

            <button
              onClick={() => setIsRegisterMode((prev) => !prev)}
              className="mt-4 text-sm text-stone-600 underline"
            >
              {isRegisterMode ? t.alreadyHaveAccount : t.noAccount}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}