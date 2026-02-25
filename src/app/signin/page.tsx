"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const onRequestCode = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn("email", { email });
      setAwaitingCode(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request code");
    } finally {
      setBusy(false);
    }
  };

  const onVerifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn("email", { email, code });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] p-5 shadow-xl shadow-black/30">
      <h1 className="text-page-title text-[var(--text)]">Sign in</h1>
      <p className="mb-4 text-body text-[var(--text-muted)]">Email verification code via Convex Auth.</p>

      <form className="space-y-3" onSubmit={awaitingCode ? onVerifyCode : onRequestCode}>
        <label className="block text-body font-medium text-[var(--text)]">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text)]"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        {awaitingCode ? (
          <label className="block text-body font-medium text-[var(--text)]">
            Verification code
            <input
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text)]"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </label>
        ) : null}

        {error ? <p className="text-body text-red-400">{error}</p> : null}

        <button
          className="w-full rounded-lg bg-[var(--brand)] px-3 py-2 text-button text-white shadow-md transition-colors hover:bg-[var(--brand-hover)] disabled:opacity-60"
          disabled={busy}
          type="submit"
        >
          {busy ? "Please wait..." : awaitingCode ? "Verify & sign in" : "Send code"}
        </button>
      </form>

      <p className="mt-3 text-caption text-[var(--text-dim)]">
        If `AUTH_RESEND_KEY` is not configured, OTP codes are logged in Convex function logs.
      </p>
    </div>
  );
}
