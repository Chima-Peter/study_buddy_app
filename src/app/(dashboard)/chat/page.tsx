import { Suspense } from "react";
import ChatPage from "./page-client";
import { Spinner } from "@/components/ui/spinner";

export default function ChatPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <ChatPage />
    </Suspense>
  );
}
