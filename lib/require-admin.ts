import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isValidAdminSession } from "@/lib/admin-auth";

// Server actions re-check the session themselves rather than relying on middleware alone.
export async function requireAdmin() {
  if (!(await isValidAdminSession(cookies().get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }
}
