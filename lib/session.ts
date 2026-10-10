import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/client";

export const SESSION_COOKIE = "smartdorm_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId: string | null;
};

type SessionPayload = {
  userId: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw) as SessionPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { tenant: true },
    });
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenant?.id ?? null,
    };
  } catch {
    return null;
  }
}

export async function setSessionUser(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify({ userId } satisfies SessionPayload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
