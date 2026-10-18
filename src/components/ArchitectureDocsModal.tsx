import React, { useState } from 'react';
import { Database, Shield, CreditCard, Lock, Server, FileCode, CheckCircle2 } from 'lucide-react';
import { Language } from '../i18n';

interface ArchitectureDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  const [activeDocTab, setActiveDocTab] = useState<'architecture' | 'database' | 'accounting' | 'payments' | 'security'>('architecture');

  return (
    <div className="fixed inset-0 z-50 bg-[#14213D]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden font-sans flex flex-col max-h-[85vh]">
        {/* Header with Deep Navy #14213D */}
        <div className="p-5 bg-[#14213D] text-white flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-base font-extrabold">
                {lang === 'sw' ? 'Nyaraka za Mfumo na Usanifu wa Kufanya Kazi' : 'System Architecture & Production Deployment Blueprint'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              SwiftDrop Transport · Enterprise Logistics Specification for East Africa
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-6 text-xs font-bold text-slate-600 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveDocTab('architecture')}
            className={`py-3 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeDocTab === 'architecture' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Usanifu (Architecture)
          </button>
          <button
            type="button"
            onClick={() => setActiveDocTab('database')}
            className={`py-3 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeDocTab === 'database' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            PostgreSQL & RLS Schema
          </button>
          <button
            type="button"
            onClick={() => setActiveDocTab('accounting')}
            className={`py-3 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeDocTab === 'accounting' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            10% Commission & Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveDocTab('payments')}
            className={`py-3 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeDocTab === 'payments' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Tanzania Payment Gateways
          </button>
          <button
            type="button"
            onClick={() => setActiveDocTab('security')}
            className={`py-3 transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeDocTab === 'security' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent hover:text-slate-900'
            }`}
          >
            PDPA 2022 & Biometrics
          </button>
        </div>

        {/* Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {activeDocTab === 'architecture' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#14213D]">1. Tiered Zero-Trust Architecture</h4>
              <p>
                SwiftDrop Transport is built on a multi-tenant cloud architecture isolating platform governance (Super Admin), carrier operations (Transport Companies like Tahmeed, Shabiby, Kilima), freelance gig drivers (Bodaboda/Bajaji/Kirikuu), and retail customers.
              </p>
              <div className="p-4 bg-[#14213D] text-[#16A34A] font-mono rounded-xl text-[11px] overflow-x-auto space-y-1">
                <div>[Clients: PWA, Web Dashboards] (React 19 + TypeScript + Tailwind)</div>
                <div>               │ HTTPS / WSS Telemetry</div>
                <div>               ▼</div>
                <div>[API Gateway / Server-Side Functions] (Express / Node.js Engine)</div>
                <div>  ├── RBAC Engine & Input Sanitization (Zod)</div>
                <div>  ├── Tanzanian Payment Aggregator Webhooks (AzamPay, Selcom HMAC)</div>
                <div>  ├── Double-Entry Ledger Posting Invariant</div>
                <div>  └── Ephemeral GPS Telemetry Stream (Active Assignment Only)</div>
                <div>               │</div>
                <div>               ▼</div>
                <div>[PostgreSQL Database with Row-Level Security] (Isolated Multi-Tenant RLS)</div>
                <div>[Private Encrypted Object Storage Vault] (NIDA, BRELA, Driving Licences)</div>
              </div>
            </div>
          )}

          {activeDocTab === 'database' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#14213D]">2. Normalized PostgreSQL Tables & RLS Policies</h4>
              <p>
                All 30+ normalized tables implement strict Row-Level Security (RLS) ensuring companies cannot inspect competitor consignments, customers view only their authorized shipments, and telemetry is restricted to active assigned drivers.
              </p>
              <div className="p-3 bg-slate-100 rounded-xl font-mono text-[11px] space-y-1 text-slate-800">
                <div>• profiles (UUID primary key linked to auth identity)</div>
                <div>• user_roles (super_admin, company_admin, dispatcher, accountant, driver, customer)</div>
                <div>• companies & company_branches (Multi-tenancy isolation)</div>
                <div>• drivers & vehicles (LATRA registration cards and insurance expiry)</div>
                <div>• delivery_orders & shipment_events (Immutable financial and status milestones)</div>
                <div>• ledger_accounts & ledger_entries (Double-entry balance records)</div>
                <div>• driver_locations (Ephemeral telemetry active only on mission)</div>
                <div>• identity_verifications & consent_records (Encrypted zero-knowledge vault)</div>
              </div>
            </div>
          )}

          {activeDocTab === 'accounting' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#14213D]">
                3. Mandatory 10% Platform Commission & Double-Entry Math
              </h4>
              <p>
                Every eligible transaction generates atomic double-entry postings satisfying the zero-sum invariant: <code>Sum(Debits) === Sum(Credits)</code>.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs space-y-2">
                <div className="font-bold text-[#14213D] font-sans">
                  Mfano wa Muamala wa TZS 10,000 (Oda ya Bodaboda / Mzigo):
                </div>
                <div>1. DEBIT  Asset: 1010 (AzamPay/Selcom Clearing)        10,000 TZS</div>
                <div>2. CREDIT Revenue: 4010 (SwiftDrop Commission 10%)      1,000 TZS</div>
                <div>3. CREDIT Liability: 2010/2020 (Partner Payable Net)    9,000 TZS</div>
                <div>4. DEBIT  Expense: 5010 (Aggregator Network 2.0%)         200 TZS</div>
                <div>5. CREDIT Asset: 1010 (Clearing Fee Deduction)            200 TZS</div>
                <div className="border-t border-slate-300 pt-1 text-[#16A34A] font-bold">
                  Total Debits = 10,200 TZS | Total Credits = 10,200 TZS (Zero Variance)
                </div>
              </div>
            </div>
          )}

          {activeDocTab === 'payments' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#14213D]">4. Tanzanian Payment Gateway Integration Steps</h4>
              <p>
                To switch from Sandbox Mode to Live Tanzanian Production Payments:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-slate-600">
                <li>
                  <strong className="text-slate-800">AzamPay Tanzania:</strong> Register merchant credentials at <code>developer.azampay.co.tz</code>. Set Webhook target URL to <code>https://api.swiftdrop.co.tz/v1/payments/webhooks/azampay</code>. Supply <code>AZAMPAY_CLIENT_ID</code> and <code>AZAMPAY_SECRET</code>.
                </li>
                <li>
                  <strong className="text-slate-800">Selcom Wireless:</strong> Complete merchant KYC for C2B / B2C Push. Enable HMAC-SHA256 signature verification in edge middleware.
                </li>
                <li>
                  <strong className="text-slate-800">Vodacom M-Pesa Direct:</strong> Configure Daraja/M-Pesa API integration with B2C shortcode for instant automated driver wallet cashouts.
                </li>
              </ol>
            </div>
          )}

          {activeDocTab === 'security' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#14213D]">
                5. Tanzania Personal Data Protection Act (PDPA 2022) Compliance
              </h4>
              <p>
                SwiftDrop implements strict zero-knowledge document vaulting:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>
                  <strong>No Raw Biometrics:</strong> Fingerprints or facial vectors are never stored in public database tables. Liveness checks use zero-knowledge verification tokens.
                </li>
                <li>
                  <strong>Private Vault Storage:</strong> NIDA cards, Voter IDs, and BRELA certificates are stored in private encrypted object buckets accessed solely via 15-minute expiring presigned URLs.
                </li>
                <li>
                  <strong>Driver Telemetry Retention:</strong> Driver GPS coordinates are recorded only during active missions (picked_up to delivered). Location broadcasting stops automatically upon completion.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#14213D] hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Funga / Close
          </button>
        </div>
      </div>
    </div>
  );
};
