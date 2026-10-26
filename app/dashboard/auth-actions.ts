"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignInState = { error?: string };

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Enter your email and password." };
  }

  const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    return { error: error.code === "invalid_credentials" ? "Incorrect email or password." : error.message };
  }

  redirect("/dashboard");
}

export async function signOut() {
  await createClient().auth.signOut();
  redirect("/dashboard/login");
}
