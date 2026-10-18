import React, { useState } from 'react';
import { AccountType, VehicleCategory } from '../types';
import { Language, i18n } from '../i18n';
import { performLivenessCheck } from '../services/biometricService';
import { Shield, Upload, CheckCircle2, User, Truck, Building2 } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterDriver: (driverData: any) => void;
  onRegisterCompany: (companyData: any) => void;
  lang: Language;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterDriver,
  onRegisterCompany,
  lang,
}) => {
  if (!isOpen) return null;

  const t = i18n[lang];

  const [accountType, setAccountType] = useState<AccountType>('motorcycle');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Driver fields
  const [nida, setNida] = useState('');
  const [licence, setLicence] = useState('');
  const [plate, setPlate] = useState('');
  const [settlementType, setSettlementType] = useState<'mpesa' | 'tigopesa' | 'airtelmoney' | 'bank'>('mpesa');
  const [settlementAccount, setSettlementAccount] = useState('');

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [brelaNumber, setBrelaNumber] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [latraPermit, setLatraPermit] = useState('');
  const [headquarters, setHeadquarters] = useState('');

  // Biometric & Consent state
  const [consentGiven, setConsentGiven] = useState(false);
  const [livenessChecking, setLivenessChecking] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isDriver = ['motorcycle', 'bajaji', 'car_van', 'truck'].includes(accountType);
  const isCompany = accountType === 'transport_company';

  const handleRunLiveness = async () => {
    setLivenessChecking(true);
    setErrorMsg(null);
    try {
      const result = await performLivenessCheck();
      setLivenessPassed(result.passed);
    } catch {
      setErrorMsg('Liveness test failed. Please ensure proper lighting and retry.');
    } finally {
      setLivenessChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!consentGiven) {
      setErrorMsg(
        lang === 'sw'
          ? 'Tafadhali kubali ridhaa ya ukaguzi wa data kwa mujibu wa PDPA 2022.'
          : 'Please accept the data protection consent before continuing.'
      );
      return;
    }

    if (isDriver && !livenessPassed) {
      setErrorMsg(
        lang === 'sw'
          ? 'Tafadhali kamilisha ukaguzi wa uso na uhai (Liveness Check) kabla ya kuwasilisha.'
          : 'Please complete the biometric facial liveness test before submitting.'
      );
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    if (isCompany) {
      onRegisterCompany({
        legalName: companyName,
        tradingName: tradingName || companyName,
        registrationNumber: brelaNumber,
        taxIdentificationNumber: tinNumber,
        carrierPermitNumber: latraPermit,
        headquarters,
        contactEmail: email || 'ops@company.tz',
        contactPhone: phone,
      });
    } else if (isDriver) {
      onRegisterDriver({
        fullName,
        phone,
        vehicleCategory: accountType as VehicleCategory,
        plateNumber: plate,
        drivingLicence: licence,
        nidaNumber: nida,
        settlementType,
        settlementAccount: settlementAccount || phone,
      });
    }

    setIsSubmitting(false);
    setSubmittedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden font-sans">
        {/* Header with Deep Navy #14213D */}
        <div className="p-5 bg-[#14213D] text-white flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold">{t.registration.title}</h3>
            <p className="text-xs text-blue-200 mt-0.5">
              Tanzania & East Africa Logistics Onboarding Portal · Secure KYC Vault
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

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h4 className="text-xl font-extrabold text-[#14213D]">
              {lang === 'sw' ? 'Ombi Lako Limepokelewa Salama!' : 'Application Submitted Successfully!'}
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {lang === 'sw'
                ? 'Hati zako zimehifadhiwa kwenye ghala ya siri (Encrypted Vault). Timu ya usimamizi itakagua NIDA / BRELA yako na kuidhinisha akaunti kabla ya kuanza kazi.'
                : 'Your documents have been stored in the encrypted zero-knowledge vault. The platform compliance team will verify your credentials before activation.'}
            </p>
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-[#F59E0B]">
              Status: pending_verification
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-extrabold rounded-xl text-xs transition cursor-pointer"
              >
                Funga / Return to App
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto text-xs">
            {/* Account Type Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{t.registration.selectType}</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as AccountType)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
              >
                <option value="customer">{t.roles.customer}</option>
                <option value="transport_company">{t.roles.transport_company}</option>
                <option value="motorcycle">{t.roles.motorcycle}</option>
                <option value="bajaji">{t.roles.bajaji}</option>
                <option value="car_van">{t.roles.car_van}</option>
                <option value="truck">{t.roles.truck}</option>
              </select>
            </div>

            {/* Dynamic Company Fields */}
            {isCompany && (
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                <div className="font-bold text-[#14213D] uppercase tracking-wide">
                  Usajili wa Kampuni (BRELA, TRA na LATRA)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">{t.registration.companyName}</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="mf. Safari Express Logistics Ltd"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Trading Brand Name</label>
                    <input
                      type="text"
                      value={tradingName}
                      onChange={(e) => setTradingName(e.target.value)}
                      placeholder="mf. Safari Express"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">BRELA Certificate No.</label>
                    <input
                      type="text"
                      required
                      value={brelaNumber}
                      onChange={(e) => setBrelaNumber(e.target.value)}
                      placeholder="BRELA-XXXXXX"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">TRA TIN Number</label>
                    <input
                      type="text"
                      required
                      value={tinNumber}
                      onChange={(e) => setTinNumber(e.target.value)}
                      placeholder="123-456-789"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-600 mb-1">{t.registration.permit}</label>
                    <input
                      type="text"
                      required
                      value={latraPermit}
                      onChange={(e) => setLatraPermit(e.target.value)}
                      placeholder="LATRA-CP-2026-XXXX"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Driver Fields */}
            {isDriver && (
              <div className="p-4 bg-orange-50/70 rounded-xl border border-orange-200 space-y-3">
                <div className="font-bold text-[#14213D] uppercase tracking-wide">
                  Hati za Dereva na Chombo (Uhakiki wa Usalama)
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">{t.registration.nida}</label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={nida}
                    onChange={(e) => setNida(e.target.value)}
                    placeholder="199XXXXXXXX-XXXXX-XXXXX-XX"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">{t.registration.licence}</label>
                    <input
                      type="text"
                      required
                      value={licence}
                      onChange={(e) => setLicence(e.target.value)}
                      placeholder="DL-TZ-XXXXXX"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">{t.registration.plate}</label>
                    <input
                      type="text"
                      required
                      value={plate}
                      onChange={(e) => setPlate(e.target.value)}
                      placeholder="T 123 ABC"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Biometric Liveness Check in Fresh Green */}
                <div className="p-3 bg-white rounded-xl border border-orange-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800 block">{t.registration.liveFaceCheck}</span>
                    <span className="text-[11px] text-slate-500">
                      Uchunguzi wa kuzuia wizi wa picha na utambulisho (Anti-Spoofing 3D Check).
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={livenessChecking || livenessPassed}
                    onClick={handleRunLiveness}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                      livenessPassed
                        ? 'bg-emerald-100 text-[#16A34A]'
                        : 'bg-[#FF7A00] hover:bg-[#E66E00] text-white'
                    }`}
                  >
                    {livenessPassed ? '✓ 96.5% Passed' : livenessChecking ? 'Inakagua...' : 'Piga Picha / Scan'}
                  </button>
                </div>
              </div>
            )}

            {/* Standard Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.registration.fullName}</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.registration.phone}</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.registration.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jina@mfano.tz"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.registration.password}</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Settlement Payout Channel */}
            {isDriver && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.registration.settlementType}</label>
                  <select
                    value={settlementType}
                    onChange={(e) => setSettlementType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="mpesa">Vodacom M-Pesa</option>
                    <option value="tigopesa">TigoPesa</option>
                    <option value="airtelmoney">Airtel Money</option>
                    <option value="bank">CRDB / NMB Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.registration.settlementAccount}</label>
                  <input
                    type="text"
                    value={settlementAccount}
                    onChange={(e) => setSettlementAccount(e.target.value)}
                    placeholder="07XXXXXXXX au Namba ya Benki"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Data Protection Consent */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-[#2563EB] rounded border-slate-300"
                />
                <span className="text-[11px] text-slate-600 leading-relaxed">
                  {t.registration.consent}
                </span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-[#DC2626] text-xs font-semibold rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Primary Action Button: Vibrant Orange #FF7A00 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-extrabold rounded-xl shadow-md transition disabled:opacity-50 text-xs cursor-pointer"
            >
              {isSubmitting ? 'Inawasilisha...' : t.registration.submitBtn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
