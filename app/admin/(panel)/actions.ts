"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

type Field =
  | "slug"
  | "name"
  | "category"
  | "google_review_url"
  | "whatsapp_number"
  | "logo_url"
  | "instagram_url"
  | "facebook_url";

const URL_FIELDS = ["google_review_url", "logo_url", "instagram_url", "facebook_url"] as const;

export type BusinessFormState = {
  errors?: Partial<Record<Field, string>>;
  formError?: string;
};

// Slugs that would collide with app routes (/admin, /dashboard, /api) or admin sub-routes (/admin/new, /admin/login).
const RESERVED_SLUGS = new Set(["admin", "dashboard", "api", "new", "login", "logout"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function optional(formData: FormData, key: Field) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseBusiness(formData: FormData) {
  const errors: Partial<Record<Field, string>> = {};

  const slug = (optional(formData, "slug") ?? "").toLowerCase();
  const name = optional(formData, "name") ?? "";
  const category = optional(formData, "category");
  const urls = Object.fromEntries(URL_FIELDS.map((field) => [field, optional(formData, field)])) as Record<
    (typeof URL_FIELDS)[number],
    string | null
  >;
  const whatsappRaw = optional(formData, "whatsapp_number");

  if (!name) errors.name = "Name is required.";

  if (!slug) errors.slug = "Slug is required.";
  else if (slug.length > 60) errors.slug = "Keep the slug under 60 characters.";
  else if (!SLUG_PATTERN.test(slug)) errors.slug = "Use lowercase letters, numbers and single hyphens only.";
  else if (RESERVED_SLUGS.has(slug)) errors.slug = `"${slug}" is reserved — pick another slug.`;

  for (const field of URL_FIELDS) {
    const value = urls[field];
    if (!value) continue;
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    } catch {
      errors[field] = "Enter a full URL starting with https://";
    }
  }

  // Stored as digits only (country code + number), which is what wa.me expects.
  const whatsapp_number = whatsappRaw ? whatsappRaw.replace(/\D/g, "") : null;
  if (whatsappRaw && (whatsapp_number!.length < 8 || whatsapp_number!.length > 15)) {
    errors.whatsapp_number = "Enter the number with country code, e.g. 919876543210.";
  }

  return {
    values: { slug, name, category, whatsapp_number, ...urls },
    errors: Object.keys(errors).length ? errors : null,
  };
}

async function slugTaken(slug: string, excludeId?: string) {
  let query = createAdminClient().from("businesses").select("id").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.maybeSingle();
  return Boolean(data);
}

const SLUG_TAKEN = { errors: { slug: "That slug is already taken by another business." } };

export async function createBusiness(_prev: BusinessFormState, formData: FormData): Promise<BusinessFormState> {
  await requireAdmin();

  const { values, errors } = parseBusiness(formData);
  if (errors) return { errors };
  if (await slugTaken(values.slug)) return SLUG_TAKEN;

  const { error } = await createAdminClient().from("businesses").insert(values);
  if (error) {
    // 23505 = unique violation (slug taken between the check and the insert).
    if (error.code === "23505") return SLUG_TAKEN;
    console.error("Create business failed:", error.message);
    return { formError: "Couldn't save the business. Please try again." };
  }

  redirect(`/admin/${values.slug}`);
}

export async function updateBusiness(
  id: string,
  _prev: BusinessFormState,
  formData: FormData
): Promise<BusinessFormState> {
  await requireAdmin();

  const { values, errors } = parseBusiness(formData);
  if (errors) return { errors };
  if (await slugTaken(values.slug, id)) return SLUG_TAKEN;

  const { error } = await createAdminClient().from("businesses").update(values).eq("id", id);
  if (error) {
    if (error.code === "23505") return SLUG_TAKEN;
    console.error("Update business failed:", error.message);
    return { formError: "Couldn't save the changes. Please try again." };
  }

  redirect(`/admin/${values.slug}`);
}

export type InviteOwnerState = {
  error?: string;
  // Set on success. tempPassword is only present for a newly created account and is shown once.
  invited?: { email: string; tempPassword?: string };
};

// Finds an existing auth user by email. listUsers has no email filter, so page through.
async function findUserIdByEmail(email: string) {
  const supabase = createAdminClient();
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 1000) return null;
  }
}

// Creates the owner's Supabase Auth account with a generated temporary password (shown
// to the admin once) and links it to the business. If the email already has an account,
// that account is linked as-is and its password is left unchanged.
export async function inviteOwner(
  businessId: string,
  slug: string,
  _prev: InviteOwnerState,
  formData: FormData
): Promise<InviteOwnerState> {
  await requireAdmin();

  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };

  const supabase = createAdminClient();
  const tempPassword = randomBytes(12).toString("base64url");

  let userId: string | null = null;
  let created = false;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });

  if (data.user) {
    userId = data.user.id;
    created = true;
  } else if (error?.code === "email_exists" || error?.code === "user_already_exists") {
    try {
      userId = await findUserIdByEmail(email);
    } catch (lookupError) {
      console.error("Owner lookup failed:", lookupError);
    }
  } else if (error) {
    console.error("Create owner failed:", error.message);
    return { error: `Couldn't create the account: ${error.message}` };
  }

  if (!userId) return { error: "Couldn't find or create an account for that email." };

  const { error: linkError } = await supabase.from("businesses").update({ owner_user_id: userId }).eq("id", businessId);
  if (linkError) {
    console.error("Link owner failed:", linkError.message);
    return { error: "The account exists but couldn't be linked to this business. Try again." };
  }

  revalidatePath(`/admin/${slug}`);
  return { invited: { email, tempPassword: created ? tempPassword : undefined } };
}
