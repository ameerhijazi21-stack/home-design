"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  PackageCheck,
  Store,
  Truck,
} from "lucide-react";

export default function ShippingPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-white text-black">
      <section className="border-b border-gray-200 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-20">
          <p className="text-xs font-medium tracking-[0.18em] text-gray-500 sm:text-sm">
            HOME DESIGN
          </p>

          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">
            משלוחים ואיסוף עצמי
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:mt-5 sm:text-lg sm:leading-8">
            כל המידע על אפשרויות המשלוח, חישוב העלות ואיסוף עצמי
            מ־Home Design.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16">
        <div className="grid gap-3 sm:gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-11 sm:w-11">
              <Truck size={20} strokeWidth={1.6} />
            </div>

            <h2 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
              משלוחים לכל הארץ
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              אנו מבצעים משלוחים לערים ויישובים ברחבי הארץ.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-11 sm:w-11">
              <MapPin size={20} strokeWidth={1.6} />
            </div>

            <h2 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
              מחיר לפי אזור
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              מחיר המשלוח מחושב לפי העיר שנבחרת במהלך ההזמנה.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 sm:h-11 sm:w-11">
              <Store size={20} strokeWidth={1.6} />
            </div>

            <h2 className="mt-4 text-lg font-semibold sm:mt-5 sm:text-xl">
              איסוף עצמי
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              ניתן לבחור איסוף עצמי מאולם התצוגה של Home Design בטמרה.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4 sm:mt-10 sm:space-y-5">
          <section className="rounded-2xl bg-neutral-50 p-5 sm:p-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <PackageCheck
                size={23}
                strokeWidth={1.6}
                className="mt-0.5 shrink-0 sm:mt-1"
              />

              <div>
                <h2 className="text-lg font-semibold sm:text-xl">
                  איך מחושב המשלוח?
                </h2>

                <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
                  בזמן התשלום בוחרים עיר וכתובת. המערכת מזהה את אזור
                  המשלוח ומציגה את המחיר לפני אישור ההזמנה.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-neutral-50 p-5 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              זמני אספקה
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              זמן האספקה עשוי להשתנות בין מוצר למוצר. זמן האספקה
              הרלוונטי מופיע בעמוד המוצר, ובמקרה הצורך צוות Home Design
              יצור קשר לתיאום.
            </p>
          </section>

          <section className="rounded-2xl bg-neutral-50 p-5 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              מוצרים בהתאמה אישית
            </h2>

            <p className="mt-2 text-sm leading-7 text-gray-600 sm:mt-3 sm:text-base">
              עבור ספות ומוצרים בהתאמה אישית, זמני האספקה וההובלה
              נקבעים בהתאם להזמנה ולתיאום מול הצוות.
            </p>
          </section>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-12 sm:flex sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 font-medium text-white transition hover:bg-neutral-800 sm:rounded-none"
          >
            <ArrowLeft size={17} />
            חזרה לחנות
          </Link>

          <a
            href="https://wa.me/972505358197"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-gray-300 px-6 py-3.5 text-center font-medium transition hover:border-black sm:rounded-none"
          >
            שאלה על משלוח? דברו איתנו
          </a>
        </div>
      </section>
    </main>
  );
}
