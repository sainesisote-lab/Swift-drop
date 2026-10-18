import React, { useState } from 'react';
import { DeliveryOrder, DriverProfile } from '../types';
import { Language, i18n } from '../i18n';
import {
  Truck,
  Power,
  Navigation,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  DollarSign,
  ShieldCheck,
  Clock,
  ArrowRight,
  Camera,
  AlertTriangle,
  Upload,
} from 'lucide-react';

interface DriverPortalProps {
  driver: DriverProfile;
  orders: DeliveryOrder[];
  onUpdateOrderStatus: (orderId: string, newStatus: any, eventDesc: string) => void;
  lang: Language;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  driver,
  orders,
  onUpdateOrderStatus,
  lang,
}) => {
  const t = i18n[lang];

  const [isOnline, setIsOnline] = useState(driver.isOnline);
  const [walletBalance, setWalletBalance] = useState(driver.walletBalanceTzs);
  const [settlementSuccess, setSettlementSuccess] = useState<string | null>(null);
  const [proofSubmitted, setProofSubmitted] = useState<boolean>(false);

  // Active mission assigned to this driver
  const assignedOrder = orders.find(
    (o) => o.assignedDriverId === driver.id && o.currentStatus !== 'delivered' && o.currentStatus !== 'cancelled'
  );

  // Incoming offer simulation for driver
  const [incomingOffer, setIncomingOffer] = useState<{
    id: string;
    pickup: string;
    dropoff: string;
    packageDesc: string;
    weightKg: number;
    grossAmountTzs: number;
    driverNetTzs: number;
    distanceKm: number;
  } | null>(
    !assignedOrder && isOnline
      ? {
          id: 'OFFER-DAR-992',
          pickup: 'Kariakoo Market, Aggrey Street',
          dropoff: 'Posta Mpya, Samora Avenue',
          packageDesc: 'Box of Legal Documents & Banking Tokens',
          weightKg: 2.5,
          grossAmountTzs: 4500,
          driverNetTzs: 4050, // 90% net after 10% platform cut
          distanceKm: 3.2,
        }
      : null
  );

  const handleStatusAdvance = (orderId: string, nextStatus: any, title: string) => {
    onUpdateOrderStatus(orderId, nextStatus, title);
    if (nextStatus === 'delivered' && assignedOrder) {
      setWalletBalance((prev) => prev + assignedOrder.netPartnerAmountTzs);
    }
  };

  const handleAcceptIncomingOffer = () => {
    if (!incomingOffer) return;
    setIncomingOffer(null);
  };

  const handleRejectIncomingOffer = () => {
    setIncomingOffer(null);
  };

  const handleRequestSettlement = () => {
    if (walletBalance <= 0) return;
    const amount = walletBalance;
    setWalletBalance(0);
    setSettlementSuccess(
      lang === 'sw'
        ? `Ombi la kuhamisha TZS ${amount.toLocaleString()} kwenda Vodacom M-Pesa (${driver.settlementAccount}) limewasilishwa.`
        : `Disbursement request for TZS ${amount.toLocaleString()} queued to Vodacom M-Pesa (${driver.settlementAccount}).`
    );
    setTimeout(() => setSettlementSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto px-4 py-4 md:py-8">
      {/* Top Driver Header with Deep Navy & Availability Switch */}
      <div className="bg-[#14213D] text-white p-6 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#FF7A00] flex items-center justify-center text-3xl font-bold text-white shadow-md">
              🛵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{driver.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16A34A]/25 text-[#16A34A] border border-[#16A34A]/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#16A34A]" />
                  <span>LATRA Verified</span>
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Plate: <span className="font-mono font-bold text-amber-400">{driver.plateNumber}</span> · Category:{' '}
                <span className="font-semibold text-white uppercase">{driver.vehicleCategory}</span>
              </div>
            </div>
          </div>

          {/* Large Touch-Friendly Online/Offline Availability Toggle */}
          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer ${
              isOnline
                ? 'bg-[#16A34A] hover:bg-[#15803D] text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              {isOnline
                ? lang === 'sw' ? 'UKO MTANDAONI (ONLINE)' : 'ONLINE & READY'
                : lang === 'sw' ? 'HAUPO MTANDAONI (OFFLINE)' : 'OFFLINE'}
            </span>
          </button>
        </div>
      </div>

      {/* Driver Financial & KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {lang === 'sw' ? 'Salio la Pochi (Wallet)' : 'Withdrawable Earnings'}
          </span>
          <div className="text-2xl font-extrabold text-[#14213D] font-mono tabular-nums mt-1">
            TZS {walletBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex justify-between items-center">
            <span className="text-[#16A34A] font-semibold">Net 90% (10% Cut Paid)</span>
            <button
              type="button"
              disabled={walletBalance <= 0}
              onClick={handleRequestSettlement}
              className="px-2.5 py-1 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold rounded-lg text-[10px] transition disabled:opacity-40"
            >
              Lipa M-Pesa →
            </button>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {lang === 'sw' ? 'Ubora wa Dereva' : 'Driver Rating'}
          </span>
          <div className="text-2xl font-extrabold text-amber-500 font-mono tabular-nums mt-1">
            ★ {driver.rating.toFixed(1)} / 5.0
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total Trips: {driver.totalTrips} completed</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {lang === 'sw' ? 'Uhakiki wa NIDA' : 'Biometric Security'}
          </span>
          <div className="text-2xl font-extrabold text-[#16A34A] font-mono tabular-nums mt-1">
            98.0% Passed
          </div>
          <div className="text-[11px] text-slate-500 mt-1">PDPA 2022 Tanzanian Vault ID Verified</div>
        </div>
      </div>

      {settlementSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>{settlementSuccess}</span>
        </div>
      )}

      {/* Incoming Request Card (Section 7.7) */}
      {incomingOffer && !assignedOrder && (
        <div className="p-5 bg-orange-50 border-2 border-[#FF7A00] rounded-2xl shadow-lg space-y-4 animate-bounce-once">
          <div className="flex justify-between items-center">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#FF7A00] text-white uppercase tracking-wider">
              {lang === 'sw' ? 'Safari Mpya Inayoingia!' : 'Incoming Delivery Request!'}
            </span>
            <span className="font-mono font-bold text-[#14213D] text-xs">
              Net Earning: TZS {incomingOffer.driverNetTzs.toLocaleString()}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="font-extrabold text-sm text-[#14213D]">{incomingOffer.packageDesc}</div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{incomingOffer.pickup}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>{incomingOffer.dropoff}</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Distance: {incomingOffer.distanceKm} KM · Weight: {incomingOffer.weightKg} KG
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleRejectIncomingOffer}
              className="py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              <XCircle className="w-4 h-4 inline mr-1 text-[#DC2626]" />
              {lang === 'sw' ? 'Kataa (Reject)' : 'Decline'}
            </button>
            <button
              type="button"
              onClick={handleAcceptIncomingOffer}
              className="py-3 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-extrabold shadow-md transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 inline mr-1" />
              {lang === 'sw' ? 'Pokea Kazi (Accept Job)' : 'Accept Delivery'}
            </button>
          </div>
        </div>
      )}

      {/* Active Assigned Mission Card */}
      {assignedOrder ? (
        <div className="bg-white rounded-2xl border-2 border-[#2563EB] shadow-lg overflow-hidden">
          <div className="p-4 bg-[#2563EB] text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-200 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-extrabold text-sm uppercase tracking-wide">
                {lang === 'sw' ? 'Safari Inayoendelea Sasa' : 'Active Delivery Mission'}
              </span>
            </div>
            <span className="font-mono text-xs bg-white/20 px-2.5 py-1 rounded-md font-bold text-white">
              {assignedOrder.trackingNumber}
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wider block">
                  {lang === 'sw' ? 'Eneo la Kuchukulia Mzigo' : 'Pickup Location'}
                </span>
                <div className="font-bold text-slate-900 text-sm">{assignedOrder.pickupAddress}</div>
                <div className="text-xs text-slate-600 flex items-center gap-2 pt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {assignedOrder.pickupContact} ({assignedOrder.pickupPhone})
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider block">
                  {lang === 'sw' ? 'Eneo la Kushushia (Mpokeaji)' : 'Delivery Destination'}
                </span>
                <div className="font-bold text-slate-900 text-sm">{assignedOrder.dropoffAddress}</div>
                <div className="text-xs text-slate-600 flex items-center gap-2 pt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {assignedOrder.dropoffContact} ({assignedOrder.dropoffPhone})
                  </span>
                </div>
              </div>
            </div>

            {/* Financials & Earnings Snapshot */}
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
              <div>
                <span className="font-bold text-[#14213D] block text-sm">
                  {assignedOrder.packageDescription}
                </span>
                <span className="text-slate-500">
                  Weight: {assignedOrder.weightKg} KG · Distance: {assignedOrder.distanceKm} KM
                </span>
              </div>
              <div className="text-right">
                <div className="text-slate-500">Gross: TZS {assignedOrder.quotedAmountTzs.toLocaleString()}</div>
                <div className="text-[#16A34A] text-[11px] font-bold">
                  Platform 10% Cut: -TZS {assignedOrder.platformCommissionTzs.toLocaleString()}
                </div>
                <div className="text-base font-extrabold text-[#14213D] font-mono tabular-nums">
                  Your Net: TZS {assignedOrder.netPartnerAmountTzs.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Proof of Delivery / Signature affordance (Section 7.7) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-800">
                  {lang === 'sw' ? 'Picha ya Uthibitisho wa Kukabidhi (Proof of Delivery)' : 'Proof of Delivery Capture'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setProofSubmitted(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  proofSubmitted ? 'bg-emerald-100 text-[#16A34A]' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {proofSubmitted ? '✓ Imepakiwa (Uploaded)' : 'Piga Picha / Capture'}
              </button>
            </div>

            {/* Large Mobile Milestone Progression Action Controls */}
            <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center gap-3">
              {assignedOrder.currentStatus === 'assigned' && (
                <button
                  type="button"
                  onClick={() =>
                    handleStatusAdvance(
                      assignedOrder.id,
                      'picked_up',
                      lang === 'sw' ? 'Mzigo umechukuwa na dereva' : 'Driver confirmed pickup from sender'
                    )
                  }
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
                >
                  {lang === 'sw' ? '1. Nimechukua Mzigo (Confirm Pickup)' : '1. Confirm Cargo Pickup'}
                </button>
              )}

              {assignedOrder.currentStatus === 'picked_up' && (
                <button
                  type="button"
                  onClick={() =>
                    handleStatusAdvance(
                      assignedOrder.id,
                      'out_for_delivery',
                      lang === 'sw' ? 'Niko njiani kuelekea kwa mpokeaji' : 'Heading to destination'
                    )
                  }
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
                >
                  {lang === 'sw' ? '2. Niko Njiani (Out for Delivery)' : '2. Out for Delivery'}
                </button>
              )}

              {assignedOrder.currentStatus === 'out_for_delivery' && (
                <button
                  type="button"
                  onClick={() =>
                    handleStatusAdvance(
                      assignedOrder.id,
                      'delivered',
                      lang === 'sw' ? 'Mzigo umekabidhiwa salama kwa mpokeaji' : 'Delivery completed and signed'
                    )
                  }
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{lang === 'sw' ? '3. Nimekabidhi Mzigo (Complete & Collect)' : '3. Complete Delivery'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 space-y-3">
          <Truck className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-base font-extrabold text-[#14213D]">
            {lang === 'sw' ? 'Hakuna Safari Inayoendelea Sasa' : 'No Active Mission Assigned'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isOnline
              ? lang === 'sw'
                ? 'Uko mtandaoni. Utapokea oda punde inapowekwa na wateja wa Kariakoo, Mwenge au Posta.'
                : 'You are online. Fleet dispatchers will match nearby requests to your vehicle.'
              : lang === 'sw'
              ? 'Washa kitufe cha "Mtandaoni" hapo juu ili kuanza kupokea safari.'
              : 'Toggle Online to start receiving delivery assignments.'}
          </p>
        </div>
      )}
    </div>
  );
};
