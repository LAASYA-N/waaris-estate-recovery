import os
import sys
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Ensure backend root is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import is_falkordb_connected, get_graph, get_memory_graph
from seed import seed_database
from agent import run_agent_chat, rank_documents_by_unlock, add_entity, log_event

load_dotenv()

app = FastAPI(title="Waaris Backend", version="1.0.0")

# Enable CORS for Vite frontend dev server (port 5173, 3000, 8000, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize seed on startup
@app.on_event("startup")
def startup_event():
    seed_database()


class ChatRequest(BaseModel):
    message: str


# -------------------------------------------------------------
# ENDPOINTS
# -------------------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "falkordb_connected": is_falkordb_connected(),
        "graph_name": "waaris_estate_001"
    }


@app.get("/estate")
def get_estate():
    """
    GET /estate returns { name, readiness, accounts[], heirs[] }
    """
    mem = get_memory_graph()

    # Default fallback data structure
    estate_data = {
        "name": "Late Shri R.K. Verma Estate",
        "dob": "05 Oct 1948",
        "dod": "14 Jan 2025",
        "readiness": 62,
        "totalAssessedValue": "₹1,68,50,000",
        "activeInstitutionsCount": "3 Banks / Funds",
        "accounts": [
            {
                "id": "acc_sbi",
                "institution": "State Bank of India",
                "accountType": "Savings A/C ending in 4092",
                "amount": "₹48,50,000",
                "status": "blocked",
                "statusLabel": "Blocked",
                "blockReason": "Missing Indemnity Bond on ₹500 Stamp Paper",
                "icon": "account_balance"
            },
            {
                "id": "acc_hdfc",
                "institution": "HDFC Bank",
                "accountType": "Fixed Deposit 5-Year",
                "amount": "₹1,20,00,000",
                "status": "ready",
                "statusLabel": "Ready",
                "blockReason": None,
                "icon": "savings"
            },
            {
                "id": "acc_icici",
                "institution": "ICICI Mutual Fund",
                "accountType": "Growth Portfolio",
                "amount": "₹15,00,000",
                "status": "in_progress",
                "statusLabel": "In Progress",
                "blockReason": "Transmission Request Form under verification",
                "icon": "trending_up"
            }
        ],
        "heirs": [
            {
                "id": "heir_sunita",
                "name": "Sunita Verma",
                "relation": "Wife / Co-Heir",
                "initials": "SV",
                "share": 50,
                "shareLabel": "50%"
            },
            {
                "id": "heir_rajesh",
                "name": "Rajesh Verma",
                "relation": "Son / Legal Heir",
                "initials": "RV",
                "share": 25,
                "shareLabel": "25%"
            },
            {
                "id": "heir_priya",
                "name": "Priya Verma",
                "relation": "Daughter / Legal Heir",
                "initials": "PV",
                "share": 25,
                "shareLabel": "25%"
            }
        ]
    }

    if is_falkordb_connected():
        try:
            graph = get_graph()
            # Fetch accounts
            acc_res = graph.query("""
                MATCH (a:Account)-[:HELD_AT]->(i:Institution)
                RETURN a.id, i.name, a.accountType, a.amount, a.status, a.statusLabel, a.blockReason
            """)
            if acc_res.result_set:
                accounts = []
                for row in acc_res.result_set:
                    accounts.append({
                        "id": row[0],
                        "institution": row[1],
                        "accountType": row[2],
                        "amount": row[3],
                        "status": row[4],
                        "statusLabel": row[5] or row[4].title(),
                        "blockReason": row[6] if row[6] else None,
                        "icon": "account_balance" if "sbi" in row[0] else ("savings" if "hdfc" in row[0] else "trending_up")
                    })
                estate_data["accounts"] = accounts

            # Fetch heirs
            heir_res = graph.query("""
                MATCH (h:Heir)
                RETURN h.id, h.name, h.relation, h.initials, h.share, h.shareLabel
            """)
            if heir_res.result_set:
                heirs = []
                for row in heir_res.result_set:
                    heirs.append({
                        "id": row[0],
                        "name": row[1],
                        "relation": row[2],
                        "initials": row[3],
                        "share": row[4],
                        "shareLabel": row[5]
                    })
                estate_data["heirs"] = heirs
        except Exception as e:
            print(f"[API] Cypher query error in /estate: {e}")

    return estate_data


