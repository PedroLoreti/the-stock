"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  KeyRoundIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  PackageIcon,
  ReceiptTextIcon,
  ShoppingCartIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserRole } from "@/lib/api/types";
import { permissions, ROLE_LABELS } from "@/lib/auth/roles";
import { useSession } from "@/lib/auth/session-provider";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** When omitted the item is visible to every signed-in user. */
  visible?: (role: UserRole) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/products", label: "Products", icon: PackageIcon },
  { href: "/sales/new", label: "New sale", icon: ShoppingCartIcon },
  { href: "/sales", label: "Sales", icon: ReceiptTextIcon },
  { href: "/users", label: "Users", icon: UsersIcon, visible: permissions.manageUsers },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/sales") return pathname === "/sales" || /^\/sales\/(?!new)/.test(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useSession();

  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => item.visible?.(user.role) ?? true);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:w-64 md:border-r md:border-b-0">
        <div className="flex h-16 items-center px-5">
          <Link href="/" className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <BrandMark />
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0" aria-label="Main">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                  active &&
                    "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:top-2 before:bottom-2 before:-left-3 before:hidden before:w-0.5 before:rounded-full before:bg-primary md:before:block",
                )}
              >
                <item.icon className={cn("size-4", active && "text-primary")} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-4 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/70 md:px-6">
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="h-10 gap-3 rounded-full px-1.5 pr-3" aria-label="Account menu">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {initialsOf(user.name)}
                    </span>
                    <span className="hidden flex-col items-start leading-tight sm:flex">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</span>
                    </span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="truncate">{user.username}</div>
                    <div className="truncate text-xs font-normal text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/change-password")}>
                  <KeyRoundIcon aria-hidden />
                  Change password
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOutIcon aria-hidden />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
