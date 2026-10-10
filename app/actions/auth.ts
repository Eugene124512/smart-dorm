"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSession, setSessionUser } from "@/lib/session";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return { error: "Invalid credentials. Use the demo accounts below." };
  }

  await setSessionUser(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/tenant");
}

export async function switchDemoRole(role: "ADMIN" | "TENANT") {
  if (role === "ADMIN") {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) return;
    await setSessionUser(admin.id);
    redirect("/admin");
  }

  const juan = await prisma.user.findUnique({
    where: { email: "juan.delacruz@smartdorm.local" },
  });
  if (!juan) return;
  await setSessionUser(juan.id);
  redirect("/tenant");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
