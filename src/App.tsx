import React, { useState, useEffect } from 'react';
import {
  AuditLog,
  DeliveryOrder,
  DriverProfile,
  PlatformSettings,
  TransportCompany,
  UserRole,
} from './types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_COMPANIES,
  INITIAL_DRIVERS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_ORDERS,
} from './data/mockDatabase';
import { Language, i18n } from './i18n';
import { Navbar } from './components/Navbar';
import { PersonaSwitcher } from './components/PersonaSwitcher';
import { CustomerPortal } from './components/CustomerPortal';
import { DriverPortal } from './components/DriverPortal';
import { CompanyPortal } from './components/CompanyPortal';
import { DispatcherPortal } from './components/DispatcherPortal';
import { AccountingPortal } from './components/AccountingPortal';
import { SuperAdminPortal } from './components/SuperAdminPortal';
import { VerificationVaultModal } from './components/VerificationVaultModal';
import { RegistrationModal } from './components/RegistrationModal';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { ACTIVE_PRICING_RULES } from './services/pricingEngine';
import {
  Truck,
  Shield,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Building2,
  Lock,
  Layers,
  FileText,
  Sparkles,
  Phone,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('sw');
  const t = i18n[lang];

  // Global State (Persistent in localStorage where supported)
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [currentTab, setCurrentTab] = useState<string>('overview');

  const [companies, setCompanies] = useState<TransportCompany[]>(() => {
    const saved = localStorage.getItem('swiftdrop_companies');
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [drivers, setDrivers] = useState<DriverProfile[]>(() => {
    const saved = localStorage.getItem('swiftdrop_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [orders, setOrders] = useState<DeliveryOrder[]>(() => {
    const saved = localStorage.getItem('swiftdrop_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [ledgerEntries, setLedgerEntries] = useState(() => {
    const saved = localStorage.getItem('swiftdrop_ledger');
    return saved ? JSON.parse(saved) : INITIAL_LEDGER_ENTRIES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('swiftdrop_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [settings, setSettings] = useState<PlatformSettings>({
    commissionRate: 0.10,
    minCommissionTzs: 500,
    taxVatRate: 0.18,
    sandboxMode: true,
    requireBiometricVerification: true,
    disputeGracePeriodHours: 48,
  });

  // Modal Controls
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);

  // Guest booking trigger
  const [guestModeActive, setGuestModeActive] = useState(false);

  // Quick Home Search Inputs
  const [homePickup, setHomePickup] = useState('Kariakoo Market, Aggrey Street');
  const [homeDropoff, setHomeDropoff] = useState('Mwenge IT Complex, Bagamoyo Road');

  // Document Vault Inspection Modal
  const [vaultModalState, setVaultModalState] = useState<{
    isOpen: boolean;
    title: string;
    entityId: string;
    docData: any;
  }>({
    isOpen: false,
    title: '',
    entityId: '',
    docData: null,
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('swiftdrop_companies', JSON.stringify(companies));
      localStorage.setItem('swiftdrop_drivers', JSON.stringify(drivers));
      localStorage.setItem('swiftdrop_orders', JSON.stringify(orders));
      localStorage.setItem('swiftdrop_ledger', JSON.stringify(ledgerEntries));
      localStorage.setItem('swiftdrop_audit', JSON.stringify(auditLogs));
    } catch {
      // Local storage sandbox safe
    }
  }, [companies, drivers, orders, ledgerEntries, auditLogs]);

  // Order Handlers
  const handleOrderCreated = (newOrder: DeliveryOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    addAuditLog('ORDER_CREATED', `Order ${newOrder.trackingNumber} registered for ${newOrder.customerName}.`);
  };

  const handlePaymentCompleted = (orderId: string, paymentRef: string, newLedgerEntries: any[]) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'successful',
              paymentReference: paymentRef,
              currentStatus: 'booked',
              statusEvents: [
                ...o.statusEvents,
                {
                  id: `evt-${Date.now()}`,
                  orderId,
                  status: 'booked',
                  titleEn: 'Payment Confirmed',
                  titleSw: 'Malipo Yamethibitishwa',
                  descriptionEn: `Payment of TZS ${o.quotedAmountTzs.toLocaleString()} reconciled via Tanzanian gateway. Reference: ${paymentRef}`,
                  descriptionSw: `Malipo ya TZS ${o.quotedAmountTzs.toLocaleString()} yamethibitishwa. Kumbukumbu: ${paymentRef}`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : o
      )
    );

    setLedgerEntries((prev: any[]) => [...newLedgerEntries, ...prev]);
    addAuditLog('PAYMENT_RECONCILED', `Order ${orderId} payment confirmed. Posted 5 double-entry records.`);
  };

  const handleDriverStatusAdvance = (orderId: string, nextStatus: any, statusTitle: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              currentStatus: nextStatus,
              statusEvents: [
                ...o.statusEvents,
                {
                  id: `evt-${Date.now()}`,
                  orderId,
                  status: nextStatus,
                  titleEn: statusTitle,
                  titleSw: statusTitle,
                  descriptionEn: `Operational status updated to ${nextStatus}.`,
                  descriptionSw: `Hali imesasishwa kuwa ${nextStatus}.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : o
      )
    );
    addAuditLog('STATUS_ADVANCE', `Order ${orderId} moved to milestone: ${nextStatus}`);
  };

  const handleAssignDriver = (orderId: string, driver: DriverProfile) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              assignedDriverId: driver.id,
              assignedDriverName: driver.fullName,
              assignedDriverPhone: driver.phone,
              assignedDriverPlate: driver.plateNumber,
              currentStatus: 'assigned',
              statusEvents: [
                ...o.statusEvents,
                {
                  id: `evt-${Date.now()}`,
                  orderId,
                  status: 'assigned',
                  titleEn: `Assigned to ${driver.fullName}`,
                  titleSw: `Amepangiwa ${driver.fullName}`,
                  descriptionEn: `Driver vehicle: ${driver.plateNumber} (${driver.vehicleCategory}).`,
                  descriptionSw: `Chombo cha dereva: ${driver.plateNumber}.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : o
      )
    );
    addAuditLog('DRIVER_DISPATCHED', `Order ${orderId} assigned to driver ${driver.fullName}`);
  };

  // Super Admin Approval Handlers
  const handleApproveCompany = (companyId: string) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId
          ? { ...c, verificationStatus: 'verified', isActive: true }
          : c
      )
    );
    addAuditLog('COMPANY_APPROVED', `Company ${companyId} verified and activated.`);
  };

  const handleRejectCompany = (companyId: string, reason: string) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId
          ? { ...c, verificationStatus: 'rejected', verificationNotes: reason, isActive: false }
          : c
      )
    );
    addAuditLog('COMPANY_REJECTED', `Company ${companyId} rejected: ${reason}`);
  };

  const handleApproveDriver = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? { ...d, verificationStatus: 'verified', isOnline: true, isAvailable: true }
          : d
      )
    );
    addAuditLog('DRIVER_APPROVED', `Driver ${driverId} verified and enabled.`);
  };

  const handleRejectDriver = (driverId: string, reason: string) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? { ...d, verificationStatus: 'rejected', isOnline: false, isAvailable: false }
          : d
      )
    );
    addAuditLog('DRIVER_REJECTED', `Driver ${driverId} rejected: ${reason}`);
  };

  const handleUpdateCommission = (newRate: number) => {
    setSettings((prev) => ({ ...prev, commissionRate: newRate }));
    addAuditLog('COMMISSION_UPDATED', `Platform commission rate adjusted to ${(newRate * 100).toFixed(1)}%`);
  };

  // Registration Handlers
  const handleRegisterDriver = (driverData: any) => {
    const newDriver: DriverProfile = {
      id: `drv-${Date.now()}`,
      userId: `usr-${Date.now()}`,
      fullName: driverData.fullName,
      phone: driverData.phone,
      vehicleCategory: driverData.vehicleCategory,
      plateNumber: driverData.plateNumber,
      drivingLicence: driverData.drivingLicence,
      nidaNumber: driverData.nidaNumber,
      companyName: 'SwiftDrop Independent Partner',
      verificationStatus: 'pending_verification',
      livenessScore: 0.965,
      isOnline: false,
      isAvailable: false,
      currentLat: -6.8202,
      currentLng: 39.2783,
      currentHeading: 0,
      currentSpeedKmh: 0,
      rating: 0,
      totalTrips: 0,
      walletBalanceTzs: 0,
      settlementType: driverData.settlementType,
      settlementAccount: driverData.settlementAccount,
    };
    setDrivers((prev) => [newDriver, ...prev]);
    addAuditLog('REGISTRATION_DRIVER', `Driver application queued: ${driverData.fullName}`);
  };

  const handleRegisterCompany = (companyData: any) => {
    const newCompany: TransportCompany = {
      id: `comp-${Date.now()}`,
      legalName: companyData.legalName,
      tradingName: companyData.tradingName,
      registrationNumber: companyData.registrationNumber,
      taxIdentificationNumber: companyData.taxIdentificationNumber,
      contactEmail: companyData.contactEmail,
      contactPhone: companyData.contactPhone,
      headquarters: companyData.headquarters || 'Dar es Salaam',
      branches: ['Dar es Salaam'],
      verificationStatus: 'pending_verification',
      carrierPermitNumber: companyData.carrierPermitNumber,
      isActive: false,
      totalFleetCount: 1,
      rating: 0,
      totalTripsCompleted: 0,
      payableBalanceTzs: 0,
    };
    setCompanies((prev) => [newCompany, ...prev]);
    addAuditLog('REGISTRATION_COMPANY', `Company application queued: ${companyData.legalName}`);
  };

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorName: activeRole === 'super_admin' ? 'Root Super Admin' : `${activeRole.replace('_', ' ')} user`,
      actorRole: activeRole,
      action,
      targetEntity: 'operational_flow',
      details,
      ipAddress: '197.250.198.12 (Dar es Salaam)',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleGuestQuickBooking = () => {
    setGuestModeActive(true);
    setActiveRole('customer');
    setCurrentTab('overview');
    window.scrollTo({ top: 580, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans text-[#14213D] selection:bg-[#FF7A00] selection:text-white">
      {/* Top Navigation Bar with Official Palette */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'architecture') {
            setDocsModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        lang={lang}
        onToggleLang={() => setLang(lang === 'sw' ? 'en' : 'sw')}
        activeRole={activeRole}
        onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
        onOpenRegister={() => setRegisterModalOpen(true)}
        onGuestBookClick={handleGuestQuickBooking}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'overview' && (
          <div className="space-y-12">
            {/* Redesigned Hero Section (Section 7.4) */}
            <section className="relative bg-[#14213D] text-white overflow-hidden py-12 lg:py-16 border-b border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-blue-900/60 text-blue-300 border border-blue-800">
                      <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                      <span>{t.compliance.badge}</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                      {lang === 'sw' ? (
                        <>
                          Usafirishaji wa Uhakika Tanzania na <span className="text-[#FF7A00]">Afrika Mashariki</span>
                        </>
                      ) : (
                        <>
                          Reliable Freight & Courier Logistics for <span className="text-[#FF7A00]">East Africa</span>
                        </>
                      )}
                    </h1>

                    <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                      {lang === 'sw'
                        ? 'Jukwaa rasmi la kuunganisha kampuni za usafirishaji, madereva wa bodaboda, bajaji, malori na wateja. Bei ya wazi, ada ya mfumo 10%, na ufuatiliaji wa moja kwa moja kwa GPS.'
                        : 'Integrated logistics engine powering intercity cargo carriers, on-demand urban couriers, and freight dispatch. Strict double-entry ledger, transparent 10% platform commission, and biometric security.'}
                    </p>

                    {/* Quick Search & Actions (Section 7.4) */}
                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            {lang === 'sw' ? 'Kutoka (Pickup)' : 'Pickup Location'}
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-[#16A34A] absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={homePickup}
                              onChange={(e) => setHomePickup(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 font-bold mb-1">
                            {lang === 'sw' ? 'Kwenda (Destination)' : 'Dropoff Destination'}
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-[#DC2626] absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={homeDropoff}
                              onChange={(e) => setHomeDropoff(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {/* Primary Action Button: Vibrant Orange #FF7A00 */}
                        <button
                          type="button"
                          onClick={handleGuestQuickBooking}
                          className="px-6 py-3 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-extrabold rounded-xl shadow-lg transition duration-150 flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-white" />
                          <span>{lang === 'sw' ? 'Agiza Mzigo Sasa (Book Delivery)' : 'Book Delivery Now'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setGuestModeActive(true);
                            handleGuestQuickBooking();
                          }}
                          className="px-4 py-3 bg-transparent hover:bg-white/10 text-slate-300 font-bold rounded-xl border border-slate-700 transition text-xs"
                        >
                          {lang === 'sw' ? 'Endelea Kama Mgeni' : 'Continue as Guest'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Commercial Logistics Fleet Photo */}
                  <div className="lg:col-span-5 relative">
                    <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900">
                      <img
                        src="/src/assets/images/hero_logistics_fleet_1792279606673.jpg"
                        alt="East African Logistics Fleet Terminal in Dar es Salaam"
                        className="w-full h-80 lg:h-96 object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Customer Booking & Live Map Component */}
            <CustomerPortal
              orders={orders}
              onOrderCreated={handleOrderCreated}
              onPaymentCompleted={handlePaymentCompleted}
              lang={lang}
              initialGuestMode={guestModeActive}
            />
          </div>
        )}

        {currentTab === 'services' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div>
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
                {t.nav.services}
              </span>
              <h2 className="text-2xl font-extrabold text-[#14213D] mt-1">
                {lang === 'sw' ? 'Huduma Zote za Usafirishaji na Vifurushi' : 'Logistics & Cargo Services'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FF7A00] flex items-center justify-center text-2xl font-bold">
                  🛵
                </div>
                <h3 className="text-lg font-bold text-[#14213D]">{t.services.lastMile}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.services.lastMileDesc}</p>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-[#14213D]">Supported Vehicles:</div>
                  <div>· Motorcycle (Bodaboda): Up to 30kg, urban rapid dispatch</div>
                  <div>· Tricycle (Bajaji): Up to 150kg, cargo carriage</div>
                  <div>· Kirikuu / Small Van: Up to 800kg, bulk city parcels</div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center text-2xl font-bold">
                  🚛
                </div>
                <h3 className="text-lg font-bold text-[#14213D]">{t.services.longDistance}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{t.services.longDistanceDesc}</p>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-[#14213D]">Approved Regional Carriers:</div>
                  <div>· Tahmeed Coach & Cargo: Dar - Arusha - Nairobi</div>
                  <div>· Shabiby Line Logistics: Dar - Dodoma - Mwanza</div>
                  <div>· Kilima Express Haulage: Dar - Mbeya - Tunduma</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'pricing' && (
          <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            <div>
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
                {t.nav.pricing}
              </span>
              <h2 className="text-2xl font-extrabold text-[#14213D] mt-1">
                {lang === 'sw' ? 'Kanuni za Bei na Ada ya Mfumo (10%)' : 'Transparent Pricing Architecture'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Total Price = Base Fare + (Billable Distance × Rate per KM) + Weight Surcharges. Fixed 10% Platform Commission.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(ACTIVE_PRICING_RULES).map((rule) => (
                <div key={rule.vehicleCategory} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="text-3xl">{rule.icon}</div>
                  <h4 className="font-extrabold text-[#14213D] text-sm">
                    {lang === 'sw' ? rule.nameSw : rule.name}
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Base Fare:</span>
                      <span className="font-bold font-mono">TZS {rule.baseFareTzs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per KM Rate:</span>
                      <span className="font-bold font-mono">TZS {rule.perKmRateTzs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum Fare:</span>
                      <span className="font-bold font-mono">TZS {rule.minFareTzs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Payload:</span>
                      <span className="font-bold font-mono text-[#16A34A]">{rule.maxWeightKg} KG</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'tracking' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <CustomerPortal
              orders={orders}
              onOrderCreated={handleOrderCreated}
              onPaymentCompleted={handlePaymentCompleted}
              lang={lang}
            />
          </div>
        )}

        {currentTab === 'portal' && (
          <div>
            {/* Active Workspace Persona Role Bar */}
            <div className="bg-[#14213D] text-white px-4 py-3 border-b border-slate-800">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">Active Role:</span>
                  <span className="font-black text-[#FF7A00] uppercase tracking-wide">
                    {activeRole.replace('_', ' ')}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300 font-medium">Tanzania Production Sandboxed</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRoleSwitcherOpen(true)}
                  className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Badili Jukumu (Switch Role) →
                </button>
              </div>
            </div>

            {/* Role-Based Views */}
            {activeRole === 'customer' && (
              <CustomerPortal
                orders={orders}
                onOrderCreated={handleOrderCreated}
                onPaymentCompleted={handlePaymentCompleted}
                lang={lang}
              />
            )}

            {activeRole === 'driver' && (
              <DriverPortal
                driver={drivers[0]}
                orders={orders}
                onUpdateOrderStatus={handleDriverStatusAdvance}
                lang={lang}
              />
            )}

            {activeRole === 'company_admin' && (
              <CompanyPortal
                company={companies[0]}
                drivers={drivers}
                orders={orders}
                lang={lang}
              />
            )}

            {activeRole === 'dispatcher' && (
              <DispatcherPortal
                orders={orders}
                drivers={drivers}
                onAssignDriver={handleAssignDriver}
                lang={lang}
              />
            )}

            {activeRole === 'accountant' && (
              <AccountingPortal ledgerEntries={ledgerEntries} lang={lang} />
            )}

            {activeRole === 'super_admin' && (
              <SuperAdminPortal
                companies={companies}
                drivers={drivers}
                orders={orders}
                auditLogs={auditLogs}
                settings={settings}
                onUpdateCommissionRate={handleUpdateCommission}
                onApproveCompany={handleApproveCompany}
                onRejectCompany={handleRejectCompany}
                onApproveDriver={handleApproveDriver}
                onRejectDriver={handleRejectDriver}
                onOpenDocVault={(title, entityId, docData) =>
                  setVaultModalState({ isOpen: true, title, entityId, docData })
                }
                lang={lang}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer in Deep Navy #14213D */}
      <footer className="bg-[#14213D] text-white border-t border-slate-800 mt-16 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">SwiftDrop Transport Ltd</span>
            <span>·</span>
            <span>Dar es Salaam, Tanzania</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setDocsModalOpen(true)}
              className="hover:text-white font-semibold cursor-pointer"
            >
              System Docs & Schema
            </button>
            <span>·</span>
            <span className="text-[#16A34A] font-semibold">PDPA 2022 Compliant</span>
            <span>·</span>
            <span>© 2026 SwiftDrop</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PersonaSwitcher
        isOpen={roleSwitcherOpen}
        onClose={() => setRoleSwitcherOpen(false)}
        activeRole={activeRole}
        onSelectRole={(r) => {
          setActiveRole(r);
          setCurrentTab('portal');
        }}
        lang={lang}
      />

      <RegistrationModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onRegisterDriver={handleRegisterDriver}
        onRegisterCompany={handleRegisterCompany}
        lang={lang}
      />

      <VerificationVaultModal
        isOpen={vaultModalState.isOpen}
        onClose={() => setVaultModalState((prev) => ({ ...prev, isOpen: false }))}
        title={vaultModalState.title}
        entityId={vaultModalState.entityId}
        docData={vaultModalState.docData}
        onApprove={(id) => {
          if (vaultModalState.docData?.type === 'company') {
            handleApproveCompany(id);
          } else {
            handleApproveDriver(id);
          }
        }}
        onReject={(id, reason) => {
          if (vaultModalState.docData?.type === 'company') {
            handleRejectCompany(id, reason);
          } else {
            handleRejectDriver(id, reason);
          }
        }}
        lang={lang}
      />

      <ArchitectureDocsModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
