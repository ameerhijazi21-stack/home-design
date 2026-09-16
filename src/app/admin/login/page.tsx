"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");
  const [loading, setLoading] =
    useState(false);
  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  async function isAdmin(
    userId: string
  ) {
    const {
      data,
      error: adminError,
    } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (adminError) {
      console.error(
        "Admin check error:",
        adminError
      );

      return false;
    }

    return Boolean(data);
  }

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!active) return;

        if (!session?.user) {
          setCheckingSession(false);
          return;
        }

        const allowed = await isAdmin(
          session.user.id
        );

        if (!active) return;

        if (allowed) {
          router.replace("/admin");
          return;
        }

        await supabase.auth.signOut();

        if (!active) return;

        setError(
          "לחשבון זה אין הרשאה למערכת הניהול."
        );

        setCheckingSession(false);
      } catch (sessionError) {
        console.error(
          "Session check error:",
          sessionError
        );

        if (active) {
          setError(
            "אירעה שגיאה בבדיקת ההתחברות."
          );

          setCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const {
        data,
        error: signInError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email: email.trim(),
            password,
          }
        );

      if (
        signInError ||
        !data.user
      ) {
        setError(
          "האימייל או הסיסמה אינם נכונים."
        );

        return;
      }

      const allowed = await isAdmin(
        data.user.id
      );

      if (!allowed) {
        await supabase.auth.signOut();

        setError(
          "לחשבון זה אין הרשאה למערכת הניהול."
        );

        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (loginError) {
      console.error(
        "Admin login error:",
        loginError
      );

      setError(
        "אירעה שגיאה בהתחברות. נסה שוב."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-neutral-100"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />

          <p className="text-sm text-gray-500">
            בודק התחברות...
          </p>
        </div>
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
            התחבר כדי לגשת למערכת
            הניהול.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-medium"
            >
              אימייל
            </label>

            <div className="relative">
              <Mail
                size={19}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="admin@example.com"
                disabled={loading}
                className="min-h-12 w-full rounded-xl border border-gray-300 py-3.5 pl-4 pr-12 outline-none transition focus:border-black disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-sm font-medium"
            >
              סיסמה
            </label>

            <div className="relative">
              <LockKeyhole
                size={19}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="admin-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="הזן סיסמה"
                disabled={loading}
                className="min-h-12 w-full rounded-xl border border-gray-300 py-3.5 pl-12 pr-12 outline-none transition focus:border-black disabled:bg-gray-50"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                disabled={loading}
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-neutral-100 hover:text-black disabled:cursor-not-allowed"
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

            <div className="mt-2 text-left">
              <Link
                href="/admin/forgot-password"
                className="text-sm text-gray-500 transition hover:text-black"
              >
                שכחתי סיסמה
              </Link>
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
            className="min-h-14 w-full rounded-xl bg-black px-6 py-4 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
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
