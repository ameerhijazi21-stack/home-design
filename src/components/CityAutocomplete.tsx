"use client";

import {
  Check,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type CityOption = {
  code: number;
  name: string;
};

type CityAutocompleteProps = {
  value: string;
  selectedValue?: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
  onSelect: (city: CityOption) => void;
};

export default function CityAutocomplete({
  value,
  selectedValue = "",
  disabled = false,
  onValueChange,
  onSelect,
}: CityAutocompleteProps) {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const query = value.trim();

    if (!query || query === selectedValue) {
      setCities([]);
      setMessage("");
      setLoading(false);
      setOpen(false);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await fetch(
          `/api/cities?q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load cities");
        }

        const data = await response.json();
        const results: CityOption[] = Array.isArray(data?.cities)
          ? data.cities
          : [];

        setCities(results);
        setOpen(true);

        if (results.length === 0) {
          setMessage("לא נמצאו יישובים מתאימים.");
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        console.error("City autocomplete error:", error);
        setCities([]);
        setMessage("לא הצלחנו לטעון את רשימת היישובים.");
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value, selectedValue]);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          autoComplete="off"
          value={value}
          disabled={disabled}
          placeholder="התחל להקליד עיר או יישוב..."
          onFocus={() => {
            if (value.trim()) {
              setOpen(true);
            }
          }}
          onChange={(event) => {
            onValueChange(event.target.value);
            setOpen(true);
          }}
          className="w-full border border-gray-300 py-3 pl-11 pr-11 outline-none transition focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
        />

        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
        </div>
      </div>

      {open && value.trim() && (
        <div className="absolute z-40 mt-2 max-h-72 w-full overflow-y-auto border border-gray-200 bg-white shadow-xl">
          {cities.map((city) => (
            <button
              key={city.code}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelect(city);
                setOpen(false);
                setMessage("");
              }}
              className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-right transition last:border-b-0 hover:bg-neutral-50"
            >
              <span className="font-medium">{city.name}</span>
              {value.trim() === city.name && (
                <Check size={17} className="text-green-600" />
              )}
            </button>
          ))}

          {!loading && message && (
            <div className="px-4 py-4 text-sm text-gray-500">
              {message}
            </div>
          )}

          {loading && cities.length === 0 && (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              מחפש יישובים...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
