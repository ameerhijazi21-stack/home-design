"use client";

import Link from "next/link";
import {
  Database,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

export default function PrivacyPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-white text-black">
      <section className="border-b border-gray-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
          <p className="text-sm font-medium tracking-[0.18em] text-gray-500">
            HOME DESIGN
          </p>

          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
            מדיניות פרטיות
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            כאן תוכלו לקרוא איזה מידע עשוי להימסר דרך האתר, למה הוא
            משמש ואיך אפשר לפנות אלינו בנוגע לפרטיות.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
              <Database size={21} strokeWidth={1.6} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">מידע שאתם מוסרים</h2>

            <p className="mt-3 leading-7 text-gray-600">
              בעת יצירת קשר או ביצוע הזמנה, ייתכן שתמסרו פרטים כמו שם,
              טלפון, כתובת ופרטי ההזמנה.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
              <UserRoundCheck size={21} strokeWidth={1.6} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">למה משתמשים במידע</h2>

            <p className="mt-3 leading-7 text-gray-600">
              המידע משמש לצורך טיפול בפניות, ביצוע הזמנות, תיאום משלוחים
              ושירות לקוחות.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
              <ShieldCheck size={21} strokeWidth={1.6} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">שמירה על המידע</h2>

            <p className="mt-3 leading-7 text-gray-600">
              אנו שואפים לנקוט אמצעים סבירים כדי לשמור על המידע שנמסר
              דרך האתר ולצמצם גישה שאינה מורשית.
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-5">
          <section className="rounded-2xl bg-neutral-50 p-6 sm:p-8">
            <h2 className="text-xl font-semibold">איזה מידע עשוי להיאסף?</h2>

            <div className="mt-4 space-y-3 leading-7 text-gray-600">
              <p>
                בעת שליחת טופס יצירת קשר, האתר עשוי לשמור את השם,
                מספר הטלפון, נושא הפנייה ותוכן ההודעה.
              </p>

              <p>
                בעת ביצוע הזמנה, האתר עשוי לשמור פרטי לקוח, פרטי משלוח,
                פריטים שהוזמנו, סכומים וסטטוס ההזמנה.
              </p>

              <p>
                מידע מקומי כמו סל קניות ומועדפים עשוי להישמר בדפדפן
                שלכם כדי לשפר את חוויית השימוש באתר.
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-neutral-50 p-6 sm:p-8">
            <h2 className="text-xl font-semibold">שימוש במידע</h2>

            <p className="mt-3 leading-7 text-gray-600">
              אנו עשויים להשתמש במידע לצורך מענה לפניות, טיפול בהזמנות,
              תיאום משלוחים ואיסוף עצמי, יצירת קשר בנוגע להזמנה,
              שירות לקוחות ושיפור תפעול האתר.
            </p>
          </section>

          <section className="rounded-2xl bg-neutral-50 p-6 sm:p-8">
            <h2 className="text-xl font-semibold">מסירת מידע לצדדים שלישיים</h2>

            <p className="mt-3 leading-7 text-gray-600">
              במקרים שבהם הדבר נחוץ לצורך השלמת השירות, ייתכן שמידע
              רלוונטי יועבר לספקים המסייעים בתפעול האתר, באחסון מידע,
              במשלוחים או בשירותים טכנולוגיים. המידע יימסר רק במידה
              הנדרשת לצורך מתן השירות.
            </p>
          </section>

          <section className="rounded-2xl bg-neutral-50 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <LockKeyhole
                size={23}
                strokeWidth={1.6}
                className="mt-1 shrink-0"
              />

              <div>
                <h2 className="text-xl font-semibold">אבטחת מידע</h2>

                <p className="mt-3 leading-7 text-gray-600">
                  אין מערכת אינטרנטית שמבטיחה אבטחה מוחלטת, אך אנו
                  משתדלים להשתמש באמצעים סבירים ומקובלים לשמירה על
                  המידע ולצמצום סיכונים.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-neutral-50 p-6 sm:p-8">
            <h2 className="text-xl font-semibold">בקשות בנוגע למידע</h2>

            <p className="mt-3 leading-7 text-gray-600">
              אם תרצו לפנות אלינו בנוגע למידע שמסרתם, לעדכון פרטים או
              לשאלה בנושא פרטיות, אפשר ליצור קשר בטלפון או ב־WhatsApp.
            </p>
          </section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            מדיניות זו היא נוסח בסיסי לאתר ונועדה לשקף את אופן הפעילות
            הנוכחי. לפני פרסום האתר לציבור מומלץ לבצע התאמה משפטית מלאה
            לפי אופן הפעילות בפועל והשירותים שיחוברו לאתר.
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <a
            href="https://wa.me/972505358197"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-black px-6 py-3.5 font-medium text-white transition hover:bg-neutral-800"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>

          <a
            href="tel:0505358197"
            className="inline-flex items-center justify-center border border-gray-300 px-6 py-3.5 font-medium transition hover:border-black"
          >
            050-535-8197
          </a>

          <Link
            href="/"
            className="inline-flex items-center justify-center border border-gray-300 px-6 py-3.5 font-medium transition hover:border-black"
          >
            חזרה לחנות
          </Link>
        </div>
      </section>
    </main>
  );
}
