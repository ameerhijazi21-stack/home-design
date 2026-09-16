"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

const NEW_ADMIN_EMAIL = "superhomedesign.il@gmail.com";

export default function AdminAccountPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState(NEW_ADMIN_EMAIL);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!active) return;

        if (!session?.user) {
          router.replace("/admin/login");
          return;
        }

        const { data: adminRow, error: adminError } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!active) return;

        if (adminError || !adminRow) {
          await supabase.auth.signOut();
          router.replace("/admin/login");
          return;
        }

        setCurrentEmail(session.user.email || "");
        setChecking(false);
      } catch (error) {
        console.error("Account load error:", error);

        if (active) {
          setChecking(false);
        }
      }
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleEmailUpdate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setEmailError("");
    setEmailSuccess("");

    const cleanEmail = newEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setEmailError("יש להזין כתובת אימייל חדשה.");
      return;
    }

    if (cleanEmail === currentEmail.toLowerCase()) {
      setEmailError("זהו כבר האימייל הנוכחי של החשבון.");
      return;
    }

    setEmailLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: cleanEmail,
      });

      if (error) {
        throw error;
      }

      setEmailSuccess(
        "בקשת שינוי האימייל נשלחה. בדוק את תיבות המייל ואשר את השינוי לפי ההודעה שתקבל."
      );
    } catch (error) {
      console.error("Email update error:", error);
      setEmailError(
        "לא הצלחנו לעדכן את האימייל כרגע. נסה שוב."
      );
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordUpdate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 10) {
      setPasswordError(
        "הסיסמה החדשה חייבת להכיל לפחות 10 תווים."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("הסיסמאות אינן תואמות.");
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("הסיסמה עודכנה בהצלחה.");
    } catch (error) {
      console.error("Password update error:", error);
      setPasswordError(
        "לא הצלחנו לעדכן את הסיסמה כרגע. נסה שוב."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  if (checking) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-neutral-100"
      >
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin"
          />
          <p className="mt-3 text-sm text-gray-500">
            טוען פרטי חשבון...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
        >
          <ArrowRight size={17} />
          חזרה ללוח הבקרה
        </Link>

        <div className="mb-7">
          <p className="mb-2 text-sm font-medium tracking-wider text-gray-400">
            HOME DESIGN ADMIN
          </p>

          <h1 className="text-3xl font-semibold">
            חשבון מנהל
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            שינוי אימייל וסיסמה לחשבון הניהול.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                <Mail size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  שינוי אימייל
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  האימייל הנוכחי:
                  <span dir="ltr" className="mr-1 inline-block">
                    {currentEmail}
                  </span>
                </p>
              </div>
            </div>

            <form
              onSubmit={handleEmailUpdate}
              className="space-y-4"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  אימייל חדש
                </span>

                <input
                  dir="ltr"
                  type="email"
                  required
                  autoComplete="email"
                  value={newEmail}
                  onChange={(event) =>
                    setNewEmail(event.target.value)
                  }
                  disabled={emailLoading}
                  className="min-h-12 w-full rounded-xl border border-gray-300 px-4 text-left outline-none transition focus:border-black disabled:bg-gray-50"
                />
              </label>

              {emailError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {emailError}
                </div>
              )}

              {emailSuccess && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800"
                >
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{emailSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={emailLoading}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {emailLoading ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} />
                )}

                {emailLoading
                  ? "מעדכן..."
                  : "עדכון אימייל"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                <LockKeyhole size={20} />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  שינוי סיסמה
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  בחר סיסמה חדשה וחזקה לחשבון המנהל.
                </p>
              </div>
            </div>

            <form
              onSubmit={handlePasswordUpdate}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="new-admin-password"
                  className="mb-2 block text-sm font-medium"
                >
                  סיסמה חדשה
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="new-admin-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    required
                    minLength={10}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    disabled={passwordLoading}
                    placeholder="לפחות 10 תווים"
                    className="min-h-12 w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 outline-none transition focus:border-black disabled:bg-gray-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-neutral-100 hover:text-black"
                    aria-label={
                      showPassword
                        ? "הסתר סיסמה"
                        : "הצג סיסמה"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-admin-password"
                  className="mb-2 block text-sm font-medium"
                >
                  אימות סיסמה חדשה
                </label>

                <div className="relative">
                  <ShieldCheck
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="confirm-admin-password"
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
                      setConfirmPassword(event.target.value)
                    }
                    disabled={passwordLoading}
                    className="min-h-12 w-full rounded-xl border border-gray-300 py-3 pl-12 pr-12 outline-none transition focus:border-black disabled:bg-gray-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-neutral-100 hover:text-black"
                    aria-label={
                      showConfirmPassword
                        ? "הסתר סיסמה"
                        : "הצג סיסמה"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800"
                >
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {passwordLoading ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} />
                )}

                {passwordLoading
                  ? "מעדכן..."
                  : "עדכון סיסמה"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
