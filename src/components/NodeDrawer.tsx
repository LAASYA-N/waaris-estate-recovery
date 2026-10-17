import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle,
  Building2,
  Wallet,
  Users,
  FileText,
  Upload,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  type: 'heir' | 'account' | 'institution' | 'document' | 'requirement';
  status: 'blocked' | 'missing' | 'ready' | 'satisfied' | 'in_progress';
  details?: {
    relation?: string;
    entitlement?: string;
    statusText?: string;
    documentsSubmitted?: string[];
    branch?: string;
    branchCode?: string;
    manager?: string;
    contact?: string;
    claimStatus?: string;
    accountNo?: string;
    balance?: string;
    institution?: string;
    blockReason?: string;
    interestEarned?: string;
    nomineeRecorded?: string;
    scope?: string;
    requiredInstitution?: string;
    blockedAccounts?: string;
    stampValue?: string;
    suretiesNeeded?: number;
    actionRequired?: boolean;
    issuer?: string;
    registrationNo?: string;
    issueDate?: string;
    court?: string;
    orderNo?: string;
    unlocks?: string[];
    [key: string]: any;
  };
}

interface NodeDrawerProps {
  node: GraphNode | null;
  onClose: () => void;
  onFulfillRequirement?: (nodeId: string) => void;
}

