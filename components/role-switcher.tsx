"use client";

import { useTransition } from "react";
import { switchDemoRole } from "@/app/actions/auth";

export function RoleSwitcher({ role }: { role: "ADMIN" | "TENANT" | null }) {
  const [pending, start] = useTransition();

  return (
    <div className="role-switch" aria-label="Role Switcher">
      <button
        type="button"
        data-active={role !== "ADMIN"}
        disabled={pending}
        onClick={() => start(() => switchDemoRole("TENANT"))}
      >
        Tenant View
      </button>
      <button
        type="button"
        data-active={role === "ADMIN"}
        disabled={pending}
        onClick={() => start(() => switchDemoRole("ADMIN"))}
      >
        Admin Dashboard
      </button>
    </div>
  );
}
