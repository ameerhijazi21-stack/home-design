"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import {
  ArrowRight,
  CreditCard,
  CircleDollarSign,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import { supabase } from "../../../lib/supabase";

type OrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

type PaymentMethod = "online" | "cash";

type OrderItem = {
  productId: number;
  variantId?: number | null;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
  color?: string | null;
  size?: string | null;
  lineTotal?: number;
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

  delivery_method:
    | "delivery"
    | "pickup";

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

function getStatusLabel(
  status: OrderStatus
) {
  const found =
    statusOptions.find(
      (item) =>
        item.value === status
    );

  return found?.label || "חדשה";
}

function getStatusClasses(
  status: OrderStatus
) {
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

const paymentStatusOptions: {
  value: PaymentStatus;
  label: string;
}[] = [
  { value: "pending", label: "ממתין לתשלום" },
  { value: "paid", label: "שולם" },
  { value: "failed", label: "נכשל" },
  { value: "cancelled", label: "בוטל" },
  { value: "refunded", label: "הוחזר" },
];

function getPaymentStatusLabel(status: PaymentStatus | null) {
  return (
    paymentStatusOptions.find((item) => item.value === status)?.label ||
    "ממתין לתשלום"
  );
}

function getPaymentStatusClasses(status: PaymentStatus | null) {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-gray-200 text-gray-700";
    case "refunded":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-orange-100 text-orange-700";
  }
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId =
    Number(params.id);

  const [order, setOrder] =
    useState<DatabaseOrder | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updating, setUpdating] =
    useState(false);

  useEffect(() => {
    async function loadOrder() {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!session) {
        router.replace(
          "/admin/login"
        );

        return;
      }

      const { data, error } =
        await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

      if (error) {
        console.error(error);

        setError(
          `לא ניתן לטעון את ההזמנה: ${error.message}`
        );

        setLoading(false);

        return;
      }

      setOrder(
        data as DatabaseOrder
      );

      setLoading(false);
    }

    if (
      Number.isNaN(orderId)
    ) {
      setError(
        "מספר הזמנה לא תקין."
      );

      setLoading(false);

      return;
    }

    loadOrder();
  }, [orderId, router]);

  async function updateStatus(
    newStatus: OrderStatus
  ) {
    if (!order) return;

    setUpdating(true);
    setError("");

    const { error } =
      await supabase
        .from("orders")
        .update({
          status: newStatus,
        })
        .eq("id", order.id);

    if (error) {
      setError(
        `לא ניתן לעדכן סטטוס: ${error.message}`
      );

      setUpdating(false);

      return;
    }

    setOrder({
      ...order,
      status: newStatus,
    });

    setUpdating(false);
  }

  async function updatePaymentStatus(newStatus: PaymentStatus) {
    if (!order) return;

    setUpdating(true);
    setError("");

    const paidAt =
      newStatus === "paid" ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: newStatus,
        paid_at: paidAt,
      })
      .eq("id", order.id);

    if (error) {
      setError(
        `לא ניתן לעדכן את סטטוס התשלום: ${error.message}`
      );
      setUpdating(false);
      return;
    }

    setOrder({
      ...order,
      payment_status: newStatus,
      paid_at: paidAt,
    });

    setUpdating(false);
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-100"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-20">
          <Loader2
            size={34}
            className="animate-spin"
          />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-100 px-4 py-16"
      >
        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow-sm">
          <p className="text-red-600">
            {error ||
              "ההזמנה לא נמצאה."}
          </p>

          <Link
            href="/orders"
            className="mt-6 inline-flex items-center gap-2 bg-black px-5 py-3 text-white"
          >
            <ArrowRight size={17} />
            חזרה להזמנות
          </Link>
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
        <div className="mb-8 flex flex-col gap-5 border-b border-gray-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/orders"
              className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
            >
              <ArrowRight size={17} />
              חזרה להזמנות
            </Link>

            <p className="text-sm text-gray-500">
              מספר הזמנה
            </p>

            <h1
              dir="ltr"
              className="mt-1 text-left text-3xl font-semibold"
            >
              {order.order_number}
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              {new Date(
                order.created_at
              ).toLocaleString(
                "he-IL"
              )}
            </p>

            <div className="mt-4">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                  order.delivery_method === "delivery"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {order.delivery_method === "delivery" ? (
                  <>
                    <Truck size={16} />
                    משלוח
                  </>
                ) : (
                  <>
                    <Package size={16} />
                    איסוף עצמי
                  </>
                )}
              </span>

              <span
                className={`mr-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${getPaymentStatusClasses(
                  order.payment_status
                )}`}
              >
                <CircleDollarSign size={16} />
                {getPaymentStatusLabel(order.payment_status)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-medium ${getStatusClasses(
                order.status
              )}`}
            >
              {getStatusLabel(
                order.status
              )}
            </span>

            <select
              value={
                order.status
              }
              disabled={
                updating
              }
              onChange={(e) =>
                updateStatus(
                  e.target
                    .value as OrderStatus
                )
              }
              className="border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            >
              {statusOptions.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_380px]">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                מוצרים
              </h2>

              <span className="text-sm text-gray-500">
                {order.cart_count} פריטים
              </span>
            </div>

            <div className="space-y-5">
              {order.items?.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={`${item.productId}-${item.variantId ?? "base"}-${index}`}
                    className="flex gap-4 border-b border-gray-100 pb-5 last:border-0"
                  >
                    <div className="h-28 w-28 shrink-0 overflow-hidden bg-neutral-100">
                      {item.image ? (
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package
                            size={
                              28
                            }
                            className="text-gray-400"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 justify-between gap-4">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-lg font-medium hover:text-gray-500"
                        >
                          {
                            item.name
                          }
                        </Link>

                        {(item.color ||
                          item.size) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.color && (
                              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-gray-700">
                                צבע:{" "}
                                <strong className="font-medium text-black">
                                  {item.color}
                                </strong>
                              </span>
                            )}

                            {item.size && (
                              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-gray-700">
                                מידה:{" "}
                                <strong className="font-medium text-black">
                                  {item.size}
                                </strong>
                              </span>
                            )}
                          </div>
                        )}

                        <p className="mt-3 text-sm text-gray-500">
                          כמות:{" "}
                          {
                            item.quantity
                          }
                        </p>

                        {item.sku && (
                          <p className="mt-1 text-sm text-gray-400">
                            מק״ט:{" "}
                            {
                              item.sku
                            }
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-left">
                        <p className="font-semibold">
                          ₪
                          {(
                            item.lineTotal ??
                            Number(
                              item.price
                            ) *
                              item.quantity
                          ).toLocaleString(
                            "he-IL"
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          ₪
                          {Number(
                            item.price
                          ).toLocaleString(
                            "he-IL"
                          )}{" "}
                          ליחידה
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold">
                פרטי לקוח
              </h2>

              <div className="space-y-5 text-sm">
                <div className="flex gap-3">
                  <User
                    size={18}
                    className="mt-0.5 text-gray-500"
                  />

                  <div>
                    <p className="text-gray-500">
                      שם
                    </p>

                    <p className="mt-1 font-medium">
                      {
                        order.customer_name
                      }
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone
                    size={18}
                    className="mt-0.5 text-gray-500"
                  />

                  <div>
                    <p className="text-gray-500">
                      טלפון
                    </p>

                    <a
                      href={`tel:${order.customer_phone}`}
                      className="mt-1 block font-medium"
                    >
                      {
                        order.customer_phone
                      }
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Mail
                    size={18}
                    className="mt-0.5 text-gray-500"
                  />

                  <div className="min-w-0">
                    <p className="text-gray-500">
                      אימייל
                    </p>

                    <a
                      href={`mailto:${order.customer_email}`}
                      className="mt-1 block break-all font-medium"
                    >
                      {
                        order.customer_email
                      }
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                {order.delivery_method ===
                "delivery" ? (
                  <Truck size={20} />
                ) : (
                  <Package
                    size={20}
                  />
                )}

                <h2 className="text-xl font-semibold">
                  {order.delivery_method ===
                  "delivery"
                    ? "משלוח"
                    : "איסוף עצמי"}
                </h2>
              </div>

              {order.delivery_method ===
                "delivery" && (
                <div className="flex gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 text-gray-500"
                  />

                  <div className="text-sm leading-6">
                    <p>
                      {
                        order.address
                      }
                    </p>

                    <p>
                      {
                        order.city
                      }
                    </p>

                    {(order.floor ||
                      order.apartment) && (
                      <p className="text-gray-500">
                        קומה:{" "}
                        {order.floor ||
                          "-"}{" "}
                        | דירה:{" "}
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
                  הלקוח בחר באיסוף עצמי.
                </p>
              )}
            </div>

            {order.notes && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-xl font-semibold">
                  הערות
                </h2>

                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {
                    order.notes
                  }
                </p>
              </div>
            )}

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <CreditCard size={21} />
                <h2 className="text-xl font-semibold">
                  פרטי תשלום
                </h2>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">
                    אמצעי תשלום
                  </span>
                  <span className="font-medium">
                    {order.payment_method === "cash"
                      ? "מזומן"
                      : "אונליין / כרטיס אשראי"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">
                    סטטוס תשלום
                  </span>
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${getPaymentStatusClasses(
                      order.payment_status
                    )}`}
                  >
                    {getPaymentStatusLabel(order.payment_status)}
                  </span>
                </div>

                {order.payment_transaction_id && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">
                      מספר עסקה
                    </span>
                    <span
                      dir="ltr"
                      className="font-medium"
                    >
                      {order.payment_transaction_id}
                    </span>
                  </div>
                )}

                {order.paid_at && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">
                      תאריך תשלום
                    </span>
                    <span className="font-medium">
                      {new Date(
                        order.paid_at
                      ).toLocaleString("he-IL")}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <label className="mb-2 block text-sm font-medium text-gray-600">
                    עדכון סטטוס תשלום
                  </label>

                  <select
                    value={
                      order.payment_status ||
                      "pending"
                    }
                    disabled={updating}
                    onChange={(e) =>
                      updatePaymentStatus(
                        e.target
                          .value as PaymentStatus
                      )
                    }
                    className="w-full border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-black disabled:opacity-50"
                  >
                    {paymentStatusOptions.map(
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

                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    כרגע ניתן לעדכן ידנית. לאחר חיבור
                    חברת הסליקה, סטטוס התשלום יעודכן
                    אוטומטית לפי אישור העסקה.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-black p-6 text-white shadow-sm">
              <h2 className="mb-5 text-xl font-semibold">
                סיכום כספי
              </h2>

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
                    אופן קבלה
                  </span>

                  <span className="font-medium text-white">
                    {order.delivery_method === "delivery"
                      ? "משלוח"
                      : "איסוף עצמי"}
                  </span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>
                    {order.delivery_method === "delivery"
                      ? "עלות משלוח"
                      : "עלות איסוף"}
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
                  <div className="flex justify-between text-xl font-semibold">
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
          </aside>
        </div>
      </div>
    </main>
  );
}