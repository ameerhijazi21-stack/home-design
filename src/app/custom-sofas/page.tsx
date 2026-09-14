"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  MessageCircle,
  Ruler,
  Palette,
  Sofa,
  Store,
} from "lucide-react";

export default function CustomSofasPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-white text-black">
      <section className="relative min-h-[520px] overflow-hidden bg-neutral-100 sm:min-h-[620px]">
        <img
          src="/images/categories/sofas.png"
          alt="ספות בהתאמה אישית"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-14 sm:min-h-[620px] sm:px-8 sm:py-20">
          <div className="max-w-2xl text-white">
            <p className="mb-3 text-xs font-medium tracking-[0.22em] sm:mb-4 sm:text-sm sm:tracking-[0.25em]">
              HOME DESIGN • CUSTOM
            </p>

            <h1 className="text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              הספה שלכם.
              <br />
              בדיוק כמו שאתם רוצים.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/90 sm:mt-6 sm:text-lg sm:leading-8">
              אצלנו הספה לא נבחרת מתוך מדף. מתכננים אותה יחד לפי החלל,
              המידות, הבד, הצבע והסגנון שמתאימים לבית שלכם.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:mt-8 sm:flex sm:flex-wrap">
              <a
                href="#contact-custom"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-medium text-black transition hover:bg-neutral-200 sm:rounded-none sm:px-7"
              >
                לתיאום ייעוץ
                <ArrowLeft size={18} />
              </a>

              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/70 px-6 py-3.5 font-medium text-white transition hover:bg-white hover:text-black sm:rounded-none sm:px-7"
              >
                חזרה לחנות
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium tracking-[0.2em] text-gray-500 sm:text-sm">
              בהתאמה אישית
            </p>

            <h2 className="mt-3 text-2xl font-semibold sm:text-4xl">
              אתם בוחרים. אנחנו מרכיבים.
            </h2>

            <p className="mt-4 text-sm leading-7 text-gray-600 sm:mt-5 sm:text-base sm:leading-8">
              במקום להתפשר על ספה מוכנה, ניתן להתאים את הספה לצרכים שלכם
              יחד איתנו באולם התצוגה.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              [Ruler, "מידות", "התאמה לחלל ולמידות שאתם צריכים."],
              [Palette, "בד וצבע", "בחירת גוון וריפוד שמתאימים לבית."],
              [Sofa, "מבנה", "התאמת מבנה הספה והסגנון לפי הצורך."],
              [Store, "ייעוץ אישי", "מגיעים לחנות ומתכננים יחד את הספה."],
            ].map(([Icon, title, text]: any) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-200 p-4 sm:rounded-none sm:p-7"
              >
                <Icon size={26} strokeWidth={1.5} className="sm:h-[30px] sm:w-[30px]" />

                <h3 className="mt-4 text-base font-semibold sm:mt-5 sm:text-xl">
                  {title}
                </h3>

                <p className="mt-2 text-xs leading-6 text-gray-500 sm:mt-3 sm:text-sm sm:leading-7">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-100 py-12 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 sm:gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <img
              src="/images/categories/sofas.png"
              alt="עיצוב ספה בהתאמה אישית"
              width={1200}
              height={900}
              loading="lazy"
              decoding="async"
              className="h-[280px] w-full rounded-2xl object-cover sm:h-[520px] sm:rounded-none"
            />
          </div>

          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.2em] text-gray-500 sm:text-sm">
              התהליך
            </p>

            <h2 className="mt-3 text-2xl font-semibold sm:text-4xl">
              מספה שרואים, לספה שמתאימה לכם
            </h2>

            <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
              {[
                "מגיעים לאולם התצוגה ומספרים לנו מה אתם מחפשים.",
                "בוחרים מידות, מבנה, בד, צבע וסגנון.",
                "אנחנו עוברים יחד על כל הפרטים לפני ההזמנה.",
                "הספה מיוצרת ומורכבת בהתאם לבחירה שלכם.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <Check size={14} />
                  </span>

                  <p className="text-sm leading-7 text-gray-700 sm:text-base">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact-custom" className="py-12 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <MessageCircle
            size={34}
            strokeWidth={1.4}
            className="mx-auto sm:h-[38px] sm:w-[38px]"
          />

          <h2 className="mt-4 text-2xl font-semibold sm:mt-5 sm:text-4xl">
            רוצים לתכנן את הספה שלכם?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            השאירו לנו הודעה או הגיעו ל־Home Design לקבלת ייעוץ אישי.
            נבין יחד מה מתאים לחלל ולסגנון שלכם.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:justify-center">
            <Link
              href="/#contact"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-black px-7 py-3.5 font-medium text-white transition hover:bg-gray-800 sm:rounded-none sm:px-8 sm:py-4"
            >
              יצירת קשר
              <ArrowLeft size={18} />
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 px-7 py-3.5 font-medium transition hover:border-black sm:rounded-none sm:px-8 sm:py-4"
            >
              המשך לחנות
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