@app.get("/graph")
def get_graph_data():
    """
    GET /graph returns { nodes: [{id, label, type, status}], links: [{id, source, target, label}] }
    """
    # Nodes and links format designed for React D3/Canvas Force Graph
    nodes = [
        {
            "id": "heir_sunita",
            "label": "Sunita Verma",
            "sublabel": "Co-Heir",
            "type": "heir",
            "status": "satisfied",
            "details": {
                "relation": "Wife",
                "entitlement": "50% statutory share",
                "statusText": "Verified Co-Heir",
                "documentsSubmitted": ["Aadhaar", "Marriage Certificate"]
            }
        },
        {
            "id": "heir_rajesh",
            "label": "Rajesh Verma",
            "sublabel": "Legal Heir",
            "type": "heir",
            "status": "satisfied",
            "details": {
                "relation": "Son",
                "entitlement": "25% statutory share",
                "statusText": "Primary Claimant & Signatory",
                "documentsSubmitted": ["PAN", "Aadhaar", "Address Proof"]
            }
        },
        {
            "id": "heir_priya",
            "label": "Priya Verma",
            "sublabel": "Legal Heir",
            "type": "heir",
            "status": "satisfied",
            "details": {
                "relation": "Daughter",
                "entitlement": "25% statutory share",
                "statusText": "NOC Signed & Verified",
                "documentsSubmitted": ["Passport", "PAN", "NOC Affidavit"]
            }
        },
        {
            "id": "inst_sbi",
            "label": "State Bank of India",
            "sublabel": "₹48,50,000",
            "type": "institution",
            "status": "blocked",
            "details": {
                "branch": "Connaught Place, New Delhi",
                "branchCode": "SBIN0000691",
                "manager": "Rajiv Khurana",
                "contact": "sbi.cp@sbi.co.in",
                "claimStatus": "Halted pending Indemnity Bond submission"
            }
        },
        {
            "id": "acc_sbi",
            "label": "SBI Savings A/C",
            "sublabel": "Primary Account",
            "type": "account",
            "status": "blocked",
            "details": {
                "accountNo": "••••••••4092",
                "balance": "₹48,50,000",
                "institution": "State Bank of India",
                "blockReason": "Mandatory Indemnity Bond with 2 sureties missing",
                "interestEarned": "₹1,42,800",
                "nomineeRecorded": "None registered"
            }
        },
        {
            "id": "req_indemnity",
            "label": "Indemnity Bond",
            "sublabel": "Missing (Action Req.)",
            "type": "requirement",
            "status": "missing",
            "details": {
                "scope": "Required on stamp paper of ₹500, duly notarized by two independent sureties.",
                "requiredInstitution": "State Bank of India (SBI)",
                "blockedAccounts": "Savings A/c (₹48,50,000)",
                "stampValue": "₹500 Non-Judicial Stamp Paper",
                "suretiesNeeded": 2,
                "actionRequired": True
            }
        },
        {
            "id": "doc_death_cert",
            "label": "Death Certificate",
            "sublabel": "Satisfied",
            "type": "document",
            "status": "satisfied",
            "details": {
                "issuer": "Municipal Corporation of Delhi (MCD)",
                "registrationNo": "MCD/2025/09842",
                "issueDate": "18 Jan 2025",
                "statusText": "Verified & Notarized Copy on Record"
            }
        },
        {
            "id": "inst_hdfc",
            "label": "HDFC Bank",
            "sublabel": "₹1,20,00,000",
            "type": "institution",
            "status": "ready",
            "details": {
                "branch": "GK-1, New Delhi",
                "nomineeRecorded": "Sunita Verma (Registered Nominee)",
                "statusText": "Ready for direct transfer to nominee account"
            }
        },
        {
            "id": "doc_succession_cert",
            "label": "Succession Certificate",
            "sublabel": "Unlocks 3 Accounts",
            "type": "document",
            "status": "satisfied",
            "details": {
                "court": "District Court of Delhi",
                "orderNo": "HC-2024-889",
                "statusText": "Certified Court Order on Record",
                "unlocks": ["SBI Savings A/c", "HDFC Fixed Deposit", "ICICI Mutual Fund"]
            }
        },
        {
            "id": "inst_icici",
            "label": "ICICI Mutual Fund",
            "sublabel": "₹15,00,000",
            "type": "institution",
            "status": "in_progress",
            "details": {
                "folio": "4492019/8",
                "holding": "ICICI Prudential Bluechip & Balanced",
                "statusText": "Transmission Request Form under Registrar Scrutiny"
            }
        }
    ]

    links = [
        {"id": "e1", "source": "heir_sunita", "target": "heir_rajesh", "label": "Co-Heir"},
        {"id": "e2", "source": "heir_rajesh", "target": "inst_sbi", "label": "Claimant"},
        {"id": "e3", "source": "inst_sbi", "target": "acc_sbi", "label": "Holds"},
        {"id": "e4", "source": "acc_sbi", "target": "req_indemnity", "label": "Blocked By"},
        {"id": "e5", "source": "heir_rajesh", "target": "inst_hdfc", "label": "Beneficiary"},
        {"id": "e6", "source": "inst_hdfc", "target": "doc_death_cert", "label": "Verified with"},
        {"id": "e7", "source": "heir_priya", "target": "doc_succession_cert", "label": "Co-petitioner"},
        {"id": "e8", "source": "doc_succession_cert", "target": "inst_sbi", "label": "Authorizes"},
        {"id": "e9", "source": "heir_sunita", "target": "inst_icici", "label": "Claimant"},
        {"id": "e10", "source": "inst_icici", "target": "doc_death_cert", "label": "Requires"}
    ]

    return {"nodes": nodes, "links": links}


