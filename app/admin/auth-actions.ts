"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  adminSessionToken,
  constantTimeEqual,
} from "@/lib/admin-auth";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return { error: "ADMIN_PASSWORD is not set on the server." };

  const input = formData.get("password");
  if (typeof input !== "string" || !constantTimeEqual(input, password)) {
    return { error: "Incorrect password." };
  }

  cookies().set(ADMIN_COOKIE, (await adminSessionToken())!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout() {
  cookies().delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}
