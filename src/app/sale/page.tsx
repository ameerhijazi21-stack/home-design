import Link from "next/link";

import ProductCard from "../../components/ProductCard";
import { getSaleProducts } from "../../lib/products";

export default async function SalePage() {
  const products = await getSaleProducts();

  return (
    <main dir="rtl" className="min-h-screen bg-white text-black">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <Link href="/">
            <img
              src="/images/new logo.png"
              alt="Home Design"
              className="h-12 w-auto object-contain sm:h-16"
            />
          </Link>

          <Link
            href="/cart"
            className="shrink-0 text-sm font-medium transition hover:text-gray-500"
          >
            לסל הקניות
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-3 text-xs text-gray-500 sm:px-6 sm:py-5 sm:text-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="transition hover:text-black">
            דף הבית
          </Link>

          <span>/</span>

          <span className="text-black">SALE</span>
        </div>
      </div>

      <section className="border-y border-gray-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 sm:py-16">
          <p className="mb-2 text-xs font-medium tracking-widest text-gray-500 sm:mb-3 sm:text-sm">
            HOME DESIGN
          </p>

          <h1 className="text-3xl font-semibold sm:text-5xl">
            SALE
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:mt-4 sm:text-base sm:leading-7">
            מבצעים והנחות על מוצרים נבחרים לבית.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
            <h2 className="text-xl font-semibold sm:text-2xl">
              מוצרים במבצע
            </h2>

            <p className="shrink-0 text-xs text-gray-500 sm:text-sm">
              {products.length} מוצרים
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-neutral-50 px-5 py-12 text-center sm:px-6 sm:py-16">
              <h3 className="text-lg font-semibold sm:text-xl">
                אין כרגע מוצרים במבצע
              </h3>

              <p className="mt-3 text-sm text-gray-500 sm:text-base">
                מבצעים חדשים יתווספו בהמשך.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-black px-7 py-3 font-medium text-white transition hover:bg-gray-800 sm:rounded-none"
              >
                חזרה לדף הבית
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
