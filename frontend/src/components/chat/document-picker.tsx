"use client";

import { useEffect, useState } from "react";
import { listDocuments } from "@/lib/api/documents";
import type { Document } from "@/types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function DocumentPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    listDocuments({ status: "completed", limit: 50 })
      .then((data) => setDocs(data.items))
      .catch(() => setDocs([]));
  }, []);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((x) => x !== id));
    else onChange([...selectedIds, id]);
  };

  const selected = docs.filter((d) => selectedIds.includes(d.id));

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-surface-secondary px-3 py-2">
          <span className="text-xs text-muted">{selected.length} documents selected</span>
          {selected.map((d) => (
            <Badge key={d.id} variant="primary" className="gap-1">
              {d.name}
              <button type="button" onClick={() => toggle(d.id)} aria-label={`Remove ${d.name}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <button
        type="button"
        className="text-xs text-primary-400 hover:underline"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide document picker" : "Scope to documents"}
      </button>
      {open && (
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border bg-surface-secondary p-2">
          {docs.length === 0 && (
            <p className="p-2 text-xs text-muted">No completed documents</p>
          )}
          {docs.map((d) => (
            <label
              key={d.id}
              className="flex min-touch cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-tertiary"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(d.id)}
                onChange={() => toggle(d.id)}
              />
              <span className="truncate">{d.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
