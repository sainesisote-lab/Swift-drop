import { ChartOfAccount, LedgerEntry } from '../types';

export const DEFAULT_CHART_OF_ACCOUNTS: ChartOfAccount[] = [
  {
    code: '1010',
    name: 'AzamPay/Selcom Clearing Receivable',
    type: 'asset',
    description: 'In-transit collections from Tanzanian MNO gateways (M-Pesa, TigoPesa, Airtel)',
    currentBalanceTzs: 4850000,
  },
  {
    code: '1020',
    name: 'SwiftDrop Operating Bank Account',
    type: 'asset',
    description: 'CRDB & NMB Primary Treasury Operating Balance',
    currentBalanceTzs: 18450000,
  },
  {
    code: '2010',
    name: 'Transport Carrier Accounts Payable',
    type: 'liability',
    description: 'Net freight earnings owed to registered intercity companies (Tahmeed, Shabiby, etc.)',
    currentBalanceTzs: 12200000,
  },
  {
    code: '2020',
    name: 'Independent Driver Accounts Payable',
    type: 'liability',
    description: 'Net earnings owed to freelance bodaboda and bajaji delivery riders',
    currentBalanceTzs: 3850000,
  },
  {
    code: '2030',
    name: 'Customer Refund Escrow',
    type: 'liability',
    description: 'Held customer deposits pending delivery completion or cancellation refund',
    currentBalanceTzs: 450000,
  },
  {
    code: '4010',
    name: 'SwiftDrop Platform Commission Revenue',
    type: 'revenue',
    description: 'Mandatory 10% platform facilitation fee recognized upon successful delivery',
    currentBalanceTzs: 7150000,
  },
  {
    code: '5010',
    name: 'Payment Gateway Processing Expenses',
    type: 'expense',
    description: 'Aggregator transaction fee costs (1.5% - 2.5% MNO network cost)',
    currentBalanceTzs: 360000,
  },
];

/**
 * Creates balanced double-entry ledger entries for an order payment.
 * 
 * Invariant: Sum(Debits) === Sum(Credits)
 */
export function recordOrderPaymentInLedger(
  paymentId: string,
  grossAmountTzs: number,
  platformCommissionTzs: number,
  gatewayFeeTzs: number,
  partnerType: 'company' | 'driver',
  orderTrackingNumber: string
): LedgerEntry[] {
  const transactionGroupId = `GRP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  const netPartnerPayable = grossAmountTzs - platformCommissionTzs;
  const partnerAccountCode = partnerType === 'company' ? '2010' : '2020';
  const partnerAccountName = partnerType === 'company' ? 'Carrier Accounts Payable' : 'Independent Driver Accounts Payable';

  const entries: LedgerEntry[] = [
    // 1. DEBIT: Gateway clearing owes gross payment
    {
      id: `LE-${Date.now()}-1`,
      transactionGroupId,
      paymentId,
      timestamp: now,
      accountCode: '1010',
      accountName: 'AzamPay/Selcom Clearing Receivable',
      debitTzs: grossAmountTzs,
      creditTzs: 0,
      memo: `Gross collection for Order ${orderTrackingNumber} via Mobile Money`,
      reconciled: true,
    },
    // 2. CREDIT: Platform recognizes 10% commission revenue
    {
      id: `LE-${Date.now()}-2`,
      transactionGroupId,
      paymentId,
      timestamp: now,
      accountCode: '4010',
      accountName: 'SwiftDrop Platform Commission Revenue',
      debitTzs: 0,
      creditTzs: platformCommissionTzs,
      memo: `10% Platform facilitation commission recognized`,
      reconciled: true,
    },
    // 3. CREDIT: Liability owed to driver/company
    {
      id: `LE-${Date.now()}-3`,
      transactionGroupId,
      paymentId,
      timestamp: now,
      accountCode: partnerAccountCode,
      accountName: partnerAccountName,
      debitTzs: 0,
      creditTzs: netPartnerPayable,
      memo: `Net payable allocated to ${partnerType} account`,
      reconciled: true,
    },
    // 4. DEBIT: Gateway network fee expense
    {
      id: `LE-${Date.now()}-4`,
      transactionGroupId,
      paymentId,
      timestamp: now,
      accountCode: '5010',
      accountName: 'Payment Gateway Processing Expenses',
      debitTzs: gatewayFeeTzs,
      creditTzs: 0,
      memo: `MNO network processing fee (AzamPay/Selcom)`,
      reconciled: true,
    },
    // 5. CREDIT: Deduct network fee from gateway clearing asset
    {
      id: `LE-${Date.now()}-5`,
      transactionGroupId,
      paymentId,
      timestamp: now,
      accountCode: '1010',
      accountName: 'AzamPay/Selcom Clearing Receivable',
      debitTzs: 0,
      creditTzs: gatewayFeeTzs,
      memo: `Network surcharge withheld at settlement gateway`,
      reconciled: true,
    },
  ];

  // Invariant verification check
  const totalDebits = entries.reduce((s, e) => s + e.debitTzs, 0);
  const totalCredits = entries.reduce((s, e) => s + e.creditTzs, 0);

  if (totalDebits !== totalCredits) {
    throw new Error(
      `Ledger unbalance detected: Total Debits (${totalDebits}) != Total Credits (${totalCredits})`
    );
  }

  return entries;
}

/**
 * Exports ledger rows to clean formatted CSV string for download.
 */
export function exportLedgerToCSV(entries: LedgerEntry[]): string {
  const headers = ['Entry ID', 'Timestamp', 'Account Code', 'Account Name', 'Debit (TZS)', 'Credit (TZS)', 'Memo', 'Reconciled'];
  const rows = entries.map((e) => [
    e.id,
    e.timestamp,
    e.accountCode,
    `"${e.accountName}"`,
    e.debitTzs,
    e.creditTzs,
    `"${e.memo.replace(/"/g, '""')}"`,
    e.reconciled ? 'YES' : 'NO',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
