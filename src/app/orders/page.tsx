"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  CreditCard,
  CircleDollarSign,
  Clock3,
  TrendingUp,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

type OrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded";
type PaymentMethod = "online" | "cash";

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
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus | null;
  payment_transaction_id: string | null;
  paid_at: string | null;
};

const statusOptions: {
  value: OrderStatus;
  label: string;
}[] = [
  {
    value: "new",
    label: "חדשה",
  },
  {
    value: "processing",
    label: "בטיפול",
  },
  {
    value: "shipped",
    label: "נשלחה",
  },
  {
    value: "completed",
    label: "הושלמה",
  },
  {
    value: "cancelled",
    label: "בוטלה",
  },
];

function getStatusLabel(status: OrderStatus) {
  const found = statusOptions.find(
    (item) => item.value === status
  );

  return found?.label || "חדשה";
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

const paymentStatusOptions: { value: PaymentStatus; label: string }[] = [
  { value: "pending", label: "ממתין לתשלום" },
  { value: "paid", label: "שולם" },
  { value: "failed", label: "נכשל" },
  { value: "cancelled", label: "בוטל" },
  { value: "refunded", label: "הוחזר" },
];

function getPaymentStatusLabel(status: PaymentStatus | null) {
  return paymentStatusOptions.find((item) => item.value === status)?.label || "ממתין לתשלום";
}

function getPaymentStatusClasses(status: PaymentStatus | null) {
  switch (status) {
    case "paid": return "bg-green-100 text-green-700";
    case "failed": return "bg-red-100 text-red-700";
    case "cancelled": return "bg-gray-200 text-gray-700";
    case "refunded": return "bg-purple-100 text-purple-700";
    default: return "bg-orange-100 text-orange-700";
  }
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<DatabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  const [updatingOrderId, setUpdatingOrderId] =
    useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | OrderStatus>("all");
  const [paymentFilter, setPaymentFilter] =
    useState<"all" | PaymentStatus>("all");

  useEffect(() => {
    async function initialize() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.replace("/admin/login");
        return;
      }

      setAuthorized(true);

      await loadOrders();
    }

    initialize();
  }, [router]);

  async function loadOrders() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Error loading orders:", error);

      setError(
        `לא ניתן לטעון את ההזמנות: ${error.message}`
      );

      setLoading(false);

      return;
    }

    setOrders((data || []) as DatabaseOrder[]);

    setLoading(false);
  }

  async function updateOrderStatus(
    orderId: number,
    newStatus: OrderStatus
  ) {
    setUpdatingOrderId(orderId);
    setError("");

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order:", error);

      setError(
        `לא ניתן לעדכן את ההזמנה: ${error.message}`
      );

      setUpdatingOrderId(null);

      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order
      )
    );

    setUpdatingOrderId(null);
  }

  async function updatePaymentStatus(orderId: number, newStatus: PaymentStatus) {
    setUpdatingOrderId(orderId);
    setError("");
    const paidAt = newStatus === "paid" ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: newStatus, paid_at: paidAt })
      .eq("id", orderId);

    if (error) {
      setError(`לא ניתן לעדכן את סטטוס התשלום: ${error.message}`);
      setUpdatingOrderId(null);
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, payment_status: newStatus, paid_at: paidAt }
          : order
      )
    );
    setUpdatingOrderId(null);
  }

  async function deleteOrder(
    orderId: number,
    orderNumber: string
  ) {
    const confirmed = window.confirm(
      `האם אתה בטוח שברצונך למחוק את ההזמנה ${orderNumber}?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingOrderId(orderId);
    setError("");

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.error("Error deleting order:", error);

      setError(
        `לא ניתן למחוק את ההזמנה: ${error.message}`
      );

      setUpdatingOrderId(null);

      return;
    }

    setOrders((currentOrders) =>
      currentOrders.filter(
        (order) => order.id !== orderId
      )
    );

    setUpdatingOrderId(null);
  }

  async function logout() {
    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm
      .toLowerCase()
      .trim();

    const orderNumber =
      order.order_number?.toLowerCase() || "";

    const customerName =
      order.customer_name?.toLowerCase() || "";

    const customerPhone =
      order.customer_phone?.toLowerCase() || "";

    const customerEmail =
      order.customer_email?.toLowerCase() || "";

    const matchesSearch =
      search === "" ||
      orderNumber.includes(search) ||
      customerName.includes(search) ||
      customerPhone.includes(search) ||
      customerEmail.includes(search);

    const matchesStatus =
      statusFilter === "all" ||
      order.status === statusFilter;

    const matchesPayment =
      paymentFilter === "all" ||
      (order.payment_status || "pending") === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const newOrdersCount = orders.filter((o) => o.status === "new").length;
  const processingOrdersCount = orders.filter((o) => o.status === "processing").length;
  const pendingPaymentsCount = orders.filter(
    (o) => (o.payment_status || "pending") === "pending"
  ).length;
  const paidRevenue = orders
    .filter((o) => o.payment_status === "paid" && o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  if (!authorized) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-100"
      >
        <div className="mx-auto max-w-7xl px-5 py-16">
          <div className="flex items-center gap-3">
            <Loader2
              size={22}
              className="animate-spin"
            />

            <p>בודק הרשאות...</p>
          </div>
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
        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 border-b border-gray-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium tracking-wide text-gray-500">
              HOME DESIGN ADMIN
            </p>

            <h1 className="text-3xl font-semibold sm:text-4xl">
              ניהול הזמנות
            </h1>

            <p className="mt-3 text-gray-500">
              צפייה, חיפוש, סינון וניהול ההזמנות
              של החנות.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center gap-2 border border-gray-300 bg-white px-5 py-3 text-sm font-medium transition hover:bg-neutral-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              רענון
            </button>

            <Link
              href="/admin"
              className="flex items-center gap-2 border border-gray-300 bg-white px-5 py-3 text-sm font-medium transition hover:bg-neutral-50"
            >
              <ArrowRight size={17} />

              לוח בקרה
            </Link>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <LogOut size={17} />

              התנתקות
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["הזמנות חדשות", newOrdersCount, Package],
            ["בטיפול", processingOrdersCount, Clock3],
            ["ממתינות לתשלום", pendingPaymentsCount, CircleDollarSign],
          ].map(([label, value, Icon]: any) => (
            <div key={label} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <Icon size={20} className="text-gray-400" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{value}</p>
            </div>
          ))}
          <div className="rounded-xl bg-black p-5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">הכנסות ששולמו</span>
              <TrendingUp size={20} className="text-gray-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold">₪{paidRevenue.toLocaleString("he-IL")}</p>
          </div>
        </div>

        {/* SEARCH + FILTER */}

        <div className="mb-7 grid grid-cols-1 gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-[1fr_220px_220px]">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              חיפוש הזמנה
            </label>

            <div className="relative">
              <Search
                size={19}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="מספר הזמנה, שם, טלפון או אימייל..."
                className="w-full border border-gray-300 py-3 pl-4 pr-11 outline-none transition focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">
              סינון לפי סטטוס
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "all"
                    | OrderStatus
                )
              }
              className="w-full border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
            >
              <option value="all">
                כל ההזמנות
              </option>

              <option value="new">
                חדשה
              </option>

              <option value="processing">
                בטיפול
              </option>

              <option value="shipped">
                נשלחה
              </option>

              <option value="completed">
                הושלמה
              </option>

              <option value="cancelled">
                בוטלה
              </option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-600">סינון לפי תשלום</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as "all" | PaymentStatus)}
              className="w-full border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black"
            >
              <option value="all">כל התשלומים</option>
              {paymentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* RESULTS COUNT */}

        {!loading && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              נמצאו{" "}
              <span className="font-semibold text-black">
                {filteredOrders.length}
              </span>{" "}
              הזמנות
            </p>

            {(searchTerm ||
              (statusFilter !== "all" || paymentFilter !== "all")) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPaymentFilter("all");
                }}
                className="text-sm font-medium text-gray-500 underline underline-offset-4 transition hover:text-black"
              >
                איפוס חיפוש וסינון
              </button>
            )}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-7 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="rounded-xl bg-white p-14 text-center shadow-sm">
            <Loader2
              size={36}
              className="mx-auto mb-4 animate-spin"
            />

            <p className="text-gray-500">
              טוען הזמנות...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl bg-white p-14 text-center shadow-sm">
            <Package
              size={48}
              strokeWidth={1.4}
              className="mx-auto mb-5 text-gray-400"
            />

            <h2 className="text-2xl font-semibold">
              לא נמצאו הזמנות
            </h2>

            <p className="mt-3 text-gray-500">
              נסה לשנות את החיפוש או את הסינון.
            </p>

            {(searchTerm ||
              (statusFilter !== "all" || paymentFilter !== "all")) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPaymentFilter("all");
                }}
                className="mt-6 bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                הצג את כל ההזמנות
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-7">
            {filteredOrders.map((order) => {
              const isUpdating =
                updatingOrderId === order.id;

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-xl bg-white shadow-sm"
                >
                  {/* ORDER TOP */}

                  <div className="flex flex-col gap-5 border-b border-gray-200 bg-neutral-50 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2
                          dir="ltr"
                          className="text-left text-lg font-semibold"
                        >
                          {order.order_number}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusClasses(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(
                            order.status
                          )}
                        </span>
                        <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${getPaymentStatusClasses(order.payment_status)}`}>
                          {getPaymentStatusLabel(order.payment_status)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {new Date(
                          order.created_at
                        ).toLocaleString("he-IL")}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Link
                        href={`/orders/${order.id}`}
                        className="flex items-center justify-center gap-2 bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                      >
                        <Eye size={17} />

                        צפייה בהזמנה

                        <ArrowLeft size={15} />
                      </Link>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-500">
                          סטטוס:
                        </label>

                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) =>
                            updateOrderStatus(
                              order.id,
                              e.target
                                .value as OrderStatus
                            )
                          }
                          className="min-w-40 border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-black disabled:opacity-50"
                        >
                          {statusOptions.map(
                            (option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            )
                          )}
                        </select>

                        {isUpdating && (
                          <Loader2
                            size={19}
                            className="animate-spin"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ORDER BODY */}

                  <div className="grid grid-cols-1 gap-8 p-5 sm:p-6 xl:grid-cols-[1fr_360px]">
                    {/* PRODUCTS */}

                    <section>
                      <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">
                          מוצרים
                        </h3>

                        <span className="text-sm text-gray-500">
                          {order.cart_count} פריטים
                        </span>
                      </div>

                      <div className="space-y-4">
                        {order.items?.map(
                          (item, index) => (
                            <div
                              key={`${item.productId}-${index}`}
                              className="flex gap-4 border-b border-gray-100 pb-4 last:border-0"
                            >
                              <div className="h-24 w-24 shrink-0 overflow-hidden bg-neutral-100">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Package
                                      size={24}
                                      className="text-gray-400"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex min-w-0 flex-1 justify-between gap-4">
                                <div>
                                  <Link
                                    href={`/products/${item.slug}`}
                                    className="font-medium transition hover:text-gray-500"
                                  >
                                    {item.name}
                                  </Link>

                                  <p className="mt-1 text-sm text-gray-500">
                                    כמות:{" "}
                                    {item.quantity}
                                  </p>

                                  {item.sku && (
                                    <p className="mt-1 text-xs text-gray-400">
                                      מק״ט:{" "}
                                      {item.sku}
                                    </p>
                                  )}

                                  <p className="mt-1 text-xs text-gray-400">
                                    מחיר ליחידה: ₪
                                    {Number(
                                      item.price
                                    ).toLocaleString(
                                      "he-IL"
                                    )}
                                  </p>
                                </div>

                                <p className="shrink-0 font-semibold">
                                  ₪
                                  {(
                                    Number(
                                      item.price
                                    ) *
                                    item.quantity
                                  ).toLocaleString(
                                    "he-IL"
                                  )}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </section>

                    {/* CUSTOMER */}

                    <aside className="space-y-5">
                      <div className="rounded-xl bg-neutral-100 p-5">
                        <h3 className="mb-5 text-lg font-semibold">
                          פרטי לקוח
                        </h3>

                        <div className="space-y-4 text-sm">
                          <div className="flex items-start gap-3">
                            <User
                              size={18}
                              className="mt-0.5 shrink-0 text-gray-500"
                            />

                            <div>
                              <p className="text-xs text-gray-500">
                                שם
                              </p>

                              <p className="mt-1 font-medium">
                                {
                                  order.customer_name
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone
                              size={18}
                              className="mt-0.5 shrink-0 text-gray-500"
                            />

                            <div>
                              <p className="text-xs text-gray-500">
                                טלפון
                              </p>

                              <a
                                dir="ltr"
                                href={`tel:${order.customer_phone}`}
                                className="mt-1 block text-right font-medium hover:underline"
                              >
                                {
                                  order.customer_phone
                                }
                              </a>
                            </div>
                          </div>

                          {order.customer_email && (
                            <div className="flex items-start gap-3">
                              <Mail
                                size={18}
                                className="mt-0.5 shrink-0 text-gray-500"
                              />

                              <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                  אימייל
                                </p>

                                <a
                                  dir="ltr"
                                  href={`mailto:${order.customer_email}`}
                                  className="mt-1 block break-all text-right font-medium hover:underline"
                                >
                                  {
                                    order.customer_email
                                  }
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* DELIVERY */}

                      <div className="rounded-xl border border-gray-200 p-5">
                        <div className="mb-4 flex items-center gap-3">
                          {order.delivery_method ===
                          "delivery" ? (
                            <Truck size={20} />
                          ) : (
                            <Package size={20} />
                          )}

                          <h3 className="font-semibold">
                            {order.delivery_method ===
                            "delivery"
                              ? "משלוח עד הבית"
                              : "איסוף עצמי"}
                          </h3>
                        </div>

                        {order.delivery_method ===
                          "delivery" && (
                          <div className="flex items-start gap-3 text-sm">
                            <MapPin
                              size={18}
                              className="mt-0.5 shrink-0 text-gray-500"
                            />

                            <div className="leading-6">
                              {order.address && (
                                <p>
                                  {order.address}
                                </p>
                              )}

                              {order.city && (
                                <p>{order.city}</p>
                              )}

                              {(order.floor ||
                                order.apartment) && (
                                <p className="text-gray-500">
                                  קומה:{" "}
                                  {order.floor ||
                                    "-"}
                                  {" | "}
                                  דירה:{" "}
                                  {order.apartment ||
                                    "-"}
                                </p>
                              )}

                              {order.zip_code && (
                                <p className="text-gray-500">
                                  מיקוד:{" "}
                                  {
                                    order.zip_code
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {order.delivery_method ===
                          "pickup" && (
                          <p className="text-sm text-gray-500">
                            הלקוח בחר באיסוף
                            עצמי.
                          </p>
                        )}
                      </div>

                      {/* NOTES */}

                      {order.notes && (
                        <div className="rounded-xl border border-gray-200 p-5">
                          <h3 className="mb-3 font-semibold">
                            הערות להזמנה
                          </h3>

                          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                            {order.notes}
                          </p>
                        </div>
                      )}

                      {/* PAYMENT */}
                      <div className="rounded-xl border border-gray-200 p-5">
                        <div className="mb-4 flex items-center gap-3">
                          <CreditCard size={20} />
                          <h3 className="font-semibold">תשלום</h3>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-500">אמצעי תשלום</span>
                            <span className="font-medium">אונליין</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-500">סטטוס</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusClasses(order.payment_status)}`}>
                              {getPaymentStatusLabel(order.payment_status)}
                            </span>
                          </div>
                          {order.payment_transaction_id && (
                            <div className="flex justify-between gap-3">
                              <span className="text-gray-500">מספר עסקה</span>
                              <span dir="ltr">{order.payment_transaction_id}</span>
                            </div>
                          )}
                          {order.paid_at && (
                            <div className="flex justify-between gap-3">
                              <span className="text-gray-500">שולם בתאריך</span>
                              <span>{new Date(order.paid_at).toLocaleString("he-IL")}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 pt-3">
                            <label className="mb-2 block text-xs font-medium text-gray-500">עדכון סטטוס תשלום</label>
                            <select
                              value={order.payment_status || "pending"}
                              disabled={isUpdating}
                              onChange={(e) => updatePaymentStatus(order.id, e.target.value as PaymentStatus)}
                              className="w-full border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-black disabled:opacity-50"
                            >
                              {paymentStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* TOTAL */}

                      <div className="rounded-xl bg-black p-5 text-white">
                        <h3 className="mb-5 text-lg font-semibold">
                          סיכום כספי
                        </h3>

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between text-gray-300">
                            <span>
                              סכום ביניים
                            </span>

                            <span>
                              ₪
                              {Number(
                                order.subtotal
                              ).toLocaleString(
                                "he-IL"
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between text-gray-300">
                            <span>
                              משלוח
                            </span>

                            <span>
                              {Number(
                                order.delivery_price
                              ) === 0
                                ? "חינם"
                                : `₪${Number(
                                    order.delivery_price
                                  ).toLocaleString(
                                    "he-IL"
                                  )}`}
                            </span>
                          </div>

                          <div className="border-t border-gray-700 pt-4">
                            <div className="flex items-center justify-between text-xl font-semibold">
                              <span>
                                סה״כ
                              </span>

                              <span>
                                ₪
                                {Number(
                                  order.total
                                ).toLocaleString(
                                  "he-IL"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="grid grid-cols-1 gap-3">
                        <Link
                          href={`/orders/${order.id}`}
                          className="flex w-full items-center justify-center gap-2 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                          <Eye size={17} />

                          צפייה בפרטי ההזמנה
                        </Link>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            deleteOrder(
                              order.id,
                              order.order_number
                            )
                          }
                          className="flex w-full items-center justify-center gap-2 border border-red-200 bg-white px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={17} />

                          מחיקת הזמנה
                        </button>
                      </div>
                    </aside>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}