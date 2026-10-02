import { PackageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Hide the wordmark and show only the square icon. */
  iconOnly?: boolean;
  className?: string;
}

/** Green square with the box icon plus the "The Stock" wordmark. */
export function BrandMark({ iconOnly = false, className }: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <PackageIcon className="size-5" aria-hidden />
      </span>
      {iconOnly ? <span className="sr-only">The Stock</span> : <span className="text-base font-semibold tracking-tight">The Stock</span>}
    </span>
  );
}
