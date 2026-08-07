"use client";

import { Modal } from "@/components/ui/modal";
import { UploadWizard } from "./upload-wizard";
import type { Document } from "@/types";

export function UploadModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (doc: Document) => void;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Upload document"
      description="Files are uploaded securely, then processed for chat and study cards"
      className="sm:w-[min(100%-2rem,36rem)]"
    >
      <UploadWizard
        embedded
        onCancel={() => onOpenChange(false)}
        onSuccess={(doc) => {
          onSuccess?.(doc);
          onOpenChange(false);
        }}
      />
    </Modal>
  );
}
