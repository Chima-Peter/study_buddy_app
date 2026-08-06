"use client";

import { Input } from "@/components/ui/input";

const statuses = ["", "pending", "processing", "completed", "failed", "cancelled"];

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
      <Input
        label="Search"
        placeholder="Search documents..."
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <Input
        label="Category"
        placeholder="Category"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      />
      <div className="w-full space-y-1.5 sm:max-w-[180px]">
        <label className="block text-sm font-medium text-[var(--text-secondary)]">Status</label>
        <select
          className="h-11 w-full rounded-md border border-border bg-surface-tertiary px-3 text-sm"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s || "all"} value={s}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
