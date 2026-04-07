Zynd-AIckathon---Policy-Navigator-Agents

Helps citizens understand government policies, verify eligibility, and discover all benefits they qualify for — powered by n8n + Google Gemini + Supabase.

---

## 🔗 Live Workflows
| Agent | Link |
|-------|------|
| Agent 1 — Policy Interpretation & Citizen Advocacy | [View](https://test-n8n.zynd.ai/workflow/xIgos4W1gnquRrl39Kgch) |
| Agent 2 & 3 — Policy Eligibility Verification + Policy Benefit Matching | [View](https://test-n8n.zynd.ai/workflow/k4O4qqAHrHnaQCV9lRP_t?projectId=JIrGbGuPZT8vRXRd) |

---

## 🧠 How It Works

User uploads policy PDF
        ↓
Agent 1 — Extracts & simplifies policy → saves to Supabase DB & Vector DB
        ↓
Agent 2 — Asks eligibility questions (max 10) → returns verdict
        ↓
Agent 3 — Searches RAG for other matching schemes → returns list
        ↓
UI renders results


## 📦 Agents

### Agent 1 — Policy Interpretation
Receives a PDF via webhook → Gemini extracts raw text → AI Agent converts into simplified JSON → saved to Supabase `policies` table with a `session_id` → raw text embedded into Supabase Vector Store for RAG.

### Agent 2 — Eligibility Verification
Receives `session_id` + user answers via webhook → fetches policy from Supabase → AI Agent asks smart grouped questions one at a time (max 10, tracked via Simple Memory) → returns eligibility verdict JSON.

### Agent 3 — Benefit Matching
Receives `session_id` → fetches citizen profile → AI Agent runs targeted RAG queries against the vector store → filters eligible results → returns matched schemes as JSON.


## 🤝 Cross-Team Collaboration (Zynd Webhooks)

All 3 agents are exposed via **Zynd X402 Webhook nodes**, enabling secure inter-team calls with **Team ByteMe**:

- **Team ByteMe can call our Agent 2 & 3** as a fallback if their agents fail
- **We can call Team ByteMe's Agent 1** as a fallback if our policy extraction fails

Zynd handles authentication and logging — no session data leaks between teams.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Orchestration | n8n |
| AI Model | Google Gemini 2.5 Flash |
| Embeddings | Gemini Embedding 001 (3072 dims) |
| Database | Supabase PostgreSQL + pgvector |
| Inter-team API | Zynd X402 Webhooks |

---

## 🚀 Setup

1. Import workflow JSON files into n8n
2. Add credentials — Google Gemini API + Supabase API
3. Create `policies` and `documents` tables in Supabase
4. Activate all workflows
5. Point your web app to the Agent 1 webhook URL

---

Built with ❤️ for Google Agentspace Hackathon | Collaboration with **Team ByteMe** via Zynd
