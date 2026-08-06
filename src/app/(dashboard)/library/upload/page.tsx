import { UploadWizard } from "@/components/library/upload-wizard";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Upload document</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Files are uploaded securely, then processed for chat and study cards
        </p>
      </div>
      <UploadWizard />
    </div>
  );
}
