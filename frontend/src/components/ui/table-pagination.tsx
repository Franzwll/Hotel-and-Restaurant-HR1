import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  /** Plural noun used in the "Showing 1–10 of 24 records" label. */
  label?: string;
  /** Hides the "Showing 1–10 of 24" range text, keeping only the page buttons. */
  hideRange?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Shared pagination footer used by every data table in the app. */
export function TablePagination({
  page,
  pageCount,
  from,
  to,
  total,
  label = "records",
  hideRange = false,
  onPageChange,
  className,
}: TablePaginationProps) {
  return (
    <div className={cn("mt-4 flex flex-wrap items-center justify-between gap-3", className)}>
      <p className="text-xs text-muted-foreground">
        Showing {from}–{to} of {total} {label}
      </p>
    <div
      className={cn(
        "mt-4 flex flex-wrap items-center gap-3",
        hideRange ? "justify-end" : "justify-between",
        className,
      )}
    >
      {!hideRange && (
        <p className="text-xs text-muted-foreground">
          Showing {from}–{to} of {total} {label}
        </p>
      )}

      {/* Always rendered — with a single page the controls stay visible but inert
          so the table footer never shifts between searches. */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        {Array.from({ length: Math.max(1, pageCount) }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={p === page ? "default" : "outline"}
            className="w-9"
            disabled={pageCount <= 1}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pageCount}
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
