/**
 * Server-Side Security Validation Example
 * 
 * ⚠️ This is a REFERENCE EXAMPLE file for backend implementation
 * ⚠️ Not intended to be used directly in production
 * ⚠️ For documentation and guidance only
 * 
 * This file shows how to implement server-side security checks
 * to complement the client-side protection in the verify page.
 * 
 * Use this as a reference for your backend implementation.
 */

// ============================================
// EXPRESS.JS / NODE.JS EXAMPLE
// ============================================

// import express from 'express';
// import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

// const app = express();

// Initialize rate limiters
// const rateLimiterByIP = new RateLimiterMemory({
//   points: 50, // Number of points
//   duration: 3600, // Per 60 seconds (per hour)
// });

// const rateLimiterByQrId = new RateLimiterMemory({
//   points: 100,
//   duration: 86400, // Per 24 hours
// });

// Signature verification middleware
const verifyRequestSignature = (req: any, res: any, next: any) => {
  const signature = req.headers['x-client-signature'];
  const requestTime = req.headers['x-request-time'];
  const qrId = req.query.qr_id;

  // Validate signature format
  if (!signature || !requestTime) {
    return res.status(401).json({
      success: false,
      message: 'Missing security headers'
    });
  }

  // Check request freshness (within 5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  const reqTime = parseInt(requestTime);

  if (isNaN(reqTime)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid request timestamp'
    });
  }

  if (Math.abs(currentTime - reqTime) > 300) {
    return res.status(401).json({
      success: false,
      message: 'Request expired - too old'
    });
  }

  // Additional signature validation can be added here
  // For example, HMAC verification with a shared secret

  next();
};

// Rate limiting middleware - by IP
const rateLimitByIP = async (req, res, next) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    await rateLimiterByIP.consume(clientIP);
    next();
  } catch (rateLimiterRes) {
    if (rateLimiterRes instanceof RateLimiterRes) {
      res.status(429).json({
        success: false,
        message: 'Too many requests from this IP',
        retryAfter: Math.round(rateLimiterRes.msBeforeNext / 1000),
      });
    } else {
      res.status(500).json({ success: false, message: 'Rate limiter error' });
    }
  }
};

// Rate limiting middleware - by QR ID
const rateLimitByQrId = async (req, res, next) => {
  try {
    const qrId = req.query.qr_id;
    if (qrId && qrId !== 'preview' && qrId !== 'demo') {
      await rateLimiterByQrId.consume(qrId);
    }
    next();
  } catch (rateLimiterRes) {
    if (rateLimiterRes instanceof RateLimiterRes) {
      res.status(429).json({
        success: false,
        message: 'This product is being verified too frequently',
        retryAfter: Math.round(rateLimiterRes.msBeforeNext / 1000),
      });
    } else {
      res.status(500).json({ success: false, message: 'Rate limiter error' });
    }
  }
};

