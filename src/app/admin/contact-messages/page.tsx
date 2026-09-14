"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MessageCircle,
  MessageSquare,
  Phone,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

type ContactStatus = "new" | "processing" | "completed";

type ContactMessage = {
  id: number;
  created_at: string;
  full_name: string;
  phone: string;
  subject: string;
  message: string | null;
  status: ContactStatus;
};

const subjectLabels: Record<string, string> = {
  product: "שאלה על מוצר",
  "custom-sofa": "ספה בהתאמה אישית",
  delivery: "משלוח והזמנה",
  mattress: "ייעוץ לבחירת מזרן",
  other: "נושא אחר",
};

function getSubjectLabel(subject: string) {
  return subjectLabels[subject] || subject;
}

function getStatusLabel(status: ContactStatus) {
  switch (status) {
    case "new":
      return "חדש";
    case "processing":
      return "בטיפול";
    case "completed":
      return "טופל";
    default:
      return "חדש";
  }
}

function getStatusClasses(status: ContactStatus) {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-700";
    case "processing":
      return "bg-yellow-100 text-yellow-700";
    case "completed":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getWhatsAppUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    return `https://wa.me/972${digits.slice(1)}`;
  }

  if (digits.startsWith("972")) {
    return `https://wa.me/${digits}`;
  }

  return `https://wa.me/${digits}`;
}

export default function ContactMessagesAdminPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<"all" | ContactStatus>("all");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadMessages() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      router.replace("/admin/login");
      return;
    }

    setAuthorized(true);

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading contact messages:", error);
      setErrorMessage("לא ניתן לטעון את הפניות כרגע.");
      setMessages([]);
    } else {
      setMessages((data || []) as ContactMessage[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    if (filter === "all") {
      return messages;
    }

    return messages.filter((message) => message.status === filter);
  }, [messages, filter]);

  const counts = useMemo(() => {
    return {
      all: messages.length,
      new: messages.filter((message) => message.status === "new").length,
      processing: messages.filter(
        (message) => message.status === "processing"
      ).length,
      completed: messages.filter(
        (message) => message.status === "completed"
      ).length,
    };
  }, [messages]);

  async function updateStatus(id: number, status: ContactStatus) {
    try {
      setUpdatingId(id);
      setErrorMessage("");

      const { error } = await supabase
        .from("contact_messages")
        .update({ status })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === id ? { ...message, status } : message
        )
      );
    } catch (error) {
      console.error("Error updating contact status:", error);
      setErrorMessage("לא הצלחנו לעדכן את סטטוס הפנייה.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!authorized || loading) {
    return (
      <main dir="rtl" className="min-h-screen bg-neutral-100">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <p>טוען פניות מלקוחות...</p>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-neutral-100 text-black">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <header className="mb-8 flex flex-col gap-5 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium tracking-wide text-gray-500">
              HOME DESIGN ADMIN
            </p>

            <h1 className="text-3xl font-semibold sm:text-4xl">
              פניות מלקוחות
            </h1>

            <p className="mt-3 text-gray-500">
              ניהול הפניות שנשלחו דרך טופס יצירת הקשר באתר.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadMessages}
              className="flex items-center gap-2 border border-gray-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-black"
            >
              <RefreshCw size={16} />
              רענון
            </button>

            <Link
              href="/admin"
              className="flex items-center gap-2 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              <ArrowRight size={17} />
              חזרה ללוח הבקרה
            </Link>
          </div>
        </header>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-xl p-5 text-right shadow-sm transition ${
              filter === "all"
                ? "bg-black text-white"
                : "bg-white hover:bg-neutral-50"
            }`}
          >
            <p className={filter === "all" ? "text-white/70" : "text-gray-500"}>
              כל הפניות
            </p>
            <p className="mt-2 text-3xl font-semibold">{counts.all}</p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("new")}
            className={`rounded-xl p-5 text-right shadow-sm transition ${
              filter === "new"
                ? "bg-black text-white"
                : "bg-white hover:bg-neutral-50"
            }`}
          >
            <p className={filter === "new" ? "text-white/70" : "text-gray-500"}>
              חדשות
            </p>
            <p className="mt-2 text-3xl font-semibold">{counts.new}</p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("processing")}
            className={`rounded-xl p-5 text-right shadow-sm transition ${
              filter === "processing"
                ? "bg-black text-white"
                : "bg-white hover:bg-neutral-50"
            }`}
          >
            <p
              className={
                filter === "processing" ? "text-white/70" : "text-gray-500"
              }
            >
              בטיפול
            </p>
            <p className="mt-2 text-3xl font-semibold">{counts.processing}</p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`rounded-xl p-5 text-right shadow-sm transition ${
              filter === "completed"
                ? "bg-black text-white"
                : "bg-white hover:bg-neutral-50"
            }`}
          >
            <p
              className={
                filter === "completed" ? "text-white/70" : "text-gray-500"
              }
            >
              טופלו
            </p>
            <p className="mt-2 text-3xl font-semibold">{counts.completed}</p>
          </button>
        </section>

        {filteredMessages.length === 0 ? (
          <section className="rounded-xl bg-white px-6 py-16 text-center shadow-sm">
            <MessageSquare
              size={44}
              strokeWidth={1.4}
              className="mx-auto text-gray-300"
            />
            <h2 className="mt-4 text-xl font-semibold">אין פניות להצגה</h2>
            <p className="mt-2 text-sm text-gray-500">
              פניות חדשות מהאתר יופיעו כאן.
            </p>
          </section>
        ) : (
          <section className="space-y-5">
            {filteredMessages.map((message) => (
              <article
                key={message.id}
                className="overflow-hidden rounded-xl bg-white shadow-sm"
              >
                <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold">
                        {message.full_name}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                          message.status
                        )}`}
                      >
                        {getStatusLabel(message.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleString("he-IL")}
                    </p>

                    <div className="mt-5">
                      <p className="text-sm text-gray-500">נושא</p>
                      <p className="mt-1 font-medium">
                        {getSubjectLabel(message.subject)}
                      </p>
                    </div>

                    <div className="mt-5">
                      <p className="text-sm text-gray-500">הודעה</p>
                      <p className="mt-1 whitespace-pre-wrap leading-7">
                        {message.message?.trim() || "לא צורפה הודעה."}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-[220px] flex-col gap-3">
                    <a
                      href={`tel:${message.phone}`}
                      className="flex items-center justify-center gap-2 border border-gray-200 px-4 py-3 text-sm font-medium transition hover:border-black"
                    >
                      <Phone size={17} />
                      {message.phone}
                    </a>

                    <a
                      href={getWhatsAppUrl(message.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 border border-gray-200 px-4 py-3 text-sm font-medium transition hover:border-black"
                    >
                      <MessageCircle size={17} />
                      WhatsApp
                    </a>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 bg-neutral-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {message.status === "completed" ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <Clock3 size={17} />
                    )}
                    סטטוס הפנייה
                  </div>

                  <select
                    value={message.status}
                    disabled={updatingId === message.id}
                    onChange={(event) =>
                      updateStatus(
                        message.id,
                        event.target.value as ContactStatus
                      )
                    }
                    className="border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black disabled:opacity-60"
                  >
                    <option value="new">חדש</option>
                    <option value="processing">בטיפול</option>
                    <option value="completed">טופל</option>
                  </select>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
