"use client";

import Link from "next/link";
import {
  Accessibility,
  Eye,
  Keyboard,
  MessageCircle,
  MousePointer2,
} from "lucide-react";

export default function AccessibilityPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-white text-black">
      <section className="border-b border-gray-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-20">
          <p className="text-xs font-medium tracking-[0.18em] text-gray-500 sm:text-sm">
            HOME DESIGN
          </p>

          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">
            הצהרת נגישות
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:mt-5 sm:text-lg sm:leading-8">
            Home Design פועלת לשיפור חוויית השימוש באתר ולמתן שירות
            נגיש ככל האפשר לכלל המשתמשים.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16">
        <div className="grid gap-3 sm:gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-11 sm:w-11">
              <Keyboard size={20} strokeWidth={1.6} />
            </div>

            <h2 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
              ניווט ברור
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              אנו משתדלים לשמור על מבנה עמודים ברור, כותרות מסודרות
              וקישורים שקל לזהות ולהשתמש בהם.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-11 sm:w-11">
              <Eye size={20} strokeWidth={1.6} />
            </div>

            <h2 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
              קריאות וניגודיות
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              האתר מעוצב עם טקסט קריא, היררכיה ברורה וניגודיות חזותית
              שמטרתה להקל על השימוש.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-11 sm:w-11">
              <MousePointer2 size={20} strokeWidth={1.6} />
            </div>

            <h2 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
              שימוש פשוט
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              אנו שואפים לשמור על טפסים, כפתורים ותהליכי רכישה פשוטים
              וברורים ככל האפשר.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4 sm:mt-10 sm:space-y-5">
          <section className="rounded-2xl bg-neutral-50 p-5 sm:p-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <Accessibility
                size={22}
                strokeWidth={1.6}
                className="mt-0.5 shrink-0 sm:mt-1"
              />

              <div>
                <h2 className="text-lg font-semibold sm:text-xl">
                  התאמות באתר
                </h2>

                <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
                  במסגרת פיתוח האתר אנו משתדלים להשתמש במבנה סמנטי,
                  טקסטים ברורים, כפתורים מזוהים, תמיכה בתצוגות שונות
                  והתאמה לשימוש במחשב ובמכשירים ניידים.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-neutral-50 p-5 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              עדיין עובדים על שיפור הנגישות
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              האתר נמצא בתהליך פיתוח ושיפור מתמשך. אם נתקלתם ברכיב,
              עמוד או פעולה שאינם נגישים עבורכם, נשמח לקבל דיווח כדי
              שנוכל לבדוק ולשפר.
            </p>
          </section>

          <section className="rounded-2xl bg-neutral-50 p-5 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              נגישות באולם התצוגה
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              לפרטים מדויקים בנוגע להסדרי נגישות פיזיים באולם התצוגה
              בטמרה, מומלץ ליצור איתנו קשר מראש לפני ההגעה.
            </p>
          </section>

          <section className="rounded-2xl bg-neutral-50 p-5 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              פנייה בנושא נגישות
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              אם מצאתם בעיית נגישות באתר או שאתם זקוקים לעזרה בקבלת
              מידע או בביצוע פעולה, אפשר לפנות אלינו בטלפון או
              ב־WhatsApp.
            </p>
          </section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 sm:p-5">
            זו הצהרת נגישות בסיסית המתאימה למצב הנוכחי של האתר. לפני
            פרסום מסחרי מלא מומלץ להשלים בדיקת נגישות בפועל ולעדכן את
            ההצהרה בהתאם להתאמות שבוצעו ולפרטי רכז הנגישות, ככל שנדרש.
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-12 sm:flex sm:flex-row sm:flex-wrap">
          <a
            href="https://wa.me/972505358197"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-center font-medium text-white transition hover:bg-neutral-800 sm:rounded-none"
          >
            <MessageCircle size={18} />
            פנייה ב־WhatsApp
          </a>

          <a
            href="tel:0505358197"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 px-6 py-3.5 text-center font-medium transition hover:border-black sm:rounded-none"
          >
            050-535-8197
          </a>

          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 px-6 py-3.5 text-center font-medium transition hover:border-black sm:rounded-none"
          >
            חזרה לחנות
          </Link>
        </div>
      </section>
    </main>
  );
}
