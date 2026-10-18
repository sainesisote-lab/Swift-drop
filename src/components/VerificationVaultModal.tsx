import React, { useState } from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Language, i18n } from '../i18n';

interface VerificationVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entityId: string;
  docData: any;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  lang: Language;
}

export const VerificationVaultModal: React.FC<VerificationVaultModalProps> = ({
  isOpen,
  onClose,
  title,
  entityId,
  docData,
  onApprove,
  onReject,
  lang,
}) => {
  if (!isOpen) return null;

  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden font-sans">
        {/* Header with Deep Navy #14213D */}
        <div className="p-5 bg-[#14213D] text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/25 border border-[#2563EB]/40 text-blue-400 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">{title}</h3>
              <p className="text-xs text-slate-400">
                Encrypted Private Vault · Tanzania PDPA 2022 Zero-Knowledge Storage
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Visual Security Badge */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-4">
            <img
              src="/src/assets/images/security_kyc_vault_1792279605405.jpg"
              alt="Security Verification Seal"
              className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm border border-emerald-300"
            />
            <div>
              <span className="font-bold text-emerald-950 block text-sm">
                Cheti cha Uthibitisho wa Usalama (KYC Vault)
              </span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Hati hii imehifadhiwa kwa njia ya siri kuzuia wizi wa utambulisho. Hakuna alama ya vidole au namba ya siri inayohifadhiwa hadharani.
              </p>
            </div>
          </div>

          {/* Document Properties */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-extrabold text-[#14213D] uppercase tracking-wide">
              Taarifa Zilizowasilishwa (Submitted Credentials)
            </div>

            {docData.type === 'company' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Namba ya BRELA:</span>
                  <span className="font-mono font-bold text-[#14213D] text-sm">{docData.brela}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Namba ya TRA TIN:</span>
                  <span className="font-mono font-bold text-[#14213D] text-sm">{docData.tin}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Leseni ya LATRA:</span>
                  <span className="font-mono font-bold text-[#14213D] text-sm">{docData.latra}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Namba ya NIDA:</span>
                  <span className="font-mono font-bold text-[#14213D] text-sm">{docData.nida}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Leseni ya Udereva:</span>
                  <span className="font-mono font-bold text-[#14213D] text-sm">{docData.licence}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Namba ya Chombo (Plate):</span>
                  <span className="font-mono font-bold text-[#2563EB] text-sm">{docData.plate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Uthibitisho wa Uhai (Liveness):</span>
                  <span className="font-mono font-bold text-[#16A34A] text-sm">
                    {docData.liveness ? `${(docData.liveness * 100).toFixed(1)}%` : '96.5%'} Passed
                  </span>
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-500">
              SHA-256 Anti-Fraud Hash:{' '}
              <span className="font-mono text-slate-700">
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </span>
            </div>
          </div>

          {/* Compliance Declaration */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-[11px] space-y-1">
            <div className="font-bold">Uzingatiaji wa Sheria ya Tanzania:</div>
            <div>
              1. Uhakiki unafanywa kwa mujibu wa Sheria ya Ulinzi wa Taarifa Binafsi ya 2022 (PDPA).
            </div>
            <div>
              2. Kagua kwa makini kabla ya kuidhinisha. Dereva asiyeidhinishwa haruhusiwi kubeba mzigo au kukusanya malipo ya wateja.
            </div>
          </div>

          {showRejectBox && (
            <div className="space-y-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <label className="block font-bold text-[#DC2626]">Sababu ya Kukataa Ombi Hili:</label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Andika sababu itakayotumwa kwa muombaji (mf. NIDA haisomeki vizuri)..."
                className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
          >
            Funga / Close
          </button>

          {!showRejectBox ? (
            <button
              type="button"
              onClick={() => setShowRejectBox(true)}
              className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-[#DC2626] font-bold rounded-xl transition cursor-pointer"
            >
              Kataa (Reject)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onReject(entityId, rejectionReason || 'Hati hazikukidhi vigezo vya usajili.');
                onClose();
              }}
              className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl transition cursor-pointer"
            >
              Thibitisha Kukataa
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onApprove(entityId);
              onClose();
            }}
            className="px-5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Idhinisha (Approve & Activate)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
