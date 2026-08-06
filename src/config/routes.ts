export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  library: "/library",
  libraryUpload: "/library/upload",
  libraryDetail: (id: string) => `/library/${id}`,
  chat: "/chat",
  chatConversation: (id: string) => `/chat/${id}`,
  study: "/study",
  studyDeck: (documentId: string) => `/study/${documentId}`,
  studyQuiz: (documentId: string, chapterKey: string) =>
    `/study/${documentId}/quiz/${encodeURIComponent(chapterKey)}`,
  notifications: "/notifications",
  settings: "/settings",
} as const;
