/**
 * Waaris API client
 * Handles communication with backend at VITE_API_URL (default http://localhost:8000)
 * Falls back transparently to local mock data if the backend is unreachable.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Mock data store
const MOCK_ESTATE = {
  name: "Late Shri R.K. Verma Estate",
  dob: "05 Oct 1948",
  dod: "14 Jan 2025",
  readiness: 62,
  totalAssessedValue: "₹1,68,50,000",
  activeInstitutionsCount: "3 Banks / Funds",
  accounts: [
    {
      id: "acc_sbi",
      institution: "State Bank of India",
      accountType: "Savings A/C ending in 4092",
      amount: "₹48,50,000",
      status: "blocked",
      statusLabel: "Blocked",
      blockReason: "Missing Indemnity Bond on ₹500 Stamp Paper",
      icon: "account_balance"
    },
    {
      id: "acc_hdfc",
      institution: "HDFC Bank",
      accountType: "Fixed Deposit 5-Year",
      amount: "₹1,20,00,000",
      status: "ready",
      statusLabel: "Ready",
      blockReason: null,
      icon: "savings"
    },
    {
      id: "acc_icici",
      institution: "ICICI Mutual Fund",
      accountType: "Growth Portfolio",
      amount: "₹15,00,000",
      status: "in_progress",
      statusLabel: "In Progress",
      blockReason: "Transmission Request Form under verification",
      icon: "trending_up"
    }
  ],
  heirs: [
    {
      id: "heir_sunita",
      name: "Sunita Verma",
      relation: "Wife / Co-Heir",
      initials: "SV",
      share: 50,
      shareLabel: "50%"
    },
    {
      id: "heir_rajesh",
      name: "Rajesh Verma",
      relation: "Son / Legal Heir",
      initials: "RV",
      share: 25,
      shareLabel: "25%"
    },
    {
      id: "heir_priya",
      name: "Priya Verma",
      relation: "Daughter / Legal Heir",
      initials: "PV",
      share: 25,
      shareLabel: "25%"
    }
  ]
};

const MOCK_GRAPH = {
  nodes: [
    {
      id: "heir_sunita",
      label: "Sunita Verma",
      sublabel: "Co-Heir",
      type: "heir",
      status: "satisfied",
      details: {
        relation: "Wife",
        entitlement: "50% statutory share",
        statusText: "Verified Co-Heir",
        documentsSubmitted: ["Aadhaar", "Marriage Certificate"]
      }
    },
    {
      id: "heir_rajesh",
      label: "Rajesh Verma",
      sublabel: "Legal Heir",
      type: "heir",
      status: "satisfied",
      details: {
        relation: "Son",
        entitlement: "25% statutory share",
        statusText: "Primary Claimant & Signatory",
        documentsSubmitted: ["PAN", "Aadhaar", "Address Proof"]
      }
    },
    {
      id: "heir_priya",
      label: "Priya Verma",
      sublabel: "Legal Heir",
      type: "heir",
      status: "satisfied",
      details: {
        relation: "Daughter",
        entitlement: "25% statutory share",
        statusText: "NOC Signed & Verified",
        documentsSubmitted: ["Passport", "PAN", "NOC Affidavit"]
      }
    },
    {
      id: "inst_sbi",
      label: "State Bank of India",
      sublabel: "₹48,50,000",
      type: "institution",
      status: "blocked",
      details: {
        branch: "Connaught Place, New Delhi",
        branchCode: "SBIN0000691",
        manager: "Rajiv Khurana",
        contact: "sbi.cp@sbi.co.in",
        claimStatus: "Halted pending Indemnity Bond submission"
      }
    },
    {
      id: "acc_sbi",
      label: "SBI Savings A/C",
      sublabel: "Primary Account",
      type: "account",
      status: "blocked",
      details: {
        accountNo: "••••••••4092",
        balance: "₹48,50,000",
        institution: "State Bank of India",
        blockReason: "Mandatory Indemnity Bond with 2 sureties missing",
        interestEarned: "₹1,42,800",
        nomineeRecorded: "None registered"
      }
    },
    {
      id: "req_indemnity",
      label: "Indemnity Bond",
      sublabel: "Missing (Action Req.)",
      type: "requirement",
      status: "missing",
      details: {
        scope: "Required on stamp paper of ₹500, duly notarized by two independent sureties, to indemnify State Bank of India against future conflicting claims regarding the deceased's deposits.",
        requiredInstitution: "State Bank of India (SBI)",
        blockedAccounts: "Savings A/c (₹48,50,000)",
        stampValue: "₹500 Non-Judicial Stamp Paper",
        suretiesNeeded: 2,
        actionRequired: true
      }
    },
    {
      id: "doc_death_cert",
      label: "Death Certificate",
      sublabel: "Satisfied",
      type: "document",
      status: "satisfied",
      details: {
        issuer: "Municipal Corporation of Delhi (MCD)",
        registrationNo: "MCD/2025/09842",
        issueDate: "18 Jan 2025",
        statusText: "Verified & Notarized Copy on Record"
      }
    },
    {
      id: "inst_hdfc",
      label: "HDFC Bank",
      sublabel: "₹1,20,00,000",
      type: "institution",
      status: "ready",
      details: {
        branch: "GK-1, New Delhi",
        nomineeRecorded: "Sunita Verma (Registered Nominee)",
        statusText: "Ready for direct transfer to nominee account"
      }
    },
    {
      id: "doc_succession_cert",
      label: "Succession Certificate",
      sublabel: "Unlocks 3 Accounts",
      type: "document",
      status: "satisfied",
      details: {
        court: "District Court of Delhi",
        orderNo: "HC-2024-889",
        statusText: "Certified Court Order on Record",
        unlocks: ["SBI Savings A/c", "SBI Fixed Deposit", "SBI Locker #42"]
      }
    },
    {
      id: "inst_icici",
      label: "ICICI Mutual Fund",
      sublabel: "₹15,00,000",
      type: "institution",
      status: "in_progress",
      details: {
        folio: "4492019/8",
        holding: "ICICI Prudential Bluechip & Balanced",
        statusText: "Transmission Request Form under Registrar Scrutiny"
      }
    }
  ],
  links: [
    { id: "e1", source: "heir_sunita", target: "heir_rajesh", label: "Co-Heir" },
    { id: "e2", source: "heir_rajesh", target: "inst_sbi", label: "Claimant" },
    { id: "e3", source: "inst_sbi", target: "acc_sbi", label: "Holds" },
    { id: "e4", source: "acc_sbi", target: "req_indemnity", label: "Blocked By" },
    { id: "e5", source: "heir_rajesh", target: "inst_hdfc", label: "Beneficiary" },
    { id: "e6", source: "inst_hdfc", target: "doc_death_cert", label: "Verified with" },
    { id: "e7", source: "heir_priya", target: "doc_succession_cert", label: "Co-petitioner" },
    { id: "e8", source: "doc_succession_cert", target: "inst_sbi", label: "Authorizes" },
    { id: "e9", source: "heir_sunita", target: "inst_icici", label: "Claimant" },
    { id: "e10", source: "inst_icici", target: "doc_death_cert", label: "Requires" }
  ]
};

const MOCK_CHECKLIST = {
  top_action: {
    document: "Indemnity Bond",
    unlocks: ["SBI Savings A/c", "SBI Fixed Deposit", "SBI Locker #42"],
    description: "Submitting the Indemnity Bond will immediately clear verification hurdles across multiple State Bank of India holdings."
  },
  institutions: [
    {
      id: "sbi",
      name: "State Bank of India",
      code: "SBI",
      status: "Action Required",
      progress: 66,
      holdingsInfo: "3 holdings linked • 2 of 3 requirements satisfied",
      requirements: [
        {
          id: "req_sbi_death",
          name: "Death Certificate (Original / Notarized)",
          subtitle: "Verified by municipal registrar office on Oct 14, 2024",
          status: "Verified",
          isCritical: false
        },
        {
          id: "req_sbi_succ",
          name: "Legal Heir Succession Certificate",
          subtitle: "District Court Order #HC-2024-889 cleared",
          status: "Verified",
          isCritical: false
        },
        {
          id: "req_sbi_indemnity",
          name: "Indemnity Bond on ₹500 Stamp Paper",
          subtitle: "Must be signed by all surviving legal heirs in presence of two independent witnesses.",
          status: "Required",
          isCritical: true,
          reasoning: "According to Reserve Bank of India (RBI) guidelines and institutional succession policy for deceased constituents, claims involving accounts without a registered nominee require legal indemnification to protect the institution against future third-party contesting claims."
        }
      ]
    },
    {
      id: "hdfc",
      name: "HDFC Life Insurance",
      code: "HDFC",
      status: "Completed",
      progress: 100,
      holdingsInfo: "Policy #98234105 • All requirements fulfilled",
      requirements: [
        {
          id: "req_hdfc_nominee",
          name: "Nominee Claim Application Form (Form 301)",
          subtitle: "Processed and approved by HDFC Claims Dept.",
          status: "Approved",
          isCritical: false
        },
        {
          id: "req_hdfc_policy",
          name: "Original Policy Bond Document",
          subtitle: "Physical copy surrendered at Connaught Place branch.",
          status: "Verified",
          isCritical: false
        }
      ]
    },
    {
      id: "icici",
      name: "ICICI Prudential Mutual Fund",
      code: "ICICI",
      status: "In Review",
      progress: 66,
      holdingsInfo: "Folio #4492019/8 • 2 of 3 requirements submitted",
      requirements: [
        {
          id: "req_icici_trf",
          name: "Transmission Request Form (TRF)",
          subtitle: "Submitted on Nov 2, 2024. Undergoing legal scrutiny by Registrar.",
          status: "In Review (Est. 2 days)",
          isCritical: false
        },
        {
          id: "req_icici_cheque",
          name: "Cancelled Cheque of Claimant with Pre-printed Name",
          subtitle: "HDFC Bank A/c ending in 4092",
          status: "Verified",
          isCritical: false
        },
        {
          id: "req_icici_fatca",
          name: "FATCA / CRS Declaration Form",
          subtitle: "Mandatory tax residency self-certification for transmission of mutual funds.",
          status: "Required",
          isCritical: true,
          reasoning: "Mandatory tax compliance requirement under SEBI regulations for transmission of mutual fund units to surviving heirs."
        }
      ]
    }
  ]
};

async function fetchWithFallback(url, options = {}, fallbackData) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[API] Fallback used for ${url}:`, err);
    // Fallback to mock data
    return typeof fallbackData === 'function' ? fallbackData() : fallbackData;
  }
}

/**
 * GET /estate
 */
