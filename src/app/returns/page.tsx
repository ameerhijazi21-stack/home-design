"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  PackageX,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

export default function ReturnsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-white text-black">
      <section className="border-b border-gray-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-20">
          <p className="text-xs font-medium tracking-[0.18em] text-gray-500 sm:text-sm">
            HOME DESIGN
          </p>

          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">
            החזרות והחלפות
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:mt-5 sm:text-lg sm:leading-8">
            אנחנו רוצים שתהיו מרוצים מהרכישה. כאן תוכלו לקרוא איך לפנות
            אלינו במקרה של החלפה, החזרה או בעיה במוצר.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16">
        <div className="grid gap-3 sm:gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-11 sm:w-11">
              <RefreshCcw size={20} strokeWidth={1.6} />
            </div>

            <h2 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
              בקשת החלפה
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              במקרה שתרצו לבדוק אפשרות להחלפת מוצר, צרו איתנו קשר עם
              פרטי ההזמנה ונשמח לבדוק את האפשרויות הזמינות.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-11 sm:w-11">
              <PackageX size={20} strokeWidth={1.6} />
            </div>

            <h2 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
              בקשת החזרה
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              בקשות להחזרה נבדקות בהתאם לסוג המוצר, מצבו ותנאי העסקה,
              ובהתאם להוראות הדין החלות.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-11 sm:w-11">
              <ShieldCheck size={20} strokeWidth={1.6} />
            </div>

            <h2 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
              מוצר פגום או שגוי
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              אם קיבלתם מוצר פגום, לא תקין או שונה מהמוצר שהוזמן,
              פנו אלינו בהקדם עם תמונות ופרטי ההזמנה.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4 sm:mt-10 sm:space-y-5">
          <section className="rounded-2xl bg-neutral-50 p-5 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              לפני שפונים אלינו
            </h2>

            <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-1 shrink-0"
                  strokeWidth={1.6}
                />
                <p className="text-sm leading-7 text-gray-600 sm:text-base">
                  הכינו את מספר ההזמנה או את פרטי הרכישה.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-1 shrink-0"
                  strokeWidth={1.6}
                />
                <p className="text-sm leading-7 text-gray-600 sm:text-base">
                  שמרו את המוצר, האריזה והאביזרים במצבם ככל האפשר.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-1 shrink-0"
                  strokeWidth={1.6}
                />
                <p className="text-sm leading-7 text-gray-600 sm:text-base">
                  במקרה של נזק או פגם, מומלץ לצרף תמונות ברורות.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-neutral-50 p-5 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              מוצרים בהתאמה אישית
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              מוצרים שהוזמנו בהתאמה אישית, לרבות ספות שיוצרו לפי מידה,
              בד, צבע או מפרט שנבחר במיוחד עבור הלקוח, עשויים להיות
              כפופים לתנאים שונים ממוצרי מדף רגילים.
            </p>
          </section>

          <section className="rounded-2xl bg-neutral-50 p-5 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              איך פונים?
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              הדרך המהירה ביותר היא ליצור קשר עם Home Design בטלפון או
              ב־WhatsApp. צוות החנות יבדוק את הפנייה ויחזור אליכם עם
              המשך הטיפול המתאים.
            </p>
          </section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 sm:p-5">
            המידע בעמוד זה הוא מידע שירותי כללי. התנאים המחייבים של
            ביטול עסקה, החזרה והחלפה יופיעו בתקנון האתר ובהתאם לדין החל.
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-12 sm:flex sm:flex-row sm:flex-wrap">
          <a
            href="https://wa.me/972505358197"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-black px-6 py-3.5 text-center font-medium text-white transition hover:bg-neutral-800 sm:rounded-none"
          >
            פנייה ב־WhatsApp
          </a>

          <a
            href="tel:0505358197"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 px-6 py-3.5 text-center font-medium transition hover:border-black sm:rounded-none"
          >
            התקשרו אלינו: 050-535-8197
          </a>

          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3.5 text-center font-medium transition hover:border-black sm:rounded-none"
          >
            <ArrowLeft size={17} />
            חזרה לחנות
          </Link>
        </div>
      </section>
    </main>
  );
}
