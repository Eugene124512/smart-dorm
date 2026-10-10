import { Suspense } from "react";
import { HeaderNav } from "@/components/header-nav";
import { RoleSwitcher } from "@/components/role-switcher";
import { getSessionUser } from "@/lib/session";

export function AppHeader() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderInner />
    </Suspense>
  );
}

function HeaderFallback() {
  return (
    <header className="sd-header">
      <div className="sd-brand">
        <strong>SmartDorm</strong>
        <span>Occupancy · Keycard · SOA</span>
      </div>
    </header>
  );
}

async function HeaderInner() {
  const session = await getSessionUser();

  return (
    <header className="sd-header">
      <div className="sd-brand">
        <strong>SmartDorm</strong>
        <span>Occupancy · Keycard · SOA</span>
      </div>
      <RoleSwitcher role={session?.role ?? null} />
      <HeaderNav role={session?.role ?? null} signedIn={Boolean(session)} />
    </header>
  );
}
