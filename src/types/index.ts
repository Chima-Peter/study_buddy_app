export interface ApiEnvelope<T> {
  data: T | null;
  success: boolean;
  message: string | null;
  error: string | null;
}

export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
  limit: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  gender?: string | null;
  university?: string | null;
  bio?: string | null;
  timezone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export type DocumentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface Document {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  status: DocumentStatus;
  comment?: string | null;
  hash?: string | null;
  path?: string | null;
  sections?: string[] | string | number | null;
  created_at: string;
  updated_at: string;
}

export interface UploadResponse {
  upload_url: string;
  path: string;
  document: Document;
}

export interface ConversationListItem {
  id: string;
  title: string;
  status: "active" | "archived";
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  query: string;
  response: string;
  query_message_id?: string | null;
  response_message_id?: string | null;
  created_at: string;
}

export interface ConversationDetail {
  id: string;
  title: string;
  status: "active" | "archived";
  chats: ChatMessage[];
}

export type StudyCardsStatus = "pending" | "failed" | "success";

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_option_index: number;
}

export interface StudySection {
  title: string;
  content: string;
  references: string[];
  external_references: string[];
}

export interface StudyChapter {
  chapter_key: string;
  introduction: string;
  sections: StudySection[];
  /** Concept/section title → short memory aid. Empty `{}` for non-main chapters. */
  mnemonics?: Record<string, string>;
  quiz: QuizQuestion[];
}

export interface StudyCardsResult {
  chapters: StudyChapter[];
}

export interface StudyCards {
  id: string;
  document_id: string;
  document_name: string;
  status: StudyCardsStatus;
  result?: StudyCardsResult | null;
  /** Present on list responses; may be omitted on detail/optimistic rows. */
  chapter_count?: number;
  question_count?: number;
  created_at: string;
  updated_at: string;
}

export type QuestionBankStatus = "pending" | "failed" | "success";

export interface QuestionBankQuestion {
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  difficulty: string;
  internal_references: string[];
  external_references: string[];
}

export interface QuestionBank {
  id: string;
  document_id: string;
  document_name: string | null;
  status: QuestionBankStatus;
  /** Flat shuffled question list; null while pending. */
  result?: QuestionBankQuestion[] | null;
  /** Present on list responses; may be omitted on detail/optimistic rows. */
  question_count?: number;
  reason?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  created_at: string;
  read_at?: string | null;
}

export interface SseEvent {
  type: string;
  data: unknown;
}

export type WsFrameType =
  | "heartbeat"
  | "token_refresh"
  | "chat.response"
  | "chat.title"
  | "chat.done"
  | "chat.error"
  | "error";

export interface WsFrame {
  type: WsFrameType | string;
  response?: string;
  message?: string;
  conversation_id?: string;
  query_message_id?: string;
  response_message_id?: string;
  token?: string;
}
