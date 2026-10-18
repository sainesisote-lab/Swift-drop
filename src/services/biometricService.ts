import { VerificationStatus } from '../types';

export interface DocumentUploadPayload {
  documentType: 'nida_card' | 'voter_id' | 'driving_licence' | 'brela_certificate' | 'latra_permit';
  idNumber: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
}

export interface VerificationAuditRecord {
  id: string;
  documentType: string;
  idNumberHash: string;
  livenessScore: number;
  faceMatchScore: number;
  isSimulated: boolean;
  status: VerificationStatus;
  timestamp: string;
  complianceNotice: string;
}

/**
 * Calculates SHA-256 digest to prevent duplicate document submissions without storing raw IDs in logs.
 */
export async function computeDocumentHash(idNumber: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(idNumber.trim().toUpperCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Executes a simulated liveness test.
 * Clearly flags result as sandbox simulation until official Tanzanian e-KYC/NIDA API is bridged.
 */
export async function performLivenessCheck(): Promise<{
  passed: boolean;
  score: number;
  feedback: string;
  isSimulated: boolean;
}> {
  // Simulate active biometric scan
  await new Promise((r) => setTimeout(r, 1500));
  const score = 0.965; // 96.5% confidence in non-spoofed 3D human face

  return {
    passed: true,
    score,
    feedback: 'Liveness test passed: 3D facial motion and anti-spoof verified (Sandbox Mode).',
    isSimulated: true,
  };
}

/**
 * Registers device WebAuthn / Passkey for rapid driver authentication.
 */
export async function checkDeviceBiometricsSupport(): Promise<boolean> {
  if (typeof window !== 'undefined' && window.PublicKeyCredential) {
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }
  return false;
}
