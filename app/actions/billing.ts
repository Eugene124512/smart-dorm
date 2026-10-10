"use server";

import { revalidatePath } from "next/cache";
import { splitMasterInvoice, type SplitShare } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import type { UtilityType } from "@/app/generated/prisma/client";

export type SplitBillState = {
  error?: string;
  period?: string;
  utilityType?: UtilityType;
  masterAmount?: number;
  shares?: SplitShare[];
};

export async function splitBillAction(
  _prev: SplitBillState,
  formData: FormData,
): Promise<SplitBillState> {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") {
    return { error: "Admin access required." };
  }

  const billingPeriod = String(formData.get("billingPeriod") ?? "").trim();
  const utilityType = String(formData.get("utilityType") ?? "") as UtilityType;
  const masterAmount = Number(formData.get("masterAmount"));

  if (!billingPeriod) {
    return { error: "Enter a billing cycle." };
  }
  if (utilityType !== "ELECTRICITY" && utilityType !== "WATER") {
    return { error: "Choose a utility type." };
  }
  if (!Number.isFinite(masterAmount) || masterAmount <= 0) {
    return { error: "Enter a valid master invoice amount." };
  }

  const tenants = await prisma.tenant.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  if (tenants.length === 0) {
    return { error: "No tenants found in SQLite." };
  }

  const shares = splitMasterInvoice(
    masterAmount,
    tenants.map((tenant) => ({
      tenantId: tenant.id,
      name: tenant.user.name,
      roomNumber: tenant.roomNumber,
      hoursPresent: tenant.hoursPresent,
    })),
  );

  await prisma.$transaction(async (tx) => {
    await tx.bill.create({
      data: {
        billingPeriod,
        utilityType,
        masterAmount,
        roomNumber: "ALL",
        status: "MASTER",
      },
    });

    await tx.bill.createMany({
      data: shares.map((share) => ({
        billingPeriod,
        utilityType,
        masterAmount: share.amount,
        roomNumber: share.roomNumber,
        status: "PENDING",
        tenantId: share.tenantId,
      })),
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/bills");
  revalidatePath("/tenant");

  return {
    period: billingPeriod,
    utilityType,
    masterAmount,
    shares,
  };
}

export async function payTenantBillsAction() {
  const session = await getSessionUser();
  if (!session?.tenantId) {
    return { error: "Sign in as a tenant to pay." };
  }

  const pending = await prisma.bill.count({
    where: { tenantId: session.tenantId, status: "PENDING" },
  });

  if (pending === 0) {
    return { error: "No pending SOA items to pay." };
  }

  await prisma.bill.updateMany({
    where: { tenantId: session.tenantId, status: "PENDING" },
    data: { status: "PAID" },
  });

  revalidatePath("/tenant");
  revalidatePath("/admin");
  return { ok: true as const };
}
