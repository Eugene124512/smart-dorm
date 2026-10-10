"use client";

import { useState, useTransition } from "react";
import { payTenantBillsAction } from "@/app/actions/billing";

type SoaLine = {
  id: string;
  billingPeriod: string;
  utilityType: string;
  masterAmount: number;
  status: string;
};

export function SoaActions({
  tenantName,
  roomNumber,
  keycardId,
  lines,
}: {
  tenantName: string;
  roomNumber: string;
  keycardId: string;
  lines: SoaLine[];
}) {
  const [toast, setToast] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const due = lines.filter((line) => line.status === "PENDING");

  function downloadSoa() {
    const body = [
      "SmartDorm Statement of Account",
      `Tenant: ${tenantName}`,
      `Room: ${roomNumber}`,
      `Keycard: ${keycardId}`,
      "",
      ...lines.map(
        (line) =>
          `${line.billingPeriod}\t${line.utilityType}\tPHP ${line.masterAmount.toFixed(2)}\t${line.status}`,
      ),
      "",
      `Balance due: PHP ${due.reduce((sum, line) => sum + line.masterAmount, 0).toFixed(2)}`,
    ].join("\n");

    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SOA-${roomNumber}-${tenantName.replaceAll(" ", "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button
        className="gcash-btn"
        type="button"
        disabled={pending || due.length === 0}
        onClick={() =>
          start(async () => {
            const result = await payTenantBillsAction();
            if ("error" in result && result.error) {
              setToast(result.error);
            } else {
              setToast("Payment successful via GCash. SOA marked as paid.");
            }
            window.setTimeout(() => setToast(null), 2800);
          })
        }
      >
        {pending ? "Processing GCash…" : "Pay Now Using GCash"}
      </button>
      <button className="ghost-btn" type="button" onClick={downloadSoa}>
        Download SOA
      </button>
      {toast ? <div className="toast">{toast}</div> : null}
    </>
  );
}
