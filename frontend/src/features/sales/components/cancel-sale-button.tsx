"use client";

import { BanIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/errors";
import type { Sale } from "@/lib/api/types";
import { permissions } from "@/lib/auth/roles";
import { useSession } from "@/lib/auth/session-provider";
import { formatDateTime } from "@/lib/format";
import { cancellationDeadline, isWithinCancellationWindow } from "../cancellation";
import { useCancelSale } from "../queries";

/**
 * Cancels a sale and restores its stock. Only management/admin can do it,
 * and only within the API's cancellation window; outside it the reason is shown.
 */
export function CancelSaleButton({ sale }: { sale: Sale }) {
  const { user } = useSession();
  const cancel = useCancelSale();

  if (!user || !permissions.cancelSales(user.role) || sale.status !== "COMPLETED") {
    return null;
  }

  const deadline = cancellationDeadline(sale);
  if (!isWithinCancellationWindow(sale)) {
    return (
      <p className="text-sm text-muted-foreground">
        Cancellation window closed on {formatDateTime(deadline)}.
      </p>
    );
  }

  const handleCancel = () => {
    if (!window.confirm("Cancel this sale? The sold quantities will return to stock.")) return;
    cancel.mutate(sale.id, {
      onSuccess: () => toast.success("Sale cancelled and stock restored"),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="destructive" onClick={handleCancel} disabled={cancel.isPending}>
        <BanIcon data-icon="inline-start" />
        {cancel.isPending ? "Cancelling..." : "Cancel sale"}
      </Button>
      <span className="text-xs text-muted-foreground">Allowed until {formatDateTime(deadline)}</span>
    </div>
  );
}
