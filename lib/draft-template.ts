// PLACEHOLDER for the real AI draft (Phase 3). Swap buildDraft() for a call to an
// AI draft endpoint (Anthropic, server-side) when it comes back. Same honesty rules
// apply: draft from the customer's words, proportionate to the rating, never inflate.

const NO_COMMENT_LINES = {
  5: [
    (name: string) => `Had a great experience at ${name}, would recommend.`,
    (name: string) => `Really happy with my visit to ${name}.`,
    (name: string) => `${name} did a great job, will be back.`,
    (name: string) => `Great visit to ${name}, glad I came.`,
    (name: string) => `Enjoyed my time at ${name}.`,
  ],
  4: [
    (name: string) => `Good experience at ${name}, happy overall.`,
    (name: string) => `Nice visit to ${name}, would come again.`,
    (name: string) => `${name} was good, pleased with my visit.`,
    (name: string) => `Solid experience at ${name}.`,
  ],
  // 1-3 stars with no detail: stay neutral, don't manufacture praise.
  low: [
    (name: string) => `Visited ${name} today.`,
    (name: string) => `Stopped by ${name}.`,
    (name: string) => `Went to ${name} today.`,
  ],
};

// Closing line after the customer's own comment, scaled to the rating.
// 1-3 stars get no closer so a complaint isn't wrapped in praise.
const COMMENT_CLOSERS: Record<number, (name: string) => string> = {
  5: (name) => `Really enjoyed my visit to ${name}.`,
  4: (name) => `Good visit to ${name} overall.`,
};

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

// Light cleanup only: trim, collapse whitespace, capitalize, end with punctuation.
function cleanComment(comment: string) {
  const text = comment.trim().replace(/\s+/g, " ");
  const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

export function buildDraft(rating: number, comment: string, businessName: string) {
  if (comment.trim()) {
    const closer = COMMENT_CLOSERS[rating];
    const cleaned = cleanComment(comment);
    return closer ? `${cleaned} ${closer(businessName)}` : cleaned;
  }

  const lines = rating === 5 ? NO_COMMENT_LINES[5] : rating === 4 ? NO_COMMENT_LINES[4] : NO_COMMENT_LINES.low;
  return pick(lines)(businessName);
}
