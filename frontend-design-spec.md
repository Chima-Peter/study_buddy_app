# StudyBuddy Frontend Design Specification

A production-level Next.js frontend specification for the StudyBuddy student platform.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [File Structure](#4-file-structure)
5. [Architecture](#5-architecture)
6. [Component Library](#6-component-library)
7. [Page Designs](#7-page-designs)
8. [Responsive Design](#8-responsive-design)
9. [Animations & Micro-interactions](#9-animations--micro-interactions)
10. [Accessibility](#10-accessibility)
11. [Performance Guidelines](#11-performance-guidelines)

---

## 1. Design Philosophy

### Core Principles

| Principle | Application |
|-----------|-------------|
| **Focus Mode** | Minimize distractions during study sessions |
| **Progress Clarity** | Always show where the student is in their learning journey |
| **Instant Feedback** | Real-time responses for uploads, chat, and quizzes |
| **Mobile-First** | Students study anywhere—design for phones first |
| **Dark Mode Default** | Reduce eye strain during late-night study sessions |

### Target Audience

- University students (18-26)
- Graduate students and professionals
- Self-learners preparing for certifications

### Design Tone

- Modern, clean, slightly playful (not corporate)
- Confident but approachable
- Academic without being boring

---

## 2. Color System

### Primary Palette

```css
:root {
  /* Primary - Deep Indigo (trust, focus, intelligence) */
  --primary-50: #EEF2FF;
  --primary-100: #E0E7FF;
  --primary-200: #C7D2FE;
  --primary-300: #A5B4FC;
  --primary-400: #818CF8;
  --primary-500: #6366F1;  /* Main brand */
  --primary-600: #4F46E5;
  --primary-700: #4338CA;
  --primary-800: #3730A3;
  --primary-900: #312E81;

  /* Secondary - Teal (growth, freshness, creativity) */
  --secondary-50: #F0FDFA;
  --secondary-100: #CCFBF1;
  --secondary-200: #99F6E4;
  --secondary-300: #5EEAD4;
  --secondary-400: #2DD4BF;
  --secondary-500: #14B8A6;  /* Accent */
  --secondary-600: #0D9488;
  --secondary-700: #0F766E;
  --secondary-800: #115E59;
  --secondary-900: #134E4A;
}
```

### Semantic Colors

```css
:root {
  /* Success - Emerald */
  --success-light: #D1FAE5;
  --success-main: #10B981;
  --success-dark: #059669;

  /* Warning - Amber */
  --warning-light: #FEF3C7;
  --warning-main: #F59E0B;
  --warning-dark: #D97706;

  /* Error - Rose */
  --error-light: #FFE4E6;
  --error-main: #F43F5E;
  --error-dark: #E11D48;

  /* Info - Sky */
  --info-light: #E0F2FE;
  --info-main: #0EA5E9;
  --info-dark: #0284C7;
}
```

### Dark Theme (Default)

```css
[data-theme="dark"] {
  --bg-primary: #0F0F12;      /* Main background */
  --bg-secondary: #1A1A1F;    /* Cards, sidebars */
  --bg-tertiary: #252529;     /* Inputs, hover states */
  --bg-elevated: #2D2D33;     /* Modals, dropdowns */

  --text-primary: #FAFAFA;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
  --text-inverse: #09090B;

  --border-default: #27272A;
  --border-strong: #3F3F46;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.6);
}
```

### Light Theme

```css
[data-theme="light"] {
  --bg-primary: #FAFAFA;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F4F4F5;
  --bg-elevated: #FFFFFF;

  --text-primary: #18181B;
  --text-secondary: #52525B;
  --text-muted: #A1A1AA;
  --text-inverse: #FAFAFA;

  --border-default: #E4E4E7;
  --border-strong: #D4D4D8;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### Gradient System

```css
:root {
  /* Hero gradients */
  --gradient-primary: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%);
  --gradient-accent: linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%);

  /* Subtle backgrounds */
  --gradient-card: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  --gradient-glow: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%);
}
```

### Document Status Colors

| Status | Color | Usage |
|--------|-------|-------|
| `pending` | `--warning-main` | Queued badge |
| `processing` | `--info-main` | Spinner + pulse |
| `completed` | `--success-main` | Ready badge |
| `failed` | `--error-main` | Error badge + icon |
| `cancelled` | `--text-muted` | Muted badge |

### Quiz Feedback Colors

| State | Background | Border | Text |
|-------|------------|--------|------|
| Correct | `--success-light` | `--success-main` | `--success-dark` |
| Incorrect | `--error-light` | `--error-main` | `--error-dark` |
| Selected | `--primary-100` | `--primary-500` | `--primary-700` |
| Default | `--bg-tertiary` | `--border-default` | `--text-primary` |

---

## 3. Typography

### Font Stack

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  --font-display: 'Cal Sans', 'Inter', sans-serif; /* For headings */
}
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `display-xl` | 48px | 700 | 1.1 | Hero headings |
| `display` | 36px | 700 | 1.2 | Page titles |
| `h1` | 30px | 600 | 1.3 | Section headers |
| `h2` | 24px | 600 | 1.35 | Card titles |
| `h3` | 20px | 600 | 1.4 | Subsection headers |
| `h4` | 18px | 500 | 1.45 | List headers |
| `body-lg` | 18px | 400 | 1.6 | Lead paragraphs |
| `body` | 16px | 400 | 1.6 | Default text |
| `body-sm` | 14px | 400 | 1.5 | Secondary text |
| `caption` | 12px | 500 | 1.4 | Labels, timestamps |
| `overline` | 11px | 600 | 1.3 | Category labels |

### Chat Typography

```css
.chat-message {
  font-size: 15px;
  line-height: 1.65;
  letter-spacing: -0.01em;
}

.chat-code {
  font-family: var(--font-mono);
  font-size: 13px;
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
}
```

---

## 4. File Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (no layout)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Minimal auth layout
│   │
│   ├── (dashboard)/              # Authenticated routes
│   │   ├── layout.tsx            # Shell with sidebar + header
│   │   ├── library/
│   │   │   ├── page.tsx          # Document grid
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Document detail
│   │   │   └── upload/
│   │   │       └── page.tsx      # Upload wizard
│   │   │
│   │   ├── chat/
│   │   │   ├── page.tsx          # New chat
│   │   │   └── [conversationId]/
│   │   │       └── page.tsx      # Chat thread
│   │   │
│   │   ├── study/
│   │   │   ├── page.tsx          # Study decks index
│   │   │   └── [documentId]/
│   │   │       ├── page.tsx      # Chapter list
│   │   │       └── quiz/
│   │   │           └── page.tsx  # Quiz player
│   │   │
│   │   ├── notifications/
│   │   │   └── page.tsx
│   │   │
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── api/                      # API routes (if needed)
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing / redirect
│   ├── loading.tsx               # Global loading
│   ├── error.tsx                 # Global error
│   └── not-found.tsx
│
├── components/
│   ├── ui/                       # Primitive components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown.tsx
│   │   ├── modal.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   ├── spinner.tsx
│   │   ├── progress.tsx
│   │   └── index.ts
│   │
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── mobile-nav.tsx
│   │   └── shell.tsx
│   │
│   ├── auth/                     # Auth-specific
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── auth-guard.tsx
│   │
│   ├── library/                  # Document library
│   │   ├── document-card.tsx
│   │   ├── document-grid.tsx
│   │   ├── document-filters.tsx
│   │   ├── upload-dropzone.tsx
│   │   ├── upload-wizard.tsx
│   │   └── status-badge.tsx
│   │
│   ├── chat/                     # Chat interface
│   │   ├── chat-window.tsx
│   │   ├── message-bubble.tsx
│   │   ├── message-input.tsx
│   │   ├── conversation-list.tsx
│   │   ├── document-picker.tsx
│   │   └── typing-indicator.tsx
│   │
│   ├── study/                    # Study cards
│   │   ├── deck-card.tsx
│   │   ├── chapter-nav.tsx
│   │   ├── section-content.tsx
│   │   ├── quiz-player.tsx
│   │   ├── quiz-option.tsx
│   │   └── score-summary.tsx
│   │
│   └── notifications/
│       ├── notification-item.tsx
│       ├── notification-list.tsx
│       └── unread-badge.tsx
│
├── lib/
│   ├── api/                      # API client layer
│   │   ├── client.ts             # Base HTTP client
│   │   ├── auth.ts               # Auth endpoints
│   │   ├── documents.ts          # Document endpoints
│   │   ├── conversations.ts      # Conversation endpoints
│   │   ├── study-cards.ts        # Study cards endpoints
│   │   ├── notifications.ts      # Notification endpoints
│   │   └── types.ts              # API response types
│   │
│   ├── ws/                       # WebSocket management
│   │   ├── chat-socket.ts        # Chat WebSocket handler
│   │   └── use-chat-socket.ts    # React hook
│   │
│   ├── sse/                      # Server-Sent Events
│   │   ├── notification-stream.ts
│   │   └── use-sse.ts
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-documents.ts
│   │   ├── use-conversations.ts
│   │   ├── use-study-cards.ts
│   │   ├── use-notifications.ts
│   │   ├── use-infinite-scroll.ts
│   │   └── use-local-storage.ts
│   │
│   └── utils/
│       ├── cn.ts                 # Class name merge
│       ├── format.ts             # Date/number formatting
│       └── validators.ts         # Form validation
│
├── stores/                       # Global state (Zustand)
│   ├── session-store.ts          # User + token
│   ├── documents-store.ts        # Document cache
│   ├── chat-store.ts             # Active chat state
│   ├── study-store.ts            # Study cards cache
│   └── notifications-store.ts    # Inbox + unread count
│
├── styles/
│   ├── globals.css               # CSS variables + base
│   └── animations.css            # Keyframe animations
│
├── types/
│   ├── api.ts                    # API response shapes
│   ├── models.ts                 # Domain models
│   └── index.ts
│
└── config/
    ├── constants.ts              # App constants
    ├── routes.ts                 # Route definitions
    └── env.ts                    # Environment validation
```

---

## 5. Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14+ (App Router) | RSC, layouts, file routing |
| Styling | Tailwind CSS + CSS Variables | Utility-first + theming |
| State | Zustand | Lightweight, no boilerplate |
| Data Fetching | TanStack Query | Cache, retry, infinite scroll |
| Forms | React Hook Form + Zod | Validation, performance |
| UI Primitives | Radix UI | Accessible, unstyled |
| Animations | Framer Motion | Declarative, performant |
| Icons | Lucide React | Consistent, tree-shakable |

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                           │
├─────────────────────────────────────────────────────────────┤
│  Pages/Layouts        │  Components        │  Hooks          │
│  (Server + Client)    │  (Client)          │  (Client)       │
├───────────────────────┴────────────────────┴─────────────────┤
│                    TanStack Query                            │
│            (cache, background refetch, mutations)            │
├──────────────────────────────────────────────────────────────┤
│  API Client (lib/api/)  │  WS (lib/ws/)  │  SSE (lib/sse/)   │
├─────────────────────────┴────────────────┴───────────────────┤
│                    Zustand Stores                            │
│     (session, documents, chat, study, notifications)         │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │    StudyBuddy Backend API    │
              │   HTTP / WebSocket / SSE     │
              └─────────────────────────────┘
```

### Authentication Flow

```
┌─────────┐    POST /login     ┌─────────┐
│  Login  │ ─────────────────► │ Backend │
│  Form   │ ◄───────────────── │         │
└────┬────┘    { token }       └─────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│           Session Store                  │
│  - token (memory + httpOnly cookie)     │
│  - user profile                         │
│  - exp timestamp                        │
└────────────────┬────────────────────────┘
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
  HTTP        WebSocket     SSE
  Bearer      ?token=      Bearer
```

### Token Refresh Strategy

```ts
// Intercept 401 responses
// 1. Check if token expired recently (within 10min grace)
// 2. Call POST /authentication/refresh with expired token
// 3. On success: update store, retry original request
// 4. On failure: clear session, redirect to /login
```

### WebSocket Reconnection

```
Connect ─► Authenticated ─► Message Loop ─┐
    ▲                                     │
    │         On token refresh:           │
    └─────── Close + Reconnect ◄──────────┘

    On disconnect:
    - Exponential backoff (1s, 2s, 4s, 8s, max 30s)
    - Show reconnecting indicator
    - Queue outgoing messages
```

### SSE Stream Management

```
Page Mount ─► Connect SSE ─► Parse Events ─► Update Stores
                  │
                  ├─► document.status ──► documents-store
                  ├─► study_cards_*   ──► study-store
                  └─► ping (keep-alive)

On token refresh: reconnect with new Bearer
On disconnect: resume with Last-Event-ID
```

---

## 6. Component Library

### Button Variants

| Variant | Usage | Style |
|---------|-------|-------|
| `primary` | Main CTAs | Solid indigo, white text |
| `secondary` | Secondary actions | Outline, indigo border |
| `ghost` | Tertiary actions | No background, hover state |
| `danger` | Destructive actions | Solid rose |
| `success` | Positive confirmations | Solid emerald |

### Button Sizes

| Size | Padding | Font | Height |
|------|---------|------|--------|
| `sm` | 8px 12px | 13px | 32px |
| `md` | 10px 16px | 14px | 40px |
| `lg` | 12px 24px | 16px | 48px |

### Card Styles

```tsx
// Standard Card
<Card>
  <CardHeader>
    <CardTitle />
    <CardDescription />
  </CardHeader>
  <CardContent />
  <CardFooter />
</Card>

// Interactive Card (hover lift)
<Card interactive />

// Status Card (colored left border)
<Card status="success" />
```

### Input States

| State | Border | Background | Label |
|-------|--------|------------|-------|
| Default | `border-default` | `bg-tertiary` | `text-secondary` |
| Focus | `primary-500` | `bg-tertiary` | `primary-500` |
| Error | `error-main` | `error-light/10` | `error-main` |
| Disabled | `border-default` | `bg-secondary` | `text-muted` |

### Badge Variants

```tsx
<Badge variant="default" />   // Gray
<Badge variant="primary" />   // Indigo
<Badge variant="success" />   // Green
<Badge variant="warning" />   // Amber
<Badge variant="error" />     // Rose
<Badge variant="outline" />   // Border only
```

---

## 7. Page Designs

### 7.1 Authentication Pages

#### Login Page

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│         ┌─────────────────────────────────────┐        │
│         │                                     │        │
│         │   [StudyBuddy Logo]                 │        │
│         │                                     │        │
│         │   Welcome back                      │        │
│         │   Continue your learning journey    │        │
│         │                                     │        │
│         │   ┌─────────────────────────────┐   │        │
│         │   │ Email                       │   │        │
│         │   └─────────────────────────────┘   │        │
│         │                                     │        │
│         │   ┌─────────────────────────────┐   │        │
│         │   │ Password              [👁]  │   │        │
│         │   └─────────────────────────────┘   │        │
│         │                                     │        │
│         │   ┌─────────────────────────────┐   │        │
│         │   │        Sign In              │   │        │
│         │   └─────────────────────────────┘   │        │
│         │                                     │        │
│         │   Don't have an account? Sign up   │        │
│         │                                     │        │
│         └─────────────────────────────────────┘        │
│                                                        │
│   [Background: Subtle gradient mesh or abstract shapes]│
└────────────────────────────────────────────────────────┘
```

### 7.2 Dashboard Shell

```
┌──────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐                              🔔 (3)  ⚙️  [Avatar ▼]    │
│ │  Logo    │    Search documents...                                  │
│ └──────────┘                                                         │
├──────────────┬───────────────────────────────────────────────────────┤
│              │                                                       │
│  📚 Library  │                                                       │
│              │                                                       │
│  💬 Chat     │                    [Page Content]                     │
│              │                                                       │
│  📖 Study    │                                                       │
│              │                                                       │
│  ────────    │                                                       │
│              │                                                       │
│  🔔 Inbox    │                                                       │
│              │                                                       │
│  ⚙️ Settings │                                                       │
│              │                                                       │
├──────────────┴───────────────────────────────────────────────────────┤
│              [Mobile: Bottom navigation bar]                         │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.3 Library Page

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  My Library                                         [+ Upload]         │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🔍 Search documents...  │ Category ▼ │ Status ▼ │ ▤ Grid │ ☰ List │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ │
│  │ 📄            │ │ 📄            │ │ 📄            │ │ 📄          │ │
│  │               │ │               │ │               │ │             │ │
│  │ Biochemistry  │ │ Organic Chem  │ │ Cell Biology  │ │ Physics 101 │ │
│  │ Lecture 1     │ │ Notes         │ │ Chapter 3     │ │ Mechanics   │ │
│  │               │ │               │ │               │ │             │ │
│  │ ● Completed   │ │ ◐ Processing  │ │ ● Completed   │ │ ✕ Failed    │ │
│  │ Science       │ │ Science       │ │ Biology       │ │ Physics     │ │
│  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ │
│                                                                        │
│  ┌───────────────┐ ┌───────────────┐                                   │
│  │ 📄            │ │     + + +     │                                   │
│  │               │ │               │                                   │
│  │ Statistics    │ │   Drop files  │                                   │
│  │ Week 5        │ │   or click    │                                   │
│  │               │ │               │                                   │
│  │ ○ Pending     │ │               │                                   │
│  │ Math          │ │               │                                   │
│  └───────────────┘ └───────────────┘                                   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.4 Document Detail (Drawer/Modal)

```
┌────────────────────────────────────────────────────────┐
│                                              [✕ Close] │
│                                                        │
│  📄 Biochemistry Lecture 1                             │
│                                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │ Status: ● Completed                            │    │
│  │ Category: Science                              │    │
│  │ Uploaded: Aug 5, 2026                          │    │
│  │ Sections: 12                                   │    │
│  └────────────────────────────────────────────────┘    │
│                                                        │
│  Description                                           │
│  Introduction to protein synthesis and enzyme...       │
│                                                        │
│  ───────────────────────────────────────────────────   │
│                                                        │
│  Actions                                               │
│                                                        │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ 💬 Start Chat   │  │ 📖 Study Cards  │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                        │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ ⬇️ Download      │  │ ✏️ Edit          │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │              🗑️ Delete Document                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 7.5 Chat Interface

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ┌──────────────────────┐ │                                                 │
│ │ Conversations        │ │  Mitosis Explained                    [···]    │
│ │ ────────────────────│ │                                                 │
│ │ ┌────────────────────┐│ │  ┌──────────────────────────────────────────┐  │
│ │ │ ● Mitosis Explained ││ │  │ 🤖 The process of mitosis consists of   │  │
│ │ │   Today, 3:42 PM    ││ │  │    four main phases: prophase,          │  │
│ │ └────────────────────┘│ │  │    metaphase, anaphase, and telophase.  │  │
│ │                        │ │  │                                          │  │
│ │ ┌────────────────────┐│ │  │    During **prophase**, the chromatin... │  │
│ │ │ Organic Chemistry   ││ │  └──────────────────────────────────────────┘  │
│ │ │   Yesterday         ││ │                                                 │
│ │ └────────────────────┘│ │  ┌──────────────────────────────────────────┐  │
│ │                        │ │  │ 👤 Can you explain the difference        │  │
│ │ ┌────────────────────┐│ │  │    between mitosis and meiosis?          │  │
│ │ │ Physics Problems    ││ │  └──────────────────────────────────────────┘  │
│ │ │   Aug 3             ││ │                                                 │
│ │ └────────────────────┘│ │  ┌──────────────────────────────────────────┐  │
│ │                        │ │  │ 🤖 Great question! While both are types  │  │
│ │ [+ New Chat]          │ │  │    of cell division, they serve very     │  │
│ │                        │ │  │    different purposes...                 │  │
│ │                        │ │  │    ▊ (typing indicator)                  │  │
│ └──────────────────────┘ │  └──────────────────────────────────────────┘  │
│                          │                                                 │
│                          │  ┌───────────────────────────────────────────┐  │
│                          │  │ 📎 2 documents selected              [−]  │  │
│                          │  └───────────────────────────────────────────┘  │
│                          │                                                 │
│                          │  ┌───────────────────────────────────────────┐  │
│                          │  │ Ask StudyBuddy anything...          [➤]   │  │
│                          │  └───────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### 7.6 Study Cards Page

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  Study Decks                                                           │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Filter: All ▼  │  Status: All ▼  │  Sort: Recent ▼            │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐      │
│  │ 📖                          │  │ 📖                          │      │
│  │                             │  │                             │      │
│  │ Biochemistry Lecture 1      │  │ Cell Biology Chapter 3      │      │
│  │                             │  │                             │      │
│  │ 4 chapters • 16 questions   │  │ 6 chapters • 24 questions   │      │
│  │                             │  │                             │      │
│  │ ┌─────────┐ ┌─────────────┐ │  │ ┌─────────┐ ┌─────────────┐ │      │
│  │ │  Read   │ │ Take Quiz   │ │  │ │  Read   │ │ Take Quiz   │ │      │
│  │ └─────────┘ └─────────────┘ │  │ └─────────┘ └─────────────┘ │      │
│  └─────────────────────────────┘  └─────────────────────────────┘      │
│                                                                        │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐      │
│  │ ⏳                          │  │ ❌                          │      │
│  │                             │  │                             │      │
│  │ Physics 101 Mechanics       │  │ Statistics Week 5           │      │
│  │                             │  │                             │      │
│  │ Generating study cards...   │  │ Generation failed           │      │
│  │ ████████░░░░░░░░            │  │                             │      │
│  │                             │  │ ┌─────────────────────────┐ │      │
│  │                             │  │ │      Retry              │ │      │
│  │                             │  │ └─────────────────────────┘ │      │
│  └─────────────────────────────┘  └─────────────────────────────┘      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.7 Chapter Reader

```
┌────────────────────────────────────────────────────────────────────────┐
│ ← Back to Deck                                        [Take Quiz]      │
│                                                                        │
│ ┌──────────────────┐  ┌────────────────────────────────────────────┐   │
│ │ Chapters         │  │                                            │   │
│ │ ────────────────│  │  Chapter 1: Introduction to Enzymes        │   │
│ │                  │  │                                            │   │
│ │ ● Ch 1: Enzymes  │  │  Enzymes are biological catalysts that    │   │
│ │   Ch 2: Proteins │  │  speed up chemical reactions in living    │   │
│ │   Ch 3: DNA      │  │  organisms without being consumed in      │   │
│ │   Ch 4: RNA      │  │  the process.                             │   │
│ │                  │  │                                            │   │
│ │                  │  │  ## Enzyme Structure                       │   │
│ │                  │  │                                            │   │
│ │                  │  │  Most enzymes are proteins, although      │   │
│ │                  │  │  some are RNA molecules called ribozymes. │   │
│ │                  │  │  The protein structure determines the...  │   │
│ │                  │  │                                            │   │
│ │                  │  │  ─────────────────────────────────────────│   │
│ │                  │  │                                            │   │
│ │                  │  │  📚 References                             │   │
│ │                  │  │  • Lecture slide 12-15                     │   │
│ │                  │  │  • Berg et al., Biochemistry Ch. 8        │   │
│ │                  │  │                                            │   │
│ └──────────────────┘  └────────────────────────────────────────────┘   │
│                                                                        │
│                        ┌─────────┐  ┌─────────┐                        │
│                        │  ← Prev │  │  Next → │                        │
│                        └─────────┘  └─────────┘                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.8 Quiz Player

```
┌────────────────────────────────────────────────────────────────────────┐
│ ← Exit Quiz                                Question 3 of 8             │
│                                            ████████░░░░░░░░░░░░        │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                                                                │    │
│  │  Which phase of mitosis is characterized by the               │    │
│  │  alignment of chromosomes at the cell's equator?              │    │
│  │                                                                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  A.  Prophase                                                  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  B.  Metaphase                                          ✓      │    │
│  │      ──────────────────────────────────────────────────────── │    │
│  │      Correct! Chromosomes align at the metaphase plate.       │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  C.  Anaphase                                                  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  D.  Telophase                                                 │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│                                   ┌───────────────────────┐            │
│                                   │    Next Question →    │            │
│                                   └───────────────────────┘            │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.9 Quiz Results

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│                         🎉                                             │
│                                                                        │
│                    Great job!                                          │
│                                                                        │
│              ┌───────────────────────┐                                 │
│              │                       │                                 │
│              │         75%          │                                 │
│              │                       │                                 │
│              │    6 / 8 correct     │                                 │
│              │                       │                                 │
│              └───────────────────────┘                                 │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  ✓ Question 1        ✓ Question 2        ✓ Question 3          │    │
│  │  ✓ Question 4        ✗ Question 5        ✓ Question 6          │    │
│  │  ✗ Question 7        ✓ Question 8                              │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐   │
│    │  Review Answers │    │   Retake Quiz   │    │  Back to Deck   │   │
│    └─────────────────┘    └─────────────────┘    └─────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.10 Notifications Page

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  Notifications                               [Mark all as read]        │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ ● Document Ready                                    2 min ago  │    │
│  │   "Biochemistry Lecture 1" has finished processing.            │    │
│  │   You can now chat about it or generate study cards.           │    │
│  │                                                     [View →]   │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ ● Study Cards Ready                                15 min ago  │    │
│  │   Study cards for "Cell Biology Chapter 3" are ready!          │    │
│  │   4 chapters and 16 quiz questions generated.                  │    │
│  │                                                    [Study →]   │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │   Document Failed                                   1 hour ago │    │
│  │   "Corrupted_file.pdf" could not be processed.                 │    │
│  │   Please try re-uploading or use a different format.           │    │
│  │                                                    [Retry →]   │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │   Welcome!                                         Yesterday   │    │
│  │   Welcome to StudyBuddy! Upload your first document to get     │    │
│  │   started with AI-powered studying.                            │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│                         [Load more]                                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.11 Settings Page

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  Settings                                                              │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Profile                                                        │    │
│  │ ─────────────────────────────────────────────────────────────│    │
│  │                                                                │    │
│  │  ┌──────┐   John Doe                                          │    │
│  │  │  👤  │   john.doe@university.edu                           │    │
│  │  └──────┘   Joined Aug 2026                                   │    │
│  │                                                                │    │
│  │  Name         ┌─────────────────────────────────────────┐     │    │
│  │               │ John Doe                                │     │    │
│  │               └─────────────────────────────────────────┘     │    │
│  │                                                                │    │
│  │  University   ┌─────────────────────────────────────────┐     │    │
│  │               │ State University                        │     │    │
│  │               └─────────────────────────────────────────┘     │    │
│  │                                                                │    │
│  │  Bio          ┌─────────────────────────────────────────┐     │    │
│  │               │ Computer Science major, Class of 2027   │     │    │
│  │               └─────────────────────────────────────────┘     │    │
│  │                                                                │    │
│  │                                        [Save Changes]          │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Appearance                                                     │    │
│  │ ─────────────────────────────────────────────────────────────│    │
│  │                                                                │    │
│  │  Theme        ○ Light   ● Dark   ○ System                     │    │
│  │                                                                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Danger Zone                                                    │    │
│  │ ─────────────────────────────────────────────────────────────│    │
│  │                                                                │    │
│  │  ┌───────────────────────────────────────────────────────┐    │    │
│  │  │              🗑️ Delete Account                        │    │    │
│  │  │  This will permanently delete all your data.          │    │    │
│  │  └───────────────────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Responsive Design

### Breakpoints

| Name | Width | Target |
|------|-------|--------|
| `xs` | < 480px | Small phones |
| `sm` | 480-639px | Large phones |
| `md` | 640-767px | Small tablets |
| `lg` | 768-1023px | Tablets / small laptops |
| `xl` | 1024-1279px | Laptops |
| `2xl` | ≥ 1280px | Desktops |

### Mobile Adaptations

| Component | Desktop | Mobile |
|-----------|---------|--------|
| Sidebar | Fixed left, 240px | Bottom sheet / drawer |
| Navigation | Sidebar items | Bottom tab bar |
| Chat | Split view (list + thread) | Stacked views |
| Document grid | 4 columns | 1-2 columns |
| Modals | Centered overlay | Full-screen sheet |
| Tables | Full | Horizontal scroll / cards |

### Bottom Navigation (Mobile)

```
┌───────────────────────────────────────────────────────────┐
│   📚        💬        📖        🔔        👤             │
│ Library    Chat     Study    Inbox    Profile            │
└───────────────────────────────────────────────────────────┘
```

---

## 9. Animations & Micro-interactions

### Page Transitions

```css
/* Route transitions using Framer Motion */
.page-enter {
  opacity: 0;
  transform: translateY(8px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 200ms ease-out;
}
```

### Component Animations

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| Button press | Scale 0.98 | 100ms |
| Card hover | Lift + shadow | 150ms |
| Modal open | Fade + scale from 0.95 | 200ms |
| Toast enter | Slide from top + fade | 300ms |
| Skeleton pulse | Opacity 0.4 → 0.8 | 1500ms loop |
| Spinner | Rotate 360° | 1000ms loop |
| Progress bar | Width transition | 300ms |
| Tab switch | Underline slide | 200ms |

### Chat Animations

| Event | Animation |
|-------|-----------|
| New message | Slide up + fade in |
| Typing indicator | 3 dots bouncing |
| Chunk streaming | Text fade in per word |
| Send button | Scale pulse on click |

### Loading States

```tsx
// Skeleton for document card
<div className="animate-pulse">
  <div className="h-32 bg-bg-tertiary rounded-lg" />
  <div className="h-4 bg-bg-tertiary rounded mt-3 w-3/4" />
  <div className="h-3 bg-bg-tertiary rounded mt-2 w-1/2" />
</div>
```

---

## 10. Accessibility

### Requirements

| Area | Implementation |
|------|----------------|
| Color contrast | WCAG AA (4.5:1 text, 3:1 UI) |
| Focus indicators | Visible ring on all interactive elements |
| Keyboard nav | Full support for all features |
| Screen readers | ARIA labels, live regions |
| Reduced motion | Respect `prefers-reduced-motion` |
| Text sizing | Support 200% zoom without horizontal scroll |

### Focus Management

```tsx
// Chat: focus input after sending
// Modal: trap focus inside
// Toast: announce via aria-live
// Page navigation: focus main heading
```

### ARIA Patterns

| Component | Pattern |
|-----------|---------|
| Sidebar | `nav` + `aria-current="page"` |
| Modal | `dialog` + focus trap |
| Toast | `alert` / `status` role |
| Tab panels | `tablist` / `tab` / `tabpanel` |
| Document status | `status` role |
| Quiz options | `radiogroup` / `radio` |

---

## 11. Performance Guidelines

### Bundle Optimization

| Strategy | Implementation |
|----------|----------------|
| Code splitting | Dynamic imports for routes |
| Tree shaking | Import only used icons/components |
| Image optimization | Next.js `<Image>` with WebP |
| Font subsetting | Only Latin characters |
| CSS purging | Tailwind JIT mode |

### Data Loading

| Pattern | Usage |
|---------|-------|
| SSR | Initial page data |
| CSR + SWR | Real-time updates |
| Infinite scroll | Document/conversation lists |
| Optimistic updates | Mark notification read |
| Prefetch | Hover on nav links |

### Caching Strategy

```ts
// TanStack Query defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes
      gcTime: 1000 * 60 * 30,       // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Performance Budgets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Time to Interactive | < 3.5s |
| JS bundle (gzipped) | < 150KB |

---

## Appendix: Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api

# Production
NEXT_PUBLIC_API_URL=https://api.studybuddy.app/api
NEXT_PUBLIC_WS_URL=wss://api.studybuddy.app/api
```

---

## Appendix: Recommended Packages

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@tanstack/react-query": "^5.50.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.6.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "framer-motion": "^11.2.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.14.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```
