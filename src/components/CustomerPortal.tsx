import React, { useState } from 'react';
import { DeliveryOrder, VehicleCategory } from '../types';
import { ACTIVE_PRICING_RULES, calculateQuote } from '../services/pricingEngine';
import { processPayment } from '../services/paymentService';
import { recordOrderPaymentInLedger } from '../services/ledgerEngine';
import { InteractiveMap } from './InteractiveMap';
import { Language, i18n } from '../i18n';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Search,
  User,
  Star,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Share2,
  Download,
  Bookmark,
  ChevronRight,
} from 'lucide-react';

interface CustomerPortalProps {
  orders: DeliveryOrder[];
  onOrderCreated: (order: DeliveryOrder) => void;
  onPaymentCompleted: (orderId: string, paymentRef: string, newLedgerEntries: any[]) => void;
  lang: Language;
  initialGuestMode?: boolean;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  orders,
  onOrderCreated,
  onPaymentCompleted,
  lang,
  initialGuestMode = false,
}) => {
  const t = i18n[lang];

  // Guest vs Authenticated User Mode
  const [isGuestMode, setIsGuestMode] = useState<boolean>(initialGuestMode);

  // 10-Step Progress Tracking
  // 1: Pickup, 2: Destination, 3: Parcel, 4: Vehicle, 5: Fare Preview, 6: Confirm, 7: Payment, 8: Assignment, 9: Tracking, 10: Receipt
  const [bookingStep, setBookingStep] = useState<number>(1);

  // Booking Form State
  const [serviceType, setServiceType] = useState<'last_mile_on_demand' | 'long_distance_cargo'>('last_mile_on_demand');
  const [vehicle, setVehicle] = useState<VehicleCategory>('motorcycle');
  const [pickupAddress, setPickupAddress] = useState('Kariakoo Market, Aggrey St, Dar es Salaam');
  const [dropoffAddress, setDropoffAddress] = useState('Mwenge IT Complex, Bagamoyo Rd, Dar es Salaam');
  const [packageDesc, setPackageDesc] = useState('Electronics spares & accessories');
  const [weightKg, setWeightKg] = useState<number>(5.0);
  const [distanceKm, setDistanceKm] = useState<number>(8.5);
  const [senderName, setSenderName] = useState('Amina Hamisi');
  const [senderPhone, setSenderPhone] = useState('+255 712 345 678');
  const [receiverName, setReceiverName] = useState('Kelvin Mushi');
  const [receiverPhone, setReceiverPhone] = useState('+255 784 556 677');
  const [specialInstructions, setSpecialInstructions] = useState('Handle with care. Fragile electronic components.');
  const [selectedCarrier, setSelectedCarrier] = useState('Tahmeed Cargo Express');

  // Payment Checkout Modal State
  const [activePaymentOrder, setActivePaymentOrder] = useState<DeliveryOrder | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'mpesa_direct' | 'azampay' | 'selcom' | 'bank_card'>('mpesa_direct');
  const [paymentPhone, setPaymentPhone] = useState('0712345678');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [ussdPromptVisible, setUssdPromptVisible] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Active tracking selection & customer view tabs
  const [customerViewTab, setCustomerViewTab] = useState<'book' | 'active_tracking' | 'history' | 'receipt' | 'support'>('book');
  const [trackingSearch, setTrackingSearch] = useState('');
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<DeliveryOrder>(orders[0] || null);

  // Receipt Modal State
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<DeliveryOrder | null>(null);

  // Saved Addresses
  const savedAddresses = [
    { label: 'Ofisi (Kariakoo)', address: 'Aggrey Street, Kariakoo Market, Dar es Salaam' },
    { label: 'Nyumbani (Mwenge)', address: 'Mwenge IT Complex, Bagamoyo Road, Dar es Salaam' },
    { label: 'Kituo cha Mabasi (Ubungo)', address: 'Shekilango Road, Ubungo Bus Interchange, Dar es Salaam' },
    { label: 'Bandari (Port Gate 4)', address: 'Dar es Salaam Port Terminal, Gate 4' },
  ];

  const selectedRule = ACTIVE_PRICING_RULES[vehicle];
  const calculatedQuote = calculateQuote(selectedRule, {
    vehicleCategory: vehicle,
    distanceKm: serviceType === 'long_distance_cargo' ? 520 : distanceKm,
    weightKg,
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const trackingNumber = `SWIFT-${serviceType === 'long_distance_cargo' ? 'CARGO' : 'DAR'}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newOrder: DeliveryOrder = {
      id: `ord-${Date.now()}`,
      trackingNumber,
      customerId: isGuestMode ? 'guest-customer' : 'usr-customer-1',
      customerName: senderName,
      customerPhone: senderPhone,
      companyName: serviceType === 'long_distance_cargo' ? selectedCarrier : 'SwiftDrop Express',
      serviceType,
      vehicleCategory: vehicle,
      pickupAddress,
      pickupLat: -6.8202,
      pickupLng: 39.2783,
      pickupContact: senderName,
      pickupPhone: senderPhone,
      dropoffAddress,
      dropoffLat: -6.7712,
      dropoffLng: 39.2312,
      dropoffContact: receiverName,
      dropoffPhone: receiverPhone,
      packageDescription: packageDesc,
      specialInstructions,
      weightKg,
      distanceKm: calculatedQuote.distanceKm,
      quotedAmountTzs: calculatedQuote.grossAmountTzs,
      platformCommissionRate: calculatedQuote.platformCommissionRate,
      platformCommissionTzs: calculatedQuote.platformCommissionTzs,
      netPartnerAmountTzs: calculatedQuote.netPartnerEarningsTzs,
      currentStatus: 'created',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusEvents: [
        {
          id: `evt-${Date.now()}`,
          orderId: `ord-${Date.now()}`,
          status: 'created',
          titleEn: 'Order Created',
          titleSw: 'Oda Imeundwa',
          descriptionEn: `Quote locked at TZS ${calculatedQuote.grossAmountTzs.toLocaleString()} (10% platform commission: TZS ${calculatedQuote.platformCommissionTzs.toLocaleString()}).`,
          descriptionSw: `Bei imefungwa TZS ${calculatedQuote.grossAmountTzs.toLocaleString()} (Ada ya mfumo 10%: TZS ${calculatedQuote.platformCommissionTzs.toLocaleString()}).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    onOrderCreated(newOrder);
    setActivePaymentOrder(newOrder);
    setSelectedTrackOrder(newOrder);
    setBookingStep(7); // Jump to payment
  };

  const handleTriggerPayment = async () => {
    if (!activePaymentOrder) return;
    setIsProcessingPayment(true);
    setUssdPromptVisible(true);

    try {
      const result = await processPayment({
        orderId: activePaymentOrder.id,
        trackingNumber: activePaymentOrder.trackingNumber,
        amountTzs: activePaymentOrder.quotedAmountTzs,
        provider: selectedProvider,
        phoneNumber: paymentPhone,
        customerName: activePaymentOrder.customerName,
      });

      // Generate verified double-entry ledger postings
      const ledgerEntries = recordOrderPaymentInLedger(
        result.transactionReference,
        activePaymentOrder.quotedAmountTzs,
        activePaymentOrder.platformCommissionTzs,
        result.gatewayFeeTzs,
        activePaymentOrder.companyId ? 'company' : 'driver',
        activePaymentOrder.trackingNumber
      );

      onPaymentCompleted(activePaymentOrder.id, result.transactionReference, ledgerEntries);
      setPaymentSuccessMsg(lang === 'sw' ? result.messageSw : result.message);

      setTimeout(() => {
        setUssdPromptVisible(false);
        setActivePaymentOrder(null);
        setPaymentSuccessMsg(null);
        setBookingStep(8); // Move to driver assignment & live tracking
        setCustomerViewTab('active_tracking');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
      setUssdPromptVisible(false);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const stepsList = [
    { num: 1, nameSw: 'Kutoka', nameEn: 'Pickup' },
    { num: 2, nameSw: 'Kwenda', nameEn: 'Destination' },
    { num: 3, nameSw: 'Mzigo', nameEn: 'Parcel Info' },
    { num: 4, nameSw: 'Chombo', nameEn: 'Vehicle' },
    { num: 5, nameSw: 'Makadirio', nameEn: 'Fare Preview' },
    { num: 6, nameSw: 'Uthibitisho', nameEn: 'Confirm' },
    { num: 7, nameSw: 'Malipo', nameEn: 'Payment' },
    { num: 8, nameSw: 'Dereva', nameEn: 'Assign Driver' },
    { num: 9, nameSw: 'GPS Live', nameEn: 'Live Tracking' },
    { num: 10, nameSw: 'Risiti', nameEn: 'Receipt' },
  ];

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto px-4 py-4 md:py-8">
      {/* Welcome & Guest/User Toggle Banner */}
      <div className="bg-[#14213D] text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" />
              <span className="text-xs font-bold text-[#FF7A00] uppercase tracking-wider">
                {isGuestMode
                  ? lang === 'sw' ? 'Hali ya Mgeni (Guest Mode)' : 'Guest Booking Mode'
                  : lang === 'sw' ? 'Akaunti ya Mteja (Customer Account)' : 'Customer Verified Account'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {isGuestMode
                ? lang === 'sw' ? 'Agiza Mzigo Moja kwa Moja Bila Kuingia' : 'Book One-Time Delivery (Guest Access)'
                : `${lang === 'sw' ? 'Karibu' : 'Welcome'}, ${senderName}`}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              {lang === 'sw'
                ? 'Usafirishaji wa haraka Dar es Salaam na mikoani. Chagua bodaboda, bajaji, kirikuu au lori kubwa.'
                : 'Fast, secure on-demand urban logistics and intercity cargo across Tanzania with transparent 10% platform commission.'}
            </p>
          </div>

          {/* Guest vs Account Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setIsGuestMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                !isGuestMode ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 inline mr-1" />
              {lang === 'sw' ? 'Akaunti Yangu' : 'My Account'}
            </button>
            <button
              type="button"
              onClick={() => setIsGuestMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isGuestMode ? 'bg-[#FF7A00] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1" />
              {lang === 'sw' ? 'Endelea Kama Mgeni' : 'Continue as Guest'}
            </button>
          </div>
        </div>

        {/* 10-Step Visual Flow Indicator */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
            <span>
              {lang === 'sw' ? 'Hatua za Usafirishaji (10-Step Progress)' : 'Delivery Progress Pipeline'}
            </span>
            <span className="text-[#FF7A00] font-mono">Step {bookingStep} of 10</span>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
            {stepsList.map((st) => {
              const isCompleted = st.num < bookingStep;
              const isCurrent = st.num === bookingStep;
              return (
                <div
                  key={st.num}
                  className={`p-1.5 rounded-lg text-center transition border ${
                    isCompleted
                      ? 'bg-[#16A34A]/20 border-[#16A34A] text-[#16A34A]'
                      : isCurrent
                      ? 'bg-[#FF7A00] border-[#FF7A00] text-white font-extrabold shadow-md'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] font-mono">{st.num}</div>
                  <div className="text-[9px] truncate">
                    {lang === 'sw' ? st.nameSw : st.nameEn}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer Module Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setCustomerViewTab('book')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            customerViewTab === 'book'
              ? 'bg-[#14213D] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>{lang === 'sw' ? 'Agiza Mzigo Mpya' : 'Book New Delivery'}</span>
        </button>

        <button
          type="button"
          onClick={() => setCustomerViewTab('active_tracking')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            customerViewTab === 'active_tracking'
              ? 'bg-[#14213D] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{lang === 'sw' ? 'Fuatilia kwa GPS (Live)' : 'Live GPS Tracking'}</span>
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
        </button>

        <button
          type="button"
          onClick={() => setCustomerViewTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            customerViewTab === 'history'
              ? 'bg-[#14213D] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          <span>{lang === 'sw' ? 'Historia na Risiti' : 'Orders & Receipts'}</span>
        </button>

        <button
          type="button"
          onClick={() => setCustomerViewTab('support')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            customerViewTab === 'support'
              ? 'bg-[#14213D] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>{lang === 'sw' ? 'Msaada kwa Wateja' : 'Customer Support'}</span>
        </button>
      </div>

      {/* View 1: Booking Form */}
      {customerViewTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Booking Controls */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-[#14213D]">{t.booking.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'sw'
                    ? 'Chagua chombo, weka maelezo ya mzigo, na upate nauli sahihi kabla ya kulipa'
                    : 'Select vehicle, package details, and view exact price breakdown before paying'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30">
                10% Commission
              </span>
            </div>

            {/* Service Type Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setServiceType('last_mile_on_demand');
                  setBookingStep(1);
                }}
                className={`py-2.5 rounded-lg transition ${
                  serviceType === 'last_mile_on_demand'
                    ? 'bg-[#14213D] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🛵 {lang === 'sw' ? 'Mjini (Last-Mile On-Demand)' : 'Urban On-Demand'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setServiceType('long_distance_cargo');
                  setBookingStep(1);
                }}
                className={`py-2.5 rounded-lg transition ${
                  serviceType === 'long_distance_cargo'
                    ? 'bg-[#14213D] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🚛 {lang === 'sw' ? 'Mikoani (Intercity Freight)' : 'Intercity Freight'}
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-5 text-xs">
              {/* If Long Distance Cargo */}
              {serviceType === 'long_distance_cargo' && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <label className="block font-bold text-[#14213D]">
                    {lang === 'sw' ? 'Kampuni ya Usafirishaji (LATRA Approved)' : 'Select Carrier Company'}
                  </label>
                  <select
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="Tahmeed Cargo Express">Tahmeed Coach & Cargo (Dar es Salaam - Arusha - Nairobi)</option>
                    <option value="Shabiby Freight Services">Shabiby Line Logistics (Dar es Salaam - Dodoma - Mwanza)</option>
                    <option value="Kilima Freight">Kilima Express Haulage (Dar es Salaam - Mbeya - Tunduma)</option>
                  </select>
                </div>
              )}

              {/* Pickup & Destination */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">{t.booking.pickup}</label>
                    <span className="text-[10px] text-[#2563EB] cursor-pointer hover:underline font-semibold">
                      {lang === 'sw' ? 'Tumia Eneo Langu' : 'Use Current GPS'}
                    </span>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#16A34A] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={pickupAddress}
                      onChange={(e) => {
                        setPickupAddress(e.target.value);
                        setBookingStep(2);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.booking.dropoff}</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#DC2626] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={dropoffAddress}
                      onChange={(e) => {
                        setDropoffAddress(e.target.value);
                        setBookingStep(3);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Saved Address Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {savedAddresses.map((sa) => (
                    <button
                      key={sa.label}
                      type="button"
                      onClick={() => setDropoffAddress(sa.address)}
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 border border-slate-200 transition"
                    >
                      + {sa.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Selection Cards (7.4 & 7.5) */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  {t.booking.vehicle} — {lang === 'sw' ? 'Chagua kulingana na uzito wa mzigo' : 'Select by weight capacity'}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['motorcycle', 'bajaji', 'car_van', 'truck'] as VehicleCategory[]).map((cat) => {
                    const r = ACTIVE_PRICING_RULES[cat];
                    const isSelected = vehicle === cat;
                    return (
                      <div
                        key={cat}
                        onClick={() => {
                          setVehicle(cat);
                          setBookingStep(4);
                        }}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                          isSelected
                            ? 'border-[#FF7A00] bg-orange-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="text-2xl mt-0.5">{r.icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-[#14213D] text-xs truncate">
                            {lang === 'sw' ? r.nameSw : r.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                            Max: <span className="text-[#16A34A] font-bold">{r.maxWeightKg}kg</span>
                          </div>
                          <div className="text-[10px] text-slate-700 font-mono font-bold mt-1">
                            TZS {r.baseFareTzs.toLocaleString()} base
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Package Specs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.booking.weight}</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max={selectedRule.maxWeightKg}
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'sw' ? 'Umbali (KM)' : 'Route Distance (KM)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    required
                    value={serviceType === 'long_distance_cargo' ? 520 : distanceKm}
                    disabled={serviceType === 'long_distance_cargo'}
                    onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 disabled:opacity-70"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.booking.packageDesc}</label>
                <input
                  type="text"
                  required
                  value={packageDesc}
                  onChange={(e) => setPackageDesc(e.target.value)}
                  placeholder="mf. Sanduku la Vipuri vya Simu / Electronic Spares"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'sw' ? 'Jina la Mpokeaji' : 'Recipient Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'sw' ? 'Simu ya Mpokeaji' : 'Recipient Phone'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Fare Preview & Transparent 10% Commission (Section 7.2 & 7.10) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>{t.booking.baseFare}:</span>
                  <span className="font-semibold font-mono tabular-nums">
                    TZS {calculatedQuote.baseFareTzs.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>
                    {t.booking.distanceFare} ({calculatedQuote.distanceKm} KM):
                  </span>
                  <span className="font-semibold font-mono tabular-nums">
                    TZS {calculatedQuote.distanceChargeTzs.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>
                    {t.booking.weightSurcharge} ({calculatedQuote.weightKg} KG):
                  </span>
                  <span className="font-semibold font-mono tabular-nums">
                    TZS {calculatedQuote.weightSurchargeTzs.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-[#14213D]">
                  <span>{t.booking.totalFare}:</span>
                  <span className="font-mono tabular-nums text-base text-[#14213D]">
                    TZS {calculatedQuote.grossAmountTzs.toLocaleString()}
                  </span>
                </div>

                {/* Mandatory 10% Platform Commission Snapshot */}
                <div className="border-t border-dashed border-slate-300 pt-2 text-[11px] space-y-1 text-slate-500">
                  <div className="flex justify-between">
                    <span>{t.booking.commission}:</span>
                    <span className="font-bold text-[#16A34A] font-mono tabular-nums">
                      TZS {calculatedQuote.platformCommissionTzs.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.booking.partnerNet}:</span>
                    <span className="font-bold text-slate-700 font-mono tabular-nums">
                      TZS {calculatedQuote.netPartnerEarningsTzs.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Action Button: Vibrant Orange #FF7A00 */}
              <button
                type="submit"
                className="w-full py-3.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-extrabold rounded-xl shadow-lg transition-all duration-150 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>{lang === 'sw' ? 'Thibitisha na Uendelee Kulipa' : 'Confirm & Proceed to Pay'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>

          {/* Right Column: Live Map Preview & Order Summary */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-[#14213D]">
                    {lang === 'sw' ? 'Hakiki Njia na Chombo' : 'Route & Vehicle Preview'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Kariakoo Hub → Mwenge IT Complex ({calculatedQuote.distanceKm} KM)
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#2563EB]">
                  {vehicle.toUpperCase()}
                </span>
              </div>

              {/* Interactive Vector Map Preview */}
              <InteractiveMap
                currentLat={-6.8185}
                currentLng={39.2745}
                heading={335}
                speedKmh={34}
                vehicleType={vehicle}
                driverName="Juma Bakari Mwambungu"
                driverPlate="MC 492 BDC"
                pickupName={pickupAddress}
                dropoffName={dropoffAddress}
                status="ready_for_delivery"
                isTrackingActive={true}
              />
            </div>

            {/* Security Guarantee Notice */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-emerald-950 block mb-0.5">
                  Uhakikisho wa Usalama wa Mzigo (Escrow Protection)
                </span>
                Malipo yako yanashikiliwa salama hadi dereva athibitishe kukabidhi mzigo kwa mpokeaji. Dereva na chombo chake wamethibitishwa na LATRA.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Live Tracking Console */}
      {customerViewTab === 'active_tracking' && selectedTrackOrder && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Live Dispatch Stream
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30">
                  {selectedTrackOrder.currentStatus.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[#14213D] mt-1 font-mono">
                {selectedTrackOrder.trackingNumber}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {selectedTrackOrder.pickupAddress} → {selectedTrackOrder.dropoffAddress}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewingReceiptOrder(selectedTrackOrder)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#14213D] text-xs font-bold transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{lang === 'sw' ? 'Tazama Risiti' : 'View Receipt'}</span>
              </button>
            </div>
          </div>

          <InteractiveMap
            currentLat={-6.8185}
            currentLng={39.2745}
            heading={335}
            speedKmh={34}
            vehicleType={selectedTrackOrder.vehicleCategory}
            driverName={selectedTrackOrder.assignedDriverName || 'Juma Bakari Mwambungu'}
            driverPlate={selectedTrackOrder.assignedDriverPlate || 'MC 492 BDC'}
            pickupName={selectedTrackOrder.pickupAddress}
            dropoffName={selectedTrackOrder.dropoffAddress}
            status={selectedTrackOrder.currentStatus}
            isTrackingActive={true}
          />

          {/* Status Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-[#14213D]">
              {lang === 'sw' ? 'Hatua za Usafirishaji Zilizokamilika' : 'Shipment Milestones'}
            </h4>
            <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
              {selectedTrackOrder.statusEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#2563EB] border-2 border-white shadow-sm" />
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>{lang === 'sw' ? evt.titleSw : evt.titleEn}</span>
                    <span className="font-mono text-slate-400 font-normal">{evt.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {lang === 'sw' ? evt.descriptionSw : evt.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View 3: Order History & Receipts */}
      {customerViewTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-[#14213D] uppercase">
              {lang === 'sw' ? 'Historia ya Oda Zako na Risiti' : 'Booking History & Verified Receipts'}
            </span>
            <span className="text-slate-500 font-mono">{orders.length} Deliveries</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#14213D] text-sm">{ord.trackingNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#2563EB] uppercase">
                      {ord.vehicleCategory}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#16A34A] uppercase">
                      {ord.paymentStatus}
                    </span>
                  </div>
                  <div className="text-slate-700">
                    {ord.pickupAddress.split(',')[0]} → {ord.dropoffAddress.split(',')[0]}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Cargo: {ord.packageDescription} · Weight: {ord.weightKg}kg · Ref: {ord.paymentReference || 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-extrabold text-[#14213D] font-mono tabular-nums text-sm">
                      TZS {ord.quotedAmountTzs.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">{ord.createdAt.slice(0, 10)}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingReceiptOrder(ord)}
                    className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#14213D] font-bold transition flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Risiti</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 4: Customer Support */}
      {customerViewTab === 'support' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl space-y-4">
          <h3 className="text-base font-extrabold text-[#14213D]">
            {lang === 'sw' ? 'Kituo cha Msaada na Huduma kwa Wateja' : 'Customer Support & Resolution Hub'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unahitaji usaidizi kuhusu safari yako au kurejeshewa fedha? Wasiliana na timu yetu ya huduma kwa wateja masaa 24/7.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <Phone className="w-4 h-4 text-[#2563EB]" />
              <div className="font-bold text-slate-900">Toll-Free Call Center</div>
              <div className="text-slate-500 font-mono">+255 800 750 000</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <div className="font-bold text-slate-900">Dispute & Claims</div>
              <div className="text-slate-500">support@swiftdrop.co.tz</div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Checkout Modal with M-Pesa USSD Push Simulation (Section 7.11) */}
      {activePaymentOrder && (
        <div className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden font-sans">
            <div className="p-5 bg-[#14213D] text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold">{t.booking.paymentMethod}</h3>
                <p className="text-xs text-slate-300">
                  Oda: {activePaymentOrder.trackingNumber} · TZS {activePaymentOrder.quotedAmountTzs.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePaymentOrder(null)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  {lang === 'sw' ? 'Chagua Njia ya Malipo (Tanzania)' : 'Select Provider'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('mpesa_direct')}
                    className={`p-3 rounded-xl border-2 text-left font-bold transition ${
                      selectedProvider === 'mpesa_direct'
                        ? 'border-[#16A34A] bg-emerald-50 text-emerald-950 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>Vodacom M-Pesa</div>
                    <div className="text-[10px] font-normal text-slate-500">USSD Direct Push</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProvider('azampay')}
                    className={`p-3 rounded-xl border-2 text-left font-bold transition ${
                      selectedProvider === 'azampay'
                        ? 'border-[#2563EB] bg-blue-50 text-blue-950 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>AzamPay Aggregator</div>
                    <div className="text-[10px] font-normal text-slate-500">Airtel / Tigo / Halo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProvider('selcom')}
                    className={`p-3 rounded-xl border-2 text-left font-bold transition ${
                      selectedProvider === 'selcom'
                        ? 'border-[#7C3AED] bg-purple-50 text-purple-950 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>Selcom Pay</div>
                    <div className="text-[10px] font-normal text-slate-500">C2B Till / Cards</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedProvider('bank_card')}
                    className={`p-3 rounded-xl border-2 text-left font-bold transition ${
                      selectedProvider === 'bank_card'
                        ? 'border-[#FF7A00] bg-orange-50 text-orange-950 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>CRDB / NMB Card</div>
                    <div className="text-[10px] font-normal text-slate-500">Visa / Mastercard</div>
                  </button>
                </div>
              </div>

              {/* Phone Prompt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.booking.phonePrompt}</label>
                <input
                  type="tel"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900"
                />
              </div>

              {/* USSD Simulation Display */}
              {ussdPromptVisible && (
                <div className="p-4 bg-slate-900 text-white rounded-xl font-mono text-xs border border-[#16A34A]/50 space-y-2 animate-pulse">
                  <div className="text-[#16A34A] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span>[USSD PUSH PROMPT ON 255{paymentPhone.replace(/^0/, '')}]</span>
                  </div>
                  <div className="text-slate-300">
                    Lipa TZS {activePaymentOrder.quotedAmountTzs.toLocaleString()} kwenda SWIFTDROP TRANSPORT (Kumb: {activePaymentOrder.trackingNumber}).
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Inathibitisha muamala na benki kuu ya Tanzania (BOT) na kuandika kitabu kikuu...
                  </div>
                </div>
              )}

              {paymentSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>{paymentSuccessMsg}</span>
                </div>
              )}

              {/* Primary Action in Vibrant Orange */}
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleTriggerPayment}
                className="w-full py-3.5 bg-[#FF7A00] hover:bg-[#E66E00] text-white font-extrabold rounded-xl shadow-lg transition-all text-xs cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? 'Inachakata...' : t.booking.simulatePay}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal (Section 7.6) */}
      {viewingReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-[#14213D]/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden font-sans">
            <div className="p-5 bg-[#14213D] text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold">
                  {lang === 'sw' ? 'Risiti Rasmi ya Usafirishaji' : 'Official Delivery Receipt'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">Ref: {viewingReceiptOrder.trackingNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceiptOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center py-2 border-b border-slate-200">
                <div className="text-lg font-black text-[#14213D]">SWIFTDROP TRANSPORT LTD</div>
                <div className="text-slate-500 text-[11px]">TRA TIN: 112-984-721 · LATRA Carrier Certified</div>
                <div className="text-slate-400 text-[10px] mt-0.5">Dar es Salaam, Tanzania</div>
              </div>

              <div className="space-y-1.5 py-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tarehe / Date:</span>
                  <span className="font-bold text-slate-800">{viewingReceiptOrder.createdAt.slice(0, 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mteja / Customer:</span>
                  <span className="font-bold text-slate-800">{viewingReceiptOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chombo / Vehicle:</span>
                  <span className="font-bold uppercase text-slate-800">{viewingReceiptOrder.vehicleCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kutoka / Origin:</span>
                  <span className="font-medium text-slate-800">{viewingReceiptOrder.pickupAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kwenda / Destination:</span>
                  <span className="font-medium text-slate-800">{viewingReceiptOrder.dropoffAddress}</span>
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-3 space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Delivery Fare:</span>
                  <span>TZS {viewingReceiptOrder.quotedAmountTzs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Platform Commission (10%):</span>
                  <span>TZS {viewingReceiptOrder.platformCommissionTzs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Partner Net Allocation:</span>
                  <span>TZS {viewingReceiptOrder.netPartnerAmountTzs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#14213D] pt-1">
                  <span>TOTAL PAID:</span>
                  <span>TZS {viewingReceiptOrder.quotedAmountTzs.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center justify-between">
                <span>Payment Confirmed via Mobile Money</span>
                <span className="font-mono">{viewingReceiptOrder.paymentReference || 'TZ-MPES-8921004'}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingReceiptOrder(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
              >
                Funga / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
