// PLACEHOLDER admin auth: one shared password (ADMIN_PASSWORD) for the whole panel.
// Real per-business accounts (each owner only sees their own data, via Supabase Auth +
// the admin_users table and RLS) come in a later phase.
//
// Uses Web Crypto only, so it runs in middleware (Edge runtime) as well as on the server.

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();

// The cookie holds an HMAC keyed by the password, so it can't be forged without the
// password, and changing ADMIN_PASSWORD logs everyone out.
export async function adminSessionToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode("review-engine-admin-session-v1"));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function constantTimeEqual(a: string, b: string) {
  const length = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export async function isValidAdminSession(cookieValue: string | undefined) {
  const token = await adminSessionToken();
  return Boolean(token && cookieValue && constantTimeEqual(cookieValue, token));
}
