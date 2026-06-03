/**
 * Security utilities for bot protection and request validation
 */

export interface SecurityConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  suspiciousPatternThreshold: number;
  enableStrictMode: boolean;
  blockSuspiciousRequests: boolean;
}

export interface RequestMetadata {
  timestamp: number;
  userAgent: string;
  referer: string;
  ipHash: string;
  requestCount: number;
}

// Storage key for tracking requests
const STORAGE_KEY = '__verify_page_security_';
const STORAGE_VERSION = 'v1_';

/**
 * Security configuration based on environment
 */
export const getSecurityConfig = (): SecurityConfig => {
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  return {
    maxRequestsPerMinute: isDevelopment ? 30 : 5, // 5 requests per minute in production
    maxRequestsPerHour: isDevelopment ? 300 : 50, // 50 requests per hour in production
    suspiciousPatternThreshold: 3,
    enableStrictMode: !isDevelopment, // Strict mode in production
    blockSuspiciousRequests: !isDevelopment, // Block in production
  };
};

/**
 * Validate QR ID format - must be alphanumeric with optional underscores/hyphens
 */
export const validateQrId = (qrId: string): { valid: boolean; reason?: string } => {
  if (!qrId) {
    return { valid: false, reason: 'QR ID is empty' };
  }

  // Remove whitespace
  const trimmed = qrId.trim();

  // Length check: should be between 3 and 50 characters
  if (trimmed.length < 3 || trimmed.length > 50) {
    return { valid: false, reason: 'Invalid QR ID length' };
  }

  // Allow alphanumeric, underscores, hyphens, and demo/preview keywords
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(trimmed)) {
    return { valid: false, reason: 'QR ID contains invalid characters' };
  }

  // Check for suspicious patterns (SQL injection, script injection attempts)
  const suspiciousPatterns = [
    /['";]/,  // Quotes or semicolons
    /(<|>|=|--|\|\|)/,  // Script/SQL patterns
    /(union|select|insert|delete|drop|exec|script)/i,  // SQL/Script keywords
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, reason: 'Suspicious characters detected' };
    }
  }

  return { valid: true };
};

/**
 * Validate URL token format - must start with pt- and contain only alphanumeric, underscores, hyphens
 */
export const validateUrlToken = (urlToken: string): { valid: boolean; reason?: string } => {
  if (!urlToken) {
    return { valid: false, reason: 'URL token is empty' };
  }

  const trimmed = urlToken.trim();

  // Length check: should be between 5 and 100 characters
  if (trimmed.length < 5 || trimmed.length > 100) {
    return { valid: false, reason: 'Invalid URL token length' };
  }

  // Must start with pt-
  if (!trimmed.startsWith('pt-')) {
    return { valid: false, reason: 'Invalid URL token prefix' };
  }

  // Allow alphanumeric, underscores, and hyphens after the pt- prefix
  const validPattern = /^pt-[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(trimmed)) {
    return { valid: false, reason: 'URL token contains invalid characters' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /['";]/,  // Quotes or semicolons
    /(<|>|=|--|\|\|)/,  // Script/SQL patterns
    /(union|select|insert|delete|drop|exec|script)/i,  // SQL/Script keywords
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, reason: 'Suspicious characters detected' };
    }
  }

  return { valid: true };
};

/**
 * Generate a simple hash of user/device identifier for rate limiting
 */
export const generateDeviceHash = (): string => {
  try {
    if (typeof window === 'undefined') return 'server';

    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width,
      screen.height,
      navigator.hardwareConcurrency || 'unknown',
    ];

    const hash = components.join('|')
      .split('')
      .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);

    return Math.abs(hash).toString(36).substring(0, 16);
  } catch (e) {
    return 'unknown';
  }
};

/**
 * Get request history from localStorage
 */
const getRequestHistory = (): RequestMetadata[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY + STORAGE_VERSION);
    if (!stored) return [];

    const history = JSON.parse(stored) as RequestMetadata[];
    const now = Date.now();

    // Keep only requests from last 1 hour
    return history.filter((req) => now - req.timestamp < 3600000);
  } catch (e) {
    console.error('Failed to retrieve request history:', e);
    return [];
  }
};

/**
 * Save request to history
 */
const saveRequestHistory = (history: RequestMetadata[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY + STORAGE_VERSION, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save request history:', e);
  }
};

/**
 * Check rate limits and return rate limit status
 */
