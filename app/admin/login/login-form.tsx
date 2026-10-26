"use client";

import { useFormState, useFormStatus } from "react-dom";
import { ui } from "@/lib/ui";
import { login, type LoginState } from "../auth-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${ui.buttonPrimary} h-11 w-full text-sm`}>
      {pending ? "Logging in…" : "Log in"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className={`flex flex-col gap-1.5 ${ui.label}`}>
        Password
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className={`${ui.input} h-11 text-sm font-normal`}
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
