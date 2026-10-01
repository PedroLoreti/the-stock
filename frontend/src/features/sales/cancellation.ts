import type { Sale } from "@/lib/api/types";

/** Same window the API enforces: a sale can only be cancelled up to 5 hours after it was made. */
export const CANCELLATION_WINDOW_MS = 5 * 60 * 60 * 1000;

export function cancellationDeadline(sale: Sale): Date {
  return new Date(new Date(sale.createdAt).getTime() + CANCELLATION_WINDOW_MS);
}

export function isWithinCancellationWindow(sale: Sale, now = new Date()): boolean {
  return now.getTime() <= cancellationDeadline(sale).getTime();
}
