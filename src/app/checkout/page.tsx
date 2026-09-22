"use client";

import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  ChevronLeft,
  Loader2,
  Package,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabase";

type DeliveryMethod =
  | "delivery"
  | "pickup";

type PaymentMethod = "online";

type CheckoutForm = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  zipCode: string;
  address: string;
  floor: string;
  apartment: string;
  notes: string;
};

const emptyForm: CheckoutForm = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  zipCode: "",
  address: "",
  floor: "",
  apartment: "",
  notes: "",
};

type CitySuggestion = {
  id: number;
  city_code: number;
  city_name: string;
  region_id: number | null;
};

type SelectedCity = {
  id: number;
  cityCode: number;
  name: string;
  regionId: number;
  regionName: string;
  shippingPrice: number;
};

function createOrderNumber() {
  const now = new Date();

  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(
      2,
      "0"
    ),
    String(now.getDate()).padStart(
      2,
      "0"
    ),
  ].join("");

  const randomPart = Math.floor(
    1000 + Math.random() * 9000
  );

  return `HD-${datePart}-${randomPart}`;
}

export default function CheckoutPage() {
  const {
    items,
    cartCount,
    cartTotal,
    clearCart,
  } = useCart();

  const [form, setForm] =
    useState<CheckoutForm>(emptyForm);

  const [
    deliveryMethod,
    setDeliveryMethod,
  ] = useState<DeliveryMethod>(
    "delivery"
  );

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successOrderNumber, setSuccessOrderNumber] =
    useState<string | null>(null);

  const [successDeliveryMethod, setSuccessDeliveryMethod] =
    useState<DeliveryMethod | null>(null);

  const [successDeliveryPrice, setSuccessDeliveryPrice] =
    useState(0);

  const [selectedCity, setSelectedCity] =
    useState<SelectedCity | null>(null);

  const [citySuggestions, setCitySuggestions] =
    useState<CitySuggestion[]>([]);

  const [cityLoading, setCityLoading] =
    useState(false);

  const [cityOpen, setCityOpen] =
    useState(false);

  const deliveryPrice =
    deliveryMethod === "delivery" &&
    selectedCity
      ? selectedCity.shippingPrice
      : 0;

  const total = useMemo(
    () => cartTotal + deliveryPrice,
    [cartTotal, deliveryPrice]
  );

  useEffect(() => {
    if (deliveryMethod !== "delivery") {
      setCitySuggestions([]);
      setCityOpen(false);
      return;
    }

    const query = form.city.trim();

    if (!query) {
      setCitySuggestions([]);
      setCityOpen(false);
      return;
    }

    if (
      selectedCity &&
      selectedCity.name === form.city
    ) {
      setCitySuggestions([]);
      setCityOpen(false);
      return;
    }

    const timer = window.setTimeout(
      async () => {
        setCityLoading(true);

        const { data, error } =
          await supabase
            .from("shipping_cities")
            .select(
              "id, city_code, city_name, region_id"
            )
            .eq("active", true)
            .ilike(
              "city_name",
              `%${query}%`
            )
            .order("city_name")
            .limit(12);

        if (error) {
          console.error(
            "Error loading city suggestions:",
            error
          );
          setCitySuggestions([]);
          setCityOpen(false);
          setCityLoading(false);
          return;
        }

        setCitySuggestions(
          (data || []) as CitySuggestion[]
        );
        setCityOpen(true);
        setCityLoading(false);
      },
      250
    );

    return () =>
      window.clearTimeout(timer);
  }, [
    form.city,
    deliveryMethod,
    selectedCity,
  ]);

  async function selectCity(
    city: CitySuggestion
  ) {
    setError("");

    if (!city.region_id) {
      setError(
        "היישוב עדיין לא משויך לאזור משלוח."
      );
      return;
    }

    setCityLoading(true);

    const { data: region, error } =
      await supabase
        .from("shipping_regions")
        .select(
          "id, name, shipping_price, active"
        )
        .eq("id", city.region_id)
        .eq("active", true)
        .maybeSingle();

    if (error || !region) {
      console.error(
        "Error loading shipping region:",
        error
      );
      setError(
        "לא הצלחנו לחשב את מחיר המשלוח לעיר הזאת."
      );
      setCityLoading(false);
      return;
    }

    setSelectedCity({
      id: city.id,
      cityCode: Number(
        city.city_code
      ),
      name: city.city_name,
      regionId: Number(
        region.id
      ),
      regionName:
        String(region.name),
      shippingPrice: Number(
        region.shipping_price
      ),
    });

    setForm((current) => ({
      ...current,
      city: city.city_name,
    }));

    setCitySuggestions([]);
    setCityOpen(false);
    setCityLoading(false);
  }

  function changeCity(
    value: string
  ) {
    setSelectedCity(null);

    setForm((current) => ({
      ...current,
      city: value,
    }));

    setCityOpen(true);
  }

  function updateForm(
    key: keyof CheckoutForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validateForm() {
    if (!form.fullName.trim()) {
      return "יש להזין שם מלא.";
    }

    if (!form.phone.trim()) {
      return "יש להזין מספר טלפון.";
    }

    if (
      deliveryMethod === "delivery" &&
      !selectedCity
    ) {
      return "יש לבחור עיר מתוך הרשימה.";
    }

    if (
      deliveryMethod === "delivery" &&
      !form.address.trim()
    ) {
      return "יש להזין כתובת למשלוח.";
    }

    return "";
  }

  async function submitOrder(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (items.length === 0) {
      setError(
        "סל הקניות ריק."
      );
      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    const orderNumber =
      createOrderNumber();

    const orderItems = items.map(
      (item) => ({
        productId: item.product.id,
        variantId:
          item.product.variantId ??
          null,
        slug: item.product.slug,
        name: item.product.name,
        price: Number(
          item.product.price
        ),
        quantity: item.quantity,
        image:
          item.product.image ||
          item.product.images?.[0] ||
          "",
        sku: item.product.sku || "",
        color:
          item.product.variantColor ??
          null,
        size:
          item.product.variantSize ??
          null,
        lineTotal:
          Number(
            item.product.price
          ) * item.quantity,
      })
    );

    const payload = {
      order_number: orderNumber,
      customer_name:
        form.fullName.trim(),
      customer_phone:
        form.phone.trim(),
      customer_email:
        form.email.trim() || null,
      city:
        deliveryMethod === "delivery"
          ? selectedCity?.name ?? null
          : null,
      city_code:
        deliveryMethod === "delivery"
          ? selectedCity?.cityCode ?? null
          : null,
      zip_code:
        deliveryMethod === "delivery"
          ? form.zipCode.trim() ||
            null
          : null,
      address:
        deliveryMethod === "delivery"
          ? form.address.trim()
          : null,
      floor:
        deliveryMethod === "delivery"
          ? form.floor.trim() ||
            null
          : null,
      apartment:
        deliveryMethod === "delivery"
          ? form.apartment.trim() ||
            null
          : null,
      notes:
        form.notes.trim() || null,
      delivery_method:
        deliveryMethod,
      delivery_price:
        deliveryPrice,
      items: orderItems,
      cart_count: cartCount,
      subtotal: cartTotal,
      total,
      status: "new",
      payment_method: "online" as PaymentMethod,
      payment_status: "pending",
    };

    /*
     * בדיקת זמינות נוספת לפני יצירת ההזמנה.
     * ה-RPC עדיין מבצע את הבדיקה הסופית והאטומית.
     */
    try {
      const availabilityChecks =
        await Promise.all(
          items.map(async (item) => {
            const product = item.product;
            const variantId =
              product.variantId ?? null;

            if (variantId !== null) {
              const { data, error } =
                await supabase
                  .from("product_variants")
                  .select("stock, active")
                  .eq("id", variantId)
                  .eq(
                    "product_id",
                    product.id
                  )
                  .maybeSingle();

              if (error) {
                throw error;
              }

              return {
                name: product.name,
                available:
                  Boolean(data?.active) &&
                  Number(data?.stock ?? 0) >=
                    item.quantity,
                stock: Number(
                  data?.stock ?? 0
                ),
              };
            }

            const { data, error } =
              await supabase
                .from("products")
                .select("stock, active")
                .eq("id", product.id)
                .maybeSingle();

            if (error) {
              throw error;
            }

            return {
              name: product.name,
              available:
                Boolean(data?.active) &&
                Number(data?.stock ?? 0) >=
                  item.quantity,
              stock: Number(
                data?.stock ?? 0
              ),
            };
          })
        );

      const unavailable =
        availabilityChecks.find(
          (check) => !check.available
        );

      if (unavailable) {
        setError(
          unavailable.stock > 0
            ? `המלאי של "${unavailable.name}" השתנה. נשארו ${unavailable.stock} יחידות בלבד. חזור לסל ועדכן את הכמות.`
            : `"${unavailable.name}" אזל מהמלאי. חזור לסל ועדכן את ההזמנה.`
        );
        setSubmitting(false);
        return;
      }
    } catch (availabilityError) {
      console.error(
        "Error checking checkout availability:",
        availabilityError
      );

      setError(
        "לא הצלחנו לבדוק את זמינות המוצרים כרגע. נסה שוב בעוד רגע."
      );
      setSubmitting(false);
      return;
    }

    const {
      data: createdOrderNumber,
      error: createOrderError,
    } = await supabase.rpc(
      "create_order_with_stock",
      {
        p_order: payload,
      }
    );

    if (createOrderError) {
      console.warn(
        "Error creating order with stock:",
        createOrderError
      );

      let message =
        "לא ניתן להשלים את ההזמנה.";

      const databaseMessage =
        createOrderError.message || "";

      if (
        databaseMessage.includes(
          "אין מספיק מלאי"
        )
      ) {
        message = databaseMessage;
      } else if (
        databaseMessage.includes(
          "אינה זמינה"
        ) ||
        databaseMessage.includes(
          "אינו זמין"
        )
      ) {
        message = databaseMessage;
      } else if (
        databaseMessage.includes(
          "סל הקניות ריק"
        ) ||
        databaseMessage.includes(
          "כמות מוצר אינה תקינה"
        ) ||
        databaseMessage.includes(
          "עיר למשלוח"
        ) ||
        databaseMessage.includes(
          "אזור משלוח"
        ) ||
        databaseMessage.includes(
          "מחיר משלוח"
        )
      ) {
        message = databaseMessage;
      }

      setError(message);
      setSubmitting(false);
      return;
    }

    setSuccessDeliveryMethod(
      deliveryMethod
    );
    setSuccessDeliveryPrice(
      deliveryPrice
    );
    clearCart();
    setSuccessOrderNumber(
      typeof createdOrderNumber === "string" &&
        createdOrderNumber
        ? createdOrderNumber
        : orderNumber
    );
    setSubmitting(false);
  }

  if (successOrderNumber) {
    const isDelivery =
      successDeliveryMethod === "delivery";

    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-50 text-black"
      >
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 sm:px-6 sm:py-5">
            <Link href="/">
              <img
                src="/images/new logo.png"
                alt="Home Design"
                className="h-12 w-auto object-contain sm:h-16"
              />
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-2xl px-5 py-14 text-center sm:px-6 sm:py-20">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CheckCircle2
              size={38}
              strokeWidth={1.7}
            />
          </div>

          <p className="mt-6 text-sm font-medium tracking-widest text-gray-400">
            HOME DESIGN
          </p>

          <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">
            ההזמנה התקבלה בהצלחה
          </h1>

          <p className="mx-auto mt-4 max-w-lg leading-7 text-gray-600">
            תודה על ההזמנה. פרטי ההזמנה נשמרו
            במערכת וניצור איתך קשר להמשך הטיפול.
          </p>

          <div className="mt-8 overflow-hidden border border-gray-200 bg-white text-right">
            <div className="border-b border-gray-200 bg-neutral-50 p-5 text-center">
              <p className="text-sm text-gray-500">
                מספר ההזמנה שלך
              </p>

              <p
                dir="ltr"
                className="mt-2 text-2xl font-semibold tracking-wide"
              >
                {successOrderNumber}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                מומלץ לשמור את מספר ההזמנה
              </p>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-500">
                אופן קבלת ההזמנה
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  {isDelivery ? (
                    <Truck size={21} />
                  ) : (
                    <Store size={21} />
                  )}
                </div>

                <div>
                  <p className="font-semibold">
                    {isDelivery
                      ? "משלוח"
                      : "איסוף עצמי"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {isDelivery
                      ? `עלות משלוח: ₪${successDeliveryPrice.toLocaleString(
                          "he-IL"
                        )}`
                      : "ללא עלות"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-5">
              <p className="text-sm text-gray-500">אמצעי תשלום</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  <CreditCard size={21} />
                </div>
                <div>
                  <p className="font-semibold">
                    תשלום אונליין
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    ממתין לחיבור לספק הסליקה
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-black px-7 py-3.5 font-medium text-white transition hover:bg-gray-800"
            >
              חזרה לחנות
            </Link>

            <Link
              href="/cart"
              className="inline-flex items-center justify-center border border-gray-300 px-7 py-3.5 font-medium transition hover:border-black"
            >
              לסל הקניות
            </Link>
          </div>

          <p className="mt-6 text-xs leading-5 text-gray-400">
            אם יש שאלה לגבי ההזמנה, אפשר למסור
            לנו את מספר ההזמנה שמופיע למעלה.
          </p>
        </section>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-50 text-black"
      >
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
            <Link href="/">
              <img
                src="/images/new logo.png"
                alt="Home Design"
                className="h-12 w-auto object-contain sm:h-16"
              />
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-2 text-sm"
            >
              חזרה לסל
              <ChevronLeft size={17} />
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-xl px-5 py-20 text-center">
          <ShoppingBag
            size={44}
            strokeWidth={1.4}
            className="mx-auto text-gray-300"
          />

          <h1 className="mt-5 text-2xl font-semibold">
            אין מוצרים לתשלום
          </h1>

          <p className="mt-2 text-gray-500">
            הוסף מוצרים לסל לפני מעבר
            לקופה.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex bg-black px-7 py-3.5 text-white"
          >
            חזרה לחנות
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50 text-black"
    >
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <Link href="/">
            <img
              src="/images/new logo.png"
              alt="Home Design"
              className="h-12 w-auto object-contain sm:h-16"
            />
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm transition hover:text-gray-500"
          >
            חזרה לסל
            <ChevronLeft size={17} />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-14">
        <div className="mb-6 sm:mb-8">
          <p className="text-sm font-medium tracking-widest text-gray-500">
            HOME DESIGN
          </p>

          <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">
            השלמת הזמנה
          </h1>
        </div>

        <form
          onSubmit={submitOrder}
          className="grid gap-8 lg:grid-cols-[1fr_390px] lg:items-start"
        >
          <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-none sm:p-6">
              <h2 className="text-xl font-semibold">
                פרטי לקוח
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    שם מלא *
                  </label>

                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(event) =>
                      updateForm(
                        "fullName",
                        event.target.value
                      )
                    }
                    className="min-h-12 w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-black sm:rounded-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    טלפון *
                  </label>

                  <input
                    dir="ltr"
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateForm(
                        "phone",
                        event.target.value
                      )
                    }
                    className="min-h-12 w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-right outline-none focus:border-black sm:rounded-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    אימייל
                  </label>

                  <input
                    dir="ltr"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateForm(
                        "email",
                        event.target.value
                      )
                    }
                    className="min-h-12 w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-left outline-none focus:border-black sm:rounded-none"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-none sm:p-6">
              <h2 className="text-xl font-semibold">
                אופן קבלת ההזמנה
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMethod(
                      "delivery"
                    );
                  }}
                  className={`flex min-h-20 items-center gap-3 rounded-xl border p-4 text-right transition sm:rounded-none ${
                    deliveryMethod ===
                    "delivery"
                      ? "border-black bg-neutral-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Truck size={23} />

                  <div>
                    <p className="font-medium">
                      משלוח
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {selectedCity
                        ? `₪${deliveryPrice.toLocaleString(
                            "he-IL"
                          )} • ${selectedCity.regionName}`
                        : "המחיר מחושב לפי העיר"}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMethod(
                      "pickup"
                    );
                    setCityOpen(false);
                  }}
                  className={`flex min-h-20 items-center gap-3 rounded-xl border p-4 text-right transition sm:rounded-none ${
                    deliveryMethod ===
                    "pickup"
                      ? "border-black bg-neutral-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Store size={23} />

                  <div>
                    <p className="font-medium">
                      איסוף עצמי
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      ללא עלות
                    </p>
                  </div>
                </button>
              </div>
            </section>

            {deliveryMethod ===
              "delivery" && (
              <section className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-none sm:p-6">
                <h2 className="text-xl font-semibold">
                  כתובת למשלוח
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <label className="mb-2 block text-sm font-medium">
                      עיר *
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        autoComplete="off"
                        value={form.city}
                        onFocus={() => {
                          if (
                            citySuggestions.length >
                            0
                          ) {
                            setCityOpen(true);
                          }
                        }}
                        onChange={(event) =>
                          changeCity(
                            event.target.value
                          )
                        }
                        placeholder="התחל להקליד עיר..."
                        className="min-h-12 w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 text-base outline-none focus:border-black sm:rounded-none"
                      />

                      {cityLoading && (
                        <Loader2
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                        />
                      )}
                    </div>

                    {cityOpen &&
                      !selectedCity && (
                        <div className="absolute right-0 left-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg sm:rounded-none">
                          {cityLoading &&
                          citySuggestions.length ===
                            0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              מחפש יישובים...
                            </div>
                          ) : citySuggestions.length >
                            0 ? (
                            citySuggestions.map(
                              (city) => (
                                <button
                                  key={
                                    city.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    void selectCity(
                                      city
                                    )
                                  }
                                  className="flex min-h-12 w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-right text-sm transition last:border-b-0 hover:bg-neutral-50"
                                >
                                  <span>
                                    {
                                      city.city_name
                                    }
                                  </span>

                                  <span className="text-xs text-gray-400">
                                    בחירה
                                  </span>
                                </button>
                              )
                            )
                          ) : form.city.trim() ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              לא נמצאו יישובים.
                            </div>
                          ) : null}
                        </div>
                      )}

                    {selectedCity && (
                      <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 sm:rounded-none">
                        משלוח ל־
                        {selectedCity.name}:{" "}
                        <strong>
                          ₪
                          {selectedCity.shippingPrice.toLocaleString(
                            "he-IL"
                          )}
                        </strong>
                        {" • "}
                        {
                          selectedCity.regionName
                        }
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      מיקוד
                    </label>

                    <input
                      type="text"
                      value={form.zipCode}
                      onChange={(event) =>
                        updateForm(
                          "zipCode",
                          event.target.value
                        )
                      }
                      className="min-h-12 w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-black sm:rounded-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                      כתובת *
                    </label>

                    <input
                      type="text"
                      value={form.address}
                      onChange={(event) =>
                        updateForm(
                          "address",
                          event.target.value
                        )
                      }
                      className="min-h-12 w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-black sm:rounded-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      קומה
                    </label>

                    <input
                      type="text"
                      value={form.floor}
                      onChange={(event) =>
                        updateForm(
                          "floor",
                          event.target.value
                        )
                      }
                      className="min-h-12 w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-black sm:rounded-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      דירה
                    </label>

                    <input
                      type="text"
                      value={form.apartment}
                      onChange={(event) =>
                        updateForm(
                          "apartment",
                          event.target.value
                        )
                      }
                      className="min-h-12 w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-black sm:rounded-none"
                    />
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-none sm:p-6">
              <h2 className="text-xl font-semibold">אמצעי תשלום</h2>
              <p className="mt-2 text-sm text-gray-500">
                התשלום יתבצע אונליין באמצעות כרטיס אשראי.
              </p>

              <div className="mt-5 grid gap-3">
                <div className="flex items-center gap-3 border border-black bg-neutral-50 p-4 text-right">
                  <CreditCard size={23} />
                  <div>
                    <p className="font-medium">תשלום אונליין</p>
                    <p className="mt-1 text-sm text-gray-500">
                      כרטיס אשראי
                    </p>
                  </div>
                </div>

              </div>

              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800 sm:rounded-none">
                אפשרות התשלום האונליין מוכנה במערכת, אך עדיין לא
                מחוברת לספק סליקה. פרטי כרטיס לא יוזנו באתר בשלב זה.
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-none sm:p-6">
              <label className="mb-2 block text-sm font-medium">
                הערות להזמנה
              </label>

              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  updateForm(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="הערות מיוחדות למשלוח או להזמנה..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-black sm:rounded-none"
              />
            </section>
          </div>

          <aside className="rounded-xl border border-gray-200 bg-white p-4 sm:rounded-none sm:p-6 lg:sticky lg:top-6">
            <div className="flex items-center gap-2">
              <Package size={21} />

              <h2 className="text-xl font-semibold">
                סיכום הזמנה
              </h2>
            </div>

            <div className="mt-5 max-h-[430px] space-y-4 overflow-y-auto border-b border-gray-200 pb-5">
              {items.map((item) => {
                const product =
                  item.product;

                const variantKey =
                  product.variantId ??
                  "base";

                const image =
                  product.image ||
                  product.images?.[0] ||
                  "";

                return (
                  <div
                    key={`${product.id}-${variantKey}`}
                    className="flex gap-3"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:h-20 sm:w-20 sm:rounded-none">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {product.name}
                      </p>

                      {(product.variantColor ||
                        product.variantSize) && (
                        <div className="mt-1 text-xs leading-5 text-gray-500">
                          {product.variantColor && (
                            <p>
                              צבע:{" "}
                              {
                                product.variantColor
                              }
                            </p>
                          )}

                          {product.variantSize && (
                            <p>
                              מידה:{" "}
                              {
                                product.variantSize
                              }
                            </p>
                          )}
                        </div>
                      )}

                      {product.sku && (
                        <p className="mt-1 text-xs text-gray-400">
                          מק״ט:{" "}
                          {product.sku}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                        <span className="text-gray-500">
                          כמות:{" "}
                          {item.quantity}
                        </span>

                        <span className="font-medium">
                          ₪
                          {(
                            Number(
                              product.price
                            ) *
                            item.quantity
                          ).toLocaleString(
                            "he-IL"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 border-b border-gray-200 py-5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  סכום ביניים
                </span>

                <span>
                  ₪
                  {cartTotal.toLocaleString(
                    "he-IL"
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  {deliveryMethod ===
                  "delivery"
                    ? "משלוח"
                    : "איסוף עצמי"}
                </span>

                <span>
                  {deliveryMethod ===
                    "pickup"
                    ? "חינם"
                    : selectedCity
                      ? `₪${deliveryPrice.toLocaleString(
                          "he-IL"
                        )}`
                      : "בחר עיר"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-5">
              <span className="font-semibold">
                סה״כ
              </span>

              <span className="text-2xl font-semibold">
                ₪
                {total.toLocaleString(
                  "he-IL"
                )}
              </span>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 sm:rounded-none">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                submitting ||
                (deliveryMethod ===
                  "delivery" &&
                  !selectedCity)
              }
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-base font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 sm:rounded-none"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  שומר הזמנה...
                </>
              ) : (
                "אישור ושליחת הזמנה"
              )}
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-gray-400">
              פרטי כרטיס אשראי אינם נשמרים באתר.
              תשלום אונליין יופעל לאחר חיבור
              ספק סליקה מאובטח.
            </p>
          </aside>
        </form>
      </section>
    </main>
  );
}
