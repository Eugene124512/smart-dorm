"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function togglePresenceAction() {
  const session = await getSessionUser();
  if (!session?.tenantId) {
    return { error: "Sign in as a tenant to tap your keycard." };
  }

  const now = new Date();
  const openLog = await prisma.occupancyLog.findFirst({
    where: { tenantId: session.tenantId, checkOutTime: null },
    orderBy: { checkInTime: "desc" },
  });

  if (openLog) {
    const durationHours =
      (now.getTime() - openLog.checkInTime.getTime()) / (1000 * 60 * 60);

    await prisma.$transaction(async (tx) => {
      await tx.occupancyLog.update({
        where: { id: openLog.id },
        data: { checkOutTime: now, durationHours },
      });
      await tx.tenant.update({
        where: { id: session.tenantId! },
        data: {
          status: "INACTIVE",
          hoursPresent: { increment: durationHours },
        },
      });
    });
  } else {
    await prisma.$transaction([
      prisma.occupancyLog.create({
        data: {
          tenantId: session.tenantId,
          checkInTime: now,
        },
      }),
      prisma.tenant.update({
        where: { id: session.tenantId },
        data: { status: "ACTIVE" },
      }),
    ]);
  }

  revalidatePath("/tenant");
  revalidatePath("/admin");
  revalidatePath("/admin/bills");
  return { ok: true };
}
