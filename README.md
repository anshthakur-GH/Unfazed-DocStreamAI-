# DocStreamAI
# Unfazed DocStream AI

**A real-time document intelligence platform built to understand, route, and act on documents - not just store them.**

---

## What This Is

Organizations today are drowning in documents. Hundreds arrive daily across email, WhatsApp, shared drives, and enterprise systems. No system receives them intelligently, no system classifies them automatically, and no system alerts the right people at the right time.

Unfazed DocStream AI is being built to fix that. It is an agentic document intelligence platform that ingests documents from multiple channels, extracts structured meaning using AI, organizes them by department, and lets users have a real conversation with any document - all in real time.

This is not another file storage tool. The goal is to make every incoming document immediately understood, structured, and actionable.

---

## The Problem We're Solving

Three core pain points drive this:

**Document Overload** - Hundreds of documents arrive across different channels with no system to receive, classify, or prioritize them. Deadlines get missed. Compliance records get lost. Skilled employees spend hours doing work that should take seconds.

**Policy Interpretation Gap** - Organizational and government policies are written in dense language. Most employees and citizens cannot identify what applies to them or what action is required. Without an intelligent layer, policies remain unread and unfollowed.

**Fragmented Tooling** - Most organizations use 4-5 separate tools for storage, approvals, policy lookup, and alerts. Nothing connects. No system extracts meaning, routes intelligently, or responds in real time.

---

## How It Works (Architecture Overview)

Documents enter the system through five ingestion channels:

- **Channel 1** - Direct file upload via UI
- **Channel 2** - Email (Gmail API)
- **Channel 3** - IBM Maximo Integration Framework (MIF)
- **Channel 4** - SharePoint (Microsoft Graph API)
- **Channel 5** - WhatsApp Business API

Once a document arrives, it goes through the following pipeline:

1. **Fetch** - The system pulls in files and messages from all active channels
2. **AI Filtration Node** - An AI node filters the document based on the industry configuration deployed. If it is not relevant, the pipeline stops and the original file is saved to Drive. If it passes, it continues.
3. **Bilingual OCR** - An AI-powered OCR layer processes the document, including bilingual content
4. **AI Agent - Semantic Tagging & Classification** - An AI agent analyzes the document and outputs structured JSON with semantic tags, classification, and urgency signals. If a document is marked critical, it is automatically shared to relevant departments via email.
5. **JSON Parsing** - The JSON output is parsed into a clean key-value structure for storage
6. **Database** - Structured data is stored in MongoDB
7. **Real-Time Push** - MongoDB Change Streams + WebSockets broadcast every update instantly to all connected users. No polling. No manual refresh.

---

## The UI Layer

The frontend is organized around three core views:

**Login Page** - Department selection with user ID and password authentication

**Home Page** - Organization-wide notice board and entry point

**Department Dashboard** - Each department sees their documents, an alert section for urgent items, intelligent search, an "Add Knowledge" option for internal context, and a document upload button

**Specific Document Page** - Every document gets its own page with a full AI chatbot scoped to that document, a document summary, the original content, and options to download, edit, or view the original file. The document is also accessible via a webview link.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, TypeScript, TailwindCSS, WebSockets |
| Backend | Node.js, Express, MongoDB + Change Streams |
| OCR / Parsing | Gemini 2.5 Flash, Bilingual OCR Pipeline |
| AI Agents | n8n, Gemini 1.5 Pro, LangChain, Supabase Vector |
| Storage | MongoDB Atlas, Google Drive, Supabase |
| Channels | Gmail API, WhatsApp Business API, Webhook, SharePoint, IBM Maximo |

---

## Target Users

- Enterprises with high document volume
- Government bodies managing policy and compliance records
- Legal and compliance departments
- HR teams
- Procurement and operations
- Any document-heavy organization

---

## What Makes This Different

Most tools in this space are either expensive enterprise platforms that are powerful but static, or lightweight AI chat tools that are smart but disorganized. No current product bridges both - real-time document intelligence, departmental structure, multi-channel ingestion, and per-document AI conversation in a single system.

Six capabilities no single competitor currently combines:

1. Real-time push architecture (MongoDB Change Streams + WebSockets)
2. Multi-channel ingestion (Email, WhatsApp, upload, Webhook, SharePoint, Maximo)
3. Per-document AI chatbot (RAG pipeline scoped to a single document)
4. Departmental silos with cross-tagging
5. Industry-agnostic deployment with no vertical lock-in
6. Lightweight, open-source-friendly stack

---

## Project Status

This project is actively being built. The architecture and workflow are finalized. Development is happening in stages - each component is being implemented and integrated progressively.

Current focus areas in progress:

- Multi-channel ingestion pipeline
- AI filtration and OCR layer
- Semantic tagging agent
- Real-time dashboard
- Per-document AI chatbot

---

## Future Roadmap

- Role-based access control (RBAC) per department
- Approval workflow engine with e-signature support
- AI risk scoring and compliance flag agent
- Version control and document diff tracking
- Bulk export and report generation agent
- White-label SaaS deployable to any industry
- ERP and CRM integration via open API layer

---

## Built By

**Unfazed AI** - 2026

---

> *"Documents arrive. Policies confuse. Decisions stall." - That is the problem. This is the fix.*
