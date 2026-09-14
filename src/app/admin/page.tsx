"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  LogOut,
  MessageSquare,
  ImageIcon,
  Package,
  ShoppingBag,
  TrendingUp,
  Boxes,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

type OrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

type OrderItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
};

type DatabaseOrder = {
  id: number;
  created_at: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  city: string | null;
  zip_code: string | null;
  address: string | null;
  floor: string | null;
  apartment: string | null;
  notes: string | null;
  delivery_method: "delivery" | "pickup";
  delivery_price: number;
  items: OrderItem[];
  cart_count: number;
  subtotal: number;
  total: number;
  status: OrderStatus;
};

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case "new":
      return "חדשה";

    case "processing":
      return "בטיפול";

    case "shipped":
      return "נשלחה";

    case "completed":
      return "הושלמה";

    case "cancelled":
      return "בוטלה";

    default:
      return "חדשה";
  }
}

function getStatusClasses(status: OrderStatus) {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-700";

    case "processing":
      return "bg-yellow-100 text-yellow-700";

    case "shipped":
      return "bg-purple-100 text-purple-700";

    case "completed":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [orders, setOrders] =
    useState<DatabaseOrder[]>([]);

  const [activeProducts, setActiveProducts] =
    useState(0);

  const [lowStockProducts, setLowStockProducts] =
    useState(0);

  const [newContactMessages, setNewContactMessages] =
    useState(0);

  const [authorized, setAuthorized] =
    useState(false);

  const [loaded, setLoaded] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.replace("/admin/login");
        return;
      }

      setAuthorized(true);

      const [
        ordersResult,
        productsResult,
        contactMessagesResult,
      ] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),
        supabase
          .from("products")
          .select("id, stock, active"),
        supabase
          .from("contact_messages")
          .select("id, status")
          .eq("status", "new"),
      ]);

      const { data, error } =
        ordersResult;

      if (!productsResult.error) {
        const products =
          productsResult.data || [];

        setActiveProducts(
          products.filter(
            (product) =>
              product.active === true
          ).length
        );

        setLowStockProducts(
          products.filter(
            (product) =>
              product.active === true &&
              Number(product.stock ?? 0) <= 5
          ).length
        );
      } else {
        console.error(
          "Error loading products:",
          productsResult.error
        );
      }

      if (!contactMessagesResult.error) {
        setNewContactMessages(
          (contactMessagesResult.data || []).length
        );
      } else {
        console.error(
          "Error loading contact messages:",
          contactMessagesResult.error
        );
      }

      if (error) {
        console.error(
          "Error loading orders:",
          error
        );

        setLoadError(
          `לא ניתן לטעון את ההזמנות: ${error.message}`
        );

        setLoaded(true);
        return;
      }

      setOrders(
        (data || []) as DatabaseOrder[]
      );

      setLoaded(true);
    }

    loadDashboard();
  }, [router]);

  const totalOrders =
    orders.length;

  const newOrders =
    orders.filter(
      (order) =>
        order.status === "new"
    ).length;

  const processingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "processing"
    ).length;

  const completedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "completed"
    ).length;

  const revenue = useMemo(() => {
    return orders
      .filter(
        (order) =>
          order.status !==
          "cancelled"
      )
      .reduce(
        (total, order) =>
          total +
          Number(order.total),
        0
      );
  }, [orders]);

  const recentOrders =
    useMemo(() => {
      return orders.slice(0, 5);
    }, [orders]);

  async function logout() {
    await supabase.auth.signOut();

    router.replace(
      "/admin/login"
    );

    router.refresh();
  }

  if (!authorized || !loaded) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-100"
      >
        <div className="mx-auto max-w-7xl px-5 py-16">
          <p>
            טוען מערכת ניהול...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-100 text-black"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-10 flex flex-col gap-5 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium tracking-wide text-gray-500">
              HOME DESIGN ADMIN
            </p>

            <h1 className="text-3xl font-semibold sm:text-4xl">
              לוח בקרה
            </h1>

            <p className="mt-3 text-gray-500">
              סקירה כללית של ההזמנות
              והפעילות באתר.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="border border-gray-300 bg-white px-5 py-3 text-sm font-medium transition hover:bg-neutral-50"
            >
              מעבר לאתר
            </Link>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 border border-black bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <LogOut size={17} />
              התנתקות
            </button>
          </div>
        </div>

        {loadError && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  סך הזמנות
                </p>

                <p className="mt-3 text-3xl font-semibold">
                  {totalOrders}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
                <ShoppingBag
                  size={21}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  הזמנות חדשות
                </p>

                <p className="mt-3 text-3xl font-semibold">
                  {newOrders}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
                <Package
                  size={21}
                  className="text-blue-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  בטיפול
                </p>

                <p className="mt-3 text-3xl font-semibold">
                  {processingOrders}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-50">
                <Clock3
                  size={21}
                  className="text-yellow-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  הושלמו
                </p>

                <p className="mt-3 text-3xl font-semibold">
                  {completedOrders}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2
                  size={21}
                  className="text-green-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  הכנסות
                </p>

                <p className="mt-3 text-3xl font-semibold">
                  ₪
                  {revenue.toLocaleString(
                    "he-IL"
                  )}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50">
                <TrendingUp
                  size={21}
                  className="text-green-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  מוצרים פעילים
                </p>
                <p className="mt-3 text-3xl font-semibold">
                  {activeProducts}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
                <Boxes size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  מלאי נמוך
                </p>
                <p className="mt-3 text-3xl font-semibold">
                  {lowStockProducts}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  5 יחידות ומטה
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50">
                <Package
                  size={21}
                  className="text-orange-700"
                />
              </div>
            </div>
          </div>
          <Link
            href="/admin/contact-messages"
            className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  פניות חדשות
                </p>

                <p className="mt-3 text-3xl font-semibold">
                  {newContactMessages}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  ממתינות לטיפול
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
                <MessageSquare
                  size={21}
                  className="text-blue-700"
                />
              </div>
            </div>
          </Link>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="text-xl font-semibold">
                  הזמנות אחרונות
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  חמש ההזמנות האחרונות באתר.
                </p>
              </div>

              <Link
                href="/orders"
                className="flex items-center gap-2 text-sm font-medium transition hover:text-gray-500"
              >
                כל ההזמנות
                <ArrowLeft size={16} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-10 text-center">
                <Package
                  size={40}
                  className="mx-auto mb-4 text-gray-300"
                  strokeWidth={1.4}
                />

                <p className="font-medium">
                  עדיין אין הזמנות
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  כאשר תבוצע הזמנה,
                  היא תופיע כאן.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map(
                  (order) => (
                    <div
                      key={order.id}
                      className="flex flex-col gap-4 p-5 transition hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                          <Package
                            size={20}
                          />
                        </div>

                        <div>
                          <p className="font-medium">
                            {
                              order.customer_name
                            }
                          </p>

                          <p
                            dir="ltr"
                            className="mt-1 text-right text-xs text-gray-400"
                          >
                            {
                              order.order_number
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {new Date(
                              order.created_at
                            ).toLocaleString(
                              "he-IL"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusClasses(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(
                            order.status
                          )}
                        </span>

                        <span className="font-semibold">
                          ₪
                          {Number(
                            order.total
                          ).toLocaleString(
                            "he-IL"
                          )}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <BarChart3 size={22} />

              <h2 className="text-xl font-semibold">
                ניהול
              </h2>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/orders"
                className="flex w-full items-center justify-between border border-gray-200 px-4 py-4 transition hover:border-black"
              >
                <span className="font-medium">
                  ניהול הזמנות
                </span>

                <ArrowLeft
                  size={17}
                />
              </Link>

              <Link
                href="/admin/products"
                className="flex w-full items-center justify-between border border-gray-200 px-4 py-4 transition hover:border-black"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Boxes size={17} />
                  ניהול מוצרים
                </span>
                <ArrowLeft size={17} />
              </Link>

              <Link
                href="/admin/site-images"
                className="flex w-full items-center justify-between border border-gray-200 px-4 py-4 transition hover:border-black"
              >
                <span className="flex items-center gap-2 font-medium">
                  <ImageIcon size={17} />
                  תמונות האתר
                </span>
                <ArrowLeft size={17} />
              </Link>

              <Link
                href="/admin/contact-messages"
                className="flex w-full items-center justify-between border border-gray-200 px-4 py-4 transition hover:border-black"
              >
                <span className="flex items-center gap-2 font-medium">
                  <MessageSquare size={17} />
                  פניות מלקוחות
                  {newContactMessages > 0 && (
                    <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
                      {newContactMessages}
                    </span>
                  )}
                </span>
                <ArrowLeft size={17} />
              </Link>

              <Link
                href="/admin/shipping"
                className="flex w-full items-center justify-between border border-gray-200 px-4 py-4 transition hover:border-black"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Truck size={17} />
                  ניהול משלוחים
                </span>
                <ArrowLeft size={17} />
              </Link>

              <Link
                href="/"
                className="flex w-full items-center justify-between border border-gray-200 px-4 py-4 transition hover:border-black"
              >
                <span className="font-medium">
                  צפייה בחנות
                </span>

                <ArrowLeft
                  size={17}
                />
              </Link>
            </div>

            <div className="mt-6 rounded-lg bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                Supabase מחובר
              </p>

              <p className="mt-2 text-sm leading-6 text-green-700">
                הנתונים בלוח הבקרה
                נטענים כעת ממסד הנתונים
                האמיתי של Home Design.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}