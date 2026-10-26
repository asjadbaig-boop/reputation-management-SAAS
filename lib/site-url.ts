// Public base URL used in QR codes. Set NEXT_PUBLIC_SITE_URL to the real domain when deployed.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export function publicBusinessUrl(slug: string) {
  return `${SITE_URL}/${slug}`;
}
