import React from 'react';
import { UserRole } from '../types';
import { Language, i18n } from '../i18n';
import { Shield, Building2, Truck, UserCheck, Calculator, User } from 'lucide-react';

interface PersonaSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  lang: Language;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  isOpen,
  onClose,
  activeRole,
  onSelectRole,
  lang,
}) => {
  if (!isOpen) return null;

  const t = i18n[lang];

  const personas: {
    role: UserRole;
    name: string;
    org: string;
    descSw: string;
    descEn: string;
    icon: any;
    color: string;
  }[] = [
    {
      role: 'customer',
      name: 'Amina Hamisi',
      org: 'Retail Sender (Dar es Salaam)',
      descSw: 'Kuagiza usafirishaji mjini na mikoani, kufuatilia chombo kwa GPS, na kulipa kwa M-Pesa.',
      descEn: 'Book on-demand deliveries, track live driver coordinates, and pay via M-Pesa / TigoPesa.',
      icon: User,
      color: 'bg-blue-50 text-[#2563EB] border-blue-200',
    },
    {
      role: 'driver',
      name: 'Juma Bakari',
      org: 'Independent Bodaboda Partner (Dar es Salaam)',
      descSw: 'Kupokea safari za mizigo, kusambaza kwa GPS moja kwa moja, kuweka hali mtandaoni, na kuona mapato.',
      descEn: 'Accept parcel jobs, transmit real-time telemetry, update milestones, and view wallet earnings.',
      icon: Truck,
      color: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    },
    {
      role: 'company_admin',
      name: 'Zuberi Tahmeed',
      org: 'Tahmeed Coach & Cargo Logistics Ltd',
      descSw: 'Kusimamia matawi (Dar, Arusha, Dodoma, Mombasa), magari 48, madereva, na kuona malipo ya kampuni.',
      descEn: 'Manage 48-vehicle fleet, intercity waybills, branches, drivers, and gross partner settlements.',
      icon: Building2,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      role: 'dispatcher',
      name: 'Farida Mwanga',
      org: 'Central Dispatch Hub (Ubungo)',
      descSw: 'Kupanga safari za mizigo, kugawa oda kwa madereva waliopo karibu, na kufuatilia ucheleweshaji.',
      descEn: 'Assign pending shipments to verified drivers and resolve operational dispatch exceptions.',
      icon: UserCheck,
      color: 'bg-purple-50 text-[#7C3AED] border-purple-200',
    },
    {
      role: 'accountant',
      name: 'Godfrey Mremi',
      org: 'Platform Financial & Audit Controller',
      descSw: 'Kagua kitabu kikuu (Double-Entry Ledger), ada ya mfumo (10%), madeni ya makampuni na ripoti ya CSV.',
      descEn: 'Audit double-entry ledger, reconcile 10% platform commission, verify settlements, and export CSV.',
      icon: Calculator,
      color: 'bg-amber-50 text-[#F59E0B] border-amber-200',
    },
    {
      role: 'super_admin',
      name: 'Platform Root Administrator',
      org: 'SwiftDrop Executive Operations',
      descSw: 'Kuidhinisha kampuni mpya, madereva, ukaguzi wa NIDA/LATRA, kurekebisha ada (10%), na ukaguzi wa mfumo.',
      descEn: 'Approve pending carriers & drivers, review KYC vault, adjust platform commission, audit security logs.',
      icon: Shield,
      color: 'bg-orange-50 text-[#FF7A00] border-orange-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden font-sans">
        <div className="p-6 bg-[#14213D] text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Badili Jukumu / Switch User Persona</h3>
            <p className="text-xs text-slate-300 mt-1">
              Jaribu kila jukumu katika mfumo wa SwiftDrop Transport (Demo Environment)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 focus:outline-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-3">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = activeRole === p.role;
            return (
              <div
                key={p.role}
                onClick={() => {
                  onSelectRole(p.role);
                  onClose();
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  isSelected
                    ? 'border-[#2563EB] bg-blue-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2.5 rounded-xl border shrink-0 ${p.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[#14213D] text-sm">{p.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {p.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">{p.org}</div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {lang === 'sw' ? p.descSw : p.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#14213D] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Funga / Close
          </button>
        </div>
      </div>
    </div>
  );
};
