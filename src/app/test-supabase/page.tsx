"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TestSupabasePage() {
  const [message, setMessage] = useState("בודק חיבור...");

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("orders")
        .select("*");

      if (error) {
        console.error(error);
        setMessage(`שגיאה: ${error.message}`);
        return;
      }

      setMessage(
        `החיבור הצליח. נמצאו ${data.length} הזמנות.`
      );
    }

    testConnection();
  }, []);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-100 px-6 py-16"
    >
      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">
          בדיקת Supabase
        </h1>

        <p className="mt-4 text-gray-600">
          {message}
        </p>
      </div>
    </main>
  );
}