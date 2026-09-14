"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/admin");
        return;
      }

      setCheckingSession(false);
    }

    checkSession();
  }, [router]);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      console.error(signInError);

      setError(
        "האימייל או הסיסמה אינם נכונים."
      );

      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  if (checkingSession) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-neutral-100"
      >
        <p className="text-gray-500">
          בודק התחברות...
        </p>
      </main>
    );
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
            כניסת מנהל
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            התחבר כדי לגשת למערכת הניהול.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              אימייל
            </label>

            <div className="relative">
              <Mail
                size={19}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="admin@example.com"
                className="w-full border border-gray-300 py-3.5 pl-4 pr-12 outline-none transition focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              סיסמה
            </label>

            <div className="relative">
              <LockKeyhole
                size={19}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="הזן סיסמה"
                className="w-full border border-gray-300 py-3.5 pl-12 pr-12 outline-none transition focus:border-black"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-black"
                aria-label={
                  showPassword
                    ? "הסתר סיסמה"
                    : "הצג סיסמה"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black px-6 py-4 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading
              ? "מתחבר..."
              : "כניסה למערכת"}
          </button>
        </form>
      </div>
    </main>
  );
}