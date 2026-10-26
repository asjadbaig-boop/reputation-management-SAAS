"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { BusinessFormState } from "@/app/admin/(panel)/actions";
import type { Business } from "@/lib/types";
import { ui } from "@/lib/ui";

function slugify(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${ui.buttonPrimary} h-10 px-5 text-sm`}>
      {pending ? "Saving…" : label}
    </button>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className={ui.label}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-stone-500">{hint}</p>
      )}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className={`${ui.card} grid grid-cols-[14rem_1fr] gap-8 p-6`}>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-stone-500">{description}</p>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

const inputClass = `${ui.input} h-10 text-sm`;

export default function BusinessForm({
  action,
  business,
  submitLabel,
  cancelHref,
}: {
  action: (state: BusinessFormState, formData: FormData) => Promise<BusinessFormState>;
  business?: Business;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useFormState(action, {});
  const [name, setName] = useState(business?.name ?? "");
  const [slug, setSlug] = useState(business?.slug ?? "");
  // When creating, the slug follows the name until the admin edits it by hand.
  const [slugEdited, setSlugEdited] = useState(Boolean(business));
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="flex max-w-4xl flex-col gap-6">
      <Section title="Basics" description="How the business appears on its review page.">
        <Field label="Business name" name="name" error={errors.name}>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugEdited) setSlug(slugify(e.target.value));
            }}
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          name="slug"
          error={errors.slug}
          hint={
            business ? (
              <span className="text-amber-700">
                Changing the slug changes the public URL — QR codes already printed will stop working.
              </span>
            ) : (
              <>
                Public page: <span className="font-mono">/{slug || "your-slug"}</span>
              </>
            )
          }
        >
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value.toLowerCase());
              setSlugEdited(true);
            }}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field label="Category" name="category" error={errors.category} hint="e.g. Restaurant, Salon, Clinic">
          <input id="category" name="category" defaultValue={business?.category ?? ""} className={inputClass} />
        </Field>
      </Section>

      <Section title="Customer links" description="Where customers go to post a review or contact the owner.">
        <Field
          label="Google review URL"
          name="google_review_url"
          error={errors.google_review_url}
          hint="Leave empty to hide the Google button on the scan page."
        >
          <input
            id="google_review_url"
            name="google_review_url"
            type="url"
            defaultValue={business?.google_review_url ?? ""}
            placeholder="https://search.google.com/local/writereview?placeid=…"
            className={inputClass}
          />
        </Field>

        <Field
          label="WhatsApp number"
          name="whatsapp_number"
          error={errors.whatsapp_number}
          hint="Country code + number, e.g. 919876543210."
        >
          <input
            id="whatsapp_number"
            name="whatsapp_number"
            inputMode="tel"
            defaultValue={business?.whatsapp_number ?? ""}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Branding & socials" description="All optional. Empty fields are simply hidden.">
        <Field label="Logo URL" name="logo_url" error={errors.logo_url} hint="Link to a square image. Empty shows initials.">
          <input
            id="logo_url"
            name="logo_url"
            type="url"
            defaultValue={business?.logo_url ?? ""}
            placeholder="https://…/logo.png"
            className={inputClass}
          />
        </Field>

        <Field label="Instagram URL" name="instagram_url" error={errors.instagram_url} hint="Shown on the thank-you screen.">
          <input
            id="instagram_url"
            name="instagram_url"
            type="url"
            defaultValue={business?.instagram_url ?? ""}
            placeholder="https://instagram.com/…"
            className={inputClass}
          />
        </Field>

        <Field label="Facebook URL" name="facebook_url" error={errors.facebook_url} hint="Shown on the thank-you screen.">
          <input
            id="facebook_url"
            name="facebook_url"
            type="url"
            defaultValue={business?.facebook_url ?? ""}
            placeholder="https://facebook.com/…"
            className={inputClass}
          />
        </Field>
      </Section>

      {state.formError && <p className="text-sm text-red-600">{state.formError}</p>}

      <div className="flex items-center justify-end gap-2">
        <Link href={cancelHref} className={`${ui.buttonGhost} h-10 px-4 text-sm`}>
          Cancel
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
