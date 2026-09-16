"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState(
    "superhomedesign.il@gmail.com"
  );

  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("יש להזין אימייל.");
      return;
    }

    setLoading(true);

    try {
      const redirectTo =
        `${window.location.origin}/admin/reset-password`;

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo,
          }
        );

      if (resetError) {
        throw resetError;
      }

      setSuccess(
        "שלחנו קישור לאיפוס הסיסמה. בדוק את תיבת המייל."
      );
    } catch (resetError) {
      console.error(
        "Password reset request error:",
        resetError
      );

      setError(
        "לא הצלחנו לשלוח את קישור האיפוס. נסה שוב בעוד רגע."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-neutral-100 px-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
            <LockKeyhole size={25} />
          </div>

          <p className="mb-2 text-sm font-medium tracking-wider text-gray-400">
            HOME DESIGN
          </p>

          <h1 className="text-3xl font-semibold">
            איפוס סיסמה
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            נשלח אליך קישור מאובטח ליצירת סיסמה חדשה.
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <CheckCircle2
              size={46}
              className="mx-auto text-green-600"
            />

            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm leading-6 text-green-800">
              {success}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              אם המייל לא מופיע, בדוק גם בתיקיית הספאם.
            </p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="mt-5 min-h-12 w-full rounded-xl border border-gray-300 px-5 py-3 font-medium transition hover:border-black"
            >
              שליחה מחדש
            </button>

            <Link
              href="/admin/login"
              className="mt-4 inline-flex w-full items-center justify-center text-sm text-gray-500 transition hover:text-black"
            >
              חזרה להתחברות
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="reset-email"
                className="mb-2 block text-sm font-medium"
              >
                אימייל מנהל
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="reset-email"
                  dir="ltr"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  disabled={loading}
                  className="min-h-12 w-full rounded-xl border border-gray-300 py-3.5 pl-4 pr-12 text-left outline-none transition focus:border-black disabled:bg-gray-50"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              {loading
                ? "שולח..."
                : "שליחת קישור איפוס"}
            </button>

            <Link
              href="/admin/login"
              className="inline-flex w-full items-center justify-center text-sm text-gray-500 transition hover:text-black"
            >
              חזרה להתחברות
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
