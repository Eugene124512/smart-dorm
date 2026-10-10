"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export function HeaderNav({
  role,
  signedIn,
}: {
  role: "ADMIN" | "TENANT" | null;
  signedIn: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="sd-nav">
      {role === "ADMIN" ? (
        <>
          <Link href="/admin" data-active={pathname === "/admin"}>
            Monitor
          </Link>
          <Link href="/admin/bills" data-active={pathname === "/admin/bills"}>
            Split Bills
          </Link>
        </>
      ) : (
        <Link href="/tenant" data-active={pathname === "/tenant"}>
          My SOA
        </Link>
      )}
      {signedIn ? (
        <form action={logoutAction}>
          <button className="ghost-btn" type="submit" style={{ padding: "0.4rem 0.7rem" }}>
            Sign out
          </button>
        </form>
      ) : (
        <Link href="/" data-active={pathname === "/"}>
          Login
        </Link>
      )}
    </div>
  );
}
