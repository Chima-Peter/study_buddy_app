import { UploadWizard } from "@/components/library/upload-wizard";
import { PageHeader } from "@/components/layout/page-header";
import { routes } from "@/config/routes";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload document"
        description="Files are uploaded securely, then processed for chat and study cards"
        showBack
        backHref={routes.library}
      />
      <UploadWizard />
    </div>
  );
}
