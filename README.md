# MelaAI — Personal AI Assistant & Life Operating System

<p align="center">
  <strong>One unified dashboard for finance, investments, productivity, lifestyle, and autonomous AI companion capabilities.</strong>
</p>

---

## 🌟 What is MelaAI?

**MelaAI** is a self-hosted, privacy-first personal assistant and life operating system. It unifies financial tracking, portfolio management, habit forming, goal tracking, reading logs, media watchlists, notes, and autonomous workflows in one place — supercharged by **Mela**, an intelligent AI companion powered by multi-provider LLM architectures (Gemini, OpenAI, Anthropic).

---

## 🚀 Key Features

### 💰 Financial & Wealth Management
- **Expense & Budget Tracking:** Categorized ledger, custom budget limits, recurring expenses, and exportable financial reports.
- **Investment Portfolio:** Real-time and manual tracking across equities, crypto, mutual funds/SIPs, gold, cash, and fixed deposits with compounding interest calculation.
- **Net Worth & Subscriptions:** Dynamic calculation of total assets vs. liabilities and normalized effective monthly subscription costs.

### 🎯 Productivity & Lifestyle
- **Goals & Tasks:** Target tracking with milestones, deadlines, and smart priority organization.
- **Habits & Calendar:** Streak maintenance, routine management, and unified calendar view.
- **Books & Media:** Reading lists backed by OpenLibrary, unified watchlist with AniList and Trakt synchronization, and Letterboxd imports.
- **Documents & Notes:** Cloud storage, semantic search, and persistent markdown notes.
- **Automations Engine:** Event-driven rules, schedule triggers, and automated notification dispatches (Email, Push, Telegram).

### 🤖 Mela AI Suite
- **Interactive AI Assistant:** Natural language conversation, context awareness, and tool invocation.
- **Proactive Insights & Recommendations:** Automated financial reviews, habit optimization suggestions, and personalized recommendations.
- **Multi-Provider AI Architecture:** Flexible provider adapters for Google Gemini, OpenAI, and Anthropic Claude.
- **Semantic Memory & Search:** Full-text and vector embeddings for contextual memory recall.

---

## 🏗️ Project Architecture & Structure

```text
melaai/
├── app/
│   ├── (auth)/                    # Authentication routes (login, register, forgot-password)
│   ├── (dashboard)/               # Dashboard modules
│   │   ├── dashboard/             # Overview dashboard
│   │   ├── finance/               # Expenses, budgets, accounts, transactions, reports
│   │   ├── investments/           # Portfolio, transactions, analytics
│   │   ├── net-worth/             # Assets and liabilities
│   │   ├── subscriptions/         # Recurring subscription tracking
│   │   ├── goals/                 # Goal setting and progress
│   │   ├── tasks/                 # Task and todo management
│   │   ├── calendar/              # Unified schedule & events
│   │   ├── habits/                # Habit tracking & streaks
│   │   ├── books/                 # Reading lists & library
│   │   ├── media/                 # Movies, TV series, anime
│   │   ├── notes/                 # Quick notes & persistent scratchpads
│   │   ├── documents/             # Document storage & analysis
│   │   ├── analytics/             # Financial, productivity & lifestyle analytics
│   │   ├── automations/           # Autonomous workflow builder
│   │   └── settings/              # User profile, security, notifications, integrations
│   ├── mela/                      # Mela AI Assistant workspace
│   │   ├── assistant/             # Chat assistant
│   │   ├── insights/              # AI-generated insights
│   │   ├── recommendations/       # Smart recommendations
│   │   ├── automations/           # AI trigger workflows
│   │   └── memory/                # Memory entries & history
│   └── api/                       # API routes
│       ├── v1/                    # REST API endpoints (finance, portfolio, goals, etc.)
│       └── mela/                  # Mela AI endpoints (chat, ask, actions, search, memory)
│
├── components/                    # Reusable UI components
│   ├── layout/                    # Sidebar, Header, Mobile Nav, Command Palette
│   ├── dashboard/                 # Overview widgets, spending charts, insight cards
│   ├── mela/                      # Mela Chat, Thought Indicators, Action Confirmations
│   └── [modules]/                 # Module-specific components (finance, books, etc.)
│
├── lib/                           # Core business logic & SDK clients
│   ├── firebase/                  # Firestore REST client, admin SDK, schema validators
│   ├── auth/                      # Session management, guards, RBAC permissions
│   ├── finance/                   # Financial metrics, pricing, calculations
│   ├── search/                    # Full-text and semantic search algorithms
│   ├── notifications/             # Email, Web Push, and Telegram dispatchers
│   ├── automation/                # Workflow execution engine, triggers, and scheduler
│   └── mela/                      # AI Engine, agent loop, memory, tool handlers, providers
│
├── hooks/                         # Custom React hooks (useAuth, useMela, useSearch, etc.)
├── types/                         # TypeScript interfaces and type definitions
├── schemas/                       # Zod validation schemas
├── services/                      # External services (OpenLibrary, AniList, Trakt, AI)
├── config/                        # App, navigation, locale, and AI configurations
├── i18n/                          # Internationalization dictionaries (English & Amharic)
├── firestore/                     # Database rules, indexes, and migration scripts
├── scripts/                       # Database seed and migration utilities
└── tests/                         # Unit, integration, and E2E test suites
```

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Frontend:** [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **State & Data Fetching:** [SWR](https://swr.vercel.app/)
- **Validation:** [Zod](https://zod.dev/)
- **Database & Auth:** [Firebase](https://firebase.google.com/) (Google Sign-In, Firestore REST API, Firebase Admin)
- **Caching:** [Upstash Redis](https://upstash.com/)
- **AI Integrations:** Google Generative AI (`@google/generative-ai`), OpenAI, Anthropic
- **Testing:** [Vitest](https://vitest.dev/), React Testing Library

---

## ⚡ Getting Started

### 1. Prerequisites
- Node.js 20+ installed
- A Firebase project with Firestore and Authentication (Google Sign-In) enabled

### 2. Clone and Install
```bash
git clone https://github.com/haile12michael12/MelaAI.git
cd MelaAI
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and set your credentials:
```bash
cp .env.example .env.local
```

Example `.env.local`:
```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Encryption & Security
ENCRYPTION_KEY="your-custom-secret-key-32-chars-long"

# AI Providers
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Deploy Firestore Rules
```bash
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Privacy Model

1. **User Ownership Isolation:** All Firestore records are partitioned by user UID and enforced at the database level using `firestore.rules`.
2. **Client-Token Authenticated REST API:** Reads and writes go through the Firestore REST API using the caller's own Firebase ID token.
3. **AES-256-GCM Encryption:** Sensitive fields (titles, notes, transaction amounts) are encrypted before reaching Firestore.
4. **SSRF and Input Validation:** All API endpoints are validated using Zod schemas with allowlisted upstream integrations.

---

## 🧪 Testing & Quality

Run the test suite using Vitest:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint
```

---

## 🌐 Internationalization (i18n)

MelaAI includes built-in multilingual support with locale dictionaries located in `i18n/`:
- English (`i18n/en/`): common, finance, Mela, and navigation dictionaries
- Amharic (`i18n/am/`): common, finance, Mela, and navigation dictionaries

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
