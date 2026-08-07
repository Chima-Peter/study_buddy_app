"use client";

import { Modal } from "@/components/ui/modal";
import { UploadWizard } from "./upload-wizard";
import type { Document } from "@/types";

export function UploadModal({
  open,
  onOpenChange,
  onSuccess,
  initialDocument,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (doc: Document) => void;
  initialDocument?: Document | null;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={initialDocument ? "Upload document again" : "Upload document"}
      description="Files are uploaded securely, then processed for chat and study cards"
      className="sm:w-[min(100%-2rem,36rem)]"
    >
      <UploadWizard
        key={initialDocument?.id ?? "new-document"}
        embedded
        initialDocument={initialDocument ?? undefined}
        onCancel={() => onOpenChange(false)}
        onSuccess={(doc) => {
          onSuccess?.(doc);
          onOpenChange(false);
        }}
      />
    </Modal>
  );
}