export const NodeDrawer: React.FC<NodeDrawerProps> = ({
  node,
  onClose,
  onFulfillRequirement,
}) => {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!node) return null;

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploaded(true);
      if (onFulfillRequirement) {
        onFulfillRequirement(node.id);
      }
    }, 1200);
  };

  const isMissingReq = node.type === 'requirement' || node.status === 'missing';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] md:w-[490px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-transform transform duration-300 ease-in-out">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {isMissingReq ? (
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-6 h-6" />
            </div>
          ) : node.type === 'heir' ? (
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-6 h-6" />
            </div>
          ) : node.type === 'account' ? (
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Wallet className="w-6 h-6" />
            </div>
          ) : node.type === 'institution' ? (
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-6 h-6" />
            </div>
          )}

          <div>
            <span
              className={`text-xs font-bold tracking-wider uppercase block ${
                isMissingReq
                  ? 'text-red-600'
                  : node.type === 'heir'
                  ? 'text-indigo-600'
                  : node.type === 'account'
                  ? 'text-teal-700'
                  : node.type === 'institution'
                  ? 'text-amber-700'
                  : 'text-emerald-700'
              }`}
            >
              {isMissingReq ? 'MISSING REQUIREMENT' : node.type.toUpperCase()}
            </span>
            <h3 className="text-2xl font-bold text-[#1E293B] font-serif mt-0.5">
              {node.label}
            </h3>
            {node.sublabel && (
              <p className="text-sm text-slate-500 font-medium">{node.sublabel}</p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-[#1E293B] hover:bg-slate-100 rounded-lg transition-colors"
          title="Close Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Alert Banner */}
        {isMissingReq ? (
          <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#1E293B]">
                  Status: Action Required
                </p>
                <p className="text-xs text-slate-500">
                  Verified by Waaris Legal Engine
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
              {uploaded ? 'Resolved' : 'Missing'}
            </span>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1E293B]">
                Status:{' '}
                <span className="capitalize text-[#0D9488]">
                  {node.status.replace('_', ' ')}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                {node.details?.statusText || 'Synchronized with legal graph'}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                node.status === 'ready' || node.status === 'satisfied'
                  ? 'bg-emerald-100 text-emerald-700'
                  : node.status === 'blocked'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {node.status.toUpperCase()}
            </span>
          </div>
        )}

        {/* Missing Requirement Details */}
        {isMissingReq && (
          <>
            <div>
              <h4 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">
                Requirement Scope
              </h4>
              <p className="text-slate-700 text-[15px] leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                {node.details?.scope ||
                  'Required on stamp paper of ₹500, duly notarized by two independent sureties, to indemnify State Bank of India against future conflicting claims regarding the deceased’s deposits.'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">
                Blocking Impact
              </h4>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-sm overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-white">
                  <span className="text-slate-500">Required Institution:</span>
                  <span className="font-semibold text-[#1E293B]">
                    {node.details?.requiredInstitution || 'State Bank of India (SBI)'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50/50">
                  <span className="text-slate-500">Blocked Accounts:</span>
                  <span className="font-semibold text-[#0D9488]">
                    {node.details?.blockedAccounts || 'Savings A/c (₹48,50,000)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Fulfill Section */}
            <div>
              <h4 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">
                Fulfill Requirement
              </h4>
              <div className="border-2 border-dashed border-teal-200 rounded-2xl p-6 bg-teal-50/30 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-[#0D9488] flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-[#1E293B] text-[16px]">
                    Drag & drop scanned indemnity bond
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, JPG, PNG up to 25MB
                  </p>
                </div>

                {uploaded ? (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 text-sm font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    <span>Uploaded & Verified by Engine!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSimulateUpload}
                    disabled={isUploading}
                    className="mt-2 px-6 py-3 bg-[#0D9488] text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Document</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Account Details */}
        {node.type === 'account' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Institution</span>
                <span className="font-semibold text-[#1E293B]">
                  {node.details?.institution || 'State Bank of India'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Account Number</span>
                <span className="font-mono text-[#1E293B]">
                  {node.details?.accountNo || '••••••••4092'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Current Balance</span>
                <span className="font-bold text-lg text-[#0D9488]">
                  {node.details?.balance || '₹48,50,000'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Nominee on Record</span>
                <span className="font-medium text-red-600">
                  {node.details?.nomineeRecorded || 'None registered'}
                </span>
              </div>
            </div>

            {node.details?.blockReason && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs font-bold text-amber-800 uppercase">
                  Block Reason
                </p>
                <p className="text-sm text-amber-900 mt-1">
                  {node.details.blockReason}
                </p>
              </div>
            )}

            <button
              onClick={() => navigate('/checklist')}
              className="w-full py-3 bg-[#0D9488] text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition flex items-center justify-center gap-2"
            >
              <span>View Resolution Checklist</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Heir Details */}
        {node.type === 'heir' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Relation</span>
                <span className="font-semibold text-[#1E293B]">
                  {node.details?.relation || 'Legal Heir'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Statutory Share</span>
                <span className="font-bold text-[#0D9488] text-base">
                  {node.details?.entitlement || '25%'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Role</span>
                <span className="font-medium text-slate-700">
                  {node.details?.statusText || 'Co-Claimant'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">
                Documents On Record
              </h4>
              <div className="space-y-2">
                {(node.details?.documentsSubmitted || ['PAN Card', 'Aadhaar Card']).map(
                  (doc, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-sm"
                    >
                      <span className="font-medium text-slate-700">{doc}</span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('/overview')}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-[#1E293B] rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <span>View Estate Breakdown</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Institution Details */}
        {node.type === 'institution' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Branch</span>
                <span className="font-semibold text-[#1E293B]">
                  {node.details?.branch || 'Connaught Place, New Delhi'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Holdings</span>
                <span className="font-bold text-[#0D9488]">
                  {node.sublabel || '₹48,50,000'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold capitalize text-amber-700">
                  {node.details?.claimStatus || 'Pending documentation'}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checklist')}
              className="w-full py-3 bg-[#0D9488] text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition flex items-center justify-center gap-2"
            >
              <span>Manage Requirements</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Document Details */}
        {node.type === 'document' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Issuing Authority</span>
                <span className="font-semibold text-[#1E293B]">
                  {node.details?.issuer || node.details?.court || 'Municipal Authority'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order / Reg. No</span>
                <span className="font-mono text-xs text-slate-700">
                  {node.details?.orderNo || node.details?.registrationNo || 'HC-2024-889'}
                </span>
              </div>
              {node.details?.unlocks && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    Unlocks Holdings:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {node.details.unlocks.map((u, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200"
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Node ID: {node.id}</span>
        <button
          onClick={onClose}
          className="text-[#0D9488] hover:underline font-semibold"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
