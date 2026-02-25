"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/spools", label: "Spools" },
  { href: "/scan", label: "Scan" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/signin";

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-[var(--panel)] pb-20 shadow-xl">
      <main className="px-4 py-4">{children}</main>
      {!hideNav ? (
        <nav className="fixed bottom-0 left-0 right-0 mx-auto flex w-full max-w-md border-t border-zinc-200 bg-white/95 backdrop-blur">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 py-3 text-center text-sm font-semibold ${
                  active ? "text-[var(--brand)]" : "text-zinc-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
