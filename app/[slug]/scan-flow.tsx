"use client";

import { useRef, useState } from "react";
import {
  ChatIcon,
  CheckIcon,
  ExternalLinkIcon,
  FacebookIcon,
  InstagramIcon,
  StarIcon,
} from "@/components/icons";
import { buildDraft } from "@/lib/draft-template";
import type { Business } from "@/lib/types";
import { ui } from "@/lib/ui";

type Step = "rating" | "comment" | "draft" | "thanks";

const PROGRESS_STEPS: Step[] = ["rating", "comment", "draft"];
const RATING_LABELS = ["Tap a star to rate", "Poor", "Fair", "Okay", "Good", "Great"];

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
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [draft, setDraft] = useState("");
  const [copyFailed, setCopyFailed] = useState(false);
  const draftRef = useRef<HTMLTextAreaElement>(null);

  const hasWhatsapp = Boolean(business.whatsapp_number?.replace(/\D/g, ""));
  const shownRating = hoverRating || rating;

  function goToDraft(commentText: string) {
    // Template draft — placeholder for the real AI draft (Phase 3), see lib/draft-template.ts.
    setDraft(buildDraft(rating, commentText, business.name));
    setStep("draft");
  }

  function recordScan() {
    // Fire-and-forget: the server route inserts the scan (public insert, no read-back)
    // and sends any low-rating alert. keepalive lets it finish even if this tab is
    // backgrounded when Google opens.
    fetch("/api/scans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ businessId: business.id, rating, comment, draft }),
    })
      .then((res) => {
        if (!res.ok) console.error("Failed to record scan:", res.status);
      })
      .catch((error) => console.error("Failed to record scan:", error));
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

  const primaryButton = `${ui.buttonPrimary} h-14 w-full text-base`;
  const secondaryButton = `${ui.buttonSecondary} h-14 w-full text-base`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-50">
      <main className="mx-auto flex min-h-screen w-full max-w-[400px] flex-col px-4 pb-10 pt-8">
        <header className="mb-6 flex flex-col items-center gap-3 text-center">
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={`${business.name} logo`}
              className="h-16 w-16 rounded-2xl bg-white object-cover shadow-sm ring-1 ring-stone-200"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-900 text-xl font-semibold text-white shadow-sm">
              {initials(business.name)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-balance">{business.name}</h1>
            {business.category && <p className="text-sm text-stone-500">{business.category}</p>}
          </div>
        </header>

        {step !== "thanks" && (
          <div className="mb-4 flex gap-1.5 px-1" aria-hidden="true">
            {PROGRESS_STEPS.map((s, i) => (
              <span
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= PROGRESS_STEPS.indexOf(step) ? "bg-stone-900" : "bg-stone-200"
                }`}
              />
            ))}
          </div>
        )}

        <div key={step} className={`${ui.card} p-6 motion-safe:animate-fade-up`}>
          {step === "rating" && (
            <section className="flex flex-col items-center gap-6 text-center">
              <div>
                <h2 className="text-lg font-semibold">How was your visit?</h2>
                <p className="mt-1 text-sm text-stone-500" aria-live="polite">
                  {RATING_LABELS[shownRating]}
                </p>
              </div>
              <div
                className="flex gap-1"
                role="radiogroup"
                aria-label="Rating"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = star <= shownRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={rating === star}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 motion-safe:active:scale-90"
                    >
                      <StarIcon
                        width={40}
                        height={40}
                        strokeWidth={1.5}
                        className={filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-stone-300"}
                      />
                    </button>
                  );
                })}
              </div>
              <button type="button" disabled={rating === 0} onClick={() => setStep("comment")} className={primaryButton}>
                Continue
              </button>
            </section>
          )}

          {step === "comment" && (
            <section className="flex flex-col gap-4">
              <div>
                <label htmlFor="comment" className="text-lg font-semibold">
                  Anything you&apos;d like to add?
                </label>
                <p className="mt-1 text-sm text-stone-500">Optional — a few words about your visit.</p>
              </div>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="Tell us about your visit…"
                className={`${ui.input} resize-none py-3 text-base`}
              />
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => goToDraft(comment)} className={primaryButton}>
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setComment("");
                    goToDraft("");
                  }}
                  className={`${ui.buttonGhost} h-12 w-full justify-center text-base`}
                >
                  Skip
                </button>
              </div>
            </section>
          )}

          {step === "draft" && (
            <section className="flex flex-col gap-4">
              {rating <= 3 && hasWhatsapp && (
                <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
                  <p className="mb-3 text-sm text-amber-950">Something not quite right? Message the owner directly.</p>
                  <a
                    href={whatsappLink(business.whatsapp_number!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-green-700 font-medium text-white transition-colors hover:bg-green-800"
                  >
                    <ChatIcon /> Message on WhatsApp
                  </a>
                </div>
              )}

              <div>
                <label htmlFor="draft" className="text-lg font-semibold">
                  Your review
                </label>
                <p className="mt-1 text-sm text-stone-500">Edit it however you like — it&apos;s your review.</p>
              </div>
              <textarea
                id="draft"
                ref={draftRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={6}
                className={`${ui.input} resize-none py-3 text-base leading-relaxed`}
              />

              {business.google_review_url ? (
                <>
                  <button type="button" disabled={!draft.trim()} onClick={handleCopyAndPost} className={primaryButton}>
                    Copy &amp; Post to Google <ExternalLinkIcon width={18} height={18} />
                  </button>
                  <p className="text-center text-xs text-stone-500">
                    We&apos;ll copy your review — just paste it on the Google page.
                  </p>
                </>
              ) : (
                <>
                  <p className="rounded-xl bg-stone-100 p-3 text-center text-sm text-stone-600">
                    Review link not set up yet.
                  </p>
                  <button type="button" onClick={handleFinishWithoutGoogle} className={secondaryButton}>
                    Finish
                  </button>
                </>
              )}
            </section>
          )}

          {step === "thanks" && (
            <section className="flex flex-col items-center gap-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
                <CheckIcon width={28} height={28} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Thanks!</h2>
                <p className="mt-1 text-sm text-stone-500">We appreciate you taking the time.</p>
              </div>

              {copyFailed && (
                <div className="w-full text-left">
                  <p className="mb-2 text-sm text-stone-600">
                    We couldn&apos;t copy automatically. Press and hold to copy your review:
                  </p>
                  <textarea
                    readOnly
                    value={draft}
                    rows={5}
                    onFocus={(e) => e.currentTarget.select()}
                    className={`${ui.input} resize-none py-3 text-base`}
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
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-green-700 text-base font-medium text-white transition-colors hover:bg-green-800"
                >
                  <ChatIcon /> Chat on WhatsApp
                </a>
              )}

              {(business.instagram_url || business.facebook_url) && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Follow us</p>
                  <div className="flex gap-3">
                    {business.instagram_url && (
                      <a
                        href={business.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className={`${ui.buttonSecondary} h-12 w-12 rounded-full`}
                      >
                        <InstagramIcon />
                      </a>
                    )}
                    {business.facebook_url && (
                      <a
                        href={business.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                        className={`${ui.buttonSecondary} h-12 w-12 rounded-full`}
                      >
                        <FacebookIcon />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
