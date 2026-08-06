# StudyBuddy Frontend

Next.js 14 student client for the StudyBuddy API.

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # or use existing .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api
```

Ensure the backend `CORS_ORIGINS` includes `http://localhost:3000`.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint

## App routes

| Route | Description |
|-------|-------------|
| `/login`, `/register` | Auth |
| `/library` | Document library |
| `/library/upload` | Upload wizard |
| `/library/[id]` | Document detail |
| `/chat`, `/chat/[id]` | Tutor chat |
| `/study`, `/study/[documentId]` | Study decks |
| `/study/[documentId]/quiz` | Quiz player |
| `/notifications` | Inbox |
| `/settings` | Profile & theme |
