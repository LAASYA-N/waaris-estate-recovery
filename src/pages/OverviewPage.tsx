import React, { useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar.js';
import { getEstate } from '../api.js';
import { Building2, PiggyBank, TrendingUp, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OverviewPage: React.FC = () => {
  const [estate, setEstate] = useState<any>(null);

  useEffect(() => {
    getEstate().then(setEstate);
  }, []);

  if (!estate) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
          <span>Loading Estate Portfolio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E293B]">
      <TopBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 space-y-10">
        {/* Top Estate Header Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-emerald-800">
                  ACTIVE ESTATE PORTFOLIO
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs sm:text-sm font-medium text-slate-500">
                  {estate.dob} – {estate.dod}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1E293B] font-serif">
                {estate.name}
              </h1>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex-1 min-w-[170px]">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Total Assessed Value
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-[#0D9488] font-serif mt-1">
                  {estate.totalAssessedValue}
                </p>
              </div>

              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex-1 min-w-[170px]">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Active Institutions
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-[#1E293B] font-serif mt-1">
                  {estate.activeInstitutionsCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Asset Inventory & Bank Accounts */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1E293B] font-serif">
              Asset Inventory & Bank Accounts
            </h2>
            <Link
              to="/agent"
              className="text-sm font-semibold text-[#0D9488] hover:underline"
            >
              Explore on Graph →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account 1: SBI */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    Blocked
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1E293B]">
                  State Bank of India
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Savings A/C ending in 4092
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[#1E293B]">
                  ₹48,50,000
                </span>
                <Link
                  to="/checklist"
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Action needed
                </Link>
              </div>
            </div>

            {/* Account 2: HDFC */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                    <PiggyBank className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Ready
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1E293B]">
                  HDFC Bank
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Fixed Deposit 5-Year
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[#1E293B]">
                  ₹1,20,00,000
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  Ready to claim
                </span>
              </div>
            </div>

            {/* Account 3: ICICI */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    In Progress
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1E293B]">
                  ICICI Mutual Fund
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Growth Portfolio
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[#1E293B]">
                  ₹15,00,000
                </span>
                <Link
                  to="/checklist"
                  className="text-xs font-semibold text-amber-700 hover:underline"
                >
                  Reviewing docs
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Legal Heirs & Entitlements */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1E293B] font-serif">
              Legal Heirs & Entitlements
            </h2>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Statutory Indian Succession Act Distribution
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {estate.heirs?.map((heir: any) => (
              <div
                key={heir.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D9488] font-bold text-lg flex items-center justify-center border border-teal-100">
                    {heir.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1E293B]">
                      {heir.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                      {heir.relation}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-3xl font-bold font-serif ${
                      heir.share === 50 ? 'text-[#0D9488]' : 'text-[#1E293B]'
                    }`}
                  >
                    {heir.shareLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
