"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChatWindow } from "@/components/chat/chat-window";
import { PageLoader } from "@/components/ui/spinner";
import { useChatStore } from "@/stores/chat-store";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { setSelectedDocumentId, resetActive } = useChatStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    resetActive();
    const docs = searchParams.get("docs");
    if (docs) {
      const first = docs.split(",").map((s) => s.trim()).find(Boolean);
      if (first) setSelectedDocumentId(first);
    }
    setReady(true);
  }, [searchParams, setSelectedDocumentId, resetActive]);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center">
        <PageLoader label="Loading chat" />
      </div>
    );
  }

  return <ChatWindow />;
}
