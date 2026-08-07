"use client";

import { Input } from "@/components/ui/input";

const statuses: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Queued" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Ready" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export function DocumentFilters({
  name,
  category,
  status,
  onNameChange,
  onCategoryChange,
  onStatusChange,
}: {
  name: string;
  category: string;
  status: string;
  onNameChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onStatusChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-secondary p-3 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <Input
          label="Search"
          placeholder="Search documents..."
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:max-w-[160px]">
        <Input
          label="Category"
          placeholder="Category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        />
      </div>
      <div className="w-full space-y-1.5 sm:max-w-[160px]">
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          Status
        </label>
        <select
          className="h-11 w-full rounded-md border border-border bg-surface-tertiary px-3 text-sm"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s.value || "all"} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
