import "server-only";
import { SITE_URL } from "@/lib/site-url";

// Emails ALERT_EMAIL about a 1-3 star scan via Resend's REST API.
// Optional feature: never throws, so a missing key or a Resend outage can't affect scan recording.
//
// Next step (out of scope for now): send per-business alerts to the owner's own email
// (businesses.owner_user_id -> auth user email) instead of one global ALERT_EMAIL.
export async function sendLowRatingAlert(alert: {
  businessName: string;
  slug: string;
  rating: number;
  comment: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL;
  if (!apiKey || !to) {
    console.warn("Low-rating alert skipped: RESEND_API_KEY or ALERT_EMAIL is not set.");
    return;
  }

  // onboarding@resend.dev works without a verified domain, but only delivers to the
  // email address that owns the Resend account. Set ALERT_FROM_EMAIL once you verify a domain.
  const from = process.env.ALERT_FROM_EMAIL || "Review Engine <onboarding@resend.dev>";

  const text = [
    `${alert.businessName} received a ${alert.rating}-star rating.`,
    "",
    `Comment: ${alert.comment || "(no comment)"}`,
    "",
    `See all feedback: ${SITE_URL}/admin/${alert.slug}`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `${alert.rating}★ feedback for ${alert.businessName}`,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.warn(`Low-rating alert failed: Resend responded ${res.status} ${await res.text()}`);
  } catch (error) {
    console.warn("Low-rating alert failed:", error);
  }
}
