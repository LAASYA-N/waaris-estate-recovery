# Waaris Backend

FastAPI backend and FalkorDB knowledge graph for the Waaris deceased estate claims assistant.

## Features
- **FalkorDB Knowledge Graph**: Isolated graph (`waaris_estate_001`) with nodes (`Deceased`, `Heir`, `Account`, `Institution`, `Document`, `Requirement`, `Claim`, `Event`) and edges (`RELATED_TO`, `HELD_AT`, `REQUIRES`, `SATISFIES`, `BLOCKED_BY`, `NOMINEE_OF`, `UNLOCKS`, `LOGGED_FOR`).
- **Gemini Agent with Graph Tools**: Answers questions purely using Cypher queries and deterministic tool execution (`rank_documents_by_unlock`, `get_entitled_heirs`, `get_missing_requirements`, `explain_path`, `add_entity`, `log_event`).
- **Event Persistence**: All user chat interactions and document events are persisted as `Event` nodes in the graph linked to the `Claim`.
- **CORS Enabled**: Configured for React + Vite frontend at `http://localhost:5173`.

---

## 1. Prerequisites & FalkorDB Container

Start FalkorDB in Docker:
```bash
docker run -p 6379:6379 -p 3000:3000 -d falkordb/falkordb:latest
```
- Port `6379`: FalkorDB Redis protocol
- Port `3000`: FalkorDB Browser UI (open `http://localhost:3000` to inspect the knowledge graph visually)

---

## 2. Environment Configuration

Edit `backend/.env`:
```env
GEMINI_API_KEY="your-gemini-api-key-from-ai-studio"
FALKORDB_HOST="localhost"
FALKORDB_PORT=6379
GRAPH_NAME="waaris_estate_001"
```

---

## 3. Installation & Seeding

Install python dependencies:
```bash
cd backend
python -m pip install -r requirements.txt
```

Run seed script (idempotent and safe to rerun anytime):
```bash
python seed.py
```

---

## 4. Run the FastAPI Server

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- Swagger Docs: `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`

---

## 5. API Endpoints Contract

- `GET /health`: Health and FalkorDB connection status.
- `GET /estate`: Estate readiness, accounts, and heir details.
- `GET /graph`: Nodes and links formatted for visual graph explorers.
- `POST /agent/chat`: Chat with estate claims agent.
- `POST /documents`: Upload document file for entity extraction & graph ingestion.
- `GET /checklist`: Dynamic action checklist and institutional blockers.

---

## 6. Key Gap Query Verification

To answer *"Which one document unblocks the most accounts?"*:
```bash
curl -X POST http://localhost:8000/agent/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Which one document unblocks the most accounts?\"}"
```
Top Result: **Legal Heir Succession Certificate (unlocks 3 accounts)**.
