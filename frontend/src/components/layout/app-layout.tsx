"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Bell,
  Bot,
  ChevronRight,
  CreditCard,
  FileText,
  Heart,
  LayoutDashboard,
  Leaf,
  LogOut,
  Map,
  Menu,
  BarChart3,
  Search,
  Shield,
  ShoppingCart,
  Sprout,
  User,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";
import { canAccessRoute } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { Breadcrumbs } from "@/components/shared/page-shell";
import { getNavLabel } from "@/lib/i18n";
import { useTranslation } from "@/providers/language-provider";
import { UserRole } from "@/types";

const navItems: Record<UserRole, Array<{ href: string; icon: React.ElementType }>> = {
  farmer: [
    { href: "/dashboard", icon: LayoutDashboard },
    { href: "/lands", icon: Map },
    { href: "/crops", icon: Sprout },
    { href: "/marketplace", icon: ShoppingCart },
    { href: "/schemes", icon: Leaf },
    { href: "/complaints", icon: FileText },
    { href: "/trust-score", icon: Shield },
    { href: "/health-card", icon: Heart },
    { href: "/loan-eligibility", icon: CreditCard },
  ],
  buyer: [
    { href: "/dashboard", icon: LayoutDashboard },
    { href: "/marketplace", icon: ShoppingCart },
  ],
  government: [
    { href: "/dashboard", icon: LayoutDashboard },
    { href: "/schemes", icon: Leaf },
    { href: "/complaints", icon: FileText },
    { href: "/village-analytics", icon: BarChart3 },
  ],
  bank: [
    { href: "/dashboard", icon: LayoutDashboard },
    { href: "/trust-score", icon: Shield },
    { href: "/loan-eligibility", icon: CreditCard },
    { href: "/village-analytics", icon: BarChart3 },
    { href: "/health-card", icon: Heart },
  ],
  admin: [
    { href: "/dashboard", icon: LayoutDashboard },
    { href: "/lands", icon: Map },
    { href: "/crops", icon: Sprout },
    { href: "/marketplace", icon: ShoppingCart },
    { href: "/schemes", icon: Leaf },
    { href: "/complaints", icon: FileText },
    { href: "/trust-score", icon: Shield },
    { href: "/health-card", icon: Heart },
    { href: "/village-analytics", icon: BarChart3 },
    { href: "/loan-eligibility", icon: CreditCard },
  ],
};

const AI_ASSISTANT_LINK = {
  href: "/ai-assistant",
  icon: Bot,
};

const SEARCHABLE_ROUTES = ["/marketplace", "/lands", "/crops", "/schemes", "/complaints"];

