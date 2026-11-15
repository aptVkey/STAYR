"use client";

import { CircleAlert, LockKeyhole } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { hardNavigate } from "@/components/admin/api";
import { AdminButton, Input } from "@/components/admin/ui";
import { Logo } from "@/components/ui/logo";

const ERRORS: Record<string, string> = {
  invalid: "Palavra-passe incorreta.",
  rate_limited: "Demasiadas tentativas. Aguarda alguns minutos.",
  not_configured: "O backoffice ainda não está configurado.",
};

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    fetch("/api/admin/login", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { configured?: boolean; authenticated?: boolean }) => {
        if (data.authenticated) hardNavigate("/admin");
        else setConfigured(data.configured !== false);
      })
      .catch(() => undefined);
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (response.ok && data.ok) {
        hardNavigate("/admin");
        return;
      }
      setError(ERRORS[data.error ?? ""] ?? "Não foi possível iniciar sessão.");
    } catch {
      setError("Não foi possível iniciar sessão.");
    }
    setBusy(false);
  };

  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-ink-deep px-5 text-paper">
      <div className="w-full max-w-sm">
        <div className="flex items-baseline gap-2.5">
          <Logo />
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-mute">Admin</span>
        </div>
        <h1 className="mt-10 text-[1.75rem] font-medium leading-none tracking-[-0.04em]">Backoffice</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-mute">
          Funil, analytics, CRM, agenda e tracking num só sítio.
        </p>

        {configured ? (
          <form onSubmit={onSubmit} className="mt-8">
            <label htmlFor="admin-password" className="mb-1.5 block text-[0.8125rem] text-mute">
              Palavra-passe
            </label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? "admin-login-error" : undefined}
              className="h-12 bg-surface"
            />
            <div aria-live="polite" className="min-h-6 pt-2">
              {error && (
                <p id="admin-login-error" className="flex items-center gap-1.5 text-[0.8125rem] text-danger">
                  <CircleAlert className="size-3.5" aria-hidden />
                  {error}
                </p>
              )}
            </div>
            <AdminButton type="submit" busy={busy} className="mt-2 h-12 w-full">
              <LockKeyhole className="size-4" aria-hidden />
              Entrar
            </AdminButton>
          </form>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-lime/45 p-5">
            <p className="text-[0.9375rem] font-medium">Backoffice por configurar</p>
            <p className="mt-2 font-mono text-[0.75rem] leading-relaxed text-mute">
              Define ADMIN_PASSWORD (mínimo 8 caracteres) e ADMIN_SESSION_SECRET no ficheiro .env.local e reinicia o
              servidor.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
