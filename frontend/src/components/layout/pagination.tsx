"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageMeta } from "@/lib/api/types";

interface PaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  /** Disables the controls while a new page is loading. */
  isFetching?: boolean;
}

/** "Showing 21-40 of 57" plus previous/next controls. Hidden when everything fits on one page. */
export function Pagination({ meta, onPageChange, isFetching = false }: PaginationProps) {
  if (meta.total === 0) return null;

  const first = (meta.page - 1) * meta.pageSize + 1;
  const last = Math.min(meta.page * meta.pageSize, meta.total);

  return (
    <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
      <span className="tabular-nums">
        Showing {first}-{last} of {meta.total}
      </span>
      {meta.totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(meta.page - 1)}
            disabled={meta.page <= 1 || isFetching}
          >
            <ChevronLeftIcon data-icon="inline-start" />
            Previous
          </Button>
          <span className="tabular-nums">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(meta.page + 1)}
            disabled={meta.page >= meta.totalPages || isFetching}
          >
            Next
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
