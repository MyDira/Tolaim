"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type ActionResult } from "@/lib/admin/actions";
import { ErrorNote, Field, inputClass } from "./ui";

/**
 * The sign-in form.
 *
 * Reached only by typing /admin. There is no signup, no password reset link
 * and no "create account" — accounts are made in the Supabase dashboard and
 * added to `admin_users` by hand.
 */
export function LoginForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(signIn, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <ErrorNote message={state.error} />}

      <Field label="Email address" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className={inputClass}
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md px-4 py-2.5 text-[0.9375rem] font-semibold text-panel transition-opacity disabled:opacity-60"
      style={{ backgroundColor: "var(--color-accent)" }}
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
