import React, { useState, useEffect } from 'react';
import { TopBar } from '../components/TopBar.js';
import { getChecklist } from '../api.js';
import {
  AlertTriangle,
  Upload,
  Search,
  ChevronDown,
  CheckCircle,
  HelpCircle,
  Eye,
  Building,
  Headphones,
  X,
  Sparkles,
  Key,
  ShieldCheck,
  PiggyBank
} from 'lucide-react';

export const ChecklistPage: React.FC = () => {
  const [checklistData, setChecklistData] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sbi: true,
    hdfc: false,
    icici: false
  });

  // Modal states
  const [activeUploadModalDoc, setActiveUploadModalDoc] = useState<string | null>(null);
  const [activeReasoningModalDoc, setActiveReasoningModalDoc] = useState<string | null>(null);
  const [uploadSuccessDoc, setUploadSuccessDoc] = useState<string | null>(null);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  useEffect(() => {
    getChecklist().then(setChecklistData);
  }, []);

  if (!checklistData) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
          <span>Loading Checklist...</span>
        </div>
      </div>
    );
  }

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSimulateSubmit = () => {
    if (!activeUploadModalDoc) return;
    const docName = activeUploadModalDoc;
    setActiveUploadModalDoc(null);
    setUploadSuccessDoc(docName);

    // Update in-memory state for immediate positive feedback
    setChecklistData((prev: any) => {
      const updatedInstitutions = prev.institutions.map((inst: any) => {
        const updatedReqs = inst.requirements.map((req: any) => {
          if (req.name.toLowerCase().includes(docName.toLowerCase()) || docName.toLowerCase().includes(req.name.toLowerCase())) {
            return {
              ...req,
              status: 'Verified',
              isCritical: false
            };
          }
          return req;
        });

        const verifiedCount = updatedReqs.filter((r: any) => r.status === 'Verified' || r.status === 'Approved').length;
        const progress = Math.round((verifiedCount / updatedReqs.length) * 100);

        return {
          ...inst,
          requirements: updatedReqs,
          progress,
          status: progress === 100 ? 'Completed' : inst.status
        };
      });

      return {
        ...prev,
        institutions: updatedInstitutions
      };
    });
  };

  // Filter institutions
  const filteredInstitutions = checklistData.institutions.filter((inst: any) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.requirements.some((r: any) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (!matchesSearch) return false;

    if (activeFilter === 'action') return inst.status === 'Action Required';
    if (activeFilter === 'review') return inst.status === 'In Review';
    if (activeFilter === 'completed') return inst.status === 'Completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B]">
      <TopBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 space-y-8">
        {/* Top Actionable Bottleneck Banner */}
        <div className="relative overflow-hidden bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-md">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-50 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Critical Bottleneck
                </span>
                <span className="text-xs sm:text-sm text-slate-500 tracking-wider uppercase font-bold">
                  Immediate Action Required
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-serif">
                Upload 1 document to unblock 3 accounts
              </h1>

              <p className="text-[17px] text-slate-600 leading-relaxed">
                Submitting the{' '}
                <strong className="text-[#0D9488] font-bold">
                  Indemnity Bond
                </strong>{' '}
                will immediately clear verification hurdles across multiple
                State Bank of India holdings.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="text-sm text-slate-500 font-semibold mr-1">
                  Unlocks:
                </span>
                <span className="px-3.5 py-1.5 bg-slate-50 text-[#1E293B] text-sm rounded-xl border border-slate-200 flex items-center gap-2 font-medium">
                  <Building className="w-4 h-4 text-[#0D9488]" />
                  SBI Savings A/c
                </span>
                <span className="px-3.5 py-1.5 bg-slate-50 text-[#1E293B] text-sm rounded-xl border border-slate-200 flex items-center gap-2 font-medium">
                  <PiggyBank className="w-4 h-4 text-[#0D9488]" />
                  SBI Fixed Deposit
                </span>
                <span className="px-3.5 py-1.5 bg-slate-50 text-[#1E293B] text-sm rounded-xl border border-slate-200 flex items-center gap-2 font-medium">
                  <Key className="w-4 h-4 text-[#0D9488]" />
                  SBI Locker #42
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveUploadModalDoc('Indemnity Bond')}
              className="px-8 py-4 bg-[#0D9488] hover:bg-teal-700 text-white text-base sm:text-lg font-semibold rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer w-full lg:w-auto"
            >
              <Upload className="w-5 h-5" />
              <span>Resolve Requirement</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-sm rounded-xl font-semibold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1E293B] hover:bg-slate-100'
              }`}
            >
              All Institutions (4)
            </button>
            <button
              onClick={() => setActiveFilter('action')}
              className={`px-4 py-2 text-sm rounded-xl font-semibold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'action'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1E293B] hover:bg-slate-100'
              }`}
            >
              Action Needed (2)
            </button>
            <button
              onClick={() => setActiveFilter('review')}
              className={`px-4 py-2 text-sm rounded-xl font-semibold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'review'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1E293B] hover:bg-slate-100'
              }`}
            >
              In Review (1)
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-4 py-2 text-sm rounded-xl font-semibold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'completed'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#1E293B] hover:bg-slate-100'
              }`}
            >
              Completed (1)
            </button>
          </div>

          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search institutions or documents..."
              className="w-full md:w-80 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1E293B] focus:outline-none focus:border-[#0D9488] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Accordion Institutions List */}
        <div className="space-y-6">
          {filteredInstitutions.map((inst: any) => {
            const isExpanded = !!expandedSections[inst.id];

            return (
              <div
                key={inst.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleSection(inst.id)}
                  className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/70 hover:bg-slate-50 transition cursor-pointer select-none border-b border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center text-xl font-bold font-serif border border-teal-100 flex-shrink-0">
                      {inst.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B] font-serif">
                          {inst.name}
                        </h2>
                        <span
                          className={`px-3 py-0.5 text-xs font-bold rounded-full ${
                            inst.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inst.status === 'In Review'
                              ? 'bg-teal-100 text-[#0D9488]'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {inst.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {inst.holdingsInfo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-3">
                      <div className="w-28 sm:w-36 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            inst.progress === 100
                              ? 'bg-emerald-500'
                              : 'bg-[#0D9488]'
                          }`}
                          style={{ width: `${inst.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[#1E293B]">
                        {inst.progress}%
                      </span>
                    </div>

                    <div
                      className={`p-1 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="p-6 bg-white divide-y divide-slate-100 space-y-4">
                    {inst.requirements.map((req: any) => {
                      const isRequired = req.status === 'Required';

                      return (
                        <div
                          key={req.id}
                          className={`pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isRequired
                              ? 'bg-red-50/50 -mx-6 px-6 py-4 rounded-2xl border border-red-200 mt-2'
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isRequired
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {isRequired ? (
                                <AlertTriangle className="w-5 h-5" />
                              ) : (
                                <CheckCircle className="w-5 h-5" />
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[17px] font-bold text-[#1E293B]">
                                  {req.name}
                                </h4>
                                {isRequired && (
                                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600">
                                {req.subtitle}
                              </p>

                              {isRequired && req.reasoning && (
                                <button
                                  onClick={() =>
                                    setActiveReasoningModalDoc(req.name)
                                  }
                                  className="text-xs font-semibold text-[#0D9488] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                                >
                                  <HelpCircle className="w-3.5 h-3.5" />
                                  <span>Why is this needed?</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 sm:self-center ml-14 sm:ml-0">
                            {!isRequired && (
                              <span
                                className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                                  req.status === 'Verified' ||
                                  req.status === 'Approved'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-teal-50 text-[#0D9488] border-teal-200'
                                }`}
                              >
                                {req.status}
                              </span>
                            )}

                            {!isRequired && (
                              <button
                                onClick={() => setActiveReasoningModalDoc(req.name)}
                                className="text-xs font-semibold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer px-2 py-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                            )}

                            {isRequired && (
                              <button
                                onClick={() => setActiveUploadModalDoc(req.name)}
                                className="px-5 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
                              >
                                <Upload className="w-4 h-4" />
                                <span>Upload Document</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help & Support Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center flex-shrink-0 border border-teal-100">
              <Headphones className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1E293B] font-serif">
                Need assistance with legal document attestation?
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                Our estate legal experts are available to review drafts before
                submission to banks.
              </p>
            </div>
          </div>

          <button
            onClick={() => setConsultationModalOpen(true)}
            className="px-6 sm:px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#1E293B] transition-colors text-sm sm:text-base font-semibold rounded-2xl border border-slate-300 whitespace-nowrap cursor-pointer"
          >
            Schedule Legal Consultation
          </button>
        </div>
      </main>

      {/* Upload Modal */}
      {activeUploadModalDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveUploadModalDoc(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-[#1E293B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#0D9488]">
              <Upload className="w-6 h-6" />
              <h3 className="text-xl font-bold text-[#1E293B] font-serif">
                Upload {activeUploadModalDoc}
              </h3>
            </div>

            <p className="text-sm text-slate-600">
              Drag and drop your scanned PDF or clear photograph here, or browse
              from your secure vault.
            </p>

            <div
              onClick={handleSimulateSubmit}
              className="border-2 border-dashed border-slate-300 hover:border-[#0D9488] rounded-2xl p-8 flex flex-col items-center justify-center gap-2 bg-slate-50 cursor-pointer transition"
            >
              <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0D9488] flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-base font-semibold text-[#1E293B]">
                Click to browse or drop file here
              </p>
              <p className="text-xs text-slate-400">
                PDF, JPG, PNG up to 25MB (Encrypted)
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setActiveUploadModalDoc(null)}
                className="px-5 py-2.5 text-slate-600 hover:text-[#1E293B] text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateSubmit}
                className="px-6 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer shadow-xs"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reasoning Modal ("Why is this needed?") */}
      {activeReasoningModalDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveReasoningModalDoc(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-[#1E293B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#0D9488]">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-xl font-bold text-[#1E293B] font-serif">
                Why is this needed?
              </h3>
            </div>

            <p className="text-sm font-bold text-slate-700">
              {activeReasoningModalDoc}
            </p>

            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              According to Reserve Bank of India (RBI) guidelines and
              institutional succession policy for deceased constituents, claims
              involving multiple accounts without registered nomination require
              legal indemnification on non-judicial stamp paper with two
              independent sureties to protect against future contesting claims.
            </p>

            <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#0D9488] flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">
                  Waaris Intelligence Graph
                </p>
                <p className="text-xs text-[#1E293B] mt-0.5">
                  Resolving this item unlocks <strong>3 dependent asset holdings</strong> instantly.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setActiveReasoningModalDoc(null)}
                className="px-6 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Success Modal */}
      {uploadSuccessDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-bold text-[#1E293B] font-serif">
              Document Uploaded Successfully
            </h3>

            <p className="text-sm text-slate-600">
              Your {uploadSuccessDoc} has been securely encrypted and validated
              by the Waaris legal engine.
            </p>

            <button
              onClick={() => setUploadSuccessDoc(null)}
              className="mt-2 w-full py-3 bg-[#0D9488] hover:bg-teal-700 text-white font-semibold rounded-xl transition"
            >
              Return to Checklist
            </button>
          </div>
        </div>
      )}

      {/* Consultation Booking Modal */}
      {consultationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setConsultationModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-[#1E293B]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#0D9488]">
              <Headphones className="w-6 h-6" />
              <h3 className="text-xl font-bold text-[#1E293B] font-serif">
                Schedule Consultation
              </h3>
            </div>

            <p className="text-sm text-slate-600">
              Connect with an empaneled High Court succession attorney for notarization & indemnity stamp verification.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm">
              <span className="font-semibold text-slate-700">Next Available Slot:</span>
              <p className="text-xs text-slate-500 mt-0.5">Tomorrow, 11:30 AM IST (30 mins video consultation)</p>
            </div>

            <button
              onClick={() => {
                alert('Consultation booked! An invite has been sent to your email.');
                setConsultationModalOpen(false);
              }}
              className="w-full py-3 bg-[#0D9488] hover:bg-teal-700 text-white font-semibold rounded-xl transition"
            >
              Confirm 30-min Slot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