export async function getEstate() {
  return fetchWithFallback('/estate', { method: 'GET' }, MOCK_ESTATE);
}

/**
 * GET /graph
 */
export async function getGraph() {
  return fetchWithFallback('/graph', { method: 'GET' }, MOCK_GRAPH);
}

/**
 * POST /agent/chat
 */
export async function sendAgentMessage(message) {
  const payload = { message };

  const fallbackHandler = () => {
    const lower = message.toLowerCase();

    // 1. Specific required prompt: "Which one document unblocks the most accounts?"
    if (lower.includes('unblock') || lower.includes('which one document') || lower.includes('succession certificate')) {
      return {
        answer: "The Legal Heir Succession Certificate unlocks 3 accounts across State Bank of India (SBI Savings A/c, SBI Fixed Deposit, and SBI Locker #42). Having this certified by the District Court satisfies statutory inheritance authorization.",
        steps: [
          "Scanned all 3 active institutions and 5 asset holdings",
          "Cross-referenced court order #HC-2024-889 against institutional clearance rules",
          "Calculated unblock cascade: SBI Savings (₹48,50,000), FD (₹12,00,000), Locker #42"
        ],
        highlight_node_ids: ["doc_succession_cert", "inst_sbi", "acc_sbi", "heir_rajesh", "heir_sunita"],
        highlight_edge_ids: ["e8", "e2", "e3", "e1"],
        actions: [
          { label: "View Succession Certificate", route: "/checklist" },
          { label: "Upload Attestation", route: "/upload" }
        ]
      };
    }

    // 2. Indemnity Bond / SBI blocker question
    if (lower.includes('sbi') || lower.includes('block') || lower.includes('indemnity')) {
      return {
        answer: "The Indemnity Bond (₹48,50,000 SBI Account) is currently the single critical blocker. Securing this unblocks the primary State Bank of India deposit and downstream mutual fund transfers for legal heir Sunita Verma.",
        steps: [
          "Checked nominee on SBI account #4092 (None registered)",
          "Identified missing Indemnity Bond requirement on ₹500 stamp paper",
          "Validated 2 independent sureties required by SBI Connaught Place branch"
        ],
        highlight_node_ids: ["inst_sbi", "acc_sbi", "req_indemnity", "heir_rajesh", "heir_sunita"],
        highlight_edge_ids: ["e2", "e3", "e4", "e1"],
        actions: [
          { label: "Resolve Indemnity Bond", route: "/checklist" }
        ]
      };
    }

    // 3. Entitlement / heir distribution question
    if (lower.includes('entitled') || lower.includes('heir') || lower.includes('share') || lower.includes('sunita') || lower.includes('rajesh') || lower.includes('priya')) {
      return {
        answer: "Per Hindu Succession Act Class-I succession rules, the estate is divided among 3 legal heirs: Sunita Verma (wife) holds a 50% co-heir entitlement, while Rajesh Verma (son) and Priya Verma (daughter) each hold a 25% statutory share.",
        steps: [
          "Retrieved Class-I legal heir structure for Late Shri R.K. Verma",
          "Calculated statutory shares: Wife (50%), Son (25%), Daughter (25%)",
          "Verified NOC affidavit signed by daughter Priya Verma"
        ],
        highlight_node_ids: ["heir_sunita", "heir_rajesh", "heir_priya", "inst_sbi", "inst_hdfc"],
        highlight_edge_ids: ["e1", "e5", "e7"],
        actions: [
          { label: "View Heirs Distribution", route: "/overview" }
        ]
      };
    }

    // Generic response with helpful graph highlighting
    return {
      answer: `I have analyzed the estate graph for Late Shri R.K. Verma. Out of ₹1,68,50,000 in total holdings, ₹1,20,00,000 at HDFC Bank is ready for claim, while ₹48,50,000 at SBI is held pending an Indemnity Bond.`,
      steps: [
        "Traversed estate dependency graph",
        "Checked institutional compliance rules",
        "Assessed readiness score at 62%"
      ],
      highlight_node_ids: ["inst_sbi", "acc_sbi", "req_indemnity", "inst_hdfc"],
      highlight_edge_ids: ["e3", "e4", "e5"],
      actions: [
        { label: "Go to Checklist", route: "/checklist" }
      ]
    };
  };

  return fetchWithFallback('/agent/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, fallbackHandler);
}

/**
 * POST /documents (multipart file)
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const fallbackHandler = () => {
    const fileName = file?.name?.toLowerCase() || '';
    if (fileName.includes('death')) {
      return {
        extracted: [
          { label: "Death Certificate registered", type: "document" },
          { label: "Deceased: Late Shri R.K. Verma", type: "entity" },
          { label: "Municipal Registrar verification: Valid", type: "status" }
        ]
      };
    }
    if (fileName.includes('indemnity')) {
      return {
        extracted: [
          { label: "Indemnity Bond on ₹500 Stamp Paper detected", type: "requirement" },
          { label: "Two Surety Signatures verified", type: "verification" },
          { label: "SBI Savings A/c unblocked", type: "account" }
        ]
      };
    }
    // Default extraction feed items
    return {
      extracted: [
        { label: "SBI account found", type: "account" },
        { label: "Nominee: Rohan Verma", type: "nominee" },
        { label: "Death certificate verified", type: "verification" }
      ]
    };
  };

  return fetchWithFallback('/documents', {
    method: 'POST',
    body: formData
  }, fallbackHandler);
}

/**
 * GET /checklist
 */
export async function getChecklist() {
  return fetchWithFallback('/checklist', { method: 'GET' }, MOCK_CHECKLIST);
}
