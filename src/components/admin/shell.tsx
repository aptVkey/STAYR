"use client";

import { BarChart3, CalendarClock, ExternalLink, LayoutDashboard, LogOut, Radio, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { hardNavigate } from "@/components/admin/api";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/crm", label: "CRM", icon: Users },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarClock },
  { href: "/admin/tracking", label: "Tracking", icon: Radio },
];

async function signOut() {
  await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
  hardNavigate("/admin/login");
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-dvh bg-ink-deep text-paper lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="sticky top-0 z-30 border-b border-paper/8 bg-ink-deep/95 backdrop-blur lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col lg:p-5">
          <div className="flex items-center justify-between px-4 pt-4 lg:px-2 lg:pt-1">
            <Link href="/admin" aria-label="STAYR — backoffice" className="flex items-baseline gap-2.5">
              <Logo />
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-mute">Admin</span>
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="grid size-9 place-items-center rounded-full text-mute hover:text-paper lg:hidden"
              aria-label="Terminar sessão"
            >
              <LogOut className="size-4" />
            </button>
          </div>

          <nav aria-label="Backoffice" className="mt-3 lg:mt-8">
            <ul className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
              {NAV.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active(href) ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-[0.875rem] transition-colors",
                      active(href) ? "bg-surface text-paper ring-1 ring-paper/10" : "text-mute hover:text-paper",
                    )}
                  >
                    <Icon className={cn("size-4", active(href) && "text-lime")} strokeWidth={1.75} aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto hidden flex-col gap-1 lg:flex">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center gap-2.5 rounded-lg px-3 text-[0.875rem] text-mute hover:text-paper"
            >
              <ExternalLink className="size-4" strokeWidth={1.75} aria-hidden />
              Ver site
            </a>
            <button
              type="button"
              onClick={signOut}
              className="flex h-10 items-center gap-2.5 rounded-lg px-3 text-left text-[0.875rem] text-mute hover:text-paper"
            >
              <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
              Terminar sessão
            </button>
          </div>
        </div>
      </aside>

      <main id="main" className="min-w-0 px-4 py-7 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto flex max-w-[78rem] flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
