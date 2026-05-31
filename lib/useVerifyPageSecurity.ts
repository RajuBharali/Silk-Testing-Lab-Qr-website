/**
 * Security hook for verify page
 */

import { useEffect, useState } from 'react';
import {
  validateQrId,
  checkRateLimit,
  detectSuspiciousActivity,
  createRequestSignature,
  getSecurityConfig,
} from '@/lib/security';

export interface SecurityCheckResult {
  passed: boolean;
  rateLimitOk: boolean;
  qrIdValid: boolean;
  notSuspicious: boolean;
  message?: string;
  signature?: string;
  rateLimitRemaining?: number;
}

/**
 * Hook to perform security checks on verification request
 */
export const useVerifyPageSecurity = (
  qrId: string | null,
  enabled: boolean = true
): SecurityCheckResult & { loading: boolean } => {
  const [result, setResult] = useState<SecurityCheckResult & { loading: boolean }>({
    passed: true,
    rateLimitOk: true,
    qrIdValid: true,
    notSuspicious: true,
    loading: false,
  });

  useEffect(() => {
    if (!enabled || !qrId) return;

    const performSecurityChecks = async () => {
      setResult((prev) => ({ ...prev, loading: true }));

      try {
        const config = getSecurityConfig();
        let passed = true;
        const messages: string[] = [];

        // 1. Check rate limiting
        const rateLimitCheck = checkRateLimit();
        if (!rateLimitCheck.allowed) {
          passed = false;
          messages.push(rateLimitCheck.reason || 'Rate limit exceeded');
        }

        // 2. Validate QR ID format
        const qrValidation = validateQrId(qrId);
        if (!qrValidation.valid) {
          passed = false;
          messages.push(qrValidation.reason || 'Invalid QR ID');
        }

        // 3. Detect suspicious patterns
        let suspiciousCheck: { suspicious: boolean; score: number; reasons: string[] } = { suspicious: false, score: 0, reasons: [] };
        if (qrValidation.valid) {
          suspiciousCheck = detectSuspiciousActivity({
            qrId,
            referer: typeof document !== 'undefined' ? document.referrer : undefined,
          });

          if (suspiciousCheck.suspicious && config.blockSuspiciousRequests) {
            passed = false;
            messages.push('Suspicious activity detected: ' + suspiciousCheck.reasons.join(', '));
          }
        }

        // 4. Create request signature
        const signature = qrValidation.valid ? createRequestSignature(qrId) : undefined;

        // Log security check details (for debugging)
        if (config.enableStrictMode && suspiciousCheck.score > 0) {
          console.warn('[Security] Suspicious activity detected:', {
            qrId,
            score: suspiciousCheck.score,
            reasons: suspiciousCheck.reasons,
          });
        }

        setResult({
          passed,
          rateLimitOk: rateLimitCheck.allowed,
          qrIdValid: qrValidation.valid,
          notSuspicious: !suspiciousCheck.suspicious,
          message: messages.length > 0 ? messages.join(' | ') : undefined,
          signature,
          rateLimitRemaining: rateLimitCheck.remaining,
          loading: false,
        });
      } catch (error) {
        console.error('Security check failed:', error);
        setResult({
          passed: false,
          rateLimitOk: false,
          qrIdValid: false,
          notSuspicious: false,
          message: 'Security validation error',
          loading: false,
        });
      }
    };

    performSecurityChecks();
  }, [qrId, enabled]);

  return result;
};

/**
 * Hook to add security headers to API requests
 */
export const getSecureHeaders = () => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // 'X-Requested-With': 'XMLHttpRequest', // Commented out to prevent CORS preflight blockage
  };

  const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'admin_key_2026_sualkuchitat_xK9pL2mN_admin';
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  // Add timestamp for request freshness check
  // headers['X-Request-Time'] = Math.floor(Date.now() / 1000).toString(); // Commented out to prevent CORS preflight blockage

  // Add browser fingerprint (not a real fingerprint, just for bot detection)
  // headers['X-Client-Signature'] = createRequestSignature('api-call'); // Commented out to prevent CORS preflight blockage

  return headers;
};
