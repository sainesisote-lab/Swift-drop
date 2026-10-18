import React, { useState } from 'react';
import { DeliveryOrder, DriverProfile } from '../types';
import { Language, i18n } from '../i18n';
import { UserCheck, Truck, MapPin, CheckCircle2, Clock } from 'lucide-react';

interface DispatcherPortalProps {
  orders: DeliveryOrder[];
  drivers: DriverProfile[];
  onAssignDriver: (orderId: string, driver: DriverProfile) => void;
  lang: Language;
}

export const DispatcherPortal: React.FC<DispatcherPortalProps> = ({
  orders,
  drivers,
  onAssignDriver,
  lang,
}) => {
  const t = i18n[lang];

  const [selectedDriverMap, setSelectedDriverMap] = useState<Record<string, string>>({});
  const [assignAlert, setAssignAlert] = useState<string | null>(null);

  const pendingOrders = orders.filter((o) => !o.assignedDriverId && o.currentStatus !== 'cancelled');
  const activeOrders = orders.filter((o) => o.assignedDriverId && o.currentStatus !== 'delivered');
  const availableDrivers = drivers.filter((d) => d.verificationStatus === 'verified' && d.isOnline);

  const handleExecuteAssignment = (orderId: string) => {
    const driverId = selectedDriverMap[orderId];
    if (!driverId) return;

    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    onAssignDriver(orderId, driver);
    setAssignAlert(
      lang === 'sw'
        ? `Dereva ${driver.fullName} (${driver.plateNumber}) amepangiwa oda ${orderId} kwa ufanisi!`
        : `Driver ${driver.fullName} (${driver.plateNumber}) assigned to mission ${orderId} successfully!`
    );

    setTimeout(() => setAssignAlert(null), 3500);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto px-4 py-4 md:py-8">
      {/* Header with Deep Navy #14213D */}
      <div className="bg-[#14213D] text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-wider block">
            {t.roles.dispatcher} Operations Board
          </span>
          <h2 className="text-xl font-extrabold text-white mt-1">
            {lang === 'sw' ? 'Uratibu wa Safari na Ugawaji wa Madereva' : 'Central Fleet Dispatch & Assignment Console'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Ubungo & Kariakoo Metro Dispatch Interchange · Real-time driver queue matching
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 font-bold">
            {availableDrivers.length} Online Drivers
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30 font-bold">
            {pendingOrders.length} Unassigned Cargo
          </span>
        </div>
      </div>

      {assignAlert && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>{assignAlert}</span>
        </div>
      )}

      {/* Unassigned Dispatch Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="font-bold text-[#14213D] uppercase">
            {lang === 'sw' ? 'Mizigo Inayosubiri Kupangiwa Dereva (Unassigned Queue)' : 'Pending Dispatch Queue'}
          </span>
          <span className="text-[#FF7A00] font-mono font-bold">{pendingOrders.length} Pending</span>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {lang === 'sw' ? 'Hakuna mizigo inayongoja dereva kwa sasa. Kazi zote zimepangiwa.' : 'All active shipments have been dispatched.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingOrders.map((ord) => (
              <div key={ord.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#14213D] text-sm">{ord.trackingNumber}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB] uppercase">
                      {ord.vehicleCategory}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Weight: {ord.weightKg}kg</span>
                  </div>
                  <div className="text-xs text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>{ord.pickupAddress}</span>
                    <span className="text-slate-400">→</span>
                    <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
                    <span>{ord.dropoffAddress}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Gross: <span className="font-bold text-slate-700">TZS {ord.quotedAmountTzs.toLocaleString()}</span> ·{' '}
                    Net Partner: <span className="font-bold text-[#16A34A]">TZS {ord.netPartnerAmountTzs.toLocaleString()}</span>
                  </div>
                </div>

                {/* Driver Selector & Assign Button */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={selectedDriverMap[ord.id] || ''}
                    onChange={(e) =>
                      setSelectedDriverMap((prev) => ({ ...prev, [ord.id]: e.target.value }))
                    }
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 flex-1 md:w-60 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  >
                    <option value="">{lang === 'sw' ? '-- Chagua Dereva Aliyepo --' : '-- Select Available Driver --'}</option>
                    {availableDrivers
                      .filter((d) => d.vehicleCategory === ord.vehicleCategory || ord.vehicleCategory === 'motorcycle')
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.fullName} ({d.plateNumber})
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    disabled={!selectedDriverMap[ord.id]}
                    onClick={() => handleExecuteAssignment(ord.id)}
                    className="px-5 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-extrabold rounded-lg transition disabled:opacity-40 whitespace-nowrap cursor-pointer"
                  >
                    {lang === 'sw' ? 'Pangia Dereva' : 'Dispatch'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dispatched Missions in Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="font-bold text-[#14213D] uppercase">
            {lang === 'sw' ? 'Safari Zinazoendelea (Active Dispatches)' : 'Active Missions in Transit'}
          </span>
          <span className="text-[#2563EB] font-mono font-bold">{activeOrders.length} Active</span>
        </div>

        <div className="divide-y divide-slate-100">
          {activeOrders.map((ord) => (
            <div key={ord.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#14213D] text-sm">{ord.trackingNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#2563EB] uppercase">
                    {ord.currentStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Driver: <span className="font-bold text-slate-800">{ord.assignedDriverName}</span> ({ord.assignedDriverPlate})
                </div>
              </div>

              <div className="text-right text-xs">
                <div className="font-bold text-[#14213D] font-mono tabular-nums">
                  TZS {ord.quotedAmountTzs.toLocaleString()}
                </div>
                <div className="text-[#16A34A] text-[11px] font-semibold">Live GPS Active</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
