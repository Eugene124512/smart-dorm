import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const instant = false;

export default function LoginPage() {
  return (
    <Suspense>
      <main className="login-wrap">
        <p
          style={{
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontSize: "0.75rem",
            color: "var(--leaf)",
            marginBottom: "0.4rem",
          }}
        >
          Wireframe 1 · Access Gate
        </p>
        <h1 style={{ margin: "0 0 1rem", fontSize: "2rem" }}>SmartDorm Portal</h1>
        <LoginForm />
        <p style={{ fontSize: "0.85rem", color: "#4d5c54" }}>
          Tenant: juan.delacruz@smartdorm.local / tenant123
          <br />
          Admin: admin@smartdorm.local / admin123
        </p>
      </main>
    </Suspense>
  );
}
