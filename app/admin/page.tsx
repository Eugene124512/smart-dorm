import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { formatHours, formatPeso } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const instant = false;

export default function AdminPage() {
  return (
    <Suspense fallback={<p style={{ padding: "1.5rem" }}>Loading monitor…</p>}>
      <AdminDashboard />
    </Suspense>
  );
}

async function AdminDashboard() {
  const session = await getSessionUser();
  if (!session) redirect("/");
  if (session.role !== "ADMIN") redirect("/tenant");

  const [tenants, pendingSoas, masterBills] = await Promise.all([
    prisma.tenant.findMany({
      include: { user: true },
      orderBy: [{ roomNumber: "asc" }, { user: { name: "asc" } }],
    }),
    prisma.bill.count({ where: { status: "PENDING" } }),
    prisma.bill.findMany({
      where: { status: "MASTER" },
      orderBy: { billingPeriod: "desc" },
      take: 8,
    }),
  ]);

  const checkedIn = tenants.filter((tenant) => tenant.status === "ACTIVE").length;

  return (
    <main style={{ maxWidth: 1080, margin: "1.5rem auto 3rem", padding: "0 1.1rem" }}>
      <p
        style={{
          margin: 0,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontSize: "0.72rem",
          color: "var(--leaf)",
        }}
      >
        Wireframe 3 · Building Monitor
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <h1 style={{ margin: "0.2rem 0 1rem" }}>SmartDorm Operations</h1>
        <Link href="/admin/bills" className="primary-btn" style={{ textDecoration: "none" }}>
          Open bill splitter
        </Link>
      </div>

      <section className="stats">
        <article className="stat">
          <span>Total tenants</span>
          <b>{tenants.length}</b>
        </article>
        <article className="stat">
          <span>Currently checked in</span>
          <b>{checkedIn}</b>
        </article>
        <article className="stat">
          <span>Pending SOAs</span>
          <b>{pendingSoas}</b>
        </article>
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Live Room Occupancy Monitor</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data">
            <thead>
              <tr>
                <th>Room</th>
                <th>Tenant</th>
                <th>Keycard</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td>{tenant.roomNumber}</td>
                  <td>{tenant.user.name}</td>
                  <td>{tenant.keycardId}</td>
                  <td>{formatHours(tenant.hoursPresent)}</td>
                  <td>
                    <span className={`pill ${tenant.status === "ACTIVE" ? "active" : "inactive"}`}>
                      {tenant.status === "ACTIVE" ? "Checked in" : "Away"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Recent Utility Bill Summary</h2>
        {masterBills.length === 0 ? (
          <p style={{ marginBottom: 0, color: "#4d5c54" }}>
            No master invoices yet. Post one from Split Bills.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>Utility</th>
                  <th>Master amount</th>
                  <th>Scope</th>
                </tr>
              </thead>
              <tbody>
                {masterBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.billingPeriod}</td>
                    <td>{bill.utilityType}</td>
                    <td>{formatPeso(bill.masterAmount)}</td>
                    <td>{bill.roomNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