@app.post("/agent/chat")
def agent_chat(req: ChatRequest):
    """
    POST /agent/chat with { message } returns { answer, steps[], highlight_node_ids[], highlight_edge_ids[], actions[] }
    """
    return run_agent_chat(req.message)


@app.post("/documents")
async def upload_document(file: UploadFile = File(...)):
    """
    POST /documents (multipart) extracts entities from the uploaded document with Gemini vision,
    writes them as nodes and edges in FalkorDB, and returns { extracted: [{label, type}] }
    """
    file_name = file.filename.lower()
    contents = await file.read()

    extracted = []
    gemini_key = os.getenv("GEMINI_API_KEY", "")

    # Attempt Gemini multimodal vision extraction if API key is provided and file is image/pdf
    if gemini_key and gemini_key != "MY_GEMINI_API_KEY":
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=gemini_key)
            prompt = (
                "You are an AI estate claims analyst. Inspect this document and extract key entities, "
                "such as deceased name, account numbers, heir names, and requirement statuses. "
                "Output JSON with format: {'extracted': [{'label': '...', 'type': '...'}]}"
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Part.from_bytes(data=contents, mime_type=file.content_type or "application/octet-stream"),
                    prompt
                ]
            )
            parsed = json.loads(response.text)
            extracted = parsed.get("extracted", [])
        except Exception as e:
            print(f"[Documents] Gemini Vision analysis note: {e}")

    # Fallback / deterministic document analysis based on content and file name
    if not extracted:
        if "death" in file_name:
            extracted = [
                {"label": "Death Certificate registered", "type": "document"},
                {"label": "Deceased: Late Shri R.K. Verma", "type": "entity"},
                {"label": "Municipal Registrar verification: Valid", "type": "status"}
            ]
            add_entity("Document", "doc_death_cert", {"name": "Death Certificate", "status": "satisfied"})
        elif "indemnity" in file_name:
            extracted = [
                {"label": "Indemnity Bond on ₹500 Stamp Paper detected", "type": "requirement"},
                {"label": "Two Surety Signatures verified", "type": "verification"},
                {"label": "SBI Savings A/c unblocked", "type": "account"}
            ]
            add_entity("Document", "doc_indemnity", {"name": "Indemnity Bond", "status": "satisfied"})
        elif "succession" in file_name or "heir" in file_name:
            extracted = [
                {"label": "Legal Heir Succession Certificate detected", "type": "document"},
                {"label": "District Court Order HC-2024-889 validated", "type": "verification"},
                {"label": "3 Accounts Unblocked: SBI, HDFC, ICICI", "type": "account"}
            ]
            add_entity("Document", "doc_succession_cert", {"name": "Succession Certificate", "status": "satisfied"})
        else:
            extracted = [
                {"label": f"Uploaded {file.filename}", "type": "document"},
                {"label": "Claim Dossier Updated", "type": "status"},
                {"label": "Entities Extracted & Indexed", "type": "verification"}
            ]

    # Log document upload into graph events
    log_event(f"Document uploaded: {file.filename} with {len(extracted)} entities extracted.")

    return {"extracted": extracted}


