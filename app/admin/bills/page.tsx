import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BillSplitForm } from "@/components/bill-split-form";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const instant = false;

export default function BillsPage() {
  return (
    <Suspense fallback={<p style={{ padding: "1.5rem" }}>Loading splitter…</p>}>
      <BillSplitView />
    </Suspense>
  );
}

async function BillSplitView() {
  const session = await getSessionUser();
  if (!session) redirect("/");
  if (session.role !== "ADMIN") redirect("/tenant");

  const tenants = await prisma.tenant.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <main style={{ maxWidth: 860, margin: "1.5rem auto 3rem", padding: "0 1.1rem" }}>
      <p
        style={{
          margin: 0,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontSize: "0.72rem",
          color: "var(--leaf)",
        }}
      >
        Wireframe 4 · Occupancy Split Engine
      </p>
      <h1 style={{ margin: "0.2rem 0 1rem" }}>Bill splitting</h1>
      <BillSplitForm
        tenants={tenants.map((tenant) => ({
          tenantId: tenant.id,
          name: tenant.user.name,
          roomNumber: tenant.roomNumber,
          hoursPresent: tenant.hoursPresent,
        }))}
      />
    </main>
  );
}
