"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Home, Settings, Smartphone, Terminal, Zap } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import useI18n from "@/lib/useI18n";

export default function SidebarNav() {
  const pathname = usePathname();
  const t = useI18n();

  const tabs = [
    { href: "/", label: t.navHome, icon: Home },
    { href: "/devices", label: t.navDevices, icon: Smartphone },
    { href: "/activity", label: t.navActivity, icon: Activity },
    { href: "/speed", label: t.navSpeed, icon: Zap },
    { href: "/terminal", label: t.navTerminal, icon: Terminal },
    { href: "/settings", label: t.navSettings, icon: Settings },
  ];

  return (
    <nav className="print-hide sticky top-6 rounded-3xl border border-[color:var(--np-border)] bg-[color:var(--np-glass-bg)] p-4 shadow-[var(--np-shadow-card)] backdrop-blur-xl">
      <div className="mb-6 px-2">
        <BrandLogo className="h-8 w-auto" />
        <h2 className="mt-1 text-xl font-semibold text-[color:var(--np-text)]">{t.navigation}</h2>
      </div>

      <div className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={
                active
                  ? "flex items-center gap-3 rounded-2xl border border-[color:var(--np-border)] bg-[color:var(--np-primary)]/14 px-3 py-2.5 text-[color:var(--np-text)] shadow-[var(--np-shadow-soft)]"
                  : "flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-[color:var(--np-muted)] hover:border-[color:var(--np-border)] hover:bg-[color:var(--np-surface)] hover:text-[color:var(--np-text)]"
              }
            >
              <Icon size={18} className={active ? "text-[color:var(--np-primary-soft)]" : "text-[color:var(--np-muted)]"} />
              <span className="text-sm font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
