"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE_MB } from "@/config/constants";

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

  const validate = useCallback((f: File) => {
    const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
    if (!(ALLOWED_FILE_EXTENSIONS as readonly string[]).includes(ext)) {
      return `Unsupported type. Allowed: ${ALLOWED_FILE_EXTENSIONS.join(", ")}`;
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
      onFile(null);
      return;
    }
    onFile(f);
  };

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
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-10 transition-colors",
          dragging ? "border-primary-500 bg-primary-500/10" : "border-border bg-surface-tertiary",
        )}
      >
        <Upload className="mb-3 h-8 w-8 text-primary-700" />
        <p className="text-sm font-medium">
          {file ? file.name : "Drop files here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted">
          PDF, DOCX, TXT, MD and more · max {MAX_FILE_SIZE_MB} MB
        </p>
        <input
          type="file"
          className="hidden"
          accept={ALLOWED_FILE_EXTENSIONS.join(",")}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
