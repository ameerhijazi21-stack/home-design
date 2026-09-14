"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MapPin,
  RefreshCw,
  Save,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

type ShippingRegion = {
  id: number;
  name: string;
  shipping_price: number;
  active: boolean;
  government_region_codes: number[];
};

type GovernmentCity = {
  code: number;
  name: string;
  regionCode: number | null;
  regionName: string | null;
};

type ShippingCity = {
  city_code: number;
  city_name: string;
  government_region_code: number | null;
  government_region_name: string | null;
  region_id: number | null;
  active: boolean;
};

type UnassignedCity = {
  id: number;
  city_name: string;
  government_region_code: number | null;
  government_region_name: string | null;
};

export default function AdminShippingPage() {
  const [regions, setRegions] =
    useState<ShippingRegion[]>([]);

  const [prices, setPrices] =
    useState<Record<number, string>>({});

  const [loading, setLoading] =
    useState(true);

  const [savingId, setSavingId] =
    useState<number | null>(null);

  const [syncing, setSyncing] =
    useState(false);

  const [assigningCityId, setAssigningCityId] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [cityCount, setCityCount] =
    useState(0);

  const [unassignedCount, setUnassignedCount] =
    useState(0);

  const [unassignedCities, setUnassignedCities] =
    useState<UnassignedCity[]>([]);

  const [citySelections, setCitySelections] =
    useState<Record<number, string>>({});

  useEffect(() => {
    void initializePage();
  }, []);

  async function initializePage() {
    setLoading(true);
    setError("");

    const {
      data: {
        session,
      },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href =
        "/admin/login";
      return;
    }

    await Promise.all([
      loadRegions(),
      loadCityStats(),
      loadUnassignedCities(),
    ]);

    setLoading(false);
  }

  async function loadRegions() {
    const { data, error } =
      await supabase
        .from("shipping_regions")
        .select(
          "id, name, shipping_price, active, government_region_codes"
        )
        .order("id");

    if (error) {
      setError(
        "לא הצלחנו לטעון את אזורי המשלוח."
      );
      return;
    }

    const rows =
      (data || []).map((region) => ({
        ...region,
        shipping_price: Number(
          region.shipping_price
        ),
        government_region_codes:
          region.government_region_codes ||
          [],
      })) as ShippingRegion[];

    setRegions(rows);

    const nextPrices:
      Record<number, string> = {};

    rows.forEach((region) => {
      nextPrices[region.id] =
        String(region.shipping_price);
    });

    setPrices(nextPrices);
  }

  async function loadCityStats() {
    const [
      totalResult,
      unassignedResult,
    ] = await Promise.all([
      supabase
        .from("shipping_cities")
        .select("id", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("shipping_cities")
        .select("id", {
          count: "exact",
          head: true,
        })
        .is("region_id", null),
    ]);

    if (!totalResult.error) {
      setCityCount(
        totalResult.count || 0
      );
    }

    if (!unassignedResult.error) {
      setUnassignedCount(
        unassignedResult.count || 0
      );
    }
  }

  async function loadUnassignedCities() {
    const { data, error } =
      await supabase
        .from("shipping_cities")
        .select(
          "id, city_name, government_region_code, government_region_name"
        )
        .is("region_id", null)
        .order("city_name");

    if (error) {
      setError(
        "לא הצלחנו לטעון את היישובים ללא אזור."
      );
      return;
    }

    setUnassignedCities(
      (data || []) as UnassignedCity[]
    );
  }

  const regionCodeToId =
    useMemo(() => {
      const map = new Map<
        number,
        number
      >();

      regions.forEach((region) => {
        region.government_region_codes.forEach(
          (code) => {
            map.set(
              Number(code),
              region.id
            );
          }
        );
      });

      return map;
    }, [regions]);

  async function savePrice(
    regionId: number
  ) {
    setError("");
    setMessage("");

    const value = Number(
      prices[regionId]
    );

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      setError(
        "מחיר המשלוח חייב להיות מספר תקין."
      );
      return;
    }

    setSavingId(regionId);

    const { error } =
      await supabase
        .from("shipping_regions")
        .update({
          shipping_price: value,
        })
        .eq("id", regionId);

    if (error) {
      setError(
        "לא הצלחנו לשמור את המחיר."
      );
      setSavingId(null);
      return;
    }

    setRegions((current) =>
      current.map((region) =>
        region.id === regionId
          ? {
              ...region,
              shipping_price: value,
            }
          : region
      )
    );

    setMessage(
      "מחיר המשלוח נשמר בהצלחה."
    );
    setSavingId(null);
  }

  async function syncCities() {
    setError("");
    setMessage("");

    if (regions.length === 0) {
      setError(
        "לא נמצאו אזורי משלוח."
      );
      return;
    }

    setSyncing(true);

    try {
      const response =
        await fetch(
          "/api/cities?all=1"
        );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch cities"
        );
      }

      const json =
        await response.json();

      const governmentCities:
        GovernmentCity[] =
          json?.cities || [];

      if (
        governmentCities.length === 0
      ) {
        throw new Error(
          "No cities returned"
        );
      }

      const rows: ShippingCity[] =
        governmentCities.map(
          (city) => ({
            city_code:
              Number(city.code),

            city_name:
              city.name.trim(),

            government_region_code:
              city.regionCode === null
                ? null
                : Number(
                    city.regionCode
                  ),

            government_region_name:
              city.regionName,

            region_id:
              city.regionCode === null
                ? null
                : regionCodeToId.get(
                    Number(
                      city.regionCode
                    )
                  ) ?? null,

            active: true,
          })
        );

      const chunkSize = 300;

      for (
        let index = 0;
        index < rows.length;
        index += chunkSize
      ) {
        const chunk =
          rows.slice(
            index,
            index + chunkSize
          );

        const { error } =
          await supabase
            .from(
              "shipping_cities"
            )
            .upsert(chunk, {
              onConflict:
                "city_code",
            });

        if (error) {
          throw error;
        }
      }

      await Promise.all([
        loadCityStats(),
        loadUnassignedCities(),
      ]);

      const unassigned =
        rows.filter(
          (city) =>
            city.region_id === null
        ).length;

      setMessage(
        `הסנכרון הושלם: ${rows.length.toLocaleString(
          "he-IL"
        )} יישובים. ${
          unassigned > 0
            ? `${unassigned} יישובים עדיין ללא אזור משלוח.`
            : "כל היישובים שויכו לאזור משלוח."
        }`
      );
    } catch (syncError) {
      console.error(
        "Shipping cities sync error:",
        syncError
      );

      setError(
        "הסנכרון נכשל. בדוק שה־API של הערים עובד ונסה שוב."
      );
    } finally {
      setSyncing(false);
    }
  }

  async function assignCityToRegion(
    cityId: number
  ) {
    setError("");
    setMessage("");

    const selected =
      citySelections[cityId];

    const regionId =
      Number(selected);

    if (
      !selected ||
      !Number.isFinite(regionId)
    ) {
      setError(
        "יש לבחור אזור משלוח ליישוב."
      );
      return;
    }

    setAssigningCityId(cityId);

    const { error } =
      await supabase
        .from("shipping_cities")
        .update({
          region_id: regionId,
        })
        .eq("id", cityId);

    if (error) {
      setError(
        "לא הצלחנו לשייך את היישוב לאזור."
      );
      setAssigningCityId(null);
      return;
    }

    setUnassignedCities((current) =>
      current.filter(
        (city) => city.id !== cityId
      )
    );

    setUnassignedCount((current) =>
      Math.max(0, current - 1)
    );

    setMessage(
      "היישוב שויך לאזור בהצלחה."
    );

    setAssigningCityId(null);
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-neutral-50"
      >
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2
            className="animate-spin"
            size={22}
          />
          טוען משלוחים...
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50 text-black"
    >
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <MapPin size={23} />
            <div>
              <h1 className="text-xl font-semibold">
                ניהול משלוחים
              </h1>
              <p className="text-sm text-gray-500">
                אזורים, מחירים ויישובים
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
          >
            <ArrowRight size={18} />
            חזרה לאדמין
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-6">
        {error && (
          <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 flex items-center gap-2 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              יישובים במערכת
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {cityCount.toLocaleString(
                "he-IL"
              )}
            </p>
          </div>

          <div className="border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              אזורי משלוח
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {regions.length}
            </p>
          </div>

          <div className="border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              ללא אזור
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {unassignedCount.toLocaleString(
                "he-IL"
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">
                סנכרון יישובי ישראל
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                הכפתור מושך את רשימת
                היישובים המעודכנת ומקשר
                כל יישוב לאזור המשלוח
                שלו לפי קוד האזור.
              </p>
            </div>

            <button
              type="button"
              onClick={syncCities}
              disabled={syncing}
              className="flex min-w-44 items-center justify-center gap-2 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {syncing ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  מסנכרן...
                </>
              ) : (
                <>
                  <RefreshCw
                    size={18}
                  />
                  סנכרון כל היישובים
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold">
              מחירים לפי אזור
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              שינוי מחיר כאן ישפיע על
              כל היישובים ששייכים לאותו
              אזור.
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {regions.map((region) => (
              <div
                key={region.id}
                className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_180px_120px] sm:items-center sm:px-6"
              >
                <div>
                  <p className="font-medium">
                    {region.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    קודי אזור:{" "}
                    {region.government_region_codes.join(
                      ", "
                    )}
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    ₪
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      prices[
                        region.id
                      ] ?? ""
                    }
                    onChange={(event) =>
                      setPrices(
                        (current) => ({
                          ...current,
                          [region.id]:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="w-full border border-gray-300 py-2.5 pr-8 pl-3 outline-none transition focus:border-black"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    savePrice(
                      region.id
                    )
                  }
                  disabled={
                    savingId ===
                    region.id
                  }
                  className="flex items-center justify-center gap-2 border border-black px-4 py-2.5 text-sm font-medium transition hover:bg-black hover:text-white disabled:opacity-50"
                >
                  {savingId ===
                  region.id ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={16} />
                  )}
                  שמירה
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold">
              יישובים ללא אזור
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              כאן ניתן לשייך ידנית כל
              יישוב שלא שויך אוטומטית.
            </p>
          </div>

          {unassignedCities.length === 0 ? (
            <div className="p-6 text-sm text-green-700">
              כל היישובים משויכים לאזור משלוח ✅
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {unassignedCities.map(
                (city) => (
                  <div
                    key={city.id}
                    className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_260px_120px] sm:items-center sm:px-6"
                  >
                    <div>
                      <p className="font-medium">
                        {city.city_name}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        קוד אזור ממשלתי:{" "}
                        {city.government_region_code ??
                          "לא קיים"}
                        {city.government_region_name
                          ? ` • ${city.government_region_name}`
                          : ""}
                      </p>
                    </div>

                    <select
                      value={
                        citySelections[
                          city.id
                        ] ?? ""
                      }
                      onChange={(event) =>
                        setCitySelections(
                          (current) => ({
                            ...current,
                            [city.id]:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="w-full border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-black"
                    >
                      <option value="">
                        בחר אזור משלוח
                      </option>

                      {regions.map(
                        (region) => (
                          <option
                            key={
                              region.id
                            }
                            value={
                              region.id
                            }
                          >
                            {
                              region.name
                            }{" "}
                            — ₪
                            {region.shipping_price.toLocaleString(
                              "he-IL"
                            )}
                          </option>
                        )
                      )}
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        assignCityToRegion(
                          city.id
                        )
                      }
                      disabled={
                        assigningCityId ===
                        city.id
                      }
                      className="flex items-center justify-center gap-2 bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:bg-gray-400"
                    >
                      {assigningCityId ===
                      city.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Save
                          size={16}
                        />
                      )}
                      שיוך
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
