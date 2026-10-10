"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const TENANT = {
  email: "juan.delacruz@smartdorm.local",
  password: "tenant123",
};

const ADMIN = {
  email: "admin@smartdorm.local",
  password: "admin123",
};

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );
  const [email, setEmail] = useState(TENANT.email);
  const [password, setPassword] = useState(TENANT.password);

  return (
    <form action={action} className="card">
      <h2>Resident / Staff Login</h2>
      <p style={{ marginTop: 0, color: "#4d5c54" }}>
        Wireframe 1 — keycard portal. Demo credentials are pre-filled.
      </p>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      {state.error ? (
        <p style={{ color: "var(--danger)", marginTop: 0 }}>{state.error}</p>
      ) : null}

      <button className="primary-btn" type="submit" disabled={pending} style={{ width: "100%" }}>
        {pending ? "Signing in…" : "Login"}
      </button>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem" }}>
        <button
          type="button"
          className="ghost-btn"
          style={{ flex: 1 }}
          onClick={() => {
            setEmail(TENANT.email);
            setPassword(TENANT.password);
          }}
        >
          Use Juan
        </button>
        <button
          type="button"
          className="ghost-btn"
          style={{ flex: 1 }}
          onClick={() => {
            setEmail(ADMIN.email);
            setPassword(ADMIN.password);
          }}
        >
          Use Admin
        </button>
      </div>
    </form>
  );
}
