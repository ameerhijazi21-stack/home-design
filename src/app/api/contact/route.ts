import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const ALLOWED_SUBJECTS = new Set([
  "product",
  "custom-sofa",
  "delivery",
  "mattress",
  "other",
]);

function json(
  body: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(
  request: NextRequest
) {
  const contentLength = Number(
    request.headers.get("content-length") || "0"
  );

  if (
    Number.isFinite(contentLength) &&
    contentLength > 12_000
  ) {
    return json(
      {
        ok: false,
        error: "הבקשה גדולה מדי.",
      },
      413
    );
  }

  let body: {
    fullName?: unknown;
    phone?: unknown;
    subject?: unknown;
    message?: unknown;
    website?: unknown;
    startedAt?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "הבקשה אינה תקינה.",
      },
      400
    );
  }

  const fullName =
    typeof body.fullName === "string"
      ? body.fullName.trim()
      : "";

  const phone =
    typeof body.phone === "string"
      ? body.phone.trim()
      : "";

  const subject =
    typeof body.subject === "string"
      ? body.subject.trim()
      : "";

  const message =
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  const website =
    typeof body.website === "string"
      ? body.website.trim()
      : "";

  const startedAt =
    typeof body.startedAt === "number"
      ? body.startedAt
      : 0;

  // Honeypot: pretend success without storing anything.
  if (website) {
    return json({ ok: true });
  }

  if (
    !fullName ||
    fullName.length < 2 ||
    fullName.length > 100
  ) {
    return json(
      {
        ok: false,
        error: "נא להזין שם מלא תקין.",
      },
      400
    );
  }

  const normalizedPhone =
    phone.replace(/[-\s]/g, "");

  if (!/^0\d{8,9}$/.test(normalizedPhone)) {
    return json(
      {
        ok: false,
        error: "נא להזין מספר טלפון תקין.",
      },
      400
    );
  }

  if (!ALLOWED_SUBJECTS.has(subject)) {
    return json(
      {
        ok: false,
        error: "נא לבחור נושא תקין.",
      },
      400
    );
  }

  if (message.length > 1500) {
    return json(
      {
        ok: false,
        error:
          "ההודעה ארוכה מדי. ניתן להזין עד 1,500 תווים.",
      },
      400
    );
  }

  // Very fast submissions are usually automated.
  if (
    startedAt > 0 &&
    Date.now() - startedAt < 1200
  ) {
    return json({ ok: true });
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Missing Supabase environment variables for contact API."
    );

    return json(
      {
        ok: false,
        error:
          "לא הצלחנו לשלוח את הפרטים כרגע.",
      },
      500
    );
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { error } = await supabase.rpc(
    "submit_contact_message",
    {
      p_full_name: fullName,
      p_phone: normalizedPhone,
      p_subject: subject,
      p_message: message || null,
      p_honeypot: "",
    }
  );

  if (error) {
    console.error(
      "Contact RPC error:",
      error
    );

    if (
      error.message.includes(
        "CONTACT_RATE_LIMITED"
      )
    ) {
      return json(
        {
          ok: false,
          error:
            "נשלחו מספר פניות בזמן קצר. נסו שוב בעוד כמה דקות.",
        },
        429
      );
    }

    if (
      error.message.includes(
        "CONTACT_VALIDATION"
      )
    ) {
      return json(
        {
          ok: false,
          error:
            "חלק מהפרטים אינם תקינים.",
        },
        400
      );
    }

    return json(
      {
        ok: false,
        error:
          "לא הצלחנו לשלוח את הפרטים כרגע. אפשר לנסות שוב או לפנות אלינו ב-WhatsApp.",
      },
      500
    );
  }

  return json({ ok: true });
}
