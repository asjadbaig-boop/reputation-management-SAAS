// Shared Tailwind class sets so buttons, inputs and cards look the same everywhere.

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

export const ui = {
  buttonPrimary: `inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300 ${focusRing}`,
  buttonSecondary: `inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white font-medium text-stone-800 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-400 ${focusRing}`,
  buttonGhost: `inline-flex items-center gap-2 rounded-lg font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 ${focusRing}`,
  input:
    "w-full rounded-xl border border-stone-300 bg-white px-3.5 text-stone-900 placeholder:text-stone-400 transition-shadow focus:border-stone-900 focus:outline-none focus:ring-4 focus:ring-stone-900/10",
  card: "rounded-2xl border border-stone-200 bg-white shadow-sm shadow-stone-900/[0.03]",
  label: "text-sm font-medium text-stone-800",
  link: "text-stone-900 underline decoration-stone-300 underline-offset-4 transition-colors hover:decoration-stone-900",
};
