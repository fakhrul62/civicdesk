"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  Users,
  BarChart3,
  ScrollText,
  Settings,
  Landmark,
  Menu,
  LogOut,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", labelKey: "admin.dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tickets", labelKey: "admin.tickets", icon: Ticket },
  { href: "/admin/agents", labelKey: "admin.agents", icon: Users },
  { href: "/admin/analytics", labelKey: "admin.analytics", icon: BarChart3 },
  { href: "/admin/audit-log", labelKey: "admin.auditLog", icon: ScrollText },
  { href: "/admin/settings", labelKey: "admin.settings", icon: Settings },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [admin, setAdmin] = useState({ name: t("admin.fallbackName"), email: "" });
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadAdmin() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!mounted || !user) return;

      setAdmin({
        name:
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          t("admin.fallbackName"),
        email: user.email || "",
      });
    }

    loadAdmin();

    return () => {
      mounted = false;
    };
  }, [t]);

  const initials = admin.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AD";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Landmark className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-semibold tracking-tight">
          Civic<span className="text-primary">Desk</span>
        </span>
        <Badge variant="secondary" className="ml-auto text-[10px]">
          {t("admin.badge")}
        </Badge>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href} onClick={onNavClick}>
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{admin.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {admin.email || t("admin.fallbackName")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            disabled={signingOut}
            onClick={() => {
              setSigningOut(true);
              window.location.assign("/sign-out");
            }}
            aria-label={signingOut ? t("admin.signingOut") : t("admin.signOut")}
          >
            {signingOut ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-2">
            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-56 p-0">
                <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                <SidebarContent onNavClick={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="hidden sm:block">
              <LanguageSwitcher compact />
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
