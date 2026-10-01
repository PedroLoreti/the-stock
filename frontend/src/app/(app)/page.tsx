"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/session-provider";

export default function HomePage() {
  const { user, signOut } = useSession();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
      <p className="text-sm text-muted-foreground">
        Signed in as {user?.username} ({user?.role})
      </p>
      <Button variant="outline" onClick={() => signOut()}>
        Sign out
      </Button>
    </main>
  );
}
