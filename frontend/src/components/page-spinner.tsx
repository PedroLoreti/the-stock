import { Loader2Icon } from "lucide-react";

export function PageSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
      <Loader2Icon className="mr-2 size-4 animate-spin" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}
