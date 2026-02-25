"use client";

import { LayoutDashboard, Package, Scan, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/spools", label: "Spools", Icon: Package },
  { href: "/scan", label: "Scan", Icon: Scan },
  { href: "/settings", label: "Settings", Icon: Settings },
] as const;

const iconSize = 20;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/signin";

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-[var(--panel)] pb-20 shadow-2xl shadow-black/30">
      <main className="px-4 py-4">{children}</main>
      {!hideNav ? (
        <nav className="fixed bottom-0 left-0 right-0 mx-auto flex w-full max-w-md border-t border-[var(--border)] bg-[var(--panel-elevated)]/95 backdrop-blur shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-caption font-semibold transition-colors ${
                  active ? "text-[var(--brand)]" : "text-[var(--text-muted)]"
                }`}
              >
                <Icon size={iconSize} strokeWidth={2} aria-hidden />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