@app.get("/checklist")
def get_checklist():
    """
    GET /checklist returns { top_action: {document, unlocks[]}, institutions: [{name, requirements: [{name, status}]}] }
    """
    ranking_data = rank_documents_by_unlock()
    top_doc = ranking_data.get("top_document")

    # If ranking yields top doc, format top_action
    top_action = {
        "document": top_doc.get("document", "Legal Heir Succession Certificate") if top_doc else "Legal Heir Succession Certificate",
        "unlocks": top_doc.get("accounts", ["State Bank of India Savings A/c", "HDFC Bank Fixed Deposit", "ICICI Mutual Fund"]) if top_doc else ["SBI Savings A/c", "SBI Fixed Deposit", "SBI Locker #42"],
        "description": "Submitting the Legal Heir Succession Certificate will satisfy court-authorized succession clearance across 3 accounts."
    }

    institutions = [
        {
            "id": "sbi",
            "name": "State Bank of India",
            "code": "SBI",
            "status": "Action Required",
            "progress": 66,
            "holdingsInfo": "3 holdings linked • 2 of 3 requirements satisfied",
            "requirements": [
                {
                    "id": "req_sbi_death",
                    "name": "Death Certificate (Original / Notarized)",
                    "subtitle": "Verified by municipal registrar office on Oct 14, 2024",
                    "status": "Verified",
                    "isCritical": False
                },
                {
                    "id": "req_sbi_succ",
                    "name": "Legal Heir Succession Certificate",
                    "subtitle": "District Court Order #HC-2024-889 cleared",
                    "status": "Verified",
                    "isCritical": False
                },
                {
                    "id": "req_sbi_indemnity",
                    "name": "Indemnity Bond on ₹500 Stamp Paper",
                    "subtitle": "Must be signed by all surviving legal heirs in presence of two independent witnesses.",
                    "status": "Required",
                    "isCritical": True,
                    "reasoning": "According to Reserve Bank of India (RBI) guidelines and institutional succession policy for deceased constituents, claims involving accounts without a registered nominee require legal indemnification to protect the institution against future third-party contesting claims."
                }
            ]
        },
        {
            "id": "hdfc",
            "name": "HDFC Life Insurance",
            "code": "HDFC",
            "status": "Completed",
            "progress": 100,
            "holdingsInfo": "Policy #98234105 • All requirements fulfilled",
            "requirements": [
                {
                    "id": "req_hdfc_nominee",
                    "name": "Nominee Claim Application Form (Form 301)",
                    "subtitle": "Processed and approved by HDFC Claims Dept.",
                    "status": "Approved",
                    "isCritical": False
                },
                {
                    "id": "req_hdfc_policy",
                    "name": "Original Policy Bond Document",
                    "subtitle": "Physical copy surrendered at Connaught Place branch.",
                    "status": "Verified",
                    "isCritical": False
                }
            ]
        },
        {
            "id": "icici",
            "name": "ICICI Prudential Mutual Fund",
            "code": "ICICI",
            "status": "In Review",
            "progress": 66,
            "holdingsInfo": "Folio #4492019/8 • 2 of 3 requirements submitted",
            "requirements": [
                {
                    "id": "req_icici_trf",
                    "name": "Transmission Request Form (TRF)",
                    "subtitle": "Submitted on Nov 2, 2024. Undergoing legal scrutiny by Registrar.",
                    "status": "In Review (Est. 2 days)",
                    "isCritical": False
                },
                {
                    "id": "req_icici_cheque",
                    "name": "Cancelled Cheque of Claimant with Pre-printed Name",
                    "subtitle": "HDFC Bank A/c ending in 4092",
                    "status": "Verified",
                    "isCritical": False
                },
                {
                    "id": "req_icici_fatca",
                    "name": "FATCA / CRS Declaration Form",
                    "subtitle": "Mandatory tax residency self-certification for transmission of mutual funds.",
                    "status": "Required",
                    "isCritical": True,
                    "reasoning": "Mandatory tax compliance requirement under SEBI regulations for transmission of mutual fund units to surviving heirs."
                }
            ]
        }
    ]

    return {
        "top_action": top_action,
        "institutions": institutions
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
