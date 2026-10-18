import React, { useState } from 'react';
import { DeliveryOrder, DriverProfile, TransportCompany } from '../types';
import { Language, i18n } from '../i18n';
import {
  Building2,
  Truck,
  Users,
  ShieldCheck,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Landmark,
  ArrowRight,
} from 'lucide-react';

interface CompanyPortalProps {
  company: TransportCompany;
  drivers: DriverProfile[];
  orders: DeliveryOrder[];
  lang: Language;
}

export const CompanyPortal: React.FC<CompanyPortalProps> = ({
  company,
  drivers,
  orders,
  lang,
}) => {
  const t = i18n[lang];

  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'branches' | 'settlements'>('overview');
  const [settlementSuccess, setSettlementSuccess] = useState<string | null>(null);

  // Tenant-isolated drivers and orders
  const companyDrivers = drivers.filter((d) => d.companyId === company.id);
  const companyOrders = orders.filter((o) => o.companyId === company.id);

  const totalGrossCargoTzs = companyOrders.reduce((sum, o) => sum + o.quotedAmountTzs, 0);
  const totalCommissionTzs = companyOrders.reduce((sum, o) => sum + o.platformCommissionTzs, 0);
  const totalNetEarnedTzs = totalGrossCargoTzs - totalCommissionTzs;

  const handleRequestCompanySettlement = () => {
    setSettlementSuccess(
      lang === 'sw'
        ? `Ombi la kuhamisha TZS ${company.payableBalanceTzs.toLocaleString()} kwenda Akaunti ya Kampuni CRDB-0150992384100 limewasilishwa kwa benki.`
        : `Disbursement request for TZS ${company.payableBalanceTzs.toLocaleString()} submitted to corporate treasury account CRDB-0150992384100.`
    );
    setTimeout(() => setSettlementSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto px-4 py-4 md:py-8">
      {/* Company Header with Official Deep Navy Styling */}
      <div className="bg-[#14213D] text-white p-6 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white text-3xl font-extrabold shadow-md">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{company.legalName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A]/25 text-[#16A34A] border border-[#16A34A]/40 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>LATRA & BRELA Verified</span>
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Trading: <span className="font-bold text-white">{company.tradingName}</span> · BRELA:{' '}
                <span className="font-mono font-bold text-amber-400">{company.registrationNumber}</span> · LATRA Permit:{' '}
                <span className="font-mono font-bold text-blue-300">{company.carrierPermitNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRequestCompanySettlement}
              className="px-5 py-2.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
            >
              {lang === 'sw' ? 'Omba Uhamisho wa Benki (Payout)' : 'Request Bank Settlement'}
            </button>
          </div>
        </div>
      </div>

      {settlementSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>{settlementSuccess}</span>
        </div>
      )}

      {/* KPI Financial Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {lang === 'sw' ? 'Magari Yaliyosajiliwa' : 'Registered Fleet'}
          </span>
          <div className="text-2xl font-extrabold text-[#14213D] font-mono tabular-nums mt-1">
            {company.totalFleetCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Heavy Freight Trucks & Haulers</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {lang === 'sw' ? 'Safari Zilizokamilika' : 'Completed Trips'}
          </span>
          <div className="text-2xl font-extrabold text-[#2563EB] font-mono tabular-nums mt-1">
            {company.totalTripsCompleted.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Rating: ★ {company.rating} / 5.0</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {lang === 'sw' ? 'Mapato Halisi (Net Payable)' : 'Net Carrier Balance'}
          </span>
          <div className="text-2xl font-extrabold text-[#16A34A] font-mono tabular-nums mt-1">
            TZS {company.payableBalanceTzs.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">90% net after 10% platform cut</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {lang === 'sw' ? 'Ada ya Mfumo Iliyolipwa (10%)' : 'Platform Cut (10%)'}
          </span>
          <div className="text-2xl font-extrabold text-[#14213D] font-mono tabular-nums mt-1">
            TZS {totalCommissionTzs.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">SwiftDrop mandatory commission</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition ${
            activeTab === 'overview' ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold' : 'hover:text-slate-900'
          }`}
        >
          {lang === 'sw' ? 'Mizigo na Waybills' : 'Active Cargo Waybills'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fleet')}
          className={`pb-3 transition ${
            activeTab === 'fleet' ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold' : 'hover:text-slate-900'
          }`}
        >
          {lang === 'sw' ? 'Magari na Madereva' : 'Fleet & Drivers'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('branches')}
          className={`pb-3 transition ${
            activeTab === 'branches' ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold' : 'hover:text-slate-900'
          }`}
        >
          {lang === 'sw' ? 'Matawi ya Mikoani' : 'Regional Branch Depots'}
        </button>
      </div>

      {/* Tab 1: Orders and Waybills */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-[#14213D] uppercase">
              {lang === 'sw' ? 'Orodha ya Waybills za Kampuni' : 'Company Consignment Waybills'}
            </span>
            <span className="text-slate-500 font-mono">Tenant Data Isolated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 uppercase font-semibold">
                  <th className="p-3">Waybill #</th>
                  <th className="p-3">Kutoka → Kwenda</th>
                  <th className="p-3">Maelezo ya Mzigo</th>
                  <th className="p-3">Dereva</th>
                  <th className="p-3 text-right">Jumla (TZS)</th>
                  <th className="p-3 text-right">Ada ya Mfumo (10%)</th>
                  <th className="p-3 text-right">Mapato ya Kampuni</th>
                  <th className="p-3">Hali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companyOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-[#2563EB]">{ord.trackingNumber}</td>
                    <td className="p-3 font-medium text-slate-800">
                      {ord.pickupAddress.split(',')[0]} → {ord.dropoffAddress.split(',')[0]}
                    </td>
                    <td className="p-3 text-slate-600">
                      {ord.packageDescription} ({ord.weightKg}kg)
                    </td>
                    <td className="p-3 text-slate-700">{ord.assignedDriverName || 'Not Assigned'}</td>
                    <td className="p-3 text-right font-mono font-bold tabular-nums">
                      {ord.quotedAmountTzs.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-[#16A34A] font-bold tabular-nums">
                      {ord.platformCommissionTzs.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-[#14213D] font-bold tabular-nums">
                      {ord.netPartnerAmountTzs.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#2563EB] uppercase">
                        {ord.currentStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Fleet & Drivers */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companyDrivers.map((d) => (
            <div key={d.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-bold text-[#14213D] text-sm">{d.fullName}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Plate: <span className="font-mono font-bold text-slate-800">{d.plateNumber}</span> · Lic:{' '}
                  <span className="font-mono text-slate-700">{d.drivingLicence}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Phone: {d.phone}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-[#16A34A]">
                Active Verified
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Regional Branches */}
      {activeTab === 'branches' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {company.branches.map((branch) => (
            <div key={branch} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#2563EB] mt-0.5" />
              <div>
                <div className="font-bold text-[#14213D] text-sm">{branch} Hub & Terminal</div>
                <div className="text-xs text-slate-500 mt-0.5">Consolidation & Cargo Warehouse</div>
                <div className="text-[11px] text-[#16A34A] font-semibold mt-1">Operational 24/7</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
