"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password",
    });

    if (error) {
      setMessage("Fehler: " + error.message);
    } else {
      setMessage("Check deine E-Mails 📩");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6efe5]">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h2 className="text-2xl mb-4">Passwort vergessen</h2>

        <input
          type="email"
          placeholder="E-Mail"
          className="w-full border p-3 mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="w-full bg-[#567a57] text-white p-3"
        >
          Reset Link senden
        </button>

        {message && <p className="mt-4">{message}</p>}
      </div>
    </div>
  );
}