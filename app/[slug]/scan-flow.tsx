"use client";

import { useRef, useState } from "react";
import { buildDraft } from "@/lib/draft-template";
import { createClient } from "@/lib/supabase/client";
import type { Business } from "@/lib/types";

type Step = "rating" | "comment" | "draft" | "thanks";

function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

export default function ScanFlow({ business }: { business: Business }) {
  const [step, setStep] = useState<Step>("rating");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [draft, setDraft] = useState("");
  const [copyFailed, setCopyFailed] = useState(false);
  const draftRef = useRef<HTMLTextAreaElement>(null);

  const hasWhatsapp = Boolean(business.whatsapp_number?.replace(/\D/g, ""));

  function goToDraft(commentText: string) {
    // Template draft — placeholder for the real AI draft (Phase 3), see lib/draft-template.ts.
    setDraft(buildDraft(rating, commentText, business.name));
    setStep("draft");
  }

  function recordScan() {
    // Public insert only — RLS blocks reading the row back, so no .select().
    const supabase = createClient();
    supabase
      .from("scans")
      .insert({
        business_id: business.id,
        rating,
        comment_raw: comment.trim() || null,
        draft_text: draft.trim() || null,
      })
      .then(({ error }) => {
        if (error) console.error("Failed to record scan:", error.message);
      });
  }

  function copyBySelection() {
    const textarea = draftRef.current;
    if (!textarea) return false;
    textarea.focus();
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    }
  }

  function handleCopyAndPost() {
    recordScan();

    // Start the copy before opening the tab: both need the click's user activation.
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(draft).catch(() => setCopyFailed(true));
    } else if (!copyBySelection()) {
      setCopyFailed(true);
    }

    window.open(business.google_review_url!, "_blank", "noopener,noreferrer");
    setStep("thanks");
  }

  function handleFinishWithoutGoogle() {
    recordScan();
    setStep("thanks");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8 text-gray-900">
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        {business.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.logo_url}
            alt={`${business.name} logo`}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 text-2xl font-semibold text-white">
            {initials(business.name)}
          </div>
        )}
        <h1 className="text-2xl font-semibold">{business.name}</h1>
      </header>

      {step === "rating" && (
        <section className="flex flex-col items-center gap-6">
          <p className="text-lg">How was your visit?</p>
          <div className="flex gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                onClick={() => setRating(star)}
                className={`flex h-14 w-14 items-center justify-center text-5xl leading-none ${
                  star <= rating ? "text-amber-400" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={rating === 0}
            onClick={() => setStep("comment")}
            className="h-12 w-full rounded-xl bg-gray-900 text-base font-medium text-white disabled:bg-gray-300"
          >
            Continue
          </button>
        </section>
      )}

      {step === "comment" && (
        <section className="flex flex-col gap-4">
          <label htmlFor="comment" className="text-lg">
            Anything you&apos;d like to add? <span className="text-gray-500">(optional)</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Tell us about your visit…"
            className="w-full rounded-xl border border-gray-300 p-3 text-base"
          />
          <button
            type="button"
            onClick={() => goToDraft(comment)}
            className="h-12 w-full rounded-xl bg-gray-900 text-base font-medium text-white"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => {
              setComment("");
              goToDraft("");
            }}
            className="h-12 w-full rounded-xl border border-gray-300 text-base font-medium"
          >
            Skip
          </button>
        </section>
      )}

      {step === "draft" && (
        <section className="flex flex-col gap-4">
          {rating <= 3 && hasWhatsapp && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="mb-3">Something not quite right? Message the owner directly.</p>
              <a
                href={whatsappLink(business.whatsapp_number!)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center rounded-xl bg-green-600 font-medium text-white"
              >
                Message on WhatsApp
              </a>
            </div>
          )}

          <label htmlFor="draft" className="text-lg">
            Your review draft
          </label>
          <textarea
            id="draft"
            ref={draftRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-gray-300 p-3 text-base"
          />
          <p className="text-sm text-gray-500">Edit it however you like — it&apos;s your review.</p>

          {business.google_review_url ? (
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={handleCopyAndPost}
              className="h-12 w-full rounded-xl bg-gray-900 text-base font-medium text-white disabled:bg-gray-300"
            >
              Copy &amp; Post to Google
            </button>
          ) : (
            <>
              <p className="rounded-xl bg-gray-100 p-3 text-center text-gray-600">
                Review link not set up yet.
              </p>
              <button
                type="button"
                onClick={handleFinishWithoutGoogle}
                className="h-12 w-full rounded-xl border border-gray-300 text-base font-medium"
              >
                Finish
              </button>
            </>
          )}
        </section>
      )}

      {step === "thanks" && (
        <section className="flex flex-col items-center gap-6 text-center">
          <p className="text-3xl font-semibold">Thanks!</p>

          {copyFailed && (
            <div className="w-full text-left">
              <p className="mb-2 text-sm text-gray-600">
                We couldn&apos;t copy automatically. Press and hold to copy your review:
              </p>
              <textarea
                readOnly
                value={draft}
                rows={5}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-xl border border-gray-300 p-3 text-base"
              />
            </div>
          )}

          {hasWhatsapp && (
            <a
              href={whatsappLink(
                business.whatsapp_number!,
                `Hi! I just visited ${business.name} and wanted to claim my 10% off for next time 😊`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center rounded-xl bg-green-600 font-medium text-white"
            >
              Chat on WhatsApp
            </a>
          )}
        </section>
      )}
    </main>
  );
}
