"use client";

import { useFormState, useFormStatus } from "react-dom";
import { ui } from "@/lib/ui";
import { signIn, type SignInState } from "../auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${ui.buttonPrimary} h-11 w-full text-sm`}>
      {pending ? "Logging in…" : "Log in"}
    </button>
  );
}

export default function SignInForm() {
  const [state, formAction] = useFormState<SignInState, FormData>(signIn, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className={`flex flex-col gap-1.5 ${ui.label}`}>
        Email
        <input
          type="email"
          name="email"
          required
          autoFocus
          autoComplete="email"
          className={`${ui.input} h-11 text-sm font-normal`}
        />
      </label>
      <label className={`flex flex-col gap-1.5 ${ui.label}`}>
        Password
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className={`${ui.input} h-11 text-sm font-normal`}
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