function buildBreadcrumbs(pathname: string, locale: "en" | "hi") {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return [{ label: getNavLabel(locale, "/dashboard"), href: "/dashboard" }];
  }

  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = getNavLabel(locale, href);
    const isLast = index === segments.length - 1;
    return { label, href: isLast ? undefined : href };
  });
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { locale, t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const roleItems = user ? navItems[user.role] || navItems.farmer : [];
  const sidebarItems = [...roleItems, AI_ASSISTANT_LINK];
  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(pathname, locale),
    [pathname, locale]
  );

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", "header"],
    queryFn: async () => (await notificationsApi.list()).data.results,
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const recentNotifications = notifications.slice(0, 5);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const param = searchParams.get("search") || "";
    if (SEARCHABLE_ROUTES.some((route) => pathname.startsWith(route))) {
      setSearchQuery(param);
    } else {
      setSearchQuery("");
    }
  }, [pathname, searchParams]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (SEARCHABLE_ROUTES.some((route) => pathname.startsWith(route))) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("search", query);
      router.push(`${pathname}?${params.toString()}`);
    } else {
      router.push(`/marketplace?search=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-white to-lime-50/60">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-emerald-100/80 bg-white/95 shadow-xl backdrop-blur-md transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-emerald-100 px-5">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-emerald-950">UNNATI</p>
              <p className="text-[11px] font-medium text-emerald-600">{t("layout.tagline")}</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-emerald-800 hover:bg-emerald-50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {getNavLabel(locale, item.href)}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="border-t border-emerald-100 p-4">
            <div className="rounded-xl bg-emerald-50/80 px-3 py-3">
              <p className="truncate text-sm font-semibold text-emerald-950">
                {user.first_name} {user.last_name}
              </p>
              <p className="truncate text-xs text-emerald-600">{user.email}</p>
              <span className="mt-2 inline-flex rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                {t(`roles.${user.role}`)}
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 border-b border-emerald-100/80 bg-white/80 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <form onSubmit={handleSearch} className="relative hidden flex-1 sm:block sm:max-w-md lg:max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("layout.searchPlaceholder")}
                className="h-10 border-emerald-100 bg-emerald-50/40 pl-9 focus-visible:bg-white"
              />
            </form>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <LanguageToggle />

              {/* Notifications dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-80 rounded-xl border border-emerald-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95"
                  >
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <p className="text-sm font-semibold text-emerald-950">{t("layout.notifications")}</p>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          {t("layout.unread", { count: unreadCount })}
                        </span>
                      )}
                    </div>
                    <DropdownMenu.Separator className="my-1 h-px bg-emerald-100" />
                    {recentNotifications.length === 0 ? (
                      <p className="px-3 py-6 text-center text-sm text-emerald-600">
                        {t("layout.noNotifications")}
                      </p>
                    ) : (
                      recentNotifications.map((n) => (
                        <DropdownMenu.Item key={n.id} asChild>
                          <Link
                            href={n.link || "/notifications"}
                            className={cn(
                              "block cursor-pointer rounded-lg px-3 py-2.5 outline-none transition-colors hover:bg-emerald-50 focus:bg-emerald-50",
                              !n.is_read && "bg-emerald-50/60"
                            )}
                          >
                            <p className="text-sm font-medium text-emerald-950">{n.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-emerald-700">{n.message}</p>
                          </Link>
                        </DropdownMenu.Item>
                      ))
                    )}
                    <DropdownMenu.Separator className="my-1 h-px bg-emerald-100" />
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/notifications"
                        className="flex cursor-pointer items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 outline-none hover:bg-emerald-50 focus:bg-emerald-50"
                      >
                        {t("layout.viewAllNotifications")}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* Profile dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 sm:px-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden max-w-[120px] truncate text-sm font-medium text-emerald-900 md:inline">
                      {user?.first_name}
                    </span>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 min-w-[180px] rounded-xl border border-emerald-100 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95"
                  >
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-emerald-950">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs capitalize text-emerald-600">{t(`roles.${user?.role}`)}</p>
                    </div>
                    {user && canAccessRoute(user.role, "/profile") && (
                      <>
                        <DropdownMenu.Separator className="my-1 h-px bg-emerald-100" />
                        <DropdownMenu.Item asChild>
                          <Link
                            href="/profile"
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-800 outline-none hover:bg-emerald-50 focus:bg-emerald-50"
                          >
                            <User className="h-4 w-4" />
                            {t("layout.profile")}
                          </Link>
                        </DropdownMenu.Item>
                      </>
                    )}
                    <DropdownMenu.Separator className="my-1 h-px bg-emerald-100" />
                    <DropdownMenu.Item
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 outline-none hover:bg-red-50 focus:bg-red-50"
                      onSelect={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      {t("layout.logout")}
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="relative border-t border-emerald-50 px-4 pb-3 sm:hidden">
            <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("layout.searchPlaceholderMobile")}
              className="h-10 border-emerald-100 bg-emerald-50/40 pl-9"
            />
          </form>
        </header>

        <main className="p-4 lg:p-6">
          <Breadcrumbs items={breadcrumbs} />
          {children}
        </main>
      </div>
    </div>
  );
}
