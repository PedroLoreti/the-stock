import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  /** Secondary line under the value, e.g. "3 sales". */
  detail?: ReactNode;
  icon?: LucideIcon;
}

/** KPI tile: label with an icon box on the right, large value, muted detail line. */
export function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <Card className="gap-4 px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold tracking-tight tabular-nums">{value}</span>
        {detail ? <span className="text-sm text-muted-foreground">{detail}</span> : null}
      </div>
    </Card>
  );
}
