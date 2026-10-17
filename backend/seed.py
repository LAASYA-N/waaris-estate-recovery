import os
import sys
from dotenv import load_dotenv

# Ensure backend root is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import is_falkordb_connected, get_graph, get_memory_graph

load_dotenv()


def seed_database():
    """
    Seeds the FalkorDB graph (waaris_estate_001) or memory graph safely and idempotently:
    Estate of Late Shri R.K. Verma
    - Deceased: Late Shri R.K. Verma
    - Heirs:
        * Sunita Verma (Wife, 50% statutory share)
        * Rajesh Verma (Son, 25% statutory share)
        * Priya Verma (Daughter, 25% statutory share)
    - Institutions:
        * State Bank of India
        * HDFC Bank
        * ICICI Mutual Fund
    - Accounts:
        * SBI savings ₹48,50,000 (blocked, no nominee)
        * HDFC Bank fixed deposit ₹1,20,00,000 (ready)
        * ICICI Mutual Fund ₹15,00,000 (in progress)
    - Requirements:
        * Death Certificate (satisfied)
        * KYC of claimant (satisfied)
        * Indemnity Bond on ₹500 stamp paper (missing, required by SBI)
        * Legal Heir Succession Certificate (missing, required by SBI, HDFC, ICICI)
    - Key relationship:
        * Legal Heir Succession Certificate is required by all three institutions/accounts,
          meaning uploading it unblocks 3 accounts.
    """
    print("[Seed] Starting graph seed for estate waaris_estate_001...")

    # 1. Populate In-Memory Fallback Graph
    mem = get_memory_graph()
    mem.clear()

    # Deceased
    mem.add_node("dec_rk_verma", ["Deceased"], {
        "id": "dec_rk_verma",
        "name": "Late Shri R.K. Verma",
        "dob": "05 Oct 1948",
        "dod": "14 Jan 2025"
    })

    # Claim
    mem.add_node("claim_001", ["Claim"], {
        "id": "claim_001",
        "title": "Estate Settlement Claim - Late Shri R.K. Verma",
        "status": "in_progress",
        "totalValue": "₹1,68,50,000",
        "readiness": 62
    })

    # Heirs
    mem.add_node("heir_sunita", ["Heir"], {
        "id": "heir_sunita",
        "name": "Sunita Verma",
        "relation": "Wife / Co-Heir",
        "share": 50,
        "shareLabel": "50%",
        "initials": "SV",
        "status": "satisfied"
    })
    mem.add_node("heir_rajesh", ["Heir"], {
        "id": "heir_rajesh",
        "name": "Rajesh Verma",
        "relation": "Son / Legal Heir",
        "share": 25,
        "shareLabel": "25%",
        "initials": "RV",
        "status": "satisfied"
    })
    mem.add_node("heir_priya", ["Heir"], {
        "id": "heir_priya",
        "name": "Priya Verma",
        "relation": "Daughter / Legal Heir",
        "share": 25,
        "shareLabel": "25%",
        "initials": "PV",
        "status": "satisfied"
    })

    # Institutions
    mem.add_node("inst_sbi", ["Institution"], {
        "id": "inst_sbi",
        "name": "State Bank of India",
        "status": "blocked",
        "code": "SBI",
        "branch": "Connaught Place, New Delhi"
    })
    mem.add_node("inst_hdfc", ["Institution"], {
        "id": "inst_hdfc",
        "name": "HDFC Bank",
        "status": "ready",
        "code": "HDFC",
        "branch": "GK-1, New Delhi"
    })
    mem.add_node("inst_icici", ["Institution"], {
        "id": "inst_icici",
        "name": "ICICI Mutual Fund",
        "status": "in_progress",
        "code": "ICICI",
        "branch": "Bandra Kurla Complex, Mumbai"
    })

    # Accounts
    mem.add_node("acc_sbi", ["Account"], {
        "id": "acc_sbi",
        "name": "SBI Savings A/C",
        "accountType": "Savings A/C ending in 4092",
        "amount": "₹48,50,000",
        "rawAmount": 4850000,
        "status": "blocked",
        "statusLabel": "Blocked",
        "blockReason": "Missing Indemnity Bond on ₹500 Stamp Paper",
        "nomineeRecorded": "None registered"
    })
    mem.add_node("acc_hdfc", ["Account"], {
        "id": "acc_hdfc",
        "name": "HDFC Fixed Deposit",
        "accountType": "Fixed Deposit 5-Year",
        "amount": "₹1,20,00,000",
        "rawAmount": 12000000,
        "status": "ready",
        "statusLabel": "Ready",
        "blockReason": None,
        "nomineeRecorded": "Sunita Verma (Registered Nominee)"
    })
    mem.add_node("acc_icici", ["Account"], {
        "id": "acc_icici",
        "name": "ICICI Growth Portfolio",
        "accountType": "Growth Portfolio",
        "amount": "₹15,00,000",
        "rawAmount": 1500000,
        "status": "in_progress",
        "statusLabel": "In Progress",
        "blockReason": "Transmission Request Form under verification",
        "nomineeRecorded": "Rajesh Verma"
    })

    # Requirements
    mem.add_node("req_death_cert", ["Requirement"], {
        "id": "req_death_cert",
        "name": "Death Certificate",
        "status": "satisfied",
        "isCritical": False
    })
    mem.add_node("req_kyc", ["Requirement"], {
        "id": "req_kyc",
        "name": "KYC of claimant",
        "status": "satisfied",
        "isCritical": False
    })
    mem.add_node("req_indemnity", ["Requirement"], {
        "id": "req_indemnity",
        "name": "Indemnity Bond on ₹500 stamp paper",
        "status": "missing",
        "isCritical": True,
        "details": "Required on ₹500 stamp paper with 2 sureties for non-nominee claim"
    })
    mem.add_node("req_succession_cert", ["Requirement"], {
        "id": "req_succession_cert",
        "name": "Legal Heir Succession Certificate",
        "status": "missing",
        "isCritical": True,
        "details": "Required statutory court succession authorization"
    })

    # Documents
    mem.add_node("doc_death_cert", ["Document"], {
        "id": "doc_death_cert",
        "name": "Official Death Certificate",
        "status": "satisfied",
        "registrationNo": "MCD/2025/09842"
    })
    mem.add_node("doc_kyc_claimant", ["Document"], {
        "id": "doc_kyc_claimant",
        "name": "Claimant KYC Dossier",
        "status": "satisfied",
        "verified": True
    })
    mem.add_node("doc_succession_cert", ["Document"], {
        "id": "doc_succession_cert",
        "name": "Legal Heir Certificate",
        "status": "missing",
        "unlockCount": 3
    })
    mem.add_node("doc_indemnity", ["Document"], {
        "id": "doc_indemnity",
        "name": "Indemnity Bond Document",
        "status": "missing",
        "unlockCount": 1
    })

    # Edges
    mem.add_edge("e_rel_1", "heir_sunita", "dec_rk_verma", "RELATED_TO", {"type": "Wife", "share": 50})
    mem.add_edge("e_rel_2", "heir_rajesh", "dec_rk_verma", "RELATED_TO", {"type": "Son", "share": 25})
    mem.add_edge("e_rel_3", "heir_priya", "dec_rk_verma", "RELATED_TO", {"type": "Daughter", "share": 25})

    mem.add_edge("e_held_1", "acc_sbi", "inst_sbi", "HELD_AT")
    mem.add_edge("e_held_2", "acc_hdfc", "inst_hdfc", "HELD_AT")
    mem.add_edge("e_held_3", "acc_icici", "inst_icici", "HELD_AT")

    mem.add_edge("e_nom_1", "heir_sunita", "acc_hdfc", "NOMINEE_OF")
    mem.add_edge("e_nom_2", "heir_rajesh", "acc_icici", "NOMINEE_OF")

    # Satisfied documents -> requirements
    mem.add_edge("e_sat_1", "doc_death_cert", "req_death_cert", "SATISFIES")
    mem.add_edge("e_sat_2", "doc_kyc_claimant", "req_kyc", "SATISFIES")

    # Missing documents -> satisfaction target
    mem.add_edge("e_sat_3", "doc_indemnity", "req_indemnity", "SATISFIES")
    mem.add_edge("e_sat_4", "doc_succession_cert", "req_succession_cert", "SATISFIES")

    # Requirements required by Accounts / Institutions
    mem.add_edge("e_req_1", "acc_sbi", "req_death_cert", "REQUIRES")
    mem.add_edge("e_req_2", "acc_sbi", "req_indemnity", "REQUIRES")
    mem.add_edge("e_req_3", "acc_sbi", "req_succession_cert", "REQUIRES")

    mem.add_edge("e_req_4", "acc_hdfc", "req_death_cert", "REQUIRES")
    mem.add_edge("e_req_5", "acc_hdfc", "req_succession_cert", "REQUIRES")

    mem.add_edge("e_req_6", "acc_icici", "req_death_cert", "REQUIRES")
    mem.add_edge("e_req_7", "acc_icici", "req_succession_cert", "REQUIRES")
    mem.add_edge("e_req_8", "acc_icici", "req_kyc", "REQUIRES")

    # Blocked By
    mem.add_edge("e_blk_1", "acc_sbi", "req_indemnity", "BLOCKED_BY")
    mem.add_edge("e_blk_2", "acc_sbi", "req_succession_cert", "BLOCKED_BY")
    mem.add_edge("e_blk_3", "acc_hdfc", "req_succession_cert", "BLOCKED_BY")
    mem.add_edge("e_blk_4", "acc_icici", "req_succession_cert", "BLOCKED_BY")

    # Direct UNLOCKS relationship for key query
    mem.add_edge("e_unl_1", "doc_succession_cert", "acc_sbi", "UNLOCKS")
    mem.add_edge("e_unl_2", "doc_succession_cert", "acc_hdfc", "UNLOCKS")
    mem.add_edge("e_unl_3", "doc_succession_cert", "acc_icici", "UNLOCKS")
    mem.add_edge("e_unl_4", "doc_indemnity", "acc_sbi", "UNLOCKS")

    # Initial Claim Event
    mem.add_node("evt_seed", ["Event"], {
        "id": "evt_seed",
        "type": "ESTATE_INITIALIZED",
        "note": "Estate graph seeded with Late Shri R.K. Verma records.",
        "timestamp": "2026-10-11T22:00:00Z"
    })
    mem.add_edge("e_claim_evt", "evt_seed", "claim_001", "LOGGED_FOR")

    print("[Seed] Fallback graph populated in memory.")

    # 2. If FalkorDB is running, execute Cypher script
    if is_falkordb_connected():
        try:
            graph = get_graph()
            # Delete old data in waaris_estate_001
            graph.query("MATCH (n) DETACH DELETE n")

            cypher_seed = """
            // 1. Create Deceased and Claim
            CREATE (dec:Deceased {id: 'dec_rk_verma', name: 'Late Shri R.K. Verma', dob: '05 Oct 1948', dod: '14 Jan 2025'})
            CREATE (cl:Claim {id: 'claim_001', title: 'Estate Settlement Claim - Late Shri R.K. Verma', status: 'in_progress', totalValue: '₹1,68,50,000', readiness: 62})

            // 2. Create Heirs
            CREATE (h1:Heir {id: 'heir_sunita', name: 'Sunita Verma', relation: 'Wife / Co-Heir', share: 50, shareLabel: '50%', initials: 'SV', status: 'satisfied'})
            CREATE (h2:Heir {id: 'heir_rajesh', name: 'Rajesh Verma', relation: 'Son / Legal Heir', share: 25, shareLabel: '25%', initials: 'RV', status: 'satisfied'})
            CREATE (h3:Heir {id: 'heir_priya', name: 'Priya Verma', relation: 'Daughter / Legal Heir', share: 25, shareLabel: '25%', initials: 'PV', status: 'satisfied'})

            // 3. Create Institutions
            CREATE (i1:Institution {id: 'inst_sbi', name: 'State Bank of India', status: 'blocked', code: 'SBI', branch: 'Connaught Place, New Delhi'})
            CREATE (i2:Institution {id: 'inst_hdfc', name: 'HDFC Bank', status: 'ready', code: 'HDFC', branch: 'GK-1, New Delhi'})
            CREATE (i3:Institution {id: 'inst_icici', name: 'ICICI Mutual Fund', status: 'in_progress', code: 'ICICI', branch: 'Bandra Kurla Complex, Mumbai'})

            // 4. Create Accounts
            CREATE (a1:Account {id: 'acc_sbi', name: 'SBI Savings A/C', accountType: 'Savings A/C ending in 4092', amount: '₹48,50,000', rawAmount: 4850000, status: 'blocked', statusLabel: 'Blocked', blockReason: 'Missing Indemnity Bond on ₹500 Stamp Paper', nomineeRecorded: 'None registered'})
            CREATE (a2:Account {id: 'acc_hdfc', name: 'HDFC Fixed Deposit', accountType: 'Fixed Deposit 5-Year', amount: '₹1,20,00,000', rawAmount: 12000000, status: 'ready', statusLabel: 'Ready', blockReason: '', nomineeRecorded: 'Sunita Verma (Registered Nominee)'})
            CREATE (a3:Account {id: 'acc_icici', name: 'ICICI Growth Portfolio', accountType: 'Growth Portfolio', amount: '₹15,00,000', rawAmount: 1500000, status: 'in_progress', statusLabel: 'In Progress', blockReason: 'Transmission Request Form under verification', nomineeRecorded: 'Rajesh Verma'})

            // 5. Create Requirements
            CREATE (r1:Requirement {id: 'req_death_cert', name: 'Death Certificate', status: 'satisfied', isCritical: false})
            CREATE (r2:Requirement {id: 'req_kyc', name: 'KYC of claimant', status: 'satisfied', isCritical: false})
            CREATE (r3:Requirement {id: 'req_indemnity', name: 'Indemnity Bond on ₹500 stamp paper', status: 'missing', isCritical: true, details: 'Required on ₹500 stamp paper with 2 sureties for non-nominee claim'})
            CREATE (r4:Requirement {id: 'req_succession_cert', name: 'Legal Heir Succession Certificate', status: 'missing', isCritical: true, details: 'Required statutory court succession authorization'})

            // 6. Create Documents
            CREATE (d1:Document {id: 'doc_death_cert', name: 'Death Certificate', status: 'satisfied', registrationNo: 'MCD/2025/09842'})
            CREATE (d2:Document {id: 'doc_kyc_claimant', name: 'KYC of claimant', status: 'satisfied', verified: true})
            CREATE (d3:Document {id: 'doc_succession_cert', name: 'Legal Heir Certificate', status: 'missing'})
            CREATE (d4:Document {id: 'doc_indemnity', name: 'Indemnity Bond', status: 'missing'})

            // Relationships - Family ties
            CREATE (h1)-[:RELATED_TO {type: 'Wife', share: 50}]->(dec)
            CREATE (h2)-[:RELATED_TO {type: 'Son', share: 25}]->(dec)
            CREATE (h3)-[:RELATED_TO {type: 'Daughter', share: 25}]->(dec)

            // Accounts held at institutions
            CREATE (a1)-[:HELD_AT]->(i1)
            CREATE (a2)-[:HELD_AT]->(i2)
            CREATE (a3)-[:HELD_AT]->(i3)

            // Nominees
            CREATE (h1)-[:NOMINEE_OF]->(a2)
            CREATE (h2)-[:NOMINEE_OF]->(a3)

            // Document satisfaction
            CREATE (d1)-[:SATISFIES]->(r1)
            CREATE (d2)-[:SATISFIES]->(r2)
            CREATE (d3)-[:SATISFIES]->(r4)
            CREATE (d4)-[:SATISFIES]->(r3)

            // Account requirements
            CREATE (a1)-[:REQUIRES]->(r1)
            CREATE (a1)-[:REQUIRES]->(r3)
            CREATE (a1)-[:REQUIRES]->(r4)

            CREATE (a2)-[:REQUIRES]->(r1)
            CREATE (a2)-[:REQUIRES]->(r4)

            CREATE (a3)-[:REQUIRES]->(r1)
            CREATE (a3)-[:REQUIRES]->(r2)
            CREATE (a3)-[:REQUIRES]->(r4)

            // Blocked By relationships
            CREATE (a1)-[:BLOCKED_BY]->(r3)
            CREATE (a1)-[:BLOCKED_BY]->(r4)
            CREATE (a2)-[:BLOCKED_BY]->(r4)
            CREATE (a3)-[:BLOCKED_BY]->(r4)

            // Unlocks
            CREATE (d3)-[:UNLOCKS]->(a1)
            CREATE (d3)-[:UNLOCKS]->(a2)
            CREATE (d3)-[:UNLOCKS]->(a3)
            CREATE (d4)-[:UNLOCKS]->(a1)

            // Initial Claim Event
            CREATE (evt:Event {id: 'evt_seed', type: 'ESTATE_INITIALIZED', note: 'Estate graph seeded with Late Shri R.K. Verma records.', timestamp: '2026-10-11T22:00:00Z'})
            CREATE (evt)-[:LOGGED_FOR]->(cl)
            """
            graph.query(cypher_seed)
            print("[Seed] Successfully seeded FalkorDB graph!")
        except Exception as e:
            print(f"[Seed] Error seeding FalkorDB: {e}")
    else:
        print("[Seed] FalkorDB not currently reachable. Seed saved in fallback graph store.")


if __name__ == "__main__":
    seed_database()