export const checkRateLimit = (): {
  allowed: boolean;
  reason?: string;
  remaining: number;
  resetTime?: number;
} => {
  const config = getSecurityConfig();
  const deviceHash = generateDeviceHash();
  const now = Date.now();

  // Get existing history
  let history = getRequestHistory();

  // Filter for current device
  history = history.filter((req) => req.ipHash === deviceHash);

  // Count requests in last minute and hour
  const oneMinuteAgo = now - 60000;
  const oneHourAgo = now - 3600000;

  const requestsLastMinute = history.filter((req) => req.timestamp > oneMinuteAgo).length;
  const requestsLastHour = history.filter((req) => req.timestamp > oneHourAgo).length;

  // Check limits
  if (requestsLastMinute >= config.maxRequestsPerMinute) {
    const resetTime = Math.min(...history.filter((req) => req.timestamp > oneMinuteAgo).map((req) => req.timestamp)) + 60000;
    return {
      allowed: false,
      reason: 'Too many requests. Please try again in a minute.',
      remaining: 0,
      resetTime,
    };
  }

  if (requestsLastHour >= config.maxRequestsPerHour) {
    const resetTime = Math.min(...history.filter((req) => req.timestamp > oneHourAgo).map((req) => req.timestamp)) + 3600000;
    return {
      allowed: false,
      reason: 'Hourly request limit exceeded. Please try again later.',
      remaining: 0,
      resetTime,
    };
  }

  // Add new request to history
  const newRequest: RequestMetadata = {
    timestamp: now,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    referer: typeof document !== 'undefined' ? document.referrer : 'unknown',
    ipHash: deviceHash,
    requestCount: requestsLastMinute + 1,
  };

  history.push(newRequest);
  saveRequestHistory(history);

  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequestsPerMinute - (requestsLastMinute + 1)),
  };
};

/**
 * Detect suspicious request patterns
 */
export const detectSuspiciousActivity = (params: {
  qrId?: string;
  url?: string;
  referer?: string;
  rapidRequests?: boolean;
}): { suspicious: boolean; score: number; reasons: string[] } => {
  let score = 0;
  const reasons: string[] = [];

  // Check for unusual QR ID patterns
  if (params.qrId) {
    // All uppercase or all lowercase with numbers (bot-like)
    if (/^[A-Z0-9]+$/.test(params.qrId) || /^[a-z0-9]+$/.test(params.qrId)) {
      score += 1;
      reasons.push('Unusual QR ID pattern detected');
    }

    // Extremely long QR ID
    if (params.qrId.length > 30) {
      score += 2;
      reasons.push('QR ID exceeds normal length');
    }

    // Common bot QR patterns
    if (/^(test|bot|admin|root|demo[\d]+)$/i.test(params.qrId)) {
      score += 1;
      reasons.push('Known bot pattern detected');
    }
  }

  // Check for unusual URL token patterns
  if (params.url) {
    // Extremely long URL token
    if (params.url.length > 80) {
      score += 2;
      reasons.push('URL token exceeds normal length');
    }

    // Common bot URL patterns
    if (/^(test|bot|admin|root|demo[\d]+)$/i.test(params.url)) {
      score += 1;
      reasons.push('Known bot pattern detected');
    }
  }

  // Check referer
  if (params.referer) {
    // Empty or missing referer can indicate automation
    if (!params.referer) {
      score += 1;
      reasons.push('Missing referer header');
    }

    // Known automation/bot services
    if (/(headless|phantom|selenium|puppeteer|scrapy|curl|wget)/i.test(params.referer)) {
      score += 3;
      reasons.push('Known bot tool detected');
    }
  }

  // Rapid consecutive requests
  if (params.rapidRequests) {
    score += 2;
    reasons.push('Rapid request pattern detected');
  }

  const config = getSecurityConfig();
  return {
    suspicious: score >= config.suspiciousPatternThreshold,
    score,
    reasons,
  };
};

/**
 * Create a request signature for verification (can be used with backend)
 */
export const createRequestSignature = (qrId: string): string => {
  const timestamp = Math.floor(Date.now() / 1000);
  const components = [qrId, timestamp, generateDeviceHash()];

  try {
    // Simple hash function (in production, use proper cryptographic hashing)
    const data = components.join('|');
    let hash = 0;

    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36) + '_' + timestamp;
  } catch (e) {
    return '';
  }
};

/**
 * Validate Content Security Policy headers
 */
export const validateRequestHeaders = (): {
  valid: boolean;
  issues: string[];
} => {
  if (typeof window === 'undefined') return { valid: true, issues: [] };

  const issues: string[] = [];

  // Check for common security headers
  try {
    const config = getSecurityConfig();

    if (config.enableStrictMode) {
      // In strict mode, check various browser security indicators
      if (typeof document !== 'undefined') {
        const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!meta) {
          issues.push('Content-Security-Policy header not found');
        }
      }
    }
  } catch (e) {
    // Silently continue
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};

/**
 * Clear request history (for testing or manual cleanup)
 */
export const clearRequestHistory = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY + STORAGE_VERSION);
    } catch (e) {
      console.error('Failed to clear request history:', e);
    }
  }
};
