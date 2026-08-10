# StudyBuddy Student Platform Guide

A detailed blueprint for building a rich student web/mobile client on top of every **live** StudyBuddy API.

> **Contract source of truth:** `/api/docs` and `/api/openapi.json`  
> Paths live under `/api/...` — there is **no** `/api/system` prefix (README may be stale).

---

## Table of contents

1. [Overview](#1-overview)
2. [Architecture the client depends on](#2-architecture-the-client-depends-on)
3. [Response conventions](#3-response-conventions)
4. [Authentication & profile](#4-authentication--profile)
5. [Document library](#5-document-library)
6. [Tutor chat (WebSocket)](#6-tutor-chat-websocket)
7. [Conversations](#7-conversations)
8. [Study cards & quizzes](#8-study-cards--quizzes)
9. [Question bank & practice exams](#9-question-bank--practice-exams)
10. [Notifications & SSE](#10-notifications--sse)
11. [Complete API catalog](#11-complete-api-catalog)
12. [Feature → endpoint map](#12-feature--endpoint-map)
13. [Recommended frontend architecture](#13-recommended-frontend-architecture)
14. [Build phases (MVP → rich)](#14-build-phases-mvp--rich)
15. [Gaps & workarounds](#15-gaps--workarounds)
16. [Local backend checklist](#16-local-backend-checklist)

---

## 1. Overview

StudyBuddy is a **backend-only** FastAPI app. There is no frontend in this repo — you are building a greenfield student platform that integrates:

| Domain | Student value |
|--------|----------------|
| Identity | Register, login, auto token refresh, profile, logout, delete account |
| Library | Upload lecture materials → ingest → searchable knowledge |
| Tutor | Streaming RAG chat grounded in documents + internal memory |
| Study deck | Chapter notes + embedded multiple-choice quizzes |
| Question bank | Flat MCQ banks + timed practice exams with score breakdown |
| Inbox | Know when ingest / study-card / question-bank jobs finish |

**Live surface:** ~30 HTTP routes + 1 WebSocket + 1 SSE stream (health included in HTTP count).

**Happy path:**

```
Register → Upload PDF → Wait for document.status=completed (SSE)
  → Chat about the document (WS)
  → Generate study cards → Read chapters / take quizzes
  → Generate question bank → Sit a timed practice exam
  → Mark notifications read
```

---

## 2. Architecture the client depends on

```
┌─────────────┐     HTTP / WS / SSE      ┌──────────────┐
│ Student app │ ───────────────────────► │ FastAPI /api │
└─────────────┘                          └──────┬───────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    ▼                           ▼                           ▼
               Postgres                    RabbitMQ                      Redis
           (users, docs,              (ingest, cards,              (JWT blacklist,
            chats, cards,              memory extract)              WS caps, SSE)
            notifications)
                    │
                    ▼
         Elasticsearch + Supabase Storage + Gemini (via agents)
```

| Path | What happens |
|------|----------------|
| **Sync** | FastAPI ↔ Postgres for CRUD |
| **Async** | RabbitMQ workers: document ingest, study-card generation, question-bank generation, memory extract (internal) |
| **Realtime** | Redis: JWT blacklist, WS connection limits, SSE fan-out |

Agents the UI never calls directly:

- **Chat agent** — driven by `WS /api/chat`
- **Study cards agent** — driven by `POST /api/study-cards/{document_id}` → queue
- **Question bank agent** — driven by `POST /api/question-bank/{document_id}` → queue

---

## 3. Response conventions

### Standard envelope (all HTTP JSON endpoints)

```json
{
  "data": {},
  "success": true,
  "message": "…",
  "error": null
}
```

Cursor-paginated lists (`documents`, `conversations`, `study-cards`, `question-bank`, `notifications`) use the same envelope with:

```json
{
  "data": {
    "items": […],
    "next_cursor": "<string|null>",
    "has_more": false,
    "limit": 20
  },
  "success": true,
  "message": "…"
}
```

### Exceptions (non-envelope)

| Surface | Shape |
|---------|--------|
| WebSocket | `{ type, response?, message?, conversation_id? }` |
| SSE | `event` + `data` JSON `{ type, data }` |

Normalize WS/SSE in one API client layer.

---

## 4. Authentication & profile

### Token model

1. `POST /register` or `POST /login` → `data.token` (HS256 JWT, `sub` = user id).
2. HTTP: `Authorization: Bearer <token>`.
3. WebSocket: `WS /api/chat?token=<jwt>` (**query param**, not header).
4. Logout / account delete: token written to Redis blacklist until natural expiry.
5. Default TTL: `JWT_EXPIRE_MINUTES` (typically 60).
6. **Grace-window auto-refresh (no refresh route):** if the JWT is expired but still inside `JWT_REFRESH_GRACE_MINUTES` (default **10**), authenticated HTTP calls **succeed** and return a new JWT in response header **`X-New-Token`**. Outside the grace window → **401**.
7. On WebSocket connect with an expired-but-refreshable token, the first frame may be `{ "type": "token_refresh", "token": "…" }` — store it before treating the session as ready.

There is **no** `POST /authentication/refresh` and **no** separate refresh-token cookie — the client reads `X-New-Token` / WS `token_refresh` and replaces the stored Bearer.

### Endpoints

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| `POST` | `/api/authentication/register` | None | `201` — body `{ name, email, password }` → `{ user, token }` |
| `POST` | `/api/authentication/login` | None | Body `{ email, password }` → `{ user, token }` |
| `POST` | `/api/authentication/logout` | Bearer | Blacklists current token; live WS/SSE should stop |
| `GET` | `/api/users/me` | Bearer | Current profile |
| `PATCH` | `/api/users/me` | Bearer | Partial update; **≥1 field required** |
| `DELETE` | `/api/users/me` | Bearer | Deletes account + cleanup + logout |

### Profile fields

| Field | Register | PATCH |
|-------|----------|--------|
| `name` | Required | Optional (min 3) |
| `email` | Required | Optional |
| `password` | Required | Optional (8–255) |
| `gender` | — | Optional |
| `university` | — | Optional |
| `bio` | — | Optional (≤1500) |
| `timezone` | — | Optional |

`UserResponse`: `id`, `name`, `email`, `gender?`, `university?`, `bio?`, `timezone?`, `created_at`, `updated_at`.

### Client notes

- Persist JWT securely; attach on every HTTP call.
- On **every** HTTP / SSE response, if `X-New-Token` is present, replace the stored Bearer (do not call a refresh endpoint).
- On WS `token_refresh`, store `token` before processing later frames.
- On hard `401` (outside grace): clear session, disconnect chat WS, stop SSE reconnect, send to login.
- After logout: tear down chat WS and SSE so they do **not** auto-reconnect with the old session.
- Error codes: `409` email taken, `401` bad credentials / session expired.

---

## 5. Document library

Upload is a **3-step pipeline** — do **not** multipart-upload through FastAPI.

### Upload flow

| Step | Call | Action |
|------|------|--------|
| 1 | `POST /api/documents/upload` | Body: `{ name, category, description?, file_name }` → `{ upload_url, path, document }` |
| 2 | `PUT <upload_url>` | Put **raw file bytes** to the signed Supabase URL |
| 3 | `POST /api/documents/{id}/ingest` | `202` — queues RabbitMQ ingest |
| 4 | SSE `document.status` | Track `pending → processing → completed \| failed \| cancelled` |
| 5 | `POST …/ingest/retry` | Only when status is `failed` (and retryable) |
| 6 | `PATCH …/ingest/cancel` | Cancel in-flight ingest → `cancelled` |

### Allowed files

`.pdf`, `.docx`, `.txt`, `.md`, `.markdown`, `.doc`, `.rtf`, `.odt`, `.epub`  
Extension comes from `file_name`. Default max size ~10 MB.

### Other document APIs

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/documents` | Cursor list: `limit` (1–50), `cursor`, `status`, `category`, `name`, `created_after`, `created_before` |
| `GET` | `/api/documents/{id}` | One document |
| `PATCH` | `/api/documents/{id}` | Metadata: `name`, `description`, `category` (≥1 field) |
| `DELETE` | `/api/documents/{id}` | Delete + storage/vectors cleanup |
| `GET` | `/api/documents/download?document_id=` | Signed download URL |

### Document status → UI

| Status | UI | Actions |
|--------|-----|---------|
| `pending` | Queued | Cancel |
| `processing` | Spinner | Cancel; disable chat-scope / generate |
| `completed` | Ready | Chat, study cards, question bank, download |
| `failed` | Error + `comment` | Retry ingest when retryable |
| `cancelled` | Muted | Prefill upload form with existing metadata; re-upload |

**No chapters:** ingest can fail (often non-retryable) when no chapters are found. Surface user-facing copy such as: *This document has no chapters. Check the document and try again.* Map known `comment` / reason strings in the status panel, document row, and SSE toasts.

`DocumentResponse` includes: `id`, `name`, `description?`, `category`, `status`, `comment?`, `hash?`, `path?`, `sections?`, `created_at`, `updated_at`.

### Screens to build

- Library grid/list with status filters  
- Upload wizard (name, category, file)  
- Detail drawer (status comment, sections, generate cards)  
- Download action via signed URL  

---

## 6. Tutor chat (WebSocket)

### Connect

```
WS /api/chat?token=<jwt>
```

- Max **5** connections per user  
- Payload ≤ **64 KB**  
- Server greets with heartbeat `Ping`

### Client → server (flat JSON)

```json
{
  "query": "Explain mitosis",
  "conversation_id": "<uuid optional>",
  "document_ids": ["<uuid optional>"]
}
```

| Field | Behavior |
|-------|----------|
| Omit `conversation_id` | Server creates conversation titled `"New Conversation"` |
| `document_ids` | Scope RAG to those materials |
| Legacy `document_id` | Still accepted; coerced to a one-element list |
| `query: "ping"` | Heartbeat `Pong` |

> **Do not** use a `type`/`data` envelope on the client message — that matches stale README docs, not the live router.

### Server → client frames

| `type` | Meaning |
|--------|---------|
| `token_refresh` | New JWT (`token` field) — store before treating the session as ready |
| `heartbeat` | Ping / Pong keep-alive |
| `chat.response` | Answer chunk (`response` field) |
| `chat.title` | Auto-generated title (first turn) |
| `chat.done` | Turn finished |
| `chat.error` / `error` | Failure (`message`) |

Most chat frames include `conversation_id`.

### Chat UI checklist

1. Sidebar of conversations; opening one loads history then uses WS.  
2. Optional document multi-select → pass as `document_ids`.  
3. Append `chat.response` chunks into the assistant bubble; finalize on `chat.done`.  
4. Idle ~80s may trigger server Ping — keep the socket alive.  
5. Surface rate-limit copy when `chat.error` says so.
6. On `token_refresh`, update the stored JWT (and shared socket token) without forcing a reconnect loop.
7. On close **1008** / “Not authenticated”, stop reconnecting until the user logs in again.

### What the agent does (for UX copy)

```
retrieval decider → rewrite query
  → retrieve documents / memories / conversation history
  → generate response → save chat
  → update summary / store memory → optional title update
```

Memories are **internal** (Elasticsearch). There is no student-facing memory CRUD API.

---

## 7. Conversations

All conversation HTTP responses use the standard envelope.

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/conversations` | Cursor list: `limit` (1–50, default 20), `cursor` → `{ items, next_cursor, has_more, limit }` |
| `GET` | `/api/conversations/{id}` | `{ id, title, status, chats: [{ id, conversation_id, query, response, created_at }] }` |
| `PATCH` | `/api/conversations/{id}` | Body `{ title }` (1–255 chars) → `{ id, title, status }` |

List item shape: `{ id, title, status }` where `status` is `active` | `archived`.

**Missing HTTP:** create (use WS — omit `conversation_id`), delete / archive via API (`status` patch is not exposed yet).

### Client notes

- Paginate the sidebar with `next_cursor` while `has_more`.
- Rename from the UI with `PATCH`; agent may still auto-title on the first turn (`chat.title`).
- Prefer agent title updates over fighting the user rename — last write wins on the server.

---

## 8. Study cards & quizzes

Study cards turn a **completed** document into chapters with notes + MCQs. Generation is async.

### Endpoints

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/study-cards` | Cursor list: `limit` (1–50, default 20), `cursor`, `status` (`pending` \| `failed` \| `success`) → `{ items, next_cursor, has_more, limit }` |
| `POST` | `/api/study-cards/{document_id}` | `202` → `{ document_id }`. **409** if already `success`, in progress, or previously **failed** (use `/retry`). |
| `POST` | `/api/study-cards/{document_id}/retry` | `202` — regenerate after a **failed** attempt. **404** if never generated; **409** if in progress / not retryable / already success. |
| `GET` | `/api/study-cards/{document_id}` | `{ id, document_id, status, result, created_at, updated_at }` |

Prefer SSE `study_cards_generated` / `study_cards_failed`, then `GET` once. Use the list endpoint for a decks index without N+1 per document. Wire failed-state **Retry** CTAs to `/retry`, not the create endpoint.

### Result shape (`status === "success"`)

```json
{
  "chapters": [
    {
      "chapter_key": "…",
      "introduction": "…",
      "sections": [
        {
          "title": "…",
          "content": "…",
          "references": ["…"],
          "external_references": ["…"]
        }
      ],
      "quiz": [
        {
          "question": "…",
          "options": ["A", "B", "C", "D"],
          "correct_option_index": 0
        }
      ]
    }
  ]
}
```

### Study UX to build

| View | Behavior |
|------|----------|
| Decks index | `GET /study-cards` (optional `status=success`) |
| Document action | “Generate study cards” when ingest is `completed` |
| Chapter outline | Navigate by `chapter_key`; intro + sections |
| Quiz player | MCQ from `quiz[]`; **score client-side** (no score API) |
| References | Show `references` + `external_references` |
| Failure | Toast on `study_cards_failed`; **Retry** via `POST …/retry` |

---

## 9. Question bank & practice exams

Question banks turn a **completed** document into a flat MCQ list (with difficulty + explanations). Generation is async; practice exams are **client-scored** from the bank.

### Endpoints

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/question-bank` | Cursor list: `limit`, `cursor`, `status` (`pending` \| `failed` \| `success`) |
| `POST` | `/api/question-bank/{document_id}` | `202` → `{ document_id }`. **409** if success, in progress, or previously **failed** (use `/retry`). |
| `POST` | `/api/question-bank/{document_id}/retry` | `202` — regenerate after failure. Same **404** / **409** pattern as study-cards retry. |
| `GET` | `/api/question-bank/{document_id}` | Bank detail; `result` is a flat question list when `success` |

### Question shape (`status === "success"`)

```json
[
  {
    "question": "…",
    "options": ["A", "B", "C", "D"],
    "correct_option_index": 0,
    "explanation": "…",
    "difficulty": "easy|medium|hard",
    "internal_references": ["…"],
    "external_references": ["…"]
  }
]
```

Clients may also normalize legacy `{ chapters: [{ questions: […] }] }` payloads into a flat list.

### Exam UX (client-side)

| View | Behavior |
|------|----------|
| Banks index | `GET /question-bank` with status filters |
| Generate | Modal → `POST /question-bank/{document_id}` when ingest is `completed` |
| Detail | Preview questions; start exam via setup modal (count + optional timer) |
| Exam player | Shuffle/subset; score locally; show score ring + difficulty breakdown |
| Failure | Toast on SSE fail; **Retry** via `POST …/retry` |

---

## 10. Notifications & SSE

### REST inbox

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/api/notifications` | Query: `limit`, `cursor`, `unread_only`, `created_after`, `created_before` |
| `PATCH` | `/api/notifications/read` | Body `{ ids: string[] }` (1–100) |
| `PATCH` | `/api/notifications/{id}/read` | Mark one |

Item: `{ id, title, content, created_at, read_at? }`.

### Live stream

```
GET /api/notifications/stream
Authorization: Bearer <token>
Accept: text/event-stream
```

- Resume with `Last-Event-ID`  
- Idle: `event: ping`  
- Payload: `{ type, data }`

| SSE `type` | When | Client action |
|------------|------|----------------|
| `document.status` | Ingest lifecycle | Update library row; toast on completed/failed; map “no chapters” copy |
| `study_cards_generated` | Cards ready | Enable Study view; `GET` cards |
| `study_cards_failed` | Generation exhausted | Show **retry** CTA (`POST …/retry`) |
| `question_bank.status` | Bank pending/success/failed | Upsert bank store; toast; retry CTA on failed |

**Tip:** One authenticated EventSource/fetch-stream per session; fan out to a global store for the unread badge. Apply `X-New-Token` from the SSE connect response. On **401/403** or logout, stop reconnecting permanently until a fresh login.

---

## 11. Complete API catalog

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| `GET` | `/api/health` | Health check | None |
| `POST` | `/api/authentication/register` | Create account + JWT | None |
| `POST` | `/api/authentication/login` | Login + JWT | None |
| `POST` | `/api/authentication/logout` | Blacklist JWT | Bearer |
| `GET` | `/api/users/me` | Current profile | Bearer |
| `PATCH` | `/api/users/me` | Update profile | Bearer |
| `DELETE` | `/api/users/me` | Delete account | Bearer |
| `POST` | `/api/documents/upload` | Signed upload URL | Bearer |
| `GET` | `/api/documents/download` | Signed download URL | Bearer |
| `POST` | `/api/documents/{id}/ingest` | Queue ingest (`202`) | Bearer |
| `POST` | `/api/documents/{id}/ingest/retry` | Retry failed ingest | Bearer |
| `PATCH` | `/api/documents/{id}/ingest/cancel` | Cancel in-flight ingest | Bearer |
| `GET` | `/api/documents` | List documents | Bearer |
| `GET` | `/api/documents/{id}` | Get document | Bearer |
| `PATCH` | `/api/documents/{id}` | Update metadata | Bearer |
| `DELETE` | `/api/documents/{id}` | Delete document | Bearer |
| `GET` | `/api/conversations` | List conversations (cursor) | Bearer |
| `GET` | `/api/conversations/{id}` | History + messages | Bearer |
| `PATCH` | `/api/conversations/{id}` | Rename conversation | Bearer |
| `WS` | `/api/chat?token=` | Streaming tutor (+ optional `token_refresh`) | Query JWT |
| `GET` | `/api/study-cards` | List study cards (cursor) | Bearer |
| `POST` | `/api/study-cards/{document_id}` | Queue generation (`202`) | Bearer |
| `POST` | `/api/study-cards/{document_id}/retry` | Retry failed generation (`202`) | Bearer |
| `GET` | `/api/study-cards/{document_id}` | Get cards + quiz | Bearer |
| `GET` | `/api/question-bank` | List question banks (cursor) | Bearer |
| `POST` | `/api/question-bank/{document_id}` | Queue generation (`202`) | Bearer |
| `POST` | `/api/question-bank/{document_id}/retry` | Retry failed generation (`202`) | Bearer |
| `GET` | `/api/question-bank/{document_id}` | Get bank + questions | Bearer |
| `GET` | `/api/notifications` | List notifications | Bearer |
| `PATCH` | `/api/notifications/read` | Bulk mark read | Bearer |
| `PATCH` | `/api/notifications/{id}/read` | Mark one read | Bearer |
| `GET` | `/api/notifications/stream` | SSE live events | Bearer |

---

## 12. Feature → endpoint map

| Student feature | Endpoints |
|-----------------|-----------|
| Sign up / login / logout | `POST …/register`, `/login`, `/logout` |
| Stay signed in | Read `X-New-Token` on HTTP/SSE; handle WS `token_refresh` within grace window |
| Profile settings | `GET/PATCH/DELETE /api/users/me` |
| Upload materials | `POST /upload` → `PUT` signed URL → `POST …/ingest` |
| Cancel / retry ingest | `PATCH …/ingest/cancel`, `POST …/ingest/retry` |
| Ingest progress | SSE `/notifications/stream` (`document.status`) + list |
| Study chat | `WS /api/chat?token=` |
| Conversation sidebar | `GET /conversations`, `GET /conversations/{id}`, `PATCH /conversations/{id}` |
| Study cards / chapter quizzes | `GET /study-cards`, `POST/GET /study-cards/{document_id}`, `POST …/retry` + SSE `study_cards_*` |
| Question bank / practice exams | `GET /question-bank`, `POST/GET /question-bank/{document_id}`, `POST …/retry` + SSE `question_bank.status` |
| Notification center | `GET /notifications`, `PATCH …/read`, SSE stream |

---

## 13. Recommended frontend architecture

### Modules

| Module | Responsibility |
|--------|----------------|
| `api/http.ts` | Fetch wrapper, Bearer injection, envelope unwrap, apply `X-New-Token`, hard 401 → clear session |
| `api/ws.ts` | Chat socket lifecycle; handle `token_refresh`; no reconnect on 1008 |
| `api/sse.ts` | Notification stream + `Last-Event-ID`; apply `X-New-Token`; stop on 401/403 / logout |
| `stores/session` | User + token |
| `stores/documents` | List cache; patch statuses from SSE |
| `stores/chat` | Active conversation + streaming buffer |
| `stores/studyCards` | Decks list + per-document status/result cache |
| `stores/questionBank` | Banks list + per-document status/result cache |
| `stores/notifications` | Inbox + unread count |

### Route map

**Public**

- `/login`
- `/register`

**Authenticated shell**

- `/library`
- `/library/:id`
- `/chat`
- `/chat/:conversationId`
- `/study`
- `/study/:documentId`
- `/study/:documentId/quiz/:chapterKey`
- `/question-bank`
- `/question-bank/:documentId`
- `/question-bank/:documentId/quiz`
- `/notifications`
- `/settings`

### Env

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Ensure backend `CORS_ORIGINS` includes the SPA origin.

---

## 14. Build phases (MVP → rich)

| Phase | Ship | Done when |
|-------|------|-----------|
| **P0** | Auth + `X-New-Token` client + shell nav | Register / login / logout; grace refresh works |
| **P1** | Upload → ingest → SSE status (+ cancel / no-chapters copy) | PDF reaches `completed` in UI |
| **P2** | Chat WS + conversation sidebar + rename | Grounded Q&A on a document |
| **P3** | Study cards list + quiz player + `/retry` | Chapter read + local quiz score |
| **P4** | Question bank + timed exam player + `/retry` | Practice exam with score breakdown |
| **P5** | Notification center + polish | Unread badge + mark read |

**MVP cut:** Auth → Library → Chat → Study cards → Question bank → Inbox.

---

## 15. Gaps & workarounds

| Gap | Impact | Workaround |
|-----|--------|------------|
| No memory CRUD API | Can't show “what tutor remembers” | Omit UI; agent uses memories silently |
| Exam / quiz scoring is client-only | No server score history | Score in client; optional local history |
| No conversation DELETE / archive HTTP | Sidebar clutter | Hide locally; `status` exists on reads but patch only accepts `title` |
| Grace refresh only (~10m after `exp`) | Must stay active or re-login | Rely on `X-New-Token` / WS `token_refresh`; on hard 401, re-login |
| No courses / curriculum | No class hierarchy | Use `category` on documents as a light tag |
| No password reset / OAuth / email verify | Friction | Email/password only for now |

---

## 16. Local backend checklist

1. `docker compose up -d` (Postgres, Redis, RabbitMQ, Elasticsearch, Supabase, Unstructured, …)  
2. `uv sync`  
3. `uv run alembic upgrade head`  
4. Configure `.env` (`DATABASE_URL`, `REDIS_URL`, `RABBITMQ_URL`, `ELASTICSEARCH_URL`, `SUPABASE_*`, `GOOGLE_API_KEY`, `JWT_SECRET`, …)  
5. `uv run python main.py` → default `0.0.0.0:8000`  
6. Open `http://localhost:8000/api/docs`

Workers for ingest / study cards / question bank / memory start with the app lifespan.

---

## Appendix A — Example client snippets

### Register + store token

```ts
const res = await fetch(`${API}/authentication/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, password }),
});
const body = await res.json();
const token = body.data.token;
```

### Apply `X-New-Token` on every response

```ts
function applyNewToken(res: Response) {
  const next = res.headers.get("X-New-Token");
  if (next) store.setToken(next);
}

// On hard 401: clear session, disconnect WS, stop SSE — do not call a refresh endpoint.
```

### Upload pipeline

```ts
const { data } = await api.post("/documents/upload", {
  name,
  category,
  file_name: file.name,
});

await fetch(data.upload_url, { method: "PUT", body: file });

await api.post(`/documents/${data.document.id}/ingest`);
// wait for SSE document.status === "completed"
```

### Conversations list + rename

```ts
const { data } = await api.get("/conversations", { limit: 20 });
// data.items, data.next_cursor, data.has_more

await api.patch(`/conversations/${id}`, { title: "Mitosis review" });
```

### Chat WebSocket

```ts
const ws = new WebSocket(`${WS_BASE}/chat?token=${token}`);

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  switch (msg.type) {
    case "token_refresh":
      store.setToken(msg.token);
      break;
    case "chat.response":
      appendChunk(msg.response);
      break;
    case "chat.done":
      finalizeTurn(msg.conversation_id);
      break;
    case "chat.title":
      updateTitle(msg.conversation_id, msg.response);
      break;
    case "chat.error":
    case "error":
      showError(msg.message);
      break;
  }
};

ws.send(
  JSON.stringify({
    query: "Summarize chapter 2",
    conversation_id: conversationId, // omit to create
    document_ids: selectedDocIds,
  }),
);
```

### SSE notifications

```ts
const es = new EventSource(`${API}/notifications/stream`, {
  // If using fetch-stream + Authorization header instead of EventSource,
  // prefer fetch: EventSource cannot set Bearer headers in browsers.
});
```

Prefer `fetch` + `ReadableStream` with `Authorization: Bearer …` (browser `EventSource` cannot set custom headers). Parse `id` / `event` / `data` lines; on `document.status`, `study_cards_*`, and `question_bank.status`, update stores.

### Retry failed generation

```ts
await api.post(`/study-cards/${documentId}/retry`);
await api.post(`/question-bank/${documentId}/retry`);
```

---

## Appendix B — Domain entities (quick reference)

| Entity | Storage | Notes |
|--------|---------|--------|
| User | Postgres | Profile fields above |
| Document | Postgres + Supabase + ES | Status machine for ingest; may fail with “no chapters” |
| Conversation / Chat | Postgres | Created via WS; rename via `PATCH` |
| StudyCards | Postgres | Unique per `document_id`; listable; `result` JSONB; retry via `/retry` |
| QuestionBank | Postgres | Unique per `document_id`; flat MCQs; retry via `/retry` |
| Notification | Postgres | + Redis SSE |
| Memory | Elasticsearch only | **No public API** |

---
