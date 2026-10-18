import { PaymentProvider } from '../types';

export interface PaymentInitiationRequest {
  orderId: string;
  trackingNumber: string;
  amountTzs: number;
  provider: PaymentProvider;
  phoneNumber: string; // e.g. 255712345678
  customerName: string;
}

export interface PaymentResult {
  success: boolean;
  transactionReference: string;
  idempotencyKey: string;
  provider: PaymentProvider;
  amountTzs: number;
  gatewayFeeTzs: number;
  message: string;
  messageSw: string;
  timestamp: string;
}

export const PAYMENT_PROVIDERS: { id: PaymentProvider; name: string; networks: string; feeRate: number }[] = [
  {
    id: 'azampay',
    name: 'AzamPay Tanzania',
    networks: 'M-Pesa, Airtel Money, TigoPesa, Halopesa',
    feeRate: 0.02, // 2.0%
  },
  {
    id: 'selcom',
    name: 'Selcom Wireless Pay',
    networks: 'Mastercard, Visa, Selcom Pay, C2B Till',
    feeRate: 0.025, // 2.5%
  },
  {
    id: 'mpesa_direct',
    name: 'Vodacom M-Pesa Direct (USSD Push)',
    networks: 'Vodacom M-Pesa Lipa Namba',
    feeRate: 0.015, // 1.5%
  },
  {
    id: 'bank_card',
    name: 'CRDB / NMB Bank Gateway',
    networks: 'Visa, Mastercard, UnionPay',
    feeRate: 0.025, // 2.5%
  },
];

// In-memory idempotency cache
const processedIdempotencyKeys = new Set<string>();

/**
 * Initiates payment with Tanzanian aggregator.
 * In Sandbox mode: simulates genuine USSD Push network response.
 */
export async function processPayment(request: PaymentInitiationRequest): Promise<PaymentResult> {
  const idempotencyKey = `IDEMP-${request.orderId}-${request.amountTzs}`;

  if (processedIdempotencyKeys.has(idempotencyKey)) {
    throw new Error('Duplicate payment attempt detected! Idempotency protection active.');
  }

  // Simulate network latency for M-Pesa USSD handshake (1.2s)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  processedIdempotencyKeys.add(idempotencyKey);

  const selectedProvider = PAYMENT_PROVIDERS.find((p) => p.id === request.provider) || PAYMENT_PROVIDERS[0];
  const gatewayFeeTzs = Math.round(request.amountTzs * selectedProvider.feeRate);
  const transactionReference = `TZ-${request.provider.toUpperCase().slice(0, 4)}-${Date.now()}`;

  return {
    success: true,
    transactionReference,
    idempotencyKey,
    provider: request.provider,
    amountTzs: request.amountTzs,
    gatewayFeeTzs,
    message: `Payment of TZS ${request.amountTzs.toLocaleString()} confirmed via ${selectedProvider.name}. Reference: ${transactionReference}`,
    messageSw: `Malipo ya TZS ${request.amountTzs.toLocaleString()} yamethibitishwa kupitia ${selectedProvider.name}. Kumbukumbu: ${transactionReference}`,
    timestamp: new Date().toISOString(),
  };
}
