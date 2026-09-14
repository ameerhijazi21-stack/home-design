"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "איך יודעים מה מחיר המשלוח?",
    answer:
      "במהלך ההזמנה בוחרים עיר וכתובת, והמערכת מציגה את מחיר המשלוח בהתאם לאזור לפני אישור ההזמנה.",
  },
  {
    question: "האם אתם עושים משלוחים לכל הארץ?",
    answer:
      "כן. Home Design מבצעת משלוחים לערים ויישובים ברחבי הארץ, בהתאם לאזורי המשלוח המוגדרים במערכת.",
  },
  {
    question: "אפשר לבחור איסוף עצמי?",
    answer:
      "כן. ניתן לבחור איסוף עצמי מאולם התצוגה של Home Design בטמרה. לאחר ההזמנה מומלץ להמתין לאישור שהמוצר מוכן לאיסוף.",
  },
  {
    question: "כמה זמן לוקח לקבל הזמנה?",
    answer:
      "זמן האספקה משתנה לפי המוצר. בעמוד כל מוצר מופיע זמן אספקה משוער, ובמקרה הצורך צוות Home Design יצור קשר לתיאום.",
  },
  {
    question: "איך מזמינים ספה בהתאמה אישית?",
    answer:
      "ספות בהתאמה אישית אינן נמכרות כמוצר רגיל בסל. בוחרים מידות, בד, צבע ומבנה בתיאום עם הצוות, ולאחר מכן מקבלים הצעה והמשך טיפול.",
  },
  {
    question: "אפשר לראות את המוצרים לפני שקונים?",
    answer:
      "כן. אפשר להגיע לאולם התצוגה של Home Design בטמרה. מומלץ ליצור קשר מראש אם אתם מחפשים מוצר מסוים.",
  },
  {
    question: "מה עושים אם קיבלתי מוצר פגום או לא נכון?",
    answer:
      "צרו איתנו קשר בהקדם עם מספר ההזמנה ותמונות של המוצר. נבדוק את הפנייה ונעדכן אתכם בהמשך הטיפול.",
  },
  {
    question: "איך מבקשים החלפה או החזרה?",
    answer:
      "אפשר לפנות אלינו בטלפון או ב-WhatsApp עם פרטי ההזמנה. הבקשה תיבדק לפי סוג המוצר, מצבו ותנאי העסקה, ובהתאם לדין החל.",
  },
  {
    question: "אפשר לשמור מוצר למועדפים?",
    answer:
      "כן. לחצו על סמל הלב בכרטיס המוצר או בעמוד המוצר. המוצר יישמר בעמוד המועדפים שלכם בדפדפן.",
  },
  {
    question: "איך יוצרים קשר עם Home Design?",
    answer:
      "אפשר ליצור קשר דרך טופס הפנייה באתר, בטלפון 050-535-8197 או ב-WhatsApp.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main dir="rtl" className="min-h-screen bg-white text-black">
      <section className="border-b border-gray-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-20">
          <p className="text-xs font-medium tracking-[0.18em] text-gray-500 sm:text-sm">
            HOME DESIGN
          </p>

          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">
            שאלות נפוצות
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:mt-5 sm:text-lg sm:leading-8">
            ריכזנו תשובות לשאלות הנפוצות ביותר על הזמנות, משלוחים,
            איסוף עצמי, מוצרים והתאמות אישיות.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-16">
        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-4 text-right sm:gap-5 sm:px-6 sm:py-5"
                >
                  <span className="text-sm font-medium leading-6 sm:text-lg">
                    {item.question}
                  </span>

                  <ChevronDown
                    size={20}
                    strokeWidth={1.6}
                    className={`shrink-0 transition duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 px-4 py-4 text-sm leading-7 text-gray-600 sm:px-6 sm:py-5 sm:text-base">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl bg-neutral-50 p-5 sm:mt-12 sm:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white sm:h-11 sm:w-11">
              <HelpCircle size={20} strokeWidth={1.6} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold sm:text-xl">
                לא מצאתם תשובה?
              </h2>

              <p className="mt-2 text-sm leading-7 text-gray-600 sm:text-base">
                אפשר לפנות אלינו ונשמח לעזור באופן אישי.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:flex sm:flex-row">
                <a
                  href="https://wa.me/972505358197"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 font-medium text-white transition hover:bg-neutral-800 sm:rounded-none"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>

                <Link
                  href="/#contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 px-6 py-3.5 text-center font-medium transition hover:border-black sm:rounded-none"
                >
                  טופס יצירת קשר
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
