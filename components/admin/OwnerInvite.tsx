"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { InviteOwnerState } from "@/app/admin/(panel)/actions";
import { ui } from "@/lib/ui";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${ui.buttonSecondary} h-10 shrink-0 px-4 text-sm`}>
      {pending ? "Saving…" : label}
    </button>
  );
}

export default function OwnerInvite({
  action,
  ownerEmail,
}: {
  action: (state: InviteOwnerState, formData: FormData) => Promise<InviteOwnerState>;
  ownerEmail: string | null;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`h-2 w-2 rounded-full ${ownerEmail ? "bg-green-500" : "bg-stone-300"}`}
          aria-hidden="true"
        />
        {ownerEmail ? (
          <span>
            Owner: <span className="font-medium">{ownerEmail}</span>
          </span>
        ) : (
          <span className="text-stone-500">No owner account linked yet</span>
        )}
      </div>

      <form action={formAction} className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="owner@business.com"
          aria-label="Owner email"
          className={`${ui.input} h-10 min-w-0 flex-1 text-sm`}
        />
        <SubmitButton label={ownerEmail ? "Replace owner" : "Invite owner"} />
      </form>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      {state.invited && (
        <div className="rounded-xl bg-green-50 p-4 text-sm ring-1 ring-green-200">
          {state.invited.tempPassword ? (
            <>
              <p className="mb-3 text-green-950">
                Account created for <span className="font-medium">{state.invited.email}</span>. Send them these login
                details — the password is shown only once.
              </p>
              <dl className="grid grid-cols-[5rem_1fr] gap-y-1 font-mono text-xs">
                <dt className="text-green-800">Login</dt>
                <dd>/dashboard/login</dd>
                <dt className="text-green-800">Password</dt>
                <dd>
                  <span className="select-all rounded bg-white px-1.5 py-0.5 ring-1 ring-green-200">
                    {state.invited.tempPassword}
                  </span>
                </dd>
              </dl>
            </>
          ) : (
            <p className="text-green-950">
              <span className="font-medium">{state.invited.email}</span> already had an account — it&apos;s now linked to
              this business. Their password is unchanged.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
