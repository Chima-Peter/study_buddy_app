"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_MB,
} from "@/config/constants";

const ALLOWED_LABEL = ALLOWED_FILE_EXTENSIONS.map((ext) =>
  ext.replace(/^\./, "").toUpperCase(),
).join(", ");

export function UploadDropzone({
  file,
  onFile,
  error,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  error?: string | null;
}) {
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validate = useCallback((f: File) => {
    const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
    if (!(ALLOWED_FILE_EXTENSIONS as readonly string[]).includes(ext)) {
      return `Only ${ALLOWED_LABEL} files are supported`;
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File must be under ${MAX_FILE_SIZE_MB} MB`;
    }
    return null;
  }, []);

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    const err = validate(f);
    if (err) {
      setLocalError(err);
      onFile(null);
      return;
    }
    setLocalError(null);
    onFile(f);
  };

  const shownError = error || localError;

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-touch cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors sm:p-10",
          dragging
            ? "border-primary-500 bg-primary-500/10"
            : "border-border bg-surface-tertiary",
        )}
      >
        <Upload className="mb-3 h-8 w-8 text-brand" />
        <p className="text-sm font-medium">
          {file ? file.name : "Tap to choose a PDF"}
        </p>
        <p className="mt-1 hidden text-xs text-muted sm:block">
          Or drop a PDF here · max {MAX_FILE_SIZE_MB} MB
        </p>
        <p className="mt-1 text-xs text-muted sm:hidden">
          PDF only · max {MAX_FILE_SIZE_MB} MB
        </p>
        <input
          type="file"
          className="hidden"
          accept={ALLOWED_FILE_EXTENSIONS.join(",")}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {shownError && (
        <p className="mt-2 text-sm text-error">{shownError}</p>
      )}
    </div>
  );
}
