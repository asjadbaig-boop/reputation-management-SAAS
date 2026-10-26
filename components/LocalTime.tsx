"use client";

// Renders a timestamp in the viewer's own timezone (the server may run in UTC).
export default function LocalTime({ value }: { value: string }) {
  return (
    <time dateTime={value} suppressHydrationWarning>
      {new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
    </time>
  );
}