// QR ID validation middleware
const validateQrId = (req, res, next) => {
  const qrId = req.query.qr_id;

  if (!qrId) {
    return res.status(400).json({
      success: false,
      message: 'QR ID is required'
    });
  }

  // Convert to string and trim
  const trimmedQrId = String(qrId).trim();

  // Length check
  if (trimmedQrId.length < 3 || trimmedQrId.length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Invalid QR ID length'
    });
  }

  // Format check
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(trimmedQrId)) {
    return res.status(400).json({
      success: false,
      message: 'QR ID contains invalid characters'
    });
  }

  // Check for injection attempts
  const suspiciousPatterns = [
    /['";]/,
    /(<|>|=|--|\|\|)/,
    /(union|select|insert|delete|drop|exec|script)/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedQrId)) {
      // Log the attack attempt
      console.warn(`[SECURITY] Injection attempt detected: ${trimmedQrId} from IP ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid QR ID format'
      });
    }
  }

  next();
};

// Logging middleware
const logVerificationAttempt = (req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    qrId: req.query.qr_id,
    signature: req.headers['x-client-signature']?.substring(0, 20),
  };

  console.log('[VERIFICATION]', logEntry);

  // Store in database for analytics
  // db.verificationAttempts.create(logEntry);

  next();
};

// User-Agent validation
const validateUserAgent = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';

  // Block known bot user agents
  const blockedBots = [
    'curl',
    'wget',
    'python',
    'headless',
    'phantom',
    'selenium',
    'puppeteer',
    'scrapy',
    'bot',
    'crawler',
  ];

  const lowerUserAgent = userAgent.toLowerCase();
  for (const bot of blockedBots) {
    if (lowerUserAgent.includes(bot)) {
      console.warn(`[SECURITY] Blocked request from bot: ${userAgent}`);
      return res.status(403).json({
        success: false,
        message: 'Automated requests are not allowed'
      });
    }
  }

  next();
};

// CORS validation
const validateOrigin = (req, res, next) => {
  const allowedOrigins = [
    'https://sualkuchisilktestlab.com',
    'https://qr.sualkuchisilktestlab.com',
    'http://localhost:3000', // For development
  ];

  const origin = req.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    console.warn(`[SECURITY] Request from unauthorized origin: ${origin}`);
    return res.status(403).json({
      success: false,
      message: 'Request origin not allowed'
    });
  }

  next();
};

// ============================================
// ROUTE SETUP
// ============================================

// Apply middleware in order
app.use(logVerificationAttempt);
app.use(validateOrigin);
app.use(validateUserAgent);
app.use(verifyRequestSignature);
app.use(rateLimitByIP);

// Verification endpoint
app.get('/api/testing/verify', [
  rateLimitByQrId,
  validateQrId,
], async (req, res) => {
  try {
    const qrId = String(req.query.qr_id).trim();

    // Fetch product details from database
    const product = await getProductByQrId(qrId);

    if (!product) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Product not found',
      });
    }

    // Verify product is still valid
    if (!product.isActive || product.isExpired) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Product verification expired or inactive',
      });
    }

    // Return verification data
    return res.json({
      success: true,
      verified: true,
      message: 'Product successfully verified',
      verification: {
        status: 'Valid',
        verifiedAt: new Date().toISOString(),
      },
      productDetails: product,
      // ... other product data ...
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Verification failed - server error',
    });
  }
});

// ============================================
// DATABASE HELPER FUNCTIONS
// ============================================

/**
 * Fetch product details by QR ID
 */
async function getProductByQrId(qrId) {
  // Pseudo-code - implement with your database
  // const product = await db.products.findOne({ qrCode: qrId });
  // return product;
}

/**
 * Log security events for monitoring
 */
async function logSecurityEvent(eventType, details) {
  // Pseudo-code - implement with your logging service
  // await db.securityLogs.create({
  //   type: eventType,
  //   details,
  //   timestamp: new Date(),
  // });
}

/**
 * Get abuse statistics for a QR code
 */
async function getAbuseStats(qrId, timeWindowHours = 1) {
  // Pseudo-code
  // const startTime = new Date(Date.now() - timeWindowHours * 3600000);
  // const attempts = await db.verificationAttempts.countDocuments({
  //   qrId,
  //   timestamp: { $gt: startTime },
  // });
  // return { attempts, timeWindowHours };
}

/**
 * Check if QR code is under attack
 */
async function isQrCodeUnderAttack(qrId, thresholdPerHour = 50) {
  const stats = await getAbuseStats(qrId, 1);
  return stats.attempts > thresholdPerHour;
}

// ============================================
// MONITORING & ALERTS
// ============================================

/**
 * Check for abuse patterns every 5 minutes
 */
setInterval(async () => {
  try {
    // Get all QR codes with verification attempts in last hour
    const attempts = await getRecentVerificationAttempts(3600000);

    for (const [qrId, count] of Object.entries(attempts)) {
      if (count > 100) {
        console.warn(`[ALERT] High verification attempts on QR: ${qrId} (${count} attempts)`);
        // Send email/slack alert
        // notifyAdmin(`High verification attempts on QR: ${qrId}`);
      }
    }
  } catch (error) {
    console.error('Monitoring error:', error);
  }
}, 5 * 60 * 1000);

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔒 Secure verification server running on port ${PORT}`);
});

export default app;

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

interface VerificationRequest {
  qrId: string;
  url?: string;
}

interface VerificationResponse {
  success: boolean;
  verified: boolean;
  message: string;
  verification?: {
    status: string;
    verifiedAt: string;
  };
  productDetails?: ProductData;
}

interface ProductData {
  productId: number;
  productName: string;
  productType: string;
  producerId: number;
  producerName: string;
  testDate: string;
  qrCode: string;
  // ... other fields
}

interface SecurityLog {
  timestamp: Date;
  type: 'rate_limit' | 'injection_attempt' | 'bot_detected' | 'invalid_qr' | 'verification_success';
  qrId?: string;
  ip: string;
  userAgent: string;
  details: Record<string, unknown>;
}
