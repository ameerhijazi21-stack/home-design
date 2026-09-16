import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebhookPayload = {
  type?: "INSERT" | "UPDATE" | "DELETE";
  table?: string;
  schema?: string;
  record?: Record<string, unknown> | null;
  old_record?: Record<string, unknown> | null;
};

type OrderItem = {
  productId?: number;
  variantId?: number | null;
  slug?: string;
  name?: string;
  price?: number;
  quantity?: number;
  image?: string;
  sku?: string;
  color?: string | null;
  size?: string | null;
  lineTotal?: number;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value: unknown) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "₪0";
  }

  return `₪${amount.toLocaleString("he-IL")}`;
}

function contactSubjectLabel(value: unknown) {
  switch (String(value ?? "")) {
    case "product":
      return "שאלה על מוצר";
    case "custom-sofa":
      return "ספה בהתאמה אישית";
    case "delivery":
      return "משלוח והזמנה";
    case "mattress":
      return "ייעוץ לבחירת מזרן";
    case "other":
      return "נושא אחר";
    default:
      return String(value ?? "פנייה חדשה");
  }
}

function deliveryMethodLabel(value: unknown) {
  return value === "pickup"
    ? "איסוף עצמי"
    : "משלוח";
}

function buildOrderEmail(record: Record<string, unknown>) {
  const orderNumber =
    String(record.order_number ?? "").trim() ||
    "ללא מספר";

  const customerName =
    String(record.customer_name ?? "").trim() ||
    "לקוח";

  const customerPhone =
    String(record.customer_phone ?? "").trim();

  const customerEmail =
    String(record.customer_email ?? "").trim();

  const deliveryMethod =
    deliveryMethodLabel(record.delivery_method);

  const city =
    String(record.city ?? "").trim();

  const address =
    String(record.address ?? "").trim();

  const floor =
    String(record.floor ?? "").trim();

  const apartment =
    String(record.apartment ?? "").trim();

  const notes =
    String(record.notes ?? "").trim();

  const items = Array.isArray(record.items)
    ? (record.items as OrderItem[])
    : [];

  const itemsHtml = items.length
    ? items
        .map((item) => {
          const details = [
            item.color
              ? `צבע: ${escapeHtml(item.color)}`
              : "",
            item.size
              ? `מידה: ${escapeHtml(item.size)}`
              : "",
            item.sku
              ? `מק״ט: ${escapeHtml(item.sku)}`
              : "",
          ]
            .filter(Boolean)
            .join(" · ");

          return `
            <tr>
              <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
                <strong>${escapeHtml(item.name || "מוצר")}</strong>
                ${
                  details
                    ? `<div style="margin-top:4px;color:#6b7280;font-size:13px;">${details}</div>`
                    : ""
                }
              </td>
              <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:center;">
                ${escapeHtml(item.quantity ?? 0)}
              </td>
              <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:left;white-space:nowrap;">
                ${escapeHtml(
                  formatMoney(
                    item.lineTotal ??
                      Number(item.price ?? 0) *
                        Number(item.quantity ?? 0)
                  )
                )}
              </td>
            </tr>
          `;
        })
        .join("")
    : `
      <tr>
        <td colspan="3" style="padding:14px;color:#6b7280;">
          לא נמצאו פריטים בפירוט ההזמנה.
        </td>
      </tr>
    `;

  const addressParts = [
    city,
    address,
    floor ? `קומה ${floor}` : "",
    apartment ? `דירה ${apartment}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;color:#111827;">
      <div style="padding:24px;background:#111827;color:#ffffff;">
        <div style="font-size:13px;letter-spacing:1px;">HOME DESIGN</div>
        <h1 style="margin:8px 0 0;font-size:25px;">הזמנה חדשה באתר</h1>
      </div>

      <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;">
        <p style="margin-top:0;font-size:16px;">
          התקבלה הזמנה חדשה:
          <strong>${escapeHtml(orderNumber)}</strong>
        </p>

        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;width:145px;">שם הלקוח</td>
            <td style="padding:8px 0;"><strong>${escapeHtml(customerName)}</strong></td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;">טלפון</td>
            <td style="padding:8px 0;" dir="ltr">${escapeHtml(customerPhone)}</td>
          </tr>
          ${
            customerEmail
              ? `
                <tr>
                  <td style="padding:8px 0;color:#6b7280;">אימייל</td>
                  <td style="padding:8px 0;" dir="ltr">${escapeHtml(customerEmail)}</td>
                </tr>
              `
              : ""
          }
          <tr>
            <td style="padding:8px 0;color:#6b7280;">אופן קבלה</td>
            <td style="padding:8px 0;">${escapeHtml(deliveryMethod)}</td>
          </tr>
          ${
            addressParts
              ? `
                <tr>
                  <td style="padding:8px 0;color:#6b7280;">כתובת</td>
                  <td style="padding:8px 0;">${escapeHtml(addressParts)}</td>
                </tr>
              `
              : ""
          }
        </table>

        <h2 style="font-size:18px;margin:24px 0 10px;">פריטים</h2>

        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:12px;text-align:right;">מוצר</th>
              <th style="padding:12px;text-align:center;">כמות</th>
              <th style="padding:12px;text-align:left;">סה״כ</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top:20px;padding:16px;background:#f9fafb;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span>סכום ביניים</span>
            <strong>${escapeHtml(formatMoney(record.subtotal))}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span>משלוח</span>
            <strong>${escapeHtml(formatMoney(record.delivery_price))}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:18px;border-top:1px solid #d1d5db;padding-top:10px;">
            <span>סה״כ</span>
            <strong>${escapeHtml(formatMoney(record.total))}</strong>
          </div>
        </div>

        ${
          notes
            ? `
              <div style="margin-top:20px;">
                <strong>הערות הלקוח:</strong>
                <div style="margin-top:8px;padding:12px;background:#fff7ed;border:1px solid #fed7aa;">
                  ${escapeHtml(notes)}
                </div>
              </div>
            `
            : ""
        }

        <p style="margin:24px 0 0;color:#6b7280;font-size:13px;">
          ההזמנה נשמרה במערכת הניהול של Home Design.
        </p>
      </div>
    </div>
  `;

  return {
    subject: `הזמנה חדשה ${orderNumber} - Home Design`,
    html,
  };
}

function buildContactEmail(record: Record<string, unknown>) {
  const fullName =
    String(record.full_name ?? "").trim() ||
    "לקוח";

  const phone =
    String(record.phone ?? "").trim();

  const subject =
    contactSubjectLabel(record.subject);

  const message =
    String(record.message ?? "").trim();

  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#111827;">
      <div style="padding:24px;background:#111827;color:#ffffff;">
        <div style="font-size:13px;letter-spacing:1px;">HOME DESIGN</div>
        <h1 style="margin:8px 0 0;font-size:25px;">פנייה חדשה מהאתר</h1>
      </div>

      <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;width:120px;">שם</td>
            <td style="padding:8px 0;"><strong>${escapeHtml(fullName)}</strong></td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;">טלפון</td>
            <td style="padding:8px 0;" dir="ltr">${escapeHtml(phone)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;">נושא</td>
            <td style="padding:8px 0;">${escapeHtml(subject)}</td>
          </tr>
        </table>

        ${
          message
            ? `
              <div style="margin-top:20px;">
                <strong>הודעה:</strong>
                <div style="margin-top:8px;padding:14px;background:#f9fafb;border:1px solid #e5e7eb;white-space:pre-wrap;">
                  ${escapeHtml(message)}
                </div>
              </div>
            `
            : ""
        }

        <div style="margin-top:24px;">
          <a
            href="https://wa.me/972${escapeHtml(phone.replace(/\D/g, "").replace(/^0/, ""))}"
            style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;"
          >
            פתיחת WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;

  return {
    subject: `פנייה חדשה: ${subject} - ${fullName}`,
    html,
  };
}

export async function POST(request: NextRequest) {
  const expectedSecret =
    process.env.NOTIFICATION_WEBHOOK_SECRET;

  const receivedSecret =
    request.headers.get(
      "x-home-design-webhook-secret"
    );

  if (
    !expectedSecret ||
    !receivedSecret ||
    receivedSecret !== expectedSecret
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const resendApiKey =
    process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return NextResponse.json(
      {
        error:
          "RESEND_API_KEY is not configured",
      },
      { status: 500 }
    );
  }

  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    "superhomedesign.il@gmail.com";

  const fromEmail =
    process.env.EMAIL_FROM ||
    "Home Design <onboarding@resend.dev>";

  let payload: WebhookPayload;

  try {
    payload =
      (await request.json()) as WebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (
    payload.type !== "INSERT" ||
    !payload.record
  ) {
    return NextResponse.json({
      ok: true,
      skipped: true,
    });
  }

  let email:
    | {
        subject: string;
        html: string;
      }
    | null = null;

  if (payload.table === "orders") {
    email = buildOrderEmail(payload.record);
  }

  if (
    payload.table === "contact_messages"
  ) {
    email = buildContactEmail(payload.record);
  }

  if (!email) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Unsupported table",
    });
  }

  const resend = new Resend(resendApiKey);

  const { data, error } =
    await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: email.subject,
      html: email.html,
    });

  if (error) {
    console.error(
      "Resend notification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to send notification",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    id: data?.id ?? null,
  });
}
