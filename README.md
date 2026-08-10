# StudyBuddy Frontend

Next.js 14 student client for the StudyBuddy API.

## Setup

```bash
npm install
cp .env.local.example .env.local   # or use existing .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Ensure the backend `CORS_ORIGINS` includes `http://localhost:3000`.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint

## Features

- **Library** — upload, ingest, cancel/retry, status via SSE (including “no chapters” failures)
- **Tutor chat** — WebSocket RAG chat with document scoping and thinking indicator
- **Study decks** — chapter notes, mnemonics, chapter quizzes; regenerate via `/retry`
- **Question bank** — flat MCQ banks, timed practice exams, score + difficulty breakdown; regenerate via `/retry`
- **Auth** — JWT with grace-window refresh via `X-New-Token` / WS `token_refresh` (no refresh route)
- **Inbox** — notifications + live SSE (`document.status`, study cards, question bank)

## App routes

| Route | Description |
|-------|-------------|
| `/login`, `/register` | Auth |
| `/library` | Document library |
| `/library/upload` | Upload wizard |
| `/library/[id]` | Document detail |
| `/chat`, `/chat/[id]` | Tutor chat |
| `/study`, `/study/[documentId]` | Study decks |
| `/study/[documentId]/quiz/[chapterKey]` | Chapter quiz player |
| `/question-bank` | Question banks |
| `/question-bank/[documentId]` | Bank detail |
| `/question-bank/[documentId]/quiz` | Practice exam |
| `/notifications` | Inbox |
| `/settings` | Profile & theme |

See [student-platform-guide.md](./student-platform-guide.md) for the full API contract the client implements.
