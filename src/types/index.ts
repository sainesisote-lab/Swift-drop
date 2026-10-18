export type UserRole =
  | 'super_admin'
  | 'company_admin'
  | 'dispatcher'
  | 'accountant'
  | 'driver'
  | 'customer';

export type AccountType =
  | 'customer'
  | 'transport_company'
  | 'motorcycle'
  | 'bajaji'
  | 'car_van'
  | 'truck';

export type VehicleCategory = 'motorcycle' | 'bajaji' | 'car_van' | 'truck';

export type VerificationStatus =
  | 'not_started'
  | 'pending_verification'
  | 'manual_review'
  | 'verified'
  | 'rejected'
  | 'suspended';

export type ShipmentStatus =
  | 'created'
  | 'booked'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'arrived_at_destination'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'exception';

export type PaymentStatus =
  | 'pending'
  | 'successful'
  | 'failed'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded'
  | 'settlement_pending'
  | 'settled';

export type PaymentProvider = 'azampay' | 'selcom' | 'mpesa_direct' | 'bank_card';

export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  preferredLanguage: 'sw' | 'en';
  companyId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface TransportCompany {
  id: string;
  legalName: string;
  tradingName: string;
  registrationNumber: string; // BRELA
  taxIdentificationNumber: string; // TRA TIN
  contactEmail: string;
  contactPhone: string;
  headquarters: string;
  branches: string[];
  logoUrl?: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  carrierPermitNumber?: string; // LATRA
  isActive: boolean;
  totalFleetCount: number;
  rating: number;
  totalTripsCompleted: number;
  payableBalanceTzs: number;
}

export interface DriverProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  vehicleCategory: VehicleCategory;
  plateNumber: string;
  drivingLicence: string;
  nidaNumber: string;
  companyId?: string; // If null, freelance independent driver
  companyName?: string;
  verificationStatus: VerificationStatus;
  livenessScore?: number;
  isOnline: boolean;
  isAvailable: boolean;
  currentLat: number;
  currentLng: number;
  currentHeading: number;
  currentSpeedKmh: number;
  rating: number;
  totalTrips: number;
  walletBalanceTzs: number;
  settlementType: 'mpesa' | 'tigopesa' | 'airtelmoney' | 'bank';
  settlementAccount: string;
}

export interface DeliveryOrder {
  id: string;
  trackingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  companyId?: string;
  companyName?: string;
  serviceType: 'last_mile_on_demand' | 'long_distance_cargo';
  vehicleCategory: VehicleCategory;
  
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupContact: string;
  pickupPhone: string;
  
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffContact: string;
  dropoffPhone: string;
  
  packageDescription: string;
  weightKg: number;
  dimensionsCm?: { length: number; width: number; height: number };
  declaredValueTzs?: number;
  specialInstructions?: string;
  
  distanceKm: number;
  quotedAmountTzs: number;
  platformCommissionRate: number; // e.g. 0.10 (10%)
  platformCommissionTzs: number;
  netPartnerAmountTzs: number;
  
  currentStatus: ShipmentStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paymentProvider?: PaymentProvider;
  
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  assignedDriverPlate?: string;
  
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
  statusEvents: ShipmentEvent[];
}

export interface ShipmentEvent {
  id: string;
  orderId: string;
  status: ShipmentStatus;
  titleEn: string;
  titleSw: string;
  descriptionEn: string;
  descriptionSw: string;
  timestamp: string;
  location?: string;
}

export interface LedgerEntry {
  id: string;
  transactionGroupId: string;
  paymentId?: string;
  timestamp: string;
  accountCode: string;
  accountName: string;
  debitTzs: number;
  creditTzs: number;
  memo: string;
  reconciled: boolean;
}

export interface ChartOfAccount {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  description: string;
  currentBalanceTzs: number;
}

export interface PlatformSettings {
  commissionRate: number; // e.g. 0.10
  minCommissionTzs: number;
  taxVatRate: number; // e.g. 0.18 (TRA VAT)
  sandboxMode: boolean;
  requireBiometricVerification: boolean;
  disputeGracePeriodHours: number;
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetEntity: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}
