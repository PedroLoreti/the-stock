"use client";

import Link from "next/link";
import { PackageIcon, ReceiptTextIcon, ShoppingCartIcon, UsersIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { permissions } from "@/lib/auth/roles";
import { useSession } from "@/lib/auth/session-provider";

export default function HomePage() {
  const { user } = useSession();
  if (!user) return null;

  const shortcuts = [
    { href: "/sales/new", title: "New sale", description: "Register a sale and update stock", icon: ShoppingCartIcon },
    { href: "/products", title: "Products", description: "Browse the catalogue and stock levels", icon: PackageIcon },
    { href: "/sales", title: "Sales", description: "Review completed and cancelled sales", icon: ReceiptTextIcon },
    ...(permissions.manageUsers(user.role)
      ? [{ href: "/users", title: "Users", description: "Manage accounts and roles", icon: UsersIcon }]
      : []),
  ];

  return (
    <>
      <PageHeader title={`Welcome, ${user.name}`} description="What would you like to do?" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((shortcut) => (
          <Link key={shortcut.href} href={shortcut.href} className="group">
            <Card className="h-full transition-colors group-hover:bg-muted/50">
              <CardHeader>
                <shortcut.icon className="mb-2 size-5 text-muted-foreground" aria-hidden />
                <CardTitle>{shortcut.title}</CardTitle>
                <CardDescription>{shortcut.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
