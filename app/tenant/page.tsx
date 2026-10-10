import { redirect } from "next/navigation";
import { Suspense } from "react";
import { togglePresenceAction } from "@/app/actions/occupancy";
import { SoaActions } from "@/components/soa-actions";
import { formatHours, formatPeso } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const instant = false;

export default function TenantPage() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center" }}>Loading tenant view…</p>}>
      <TenantView />
    </Suspense>
  );
}

async function TenantView() {
  const session = await getSessionUser();
  if (!session) redirect("/");
  if (session.role !== "TENANT" || !session.tenantId) redirect("/admin");

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    include: {
      user: true,
      bills: { orderBy: { billingPeriod: "desc" } },
      occupancyLogs: {
        where: { checkOutTime: null },
        orderBy: { checkInTime: "desc" },
        take: 1,
      },
    },
  });

  if (!tenant) redirect("/");

  const loggedIn = tenant.status === "ACTIVE" || tenant.occupancyLogs.length > 0;
  const soa = tenant.bills.filter((bill) => bill.status !== "MASTER");
  const electricity = soa
    .filter((bill) => bill.utilityType === "ELECTRICITY" && bill.status === "PENDING")
    .reduce((sum, bill) => sum + bill.masterAmount, 0);
  const water = soa
    .filter((bill) => bill.utilityType === "WATER" && bill.status === "PENDING")
    .reduce((sum, bill) => sum + bill.masterAmount, 0);
  const paid = soa
    .filter((bill) => bill.status === "PAID")
    .reduce((sum, bill) => sum + bill.masterAmount, 0);

  return (
    <div className="phone-shell">
      <div className="phone-screen">
        <div>
          <p
            style={{
              margin: 0,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontSize: "0.68rem",
              color: "var(--leaf)",
            }}
          >
            Wireframe 2 · Tenant Mobile
          </p>
          <h1 style={{ margin: "0.2rem 0 0", fontSize: "1.45rem" }}>Room {tenant.roomNumber}</h1>
        </div>

        <section className="card">
          <h2>User Info</h2>
          <p style={{ margin: "0 0 0.35rem", fontSize: "1.2rem", fontWeight: 700 }}>
            {tenant.user.name}
          </p>
          <p style={{ margin: 0, color: "#4d5c54" }}>
            Room {tenant.roomNumber} · Keycard {tenant.keycardId}
          </p>
          <p style={{ margin: "0.55rem 0 0" }}>
            <span className={`pill ${tenant.status === "ACTIVE" ? "active" : "inactive"}`}>
              {tenant.status}
            </span>
          </p>
        </section>

        <section className="card">
          <h2>Current Presence Status</h2>
          <div className="presence-flag" data-on={loggedIn}>
            {loggedIn ? "[ LOGGED IN ]" : "[ LOGGED OUT ]"}
          </div>
          <p style={{ color: "#4d5c54", margin: "0.75rem 0" }}>
            Hours tracked this cycle: <strong>{formatHours(tenant.hoursPresent)}</strong>
          </p>
          <form action={togglePresenceAction}>
            <button className="primary-btn" type="submit" style={{ width: "100%" }}>
              {loggedIn ? "Tap keycard to check out" : "Tap keycard to check in"}
            </button>
          </form>
        </section>

        <section className="card" style={{ flex: 1 }}>
          <h2>Statement of Account</h2>
          <table className="data">
            <tbody>
              <tr>
                <td>Electricity share</td>
                <td style={{ textAlign: "right" }}>{formatPeso(electricity)}</td>
              </tr>
              <tr>
                <td>Water share</td>
                <td style={{ textAlign: "right" }}>{formatPeso(water)}</td>
              </tr>
              <tr>
                <td>Already paid</td>
                <td style={{ textAlign: "right" }}>{formatPeso(paid)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Balance due</strong>
                </td>
                <td style={{ textAlign: "right" }}>
                  <strong>{formatPeso(electricity + water)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          {soa.length === 0 ? (
            <p style={{ color: "#4d5c54", marginBottom: 0 }}>
              No posted bills yet. Ask admin to run a utility split.
            </p>
          ) : (
            <ul style={{ paddingLeft: "1.1rem", color: "#4d5c54" }}>
              {soa.slice(0, 4).map((bill) => (
                <li key={bill.id}>
                  {bill.billingPeriod} {bill.utilityType.toLowerCase()} ·{" "}
                  {formatPeso(bill.masterAmount)} · {bill.status}
                </li>
              ))}
            </ul>
          )}
        </section>

        <SoaActions
          tenantName={tenant.user.name}
          roomNumber={tenant.roomNumber}
          keycardId={tenant.keycardId}
          lines={soa.map((bill) => ({
            id: bill.id,
            billingPeriod: bill.billingPeriod,
            utilityType: bill.utilityType,
            masterAmount: bill.masterAmount,
            status: bill.status,
          }))}
        />
      </div>
    </div>
  );
}
