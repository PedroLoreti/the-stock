import type { ReactNode } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  /** Secondary line under the value, e.g. "3 sales". */
  detail?: ReactNode;
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {detail ? <CardDescription>{detail}</CardDescription> : null}
      </CardHeader>
    </Card>
  );
}
