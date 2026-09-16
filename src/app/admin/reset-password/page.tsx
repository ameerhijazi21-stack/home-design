"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

export default function AdminResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [checkingRecovery, setCheckingRecovery] =
    useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        setRecoveryReady(true);
      } else {
        setRecoveryReady(false);
      }

      setCheckingRecovery(false);
    }

    void checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN"
        ) {
          setRecoveryReady(Boolean(session?.user));
          setCheckingRecovery(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!recoveryReady) {
      setError(
        "קישור האיפוס אינו תקין או שפג תוקפו. בקש קישור חדש."
      );
      return;
    }

    if (password.length < 10) {
      setError(
        "הסיסמה חייבת להכיל לפחות 10 תווים."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "הסיסמאות אינן תואמות."
      );
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw updateError;
      }

      setSuccess(
        "הסיסמה עודכנה בהצלחה."
      );

      setPassword("");
      setConfirmPassword("");

      window.setTimeout(async () => {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }, 1600);
    } catch (updateError) {
      console.error(
        "Password update error:",
        updateError
      );

      setError(
        "לא הצלחנו לעדכן את הסיסמה. בקש קישור איפוס חדש ונסה שוב."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingRecovery) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-neutral-100 px-4"
      >
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin"
          />
          <p className="mt-3 text-sm text-gray-500">
            בודק קישור איפוס...
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
            יצירת סיסמה חדשה
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            בחר סיסמה חדשה לחשבון המנהל.
          </p>
        </div>

        {!recoveryReady ? (
          <div>
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
              קישור האיפוס אינו תקין או שפג תוקפו.
            </div>

            <Link
              href="/admin/forgot-password"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-neutral-800"
            >
              בקשת קישור חדש
            </Link>

            <Link
              href="/admin/login"
              className="mt-3 inline-flex w-full items-center justify-center text-sm text-gray-500 transition hover:text-black"
            >
              חזרה להתחברות
            </Link>
          </div>
        ) : success ? (
          <div className="text-center">
            <CheckCircle2
              size={46}
              className="mx-auto text-green-600"
            />

            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm leading-6 text-green-800">
              {success}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              מעביר אותך למסך ההתחברות...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium"
              >
                סיסמה חדשה
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="new-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  required
                  minLength={10}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="לפחות 10 תווים"
                  disabled={loading}
                  className="min-h-12 w-full rounded-xl border border-gray-300 py-3.5 pl-12 pr-12 outline-none transition focus:border-black disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-neutral-100 hover:text-black"
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

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium"
              >
                אימות סיסמה חדשה
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  required
                  minLength={10}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  disabled={loading}
                  className="min-h-12 w-full rounded-xl border border-gray-300 py-3.5 pl-12 pr-12 outline-none transition focus:border-black disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-neutral-100 hover:text-black"
                  aria-label={
                    showConfirmPassword
                      ? "הסתר סיסמה"
                      : "הצג סיסמה"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
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
                ? "מעדכן סיסמה..."
                : "שמירת סיסמה חדשה"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
