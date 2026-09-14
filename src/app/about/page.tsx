"use client";

import Link from "next/link";
import {
  HeartHandshake,
  Home,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-white text-black">
      <section className="border-b border-gray-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-20">
          <p className="text-xs font-medium tracking-[0.18em] text-gray-500 sm:text-sm">
            HOME DESIGN
          </p>

          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">
            אודות Home Design
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:mt-5 sm:text-lg sm:leading-8">
            ריהוט, מזרנים ועיצוב לבית — עם דגש על בחירה נוחה,
            שירות אישי והתאמה לבית שלכם.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16">
        <div className="grid gap-7 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              הבית מתחיל בעיצוב
            </h2>

            <div className="mt-4 space-y-4 text-base leading-7 text-gray-600 sm:mt-5 sm:text-lg sm:leading-8">
              <p>
                Home Design היא חנות לריהוט ולעיצוב הבית בטמרה, עם
                מגוון מוצרים שנועדו לעזור לכם ליצור חלל נעים, פרקטי
                ומעוצב.
              </p>

              <p>
                באתר תוכלו להתרשם מפינות אוכל, כיסאות, כורסאות,
                שולחנות, מזרנים ופריטי עיצוב לבית, לבחור מוצרים
                ולבצע הזמנה בצורה פשוטה וברורה.
              </p>

              <p>
                לצד מוצרי המדף, אנחנו מציעים גם ספות בהתאמה אישית,
                עם אפשרות לבחור מידות, בד, צבע ומפרט בהתאם לצרכים
                ולסגנון של הבית.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-50 p-5 sm:rounded-3xl sm:p-8">
            <div className="flex items-center gap-3">
              <MapPin size={21} strokeWidth={1.6} />
              <h2 className="text-lg font-semibold sm:text-xl">
                אולם התצוגה שלנו
              </h2>
            </div>

            <p className="mt-3 text-sm leading-7 text-gray-600 sm:mt-4 sm:text-base">
              מוזמנים להגיע ל־Home Design בטמרה, להתרשם מהמוצרים
              ולקבל ייעוץ אישי.
            </p>

            <a
              href="https://waze.com/ul/hsvc4bt30t"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-black px-6 py-3.5 font-medium text-white transition hover:bg-neutral-800 sm:mt-6 sm:w-auto sm:rounded-none"
            >
              ניווט ב־Waze
            </a>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:mt-14 sm:gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-11 sm:w-11">
              <Home size={20} strokeWidth={1.6} />
            </div>

            <h3 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
              מגוון לבית
            </h3>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              ריהוט, מזרנים ופריטי עיצוב במקום אחד, עם קטגוריות
              ברורות וחוויית קנייה פשוטה.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-11 sm:w-11">
              <Sparkles size={20} strokeWidth={1.6} />
            </div>

            <h3 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
              התאמה אישית
            </h3>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              בספות בהתאמה אישית אפשר לבחור את הפרטים החשובים
              לכם ולבנות פתרון שמתאים לחלל שלכם.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-11 sm:w-11">
              <HeartHandshake size={20} strokeWidth={1.6} />
            </div>

            <h3 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
              שירות אישי
            </h3>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              אפשר לפנות אלינו לפני הרכישה, במהלך ההזמנה וגם לאחריה,
              בטלפון, ב־WhatsApp או דרך האתר.
            </p>
          </div>
        </div>

        <section className="mt-10 rounded-2xl bg-black px-5 py-8 text-white sm:mt-14 sm:rounded-3xl sm:px-10 sm:py-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            רוצים להתייעץ לפני שמחליטים?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
            דברו איתנו ונשמח לעזור לכם לבחור את המוצר או ההתאמה
            שמתאימים לבית שלכם.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:flex sm:flex-row">
            <a
              href="https://wa.me/972505358197"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-medium text-black transition hover:bg-gray-100 sm:rounded-none"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>

            <Link
              href="/#contact"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 px-6 py-3.5 text-center font-medium text-white transition hover:border-white sm:rounded-none"
            >
              יצירת קשר
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
