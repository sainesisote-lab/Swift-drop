import { VehicleCategory } from '../types';

export interface PricingRule {
  vehicleCategory: VehicleCategory;
  name: string;
  nameSw: string;
  baseFareTzs: number;
  perKmRateTzs: number;
  minFareTzs: number;
  perKgSurchargeTzs: number;
  perMinuteWaitingTzs: number;
  maxWeightKg: number;
  maxCbm: number;
  icon: string;
}

export interface QuoteInput {
  vehicleCategory: VehicleCategory;
  distanceKm: number;
  weightKg: number;
  waitingMinutes?: number;
  customPlatformCommissionRate?: number; // Defaults to 0.10 (10%)
}

export interface CalculatedQuote {
  vehicleCategory: VehicleCategory;
  distanceKm: number;
  weightKg: number;
  baseFareTzs: number;
  distanceChargeTzs: number;
  weightSurchargeTzs: number;
  waitingChargeTzs: number;
  grossAmountTzs: number;
  platformCommissionRate: number;
  platformCommissionTzs: number;
  netPartnerEarningsTzs: number;
  immutableSnapshotHash: string;
}

export const ACTIVE_PRICING_RULES: Record<VehicleCategory, PricingRule> = {
  motorcycle: {
    vehicleCategory: 'motorcycle',
    name: 'Motorcycle (Bodaboda)',
    nameSw: 'Pikipiki (Bodaboda)',
    baseFareTzs: 2000,
    perKmRateTzs: 600,
    minFareTzs: 2500,
    perKgSurchargeTzs: 20,
    perMinuteWaitingTzs: 50,
    maxWeightKg: 30,
    maxCbm: 0.1,
    icon: '🛵',
  },
  bajaji: {
    vehicleCategory: 'bajaji',
    name: 'Tricycle (Bajaji)',
    nameSw: 'Bajaji ya Mizigo',
    baseFareTzs: 3500,
    perKmRateTzs: 850,
    minFareTzs: 4000,
    perKgSurchargeTzs: 30,
    perMinuteWaitingTzs: 70,
    maxWeightKg: 150,
    maxCbm: 0.8,
    icon: '🛺',
  },
  car_van: {
    vehicleCategory: 'car_van',
    name: 'Kirikuu / Cargo Van',
    nameSw: 'Kirikuu / Gari Ndogo',
    baseFareTzs: 8000,
    perKmRateTzs: 1500,
    minFareTzs: 10000,
    perKgSurchargeTzs: 50,
    perMinuteWaitingTzs: 150,
    maxWeightKg: 800,
    maxCbm: 4.5,
    icon: '🚐',
  },
  truck: {
    vehicleCategory: 'truck',
    name: 'Heavy Freight Hauler',
    nameSw: 'Lori Kubwa la Mizigo',
    baseFareTzs: 25000,
    perKmRateTzs: 3500,
    minFareTzs: 35000,
    perKgSurchargeTzs: 80,
    perMinuteWaitingTzs: 300,
    maxWeightKg: 30000,
    maxCbm: 75.0,
    icon: '🚛',
  },
};

/**
 * Calculates a verified, immutable pricing quote on the server.
 */
export function calculateQuote(
  rule: PricingRule,
  input: QuoteInput
): CalculatedQuote {
  if (input.weightKg > rule.maxWeightKg) {
    throw new Error(
      `Package weight (${input.weightKg}kg) exceeds vehicle safety threshold for ${rule.name} (Max: ${rule.maxWeightKg}kg)`
    );
  }

  const safeDistance = Math.max(0.5, input.distanceKm);
  const baseFare = rule.baseFareTzs;
  const distanceCharge = Math.round(safeDistance * rule.perKmRateTzs);
  const weightSurcharge = Math.round(Math.max(0, input.weightKg) * rule.perKgSurchargeTzs);
  const waitingCharge = Math.round((input.waitingMinutes || 0) * rule.perMinuteWaitingTzs);

  const rawGross = baseFare + distanceCharge + weightSurcharge + waitingCharge;
  const grossAmount = Math.max(rule.minFareTzs, rawGross);

  // Platform Commission locked at 10% (or dynamically updated by super admin)
  const commissionRate = input.customPlatformCommissionRate ?? 0.10;
  const platformCommission = Math.round(grossAmount * commissionRate);
  const netPartnerEarnings = grossAmount - platformCommission;

  // Create an SHA-like snapshot hash token
  const rawDigest = `${input.vehicleCategory}|${safeDistance}|${grossAmount}|${commissionRate}|${platformCommission}|${Date.now()}`;
  const immutableSnapshotHash = `SWIFT-HASH-${Math.abs(hashString(rawDigest)).toString(16).toUpperCase()}`;

  return {
    vehicleCategory: input.vehicleCategory,
    distanceKm: safeDistance,
    weightKg: input.weightKg,
    baseFareTzs: baseFare,
    distanceChargeTzs: distanceCharge,
    weightSurchargeTzs: weightSurcharge,
    waitingChargeTzs: waitingCharge,
    grossAmountTzs: grossAmount,
    platformCommissionRate: commissionRate,
    platformCommissionTzs: platformCommission,
    netPartnerEarningsTzs: netPartnerEarnings,
    immutableSnapshotHash,
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
