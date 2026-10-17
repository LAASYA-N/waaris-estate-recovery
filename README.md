# Waaris: AI Estate Recovery Assistant with FalkorDB Graph Context

> **Hackathon Submission:** Graph Hacks – Context for AI Agents (WeMakeDevs × FalkorDB)  
> **Team:** Legacy Labs  
> **Track:** Context for AI Agents  
> **Demo Video:** [`waaris_demo_final.mp4`](./waaris_demo_final.mp4)  

---

## 1. Problem Statement
When a person passes away, grieving families are thrown into an administrative nightmare. Estate recovery and succession paperwork are fragmented across multiple institutions (banks, mutual funds, insurance companies), each with differing stamp paper values, indemnity bonds, and legal requirements. 

Nominees often discover that nominee status is not legal ownership, leaving over **₹1.5 lakh crore** in unclaimed financial assets in India. Standard LLM chatbots fail because succession law requires exact, deterministic relational memory: traversing which heirs are entitled, which documents are missing, and which single action unlocks the maximum frozen value.

---

## 2. Solution Overview
**Waaris** is an agentic claims assistant that replaces bureaucratic confusion with a connected, deterministic knowledge graph in **FalkorDB**:
- **Native Graph Modeling:** Models `Deceased`, `Heir`, `Account`, `Institution`, `Document`, and `Requirement` as interconnected nodes and edges.
- **Deterministic Cypher Execution:** Google Gemini 2.5 Flash agent invokes exact Cypher tools instead of raw vector similarity, guaranteeing 0% hallucination.
- **Dynamic Estate Action Plan:** Evaluates claim readiness, computes statutory heir shares under Class-I succession law, and computes priority document unlocks.

---

## 3. FalkorDB Graph Data Model

### Node Labels
- `(:Deceased {id, name, dob, dod})`: The deceased individual whose estate is undergoing succession.
- `(:Heir {id, name, relation, share, shareLabel})`: Class-I statutory heirs (e.g., spouse 50%, children 25%).
- `(:Account {id, name, institution, amount_inr, status})`: Bank accounts, fixed deposits, or mutual fund folios.
- `(:Institution {id, name, type})`: Financial bodies (e.g., State Bank of India, HDFC Bank, ICICI Prudential).
- `(:Document {id, name, verified, dateUploaded})`: Tangible certificates (Death Certificate, Succession Certificate).
- `(:Requirement {id, name, details, status})`: Legal preconditions needed to process a claim (e.g., ₹500 Indemnity Bond).
- `(:Claim {id, estateName, totalValue, readiness})`: Estate claim container.
- `(:Event {id, action, timestamp, details})`: Persistent audit trail of chat and document actions.

### Edge Relationships
- `(:Heir)-[:RELATED_TO]->(:Deceased)`: Familial legal relationship.
- `(:Account)-[:HELD_AT]->(:Institution)`: Institution holding the asset.
- `(:Deceased)-[:OWNED]->(:Account)`: Asset ownership link.
- `(:Account)-[:BLOCKED_BY]->(:Requirement)`: Unmet institutional condition.
- `(:Document)-[:SATISFIES]->(:Requirement)`: Requirement cleared by evidence.
- `(:Document)-[:UNLOCKS]->(:Account)`: Document that resolves blockers and frees an account.
- `(:Heir)-[:NOMINEE_OF]->(:Account)`: Registered nomination link.
- `(:Event)-[:LOGGED_FOR]->(:Claim)`: Audit event tracking.

---

## 4. Key Cypher Queries & Graph Traversal

### 1. The Key Gap Query: Rank Documents by Unlock
Answers: *"Which one document unblocks the most accounts?"*
```cypher
MATCH (d:Document)-[:UNLOCKS]->(a:Account)
WHERE a.status = 'blocked' OR a.status = 'in_progress'
RETURN d.id AS doc_id,
       d.name AS document_name,
       count(DISTINCT a) AS accounts_unlocked,
       sum(a.amount_inr) AS total_value_unlocked,
       collect(a.name) AS accounts
ORDER BY accounts_unlocked DESC;
```
*Top Result: Legal Heir Succession Certificate unlocks 3 accounts worth ₹1.68 Cr across SBI, HDFC, and ICICI.*

### 2. Discover Institutional Blockers
```cypher
MATCH (a:Account)-[:BLOCKED_BY]->(r:Requirement)
RETURN a.id AS account_id,
       a.name AS account_name,
       r.id AS requirement_id,
       r.name AS requirement_name,
       r.details AS details;
```

### 3. Retrieve Entitled Heirs and Statutory Shares
```cypher
MATCH (h:Heir)-[r:RELATED_TO]->(d:Deceased)
RETURN h.id AS id,
       h.name AS name,
       h.relation AS relation,
       h.share AS share,
       h.shareLabel AS shareLabel;
```

### 4. Fetch Full Graph Topology for Exploration
```cypher
MATCH (n) OPTIONAL MATCH (n)-[e]-(m) RETURN * LIMIT 100;
```

---

## 5. Technology Stack
- **Frontend:** React 19, Vite, Tailwind CSS, `@google/genai`, `react-force-graph-2d`, `lucide-react`, `motion`.
- **Backend:** FastAPI, Python 3.11, Uvicorn, Pydantic, python-dotenv.
- **Graph Database:** FalkorDB (Redis protocol over port 6379 / Cloud Port 50009).
- **AI Agent / LLM:** Google Gemini 2.5 Flash with deterministic Cypher function-calling tools.

---

## 6. Complete Local Setup Instructions

### Prerequisites
- Node.js 18+ and Python 3.10+
- (Optional) Docker for local FalkorDB or a FalkorDB Cloud instance

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/waaris.git
cd waaris
```

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```env
GEMINI_API_KEY="your-gemini-api-key"
FALKORDB_HOST="localhost"
FALKORDB_PORT=6379
FALKORDB_USER="falkordb"
FALKORDB_PASSWORD=""
FALKORDB_SSL="false"
GRAPH_NAME="waaris_estate_001"
```

**Frontend (`.env`):**
```env
VITE_API_URL="http://127.0.0.1:8000"
```

### Step 3: Start FalkorDB (Docker)
```bash
docker run -p 6379:6379 -p 3001:3000 -d falkordb/falkordb:latest
```
*(FalkorDB Browser UI will be available at `http://localhost:3001`)*

### Step 4: Setup and Seed Backend
```bash
cd backend
python -m pip install -r requirements.txt
python seed.py
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- Swagger API Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### Step 5: Start Frontend
In the root directory:
```bash
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 7. Submission Checklist Summary
- [x] **Track:** Context for AI Agents (WeMakeDevs × FalkorDB)
- [x] **Public Repository:** Git repository ready for publishing
- [x] **README & Architecture:** Setup instructions, graph data model, node/edge schema
- [x] **Cypher Queries:** Core graph traversal and gap queries documented
- [x] **Demo Video:** 1080p full demo video with synced narration (`waaris_demo_final.mp4`)
- [x] **Complete Local Setup:** Fully reproducible steps for backend, frontend, and FalkorDB
