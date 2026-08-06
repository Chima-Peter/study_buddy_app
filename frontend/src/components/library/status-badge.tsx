import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/types";

const map: Record<
  DocumentStatus,
  { label: string; variant: "default" | "primary" | "success" | "warning" | "error" }
> = {
  pending: { label: "Queued", variant: "warning" },
  processing: { label: "Processing", variant: "primary" },
  completed: { label: "Ready", variant: "success" },
  failed: { label: "Failed", variant: "error" },
  cancelled: { label: "Cancelled", variant: "default" },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const meta = map[status] ?? map.pending;
  return (
    <Badge variant={meta.variant} className="gap-1">
      {status === "processing" && <Loader2 className="h-3 w-3 animate-spin" />}
      {meta.label}
    </Badge>
  );
}
