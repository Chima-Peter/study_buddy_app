import { ChatShell } from "@/components/chat/chat-shell";

export default function ChatSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChatShell>{children}</ChatShell>;
}
