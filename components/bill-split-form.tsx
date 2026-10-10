"use client";

import { useActionState } from "react";
import { splitBillAction, type SplitBillState } from "@/app/actions/billing";
import { formatHours, formatPeso } from "@/lib/format";
import type { OccupancyWeight } from "@/lib/billing";

export function BillSplitForm({ tenants }: { tenants: OccupancyWeight[] }) {
  const [state, action, pending] = useActionState<SplitBillState, FormData>(
    splitBillAction,
    {},
  );

  const totalHours = tenants.reduce((sum, tenant) => sum + tenant.hoursPresent, 0);
  const preview = state.shares ?? [];

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <form action={action} className="card">
        <h2>Bill Entry Form</h2>
        <p style={{ marginTop: 0, color: "#4d5c54" }}>
          Master invoice is split by hours present in SQLite. Example: Juan 450 /
          Maria 300 of 750 hrs.
        </p>
        <div className="field">
          <label htmlFor="billingPeriod">Billing Cycle</label>
          <input
            id="billingPeriod"
            name="billingPeriod"
            defaultValue="October 2026"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="utilityType">Utility Type</label>
          <select id="utilityType" name="utilityType" defaultValue="ELECTRICITY">
            <option value="ELECTRICITY">Electricity</option>
            <option value="WATER">Water</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="masterAmount">Master Invoice Amount</label>
          <input
            id="masterAmount"
            name="masterAmount"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue="480.00"
            required
          />
        </div>
        {state.error ? (
          <p style={{ color: "var(--danger)" }}>{state.error}</p>
        ) : null}
        <button className="primary-btn" type="submit" disabled={pending}>
          {pending ? "Computing split…" : "Compute occupancy split"}
        </button>
      </form>

      <section className="card">
        <h2>Computed Occupancy & Split Preview</h2>
        <p style={{ marginTop: 0, color: "#4d5c54" }}>
          Live occupancy weights: {formatHours(totalHours)} across {tenants.length}{" "}
          tenants.
          {state.masterAmount
            ? ` Posted ${state.utilityType?.toLowerCase()} bill for ${state.period} (${formatPeso(state.masterAmount)}).`
            : " Submit the form to write shares into SQLite."}
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Room</th>
                <th>Hours</th>
                <th>Share</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(preview.length > 0
                ? preview
                : tenants.map((tenant) => ({
                    ...tenant,
                    percent: totalHours
                      ? (tenant.hoursPresent / totalHours) * 100
                      : 0,
                    amount: 0,
                  }))
              ).map((row) => (
                <tr key={row.tenantId}>
                  <td>{row.name}</td>
                  <td>{row.roomNumber}</td>
                  <td>{formatHours(row.hoursPresent)}</td>
                  <td>{row.percent.toFixed(1)}%</td>
                  <td>{preview.length ? formatPeso(row.amount) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
