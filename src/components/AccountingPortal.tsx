import React, { useState } from 'react';
import { ChartOfAccount, LedgerEntry } from '../types';
import { DEFAULT_CHART_OF_ACCOUNTS, exportLedgerToCSV } from '../services/ledgerEngine';
import { Language, i18n } from '../i18n';
import {
  Calculator,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Filter,
} from 'lucide-react';

interface AccountingPortalProps {
  ledgerEntries: LedgerEntry[];
  lang: Language;
}

export const AccountingPortal: React.FC<AccountingPortalProps> = ({
  ledgerEntries,
  lang,
}) => {
  const t = i18n[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('ALL');

  // Compute accounting metrics
  const totalDebits = ledgerEntries.reduce((sum, e) => sum + e.debitTzs, 0);
  const totalCredits = ledgerEntries.reduce((sum, e) => sum + e.creditTzs, 0);
  const isBalanced = totalDebits === totalCredits;

  // Revenue (4010 Platform Commission)
  const totalCommissionRevenue = ledgerEntries
    .filter((e) => e.accountCode === '4010')
    .reduce((sum, e) => sum + e.creditTzs, 0);

  // Gross Collections (1010 Debits)
  const totalGrossCollections = ledgerEntries
    .filter((e) => e.accountCode === '1010')
    .reduce((sum, e) => sum + e.debitTzs, 0);

  // Gateway Fees (5010 Debits)
  const totalGatewayExpenses = ledgerEntries
    .filter((e) => e.accountCode === '5010')
    .reduce((sum, e) => sum + e.debitTzs, 0);

  // Partner Payables (2010 + 2020 Credits)
  const totalPartnerPayables = ledgerEntries
    .filter((e) => e.accountCode === '2010' || e.accountCode === '2020')
    .reduce((sum, e) => sum + e.creditTzs, 0);

  const filteredEntries = ledgerEntries.filter((e) => {
    const matchesQuery =
      e.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.accountCode.includes(searchQuery) ||
      e.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAccount =
      selectedAccountFilter === 'ALL' || e.accountCode === selectedAccountFilter;

    return matchesQuery && matchesAccount;
  });

  const handleExportCSV = () => {
    const csvContent = exportLedgerToCSV(ledgerEntries);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `swiftdrop_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto px-4 py-4 md:py-8">
      {/* Header with Deep Navy #14213D */}
      <div className="bg-[#14213D] text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            {t.roles.accountant} Workspace · IFRS Compliance
          </span>
          <h2 className="text-xl font-extrabold text-white mt-1">{t.accounting.title}</h2>
          <p className="text-xs text-slate-300 mt-0.5">{t.accounting.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-5 py-2.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-white" />
          <span>{t.accounting.exportCsv}</span>
        </button>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {t.accounting.grossVolume}
          </span>
          <div className="text-2xl font-black text-[#14213D] font-mono tabular-nums mt-1">
            TZS {totalGrossCollections.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">100% of customer collections</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider block">
            {t.accounting.commissionEarned}
          </span>
          <div className="text-2xl font-black text-[#16A34A] font-mono tabular-nums mt-1">
            TZS {totalCommissionRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#16A34A] font-semibold mt-1">Real Platform Profit (10%)</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
            {t.accounting.partnerPayables}
          </span>
          <div className="text-2xl font-black text-[#2563EB] font-mono tabular-nums mt-1">
            TZS {totalPartnerPayables.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">90% net owed to carriers & drivers</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wider block">
            {t.accounting.gatewayFees}
          </span>
          <div className="text-2xl font-black text-[#DC2626] font-mono tabular-nums mt-1">
            TZS {totalGatewayExpenses.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">M-Pesa / AzamPay aggregator fees</div>
        </div>
      </div>

      {/* Zero-Sum Balance Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isBalanced
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isBalanced ? (
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0" />
          )}
          <div>
            <div className="font-extrabold text-sm">
              {isBalanced ? t.accounting.balanced : t.accounting.unbalanced}
            </div>
            <div className="text-xs opacity-80">
              Total Debits: TZS {totalDebits.toLocaleString()} | Total Credits: TZS {totalCredits.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="text-xs font-mono font-bold px-3 py-1 bg-white rounded-xl border border-slate-200 shadow-xs">
          Variance: TZS {(totalDebits - totalCredits).toLocaleString()}
        </div>
      </div>

      {/* Chart of Accounts Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-extrabold text-[#14213D] uppercase tracking-wide">
          Chart of Accounts (Mipango ya Hesabu)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEFAULT_CHART_OF_ACCOUNTS.map((acc) => (
            <div key={acc.code} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[#2563EB]">{acc.code}</span>
                <span className="uppercase text-[10px] font-bold text-slate-600 px-2 py-0.5 bg-slate-200 rounded">
                  {acc.type}
                </span>
              </div>
              <div className="font-bold text-[#14213D]">{acc.name}</div>
              <p className="text-[11px] text-slate-500 line-clamp-2">{acc.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ledger Table with Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search memo, code, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-600">Filter Account:</span>
            <select
              value={selectedAccountFilter}
              onChange={(e) => setSelectedAccountFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
            >
              <option value="ALL">All Accounts</option>
              <option value="1010">1010 - Gateway Clearing</option>
              <option value="4010">4010 - Platform Commission</option>
              <option value="2010">2010 - Carrier Payables</option>
              <option value="2020">2020 - Driver Payables</option>
              <option value="5010">5010 - Gateway Fee Expense</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 uppercase font-semibold">
                <th className="p-3">Ref ID</th>
                <th className="p-3">Tarehe / Timestamp</th>
                <th className="p-3">Akaunti</th>
                <th className="p-3 text-right">Debit (TZS)</th>
                <th className="p-3 text-right">Credit (TZS)</th>
                <th className="p-3">Memo / Audit Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredEntries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="p-3 text-[#2563EB] font-bold">{e.id}</td>
                  <td className="p-3 text-slate-500 font-sans">{e.timestamp.replace('T', ' ').slice(0, 19)}</td>
                  <td className="p-3 font-semibold text-slate-900 font-sans">
                    {e.accountCode} - {e.accountName}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 tabular-nums">
                    {e.debitTzs > 0 ? e.debitTzs.toLocaleString() : '-'}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 tabular-nums">
                    {e.creditTzs > 0 ? e.creditTzs.toLocaleString() : '-'}
                  </td>
                  <td className="p-3 text-slate-600 font-sans">{e.memo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
