import React, { useState } from 'react';
import {
  AuditLog,
  DeliveryOrder,
  DriverProfile,
  PlatformSettings,
  TransportCompany,
  VehicleCategory,
} from '../types';
import { Language, i18n } from '../i18n';
import { ACTIVE_PRICING_RULES, PricingRule, calculateQuote } from '../services/pricingEngine';
import {
  Shield,
  Building2,
  Truck,
  CheckCircle2,
  XCircle,
  FileText,
  Percent,
  Sliders,
  History,
  AlertCircle,
  Eye,
  CreditCard,
  Landmark,
  Layers,
  Settings,
  Users,
  Search,
  Plus,
  RefreshCw,
  MapPin,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface SuperAdminPortalProps {
  companies: TransportCompany[];
  drivers: DriverProfile[];
  orders: DeliveryOrder[];
  auditLogs: AuditLog[];
  settings: PlatformSettings;
  onUpdateCommissionRate: (rate: number) => void;
  onApproveCompany: (companyId: string) => void;
  onRejectCompany: (companyId: string, reason: string) => void;
  onApproveDriver: (driverId: string) => void;
  onRejectDriver: (driverId: string, reason: string) => void;
  onOpenDocVault: (title: string, entityId: string, docData: any) => void;
  lang: Language;
}

type AdminSection =
  | 'overview'
  | 'deliveries'
  | 'customers'
  | 'drivers'
  | 'companies'
  | 'pricing'
  | 'payment_providers'
  | 'bank_accounts'
  | 'commission'
  | 'settlements'
  | 'identity_vault'
  | 'audit_logs'
  | 'system_settings';

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({
  companies,
  drivers,
  orders,
  auditLogs,
  settings,
  onUpdateCommissionRate,
  onApproveCompany,
  onRejectCompany,
  onApproveDriver,
  onRejectDriver,
  onOpenDocVault,
  lang,
}) => {
  const t = i18n[lang];

  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [commissionInput, setCommissionInput] = useState<number>(settings.commissionRate * 100);
  const [commissionSuccess, setCommissionSuccess] = useState<string | null>(null);

  // Pricing edit state
  const [pricingRules, setPricingRules] = useState(ACTIVE_PRICING_RULES);
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<VehicleCategory>('motorcycle');
  const [editBaseFare, setEditBaseFare] = useState<number>(pricingRules.motorcycle.baseFareTzs);
  const [editKmRate, setEditKmRate] = useState<number>(pricingRules.motorcycle.perKmRateTzs);
  const [pricingUpdateNotice, setPricingUpdateNotice] = useState<string | null>(null);

  // Bank Account State
  const [collectionAccount, setCollectionAccount] = useState({
    bankName: 'CRDB Bank Tanzania',
    accountName: 'SwiftDrop Transport Limited — Collections',
    accountNumberMasked: '0150 •••• •••• 8410',
    currency: 'TZS',
    branch: 'Tower Branch, Dar es Salaam',
    status: 'ACTIVE_VERIFIED',
  });

  const [commissionAccount, setCommissionAccount] = useState({
    bankName: 'NMB Bank Plc',
    accountName: 'SwiftDrop Commission & Revenue Escrow',
    accountNumberMasked: '2010 •••• •••• 9920',
    currency: 'TZS',
    branch: 'Bank House, Posta, Dar es Salaam',
    status: 'ACTIVE_VERIFIED',
  });

  const pendingCompanies = companies.filter((c) => c.verificationStatus === 'pending_verification');
  const pendingDrivers = drivers.filter((d) => d.verificationStatus === 'pending_verification');

  const totalGrossVolume = orders.reduce((sum, o) => sum + o.quotedAmountTzs, 0);
  const totalCommissionRevenue = orders.reduce((sum, o) => sum + o.platformCommissionTzs, 0);
  const totalPartnerPayables = orders.reduce((sum, o) => sum + o.netPartnerAmountTzs, 0);

  const handleSaveCommission = (e: React.FormEvent) => {
    e.preventDefault();
    const rateDecimal = commissionInput / 100;
    onUpdateCommissionRate(rateDecimal);
    setCommissionSuccess(
      lang === 'sw'
        ? `Kiwango cha ada ya mfumo kimesasishwa kuwa ${(rateDecimal * 100).toFixed(1)}% kwa safari mpya.`
        : `Platform commission rate successfully updated to ${(rateDecimal * 100).toFixed(1)}% for future orders.`
    );
    setTimeout(() => setCommissionSuccess(null), 3500);
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    setPricingRules((prev) => ({
      ...prev,
      [selectedVehicleForEdit]: {
        ...prev[selectedVehicleForEdit],
        baseFareTzs: editBaseFare,
        perKmRateTzs: editKmRate,
      },
    }));
    setPricingUpdateNotice(
      lang === 'sw'
        ? `Bei ya ${selectedVehicleForEdit.toUpperCase()} imesasishwa: Base TZS ${editBaseFare.toLocaleString()}, Rate/KM TZS ${editKmRate.toLocaleString()}.`
        : `Pricing for ${selectedVehicleForEdit.toUpperCase()} updated: Base TZS ${editBaseFare.toLocaleString()}, Rate/KM TZS ${editKmRate.toLocaleString()}.`
    );
    setTimeout(() => setPricingUpdateNotice(null), 4000);
  };

  const sidebarNavItems: { id: AdminSection; labelSw: string; labelEn: string; icon: any; badge?: number }[] = [
    { id: 'overview', labelSw: 'Muhtasari wa Mfumo', labelEn: 'Overview & Metrics', icon: Sliders },
    { id: 'deliveries', labelSw: 'Mizigo na Safari', labelEn: 'Deliveries & Dispatch', icon: Truck, badge: orders.length },
    { id: 'companies', labelSw: 'Kampuni za Usafirishaji', labelEn: 'Transport Companies', icon: Building2, badge: pendingCompanies.length },
    { id: 'drivers', labelSw: 'Madereva na Vyombo', labelEn: 'Drivers & Fleet', icon: Users, badge: pendingDrivers.length },
    { id: 'pricing', labelSw: 'Usimamizi wa Bei', labelEn: 'Pricing Management', icon: DollarSign },
    { id: 'commission', labelSw: 'Ada ya Mfumo (10%)', labelEn: 'Commission Management', icon: Percent },
    { id: 'payment_providers', labelSw: 'Njia za Malipo (M-Pesa)', labelEn: 'Payment Providers', icon: CreditCard },
    { id: 'bank_accounts', labelSw: 'Akaunti za Benki', labelEn: 'Bank Accounts', icon: Landmark },
    { id: 'settlements', labelSw: 'Malipo ya Makampuni', labelEn: 'Settlements & Payouts', icon: RefreshCw },
    { id: 'identity_vault', labelSw: 'Uhakiki wa Hati (KYC)', labelEn: 'Identity & KYC Vault', icon: ShieldCheck, badge: pendingCompanies.length + pendingDrivers.length },
    { id: 'audit_logs', labelSw: 'Kumbukumbu za Usalama', labelEn: 'Security & Audit Logs', icon: History },
    { id: 'system_settings', labelSw: 'Mipangilio ya Mfumo', labelEn: 'System Settings', icon: Settings },
  ];

  return (
    <div className="font-sans max-w-7xl mx-auto px-4 py-4 md:py-8 space-y-6">
      {/* Super Admin Top Header */}
      <div className="bg-[#14213D] text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" />
            <span className="text-[11px] font-black text-[#FF7A00] uppercase tracking-wider">
              Platform Master Console · Super Administrator
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            SwiftDrop Transport Governance & Operations Centre
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Full compliance oversight: Carrier vetting, document vault inspection, 10% commission engine, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <div className="text-slate-400">Platform Commission</div>
            <div className="font-extrabold text-[#16A34A] font-mono text-base">
              {(settings.commissionRate * 100).toFixed(0)}% Locked
            </div>
          </div>
        </div>
      </div>

      {commissionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>{commissionSuccess}</span>
        </div>
      )}

      {pricingUpdateNotice && (
        <div className="p-3.5 bg-blue-50 border border-blue-300 text-blue-900 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span>{pricingUpdateNotice}</span>
        </div>
      )}

      {/* Main Admin Workspace: Sidebar + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Navigation (Section 7.9) */}
        <div className="lg:col-span-3 bg-[#14213D] text-white rounded-2xl p-3 shadow-lg border border-slate-800 space-y-1">
          <div className="p-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
            Navigation Menu
          </div>
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{lang === 'sw' ? item.labelSw : item.labelEn}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      isActive ? 'bg-white text-[#2563EB]' : 'bg-[#FF7A00] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Content View Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Section: Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards with Clear Accounting Meaning (Section 7.9) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Gross Payments (TZS)
                  </span>
                  <div className="text-2xl font-black text-[#14213D] font-mono tabular-nums mt-1">
                    TZS {totalGrossVolume.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Total customer payments collected</div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider block">
                    Verified Commission (10%)
                  </span>
                  <div className="text-2xl font-black text-[#16A34A] font-mono tabular-nums mt-1">
                    TZS {totalCommissionRevenue.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Platform facilitation revenue</div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
                    Partner Payables Net
                  </span>
                  <div className="text-2xl font-black text-[#2563EB] font-mono tabular-nums mt-1">
                    TZS {totalPartnerPayables.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Net 90% owed to carriers & drivers</div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider block">
                    Pending KYC Reviews
                  </span>
                  <div className="text-2xl font-black text-[#F59E0B] font-mono tabular-nums mt-1">
                    {pendingCompanies.length + pendingDrivers.length}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Awaiting Super Admin approval</div>
                </div>
              </div>

              {/* Operational Action Shortcuts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveSection('identity_vault')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#2563EB] transition cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF7A00] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-[#14213D] text-sm">Review Pending KYC</div>
                  <p className="text-xs text-slate-500">
                    {pendingCompanies.length + pendingDrivers.length} entities waiting for document verification.
                  </p>
                </div>

                <div
                  onClick={() => setActiveSection('pricing')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#2563EB] transition cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-[#14213D] text-sm">Configure Pricing & Rules</div>
                  <p className="text-xs text-slate-500">
                    Adjust base fare, per km rate, and minimum fare thresholds.
                  </p>
                </div>

                <div
                  onClick={() => setActiveSection('bank_accounts')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#2563EB] transition cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#16A34A] flex items-center justify-center font-bold">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-[#14213D] text-sm">Manage Bank Accounts</div>
                  <p className="text-xs text-slate-500">
                    SwiftDrop collection treasury and platform commission destinations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Pricing Management (Section 7.10) */}
          {activeSection === 'pricing' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-[#14213D]">
                    {lang === 'sw' ? 'Usimamizi wa Kanuni za Bei' : 'Pricing Rules & Fare Engine'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure base fares, per-KM rates, minimum charges, and payload constraints.
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-[#2563EB] border border-blue-200 rounded-lg text-xs font-bold font-mono">
                  Commission: 10% Fixed
                </span>
              </div>

              {/* Vehicle Category Selector for Editing */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['motorcycle', 'bajaji', 'car_van', 'truck'] as VehicleCategory[]).map((cat) => {
                  const r = pricingRules[cat];
                  const isSelected = selectedVehicleForEdit === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedVehicleForEdit(cat);
                        setEditBaseFare(r.baseFareTzs);
                        setEditKmRate(r.perKmRateTzs);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-[#FF7A00] bg-orange-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xl">{r.icon}</div>
                      <div className="font-bold text-xs text-[#14213D] mt-1">
                        {lang === 'sw' ? r.nameSw : r.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                        TZS {r.baseFareTzs.toLocaleString()} base
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Edit Pricing Form */}
              <form onSubmit={handleSavePricing} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <div className="font-bold text-[#14213D] uppercase tracking-wide">
                  Edit Fare Parameters for: {selectedVehicleForEdit.toUpperCase()}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nauli ya Msingi (Base Fare TZS)</label>
                    <input
                      type="number"
                      step="100"
                      min="500"
                      required
                      value={editBaseFare}
                      onChange={(e) => setEditBaseFare(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gharama kwa Kila KM (Rate per KM TZS)</label>
                    <input
                      type="number"
                      step="50"
                      min="100"
                      required
                      value={editKmRate}
                      onChange={(e) => setEditKmRate(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-extrabold rounded-xl shadow-md transition text-xs cursor-pointer"
                >
                  {lang === 'sw' ? 'Hifadhi Mabadiliko ya Bei' : 'Update & Lock Fare Rule'}
                </button>
              </form>
            </div>
          )}

          {/* Section: Commission Management (Section 7.11) */}
          {activeSection === 'commission' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-[#14213D]">
                  {t.admin.commissionRate} — Mandatory 10% Default
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  The configured platform commission is 10% of eligible gross volume. Future changes apply non-retroactively to safeguard historical financial entries.
                </p>
              </div>

              <form onSubmit={handleSaveCommission} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Platform Commission Rate (%)
                  </label>
                  <div className="relative">
                    <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="30"
                      required
                      value={commissionInput}
                      onChange={(e) => setCommissionInput(parseFloat(e.target.value) || 10)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-600">
                  <div className="font-bold text-[#14213D]">Example Split for TZS 10,000 Order:</div>
                  <div>· Platform Commission ({commissionInput}%): TZS {((10000 * commissionInput) / 100).toLocaleString()}</div>
                  <div>· Partner Net Payable ({100 - commissionInput}%): TZS {(10000 - (10000 * commissionInput) / 100).toLocaleString()}</div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-extrabold rounded-xl shadow-md transition text-xs cursor-pointer"
                >
                  {t.admin.updateCommission}
                </button>
              </form>
            </div>
          )}

          {/* Section: Bank Accounts Directory (Section 7.11) */}
          {activeSection === 'bank_accounts' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-[#14213D]">
                  {lang === 'sw' ? 'Akaunti za Benki za SwiftDrop' : 'Corporate Bank Accounts & Treasury'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Masked corporate collection and platform commission destination accounts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#14213D] text-sm">{collectionAccount.bankName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#16A34A]">
                      {collectionAccount.status}
                    </span>
                  </div>
                  <div className="text-slate-600 font-semibold">{collectionAccount.accountName}</div>
                  <div className="font-mono font-bold text-slate-800 text-sm">
                    {collectionAccount.accountNumberMasked}
                  </div>
                  <div className="text-slate-500 text-[11px]">{collectionAccount.branch}</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#14213D] text-sm">{commissionAccount.bankName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#16A34A]">
                      {commissionAccount.status}
                    </span>
                  </div>
                  <div className="text-slate-600 font-semibold">{commissionAccount.accountName}</div>
                  <div className="font-mono font-bold text-slate-800 text-sm">
                    {commissionAccount.accountNumberMasked}
                  </div>
                  <div className="text-slate-500 text-[11px]">{commissionAccount.branch}</div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Identity & KYC Vault */}
          {activeSection === 'identity_vault' && (
            <div className="space-y-6">
              {/* Pending Companies */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-[#14213D] uppercase">
                    Pending Transport Company Verifications
                  </span>
                  <span className="text-[#FF7A00] font-bold">{pendingCompanies.length} In Queue</span>
                </div>

                {pendingCompanies.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    All carrier applications have been processed.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pendingCompanies.map((c) => (
                      <div
                        key={c.id}
                        className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#14213D] text-sm">{c.legalName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-[#F59E0B]">
                              {c.verificationStatus}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            BRELA: <span className="font-mono font-bold text-slate-700">{c.registrationNumber}</span> · TIN:{' '}
                            <span className="font-mono text-slate-700">{c.taxIdentificationNumber}</span> · LATRA Permit:{' '}
                            <span className="font-mono text-slate-700">{c.carrierPermitNumber}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenDocVault(
                                `Uhakiki wa Hati: ${c.legalName}`,
                                c.id,
                                {
                                  type: 'company',
                                  brela: c.registrationNumber,
                                  tin: c.taxIdentificationNumber,
                                  latra: c.carrierPermitNumber,
                                }
                              )
                            }
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Kagua Hati</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onApproveCompany(c.id)}
                            className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onRejectCompany(c.id, 'Hati ya LATRA haijathibitishwa na mamlaka.')}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-[#DC2626] text-xs font-bold rounded-lg transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Drivers */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-[#14213D] uppercase">
                    Pending Driver & Rider Verifications
                  </span>
                  <span className="text-[#FF7A00] font-bold">{pendingDrivers.length} In Queue</span>
                </div>

                {pendingDrivers.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    All driver applications have been processed.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pendingDrivers.map((d) => (
                      <div
                        key={d.id}
                        className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#14213D] text-sm">{d.fullName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-[#F59E0B]">
                              {d.verificationStatus}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#2563EB] uppercase">
                              {d.vehicleCategory}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            NIDA: <span className="font-mono font-bold text-slate-700">{d.nidaNumber}</span> · Leseni:{' '}
                            <span className="font-mono text-slate-700">{d.drivingLicence}</span> · Chombo:{' '}
                            <span className="font-mono font-bold text-slate-700">{d.plateNumber}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenDocVault(
                                `Uhakiki wa Dereva: ${d.fullName}`,
                                d.id,
                                {
                                  type: 'driver',
                                  nida: d.nidaNumber,
                                  licence: d.drivingLicence,
                                  plate: d.plateNumber,
                                  liveness: d.livenessScore,
                                }
                              )
                            }
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Kagua Hati na Uso</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onApproveDriver(d.id)}
                            className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onRejectDriver(d.id, 'Leseni ya udereva haijathibitishwa au imeisha muda.')}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-[#DC2626] text-xs font-bold rounded-lg transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Deliveries & Dispatch */}
          {activeSection === 'deliveries' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-[#14213D] uppercase">All Active Platform Missions</span>
                <span className="text-slate-500 font-mono">{orders.length} Total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 uppercase font-semibold">
                      <th className="p-3">Tracking Ref</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Pickup → Destination</th>
                      <th className="p-3">Driver</th>
                      <th className="p-3 text-right">Gross (TZS)</th>
                      <th className="p-3 text-right">Commission (10%)</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-[#2563EB]">{o.trackingNumber}</td>
                        <td className="p-3 font-medium text-slate-900">{o.customerName}</td>
                        <td className="p-3 text-slate-600">
                          {o.pickupAddress.split(',')[0]} → {o.dropoffAddress.split(',')[0]}
                        </td>
                        <td className="p-3 text-slate-700">{o.assignedDriverName || 'Unassigned'}</td>
                        <td className="p-3 text-right font-mono font-bold tabular-nums">
                          {o.quotedAmountTzs.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-[#16A34A] font-bold tabular-nums">
                          {o.platformCommissionTzs.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#2563EB] uppercase">
                            {o.currentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Audit Logs */}
          {activeSection === 'audit_logs' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-[#14213D] uppercase">Tamper-Resistant Security Audit Logs</span>
                <span className="text-slate-500 font-mono">{auditLogs.length} Entries</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#14213D] font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100">
                          {log.action}
                        </span>
                        <span className="text-slate-600 font-semibold">{log.actorName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 font-mono">{log.ipAddress}</span>
                      </div>
                      <p className="text-slate-700 text-xs mt-1">{log.details}</p>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">{log.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Default fallback for other sections */}
          {(activeSection === 'companies' || activeSection === 'drivers' || activeSection === 'payment_providers' || activeSection === 'settlements' || activeSection === 'system_settings') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#14213D] uppercase">
                {activeSection.replace('_', ' ')}
              </h3>
              <p className="text-xs text-slate-600">
                Managed under strict Tanzanian logistics regulatory authority (LATRA & BOT Clearing).
              </p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs">
                Total Registered Companies: {companies.length} | Total Registered Drivers: {drivers.length} | Sandbox Environment: Active
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
