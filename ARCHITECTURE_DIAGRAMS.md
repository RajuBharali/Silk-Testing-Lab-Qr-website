# Security Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  1. User scans QR code                                   │   │
│  │  2. Navigates to: /verify?qr_id=PRODUCT_123             │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬──────────────────────────────────────┘
                             │ HTTP Request
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  app/verify/page.tsx (VerifyContent)                     │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ useVerifyPageSecurity Hook                         │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬──────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    ┌────────┐          ┌────────┐          ┌──────────┐
    │ Rate   │          │ QR ID  │          │   Bot    │
    │Limit   │          │Validate│          │ Detect   │
    │Check   │          │        │          │          │
    └────────┘          └────────┘          └──────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    Pass? ───┴─── Fail?
                    │              │
                    ▼              ▼
            ┌──────────────┐   ┌──────────────┐
            │ Create Sig   │   │ Show Error   │
            │ Make API Call│   │ & Block      │
            └──────────────┘   └──────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  BACKEND API VALIDATION  │
        │  (Your backend service)  │
        └──────────────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  Database Query          │
        │  Verify QR Code          │
        │  Get Product Details     │
        └──────────────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  Return Product Data     │
        │  or Error               │
        └──────────────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │  Display Result to User  │
        │  ✅ Product Info or      │
        │  ❌ Error Message        │
        └──────────────────────────┘
```

---

## Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  REQUEST LIFECYCLE                                              │
└─────────────────────────────────────────────────────────────────┘

TIME     STAGE                    ACTION                  OUTCOME
────────────────────────────────────────────────────────────────
  0ms    User Action              Scans QR Code          Request Initiated
         
  1ms    Extract Params           QR ID from URL         Param: PROD123
         
  2ms    Rate Limit Check         Check localStorage     ✅ 4 remaining
         
  3ms    QR ID Validation         Format Check           ✅ Valid format
         
  4ms    Bot Detection            User-Agent Analysis    ✅ Not a bot
         
  5ms    Suspicious Activity      Pattern Scoring        ✅ Safe (score: 0)
         
  6ms    Create Signature         HMAC Generation        ✅ Signed
         
  7ms    Add Security Headers     X-Headers              ✅ Headers added
         
  8ms    Make API Request         Fetch to Backend       ⏳ Waiting...
         
200ms    API Response             Backend Returns Data   ✅ Product Details
         
202ms    Render UI                Display Product        ✅ User Sees Result
         
205ms    TOTAL                    Complete              ✅ Success!
```

---

## Security Layers

```
┌────────────────────────────────────────────────────────────────┐
│                    ATTACK VECTORS                              │
└────────────────────────────────────────────────────────────────┘

LAYER 1: Rate Limiting
├─ Protection: Rapid Scanning Attacks
├─ Method: Request count tracking
├─ Limit: 5 requests/minute
├─ Storage: Client localStorage
└─ Impact: ✅ Blocks bot scanners


LAYER 2: Input Validation
├─ Protection: Injection Attacks
├─ Method: Format & pattern checking
├─ Rules: Alphanumeric only, 3-50 chars
├─ Blocks: SQL, Scripts, Special chars
└─ Impact: ✅ Prevents malformed requests


LAYER 3: Bot Detection
├─ Protection: Automated Tools
├─ Method: User-Agent analysis
├─ Detects: Selenium, Puppeteer, curl, wget
├─ Threshold: Score-based (3+ blocks)
└─ Impact: ✅ Blocks known bot tools


LAYER 4: Suspicious Activity
├─ Protection: Unusual Patterns
├─ Method: Multi-factor scoring
├─ Signals: Rapid requests, odd patterns
├─ Score: Accumulative
└─ Impact: ✅ Catches custom bots


LAYER 5: Request Signing
├─ Protection: Backend Verification
├─ Method: Cryptographic signature
├─ Contains: QR ID, Timestamp, Hash
├─ Header: X-Client-Signature
└─ Impact: ✅ Future backend validation


LAYER 6: Device Fingerprinting
├─ Protection: Repeat Attacks
├─ Method: Browser property hash
├─ Data: No personal information
├─ Tracking: Cross-request consistency
└─ Impact: ✅ Blocks repeat attackers
```

---

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ app/verify/page.tsx (Client Component)                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ VerifyContent()                                            │  │
│  │  ├─ imports: useVerifyPageSecurity, getSecureHeaders      │  │
│  │  ├─ calls: useSearchParams() for qr_id                    │  │
│  │  ├─ calls: useVerifyPageSecurity() hook                   │  │
│  │  └─ shows: Error or Product Details                       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                             │
                             │ uses
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ lib/useVerifyPageSecurity.ts (React Hook)                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ useVerifyPageSecurity(qrId, enabled)                       │  │
│  │  ├─ useState: store result                                 │  │
│  │  ├─ useEffect: trigger checks                             │  │
│  │  ├─ imports: security functions                           │  │
│  │  └─ returns: SecurityCheckResult                          │  │
│  │                                                             │  │
│  │ getSecureHeaders()                                         │  │
│  │  ├─ adds: X-Request-Time                                  │  │
│  │  ├─ adds: X-Client-Signature                              │  │
│  │  └─ returns: headers object                               │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                             │
                             │ uses
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ lib/security.ts (Core Security Logic)                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ getSecurityConfig()                                        │  │
│  │  └─ returns: production/dev settings                       │  │
│  │                                                             │  │
│  │ validateQrId(qrId)                                         │  │
│  │  └─ returns: { valid, reason? }                            │  │
│  │                                                             │  │
│  │ checkRateLimit()                                           │  │
│  │  └─ returns: { allowed, remaining, reason? }              │  │
│  │                                                             │  │
│  │ detectSuspiciousActivity(params)                           │  │
│  │  └─ returns: { suspicious, score, reasons }               │  │
│  │                                                             │  │
│  │ generateDeviceHash()                                       │  │
│  │  └─ returns: device fingerprint string                     │  │
│  │                                                             │  │
│  │ createRequestSignature(qrId)                               │  │
│  │  └─ returns: signature string                              │  │
│  │                                                             │  │
│  │ [Storage Helpers: getRequestHistory, saveRequestHistory]  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                             │
                             │ stores
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ Browser localStorage                                             │
│  ├─ Key: __verify_page_security_v1_                              │
│  ├─ Data: [{ timestamp, userAgent, referer, ipHash, ...}, ...]   │
│  ├─ Size: ~100-500 bytes per hour                                │
│  └─ Auto-cleanup: 1-hour rolling window                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow for Rate Limiting

```
REQUEST ARRIVES
        │
        ▼
┌─────────────────────────┐
│ generateDeviceHash()    │  Browser fingerprint
│                         │  (unique per device)
│ Returns: "a7b3e2f1c9"  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ getRequestHistory()     │  Fetch from localStorage
│ from localStorage       │
│                         │
│ Filter by:              │
│ - deviceHash match      │  Get only THIS device's requests
│ - Last 1 hour          │  (purge older than 60 min)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Count requests:                         │
│ - Last 1 minute: 4 requests             │
│ - Last 1 hour: 23 requests              │
│                                         │
│ Limits:                                 │
│ - Per minute: 5 (still have 1)          │
│ - Per hour: 50 (still have 27)          │
└────────────┬────────────────────────────┘
             │
             ▼ ALLOWED? ──YES──┐
             │                 │
            NO                 ▼
             │          ┌─────────────────┐
             │          │ Create new entry│
             ▼          │ - timestamp     │
        ┌────────────┐  │ - userAgent     │
        │ BLOCKED ❌ │  │ - ipHash        │
        │Too many    │  │ - requestCount  │
        │requests    │  └────────┬────────┘
        └────────────┘           │
                                 ▼
                        ┌──────────────────┐
                        │ Append to history│
                        │ & save to        │
                        │ localStorage     │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ ALLOWED ✅       │
                        │ Remaining: 0     │
                        └──────────────────┘
```

---

## Bot Detection Decision Tree

```
REQUEST ARRIVES
        │
        ▼
┌──────────────────────────────────┐
│ Check User-Agent Header          │
└──────────────┬───────────────────┘
               │
        ┌──────┴──────┐
        │             │
       YES            NO
    (bot detected)  (unknown)
        │             │
        ▼             ▼
    ┌────────┐   ┌──────────────────────┐
    │BLOCK   │   │ Check QR ID Pattern  │
    │Score+3 │   │ (Unusual patterns?)  │
    └────────┘   └──────┬───────────────┘
                        │
                 ┌──────┴──────┐
                 │             │
                YES            NO
            (unusual)       (normal)
                │             │
                ▼             ▼
            ┌────────┐   ┌──────────────────────┐
            │BLOCK   │   │ Check Request Rate   │
            │Score+1 │   │ (Rapid requests?)    │
            └────────┘   └──────┬───────────────┘
                                │
                         ┌──────┴──────┐
                         │             │
                        YES            NO
                    (rapid req)    (normal rate)
                         │             │
                         ▼             ▼
                     ┌────────┐   ┌──────────────────────┐
                     │BLOCK   │   │ Check Referer        │
                     │Score+2 │   │ (Missing or bot?)    │
                     └────────┘   └──────┬───────────────┘
                                         │
                                  ┌──────┴──────┐
                                  │             │
                                 YES            NO
                             (suspicious)  (legitimate)
                                  │             │
                                  ▼             ▼
                              ┌────────┐   ┌──────────────┐
                              │BLOCK   │   │ Total Score  │
                              │Score+1 │   └──────┬───────┘
                              └────────┘          │
                                                  ▼
                                          ┌──────────────────┐
                                          │ Score >= 3?      │
                                          └────────┬─────────┘
                                                   │
                                            ┌──────┴──────┐
                                            │             │
                                           YES            NO
                                            │             │
                                            ▼             ▼
                                        ┌────────┐   ┌──────────┐
                                        │BLOCK   │   │ALLOW ✅  │
                                        │Score ≥3│   │          │
                                        └────────┘   └──────────┘
```

---

## Storage Structure

```
localStorage
├─ Key: __verify_page_security_v1_
│
└─ Value: [
    {
      timestamp: 1716864000000,           // When the request was made
      userAgent: "Mozilla/5.0...",        // Browser info
      referer: "https://...",             // Where request came from
      ipHash: "a7b3e2f1c9d4e5f6",        // Device fingerprint
      requestCount: 1                     // Count in current window
    },
    {
      timestamp: 1716864015000,
      userAgent: "Mozilla/5.0...",
      referer: "https://...",
      ipHash: "a7b3e2f1c9d4e5f6",
      requestCount: 2
    },
    // ... more entries for this device
  ]

Storage Lifecycle:
┌──────────────────────┐
│ Request made         │ Create new entry
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Append to array      │ Add to history
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Save to localStorage │ Persist
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Auto-cleanup         │ Remove entries > 1 hour old
│ (happens on load)    │ Keep only recent history
└──────────────────────┘
```

---

## Error Handling Flow

```
VERIFICATION PROCESS ERROR SCENARIOS

┌─ Security Check Failed
│  ├─ Rate Limit Exceeded
│  │  └─ Message: "Too many requests. Please try again in a minute."
│  │  └─ Color: Orange warning
│  │  └─ Retry: Show wait time
│  │
│  ├─ Invalid QR ID
│  │  └─ Message: "Invalid QR ID - ..."
│  │  └─ Color: Red error
│  │  └─ Action: Rescan QR code
│  │
│  └─ Suspicious Activity
│     └─ Message: "Too Many Requests - This is a security measure..."
│     └─ Color: Orange warning
│     └─ Action: Wait & retry
│
├─ API Request Failed
│  ├─ Network Error
│  │  └─ Message: "Network error. Could not connect..."
│  │  └─ Color: Red error
│  │  └─ Action: Check connection & retry
│  │
│  ├─ Product Not Found
│  │  └─ Message: From backend
│  │  └─ Color: Red error
│  │  └─ Action: Rescan QR code
│  │
│  └─ Server Error
│     └─ Message: From backend
│     └─ Color: Red error
│     └─ Action: Retry or contact support
│
└─ Success ✅
   └─ Message: Display product details
   └─ Color: Green success
   └─ Action: User verification complete
```

---

## Performance Timeline

```
TYPICAL VERIFICATION REQUEST TIMELINE

  0ms ─── START
         User scans QR code
         Browser navigates to /verify?qr_id=PROD123
         
  1ms ─── EXTRACT PARAMS
         useSearchParams() gets QR ID
         
  2ms ─── SECURITY HOOK INIT
         useVerifyPageSecurity called
         
  3ms ─── RATE LIMIT CHECK
         localStorage read: <1ms
         history filter: <1ms
         
  4ms ─── QR ID VALIDATION
         regex check: <1ms
         
  5ms ─── BOT DETECTION
         User-Agent parsing: <1ms
         pattern matching: <1ms
         
  6ms ─── SUSPICIOUS ACTIVITY
         scoring: <1ms
         
  7ms ─── REQUEST SIGNING
         hash generation: <1ms
         
  8ms ─── API CALL
         fetch initiated
         network latency: ~100-200ms
         
200ms ─── API RESPONSE
         backend processing: ~100ms
         data received
         
202ms ─── UI RENDER
         React component update: <10ms
         DOM paint
         
205ms ─── COMPLETE
         Total time: ~205ms
         
BREAKDOWN:
├─ Security checks: ~7ms (3.4%)
├─ Network/API:    ~193ms (94%)
└─ UI rendering:   ~5ms (2.4%)

CONCLUSION: Security adds negligible overhead!
```

---

## Security Levels by Environment

```
DEVELOPMENT MODE (localhost)
┌─────────────────────────────────────┐
│ Rate Limits (Relaxed)               │
├─────────────────────────────────────┤
│ Per Minute: 30 requests             │
│ Per Hour: 300 requests              │
│ Purpose: Easy testing               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Security Checks (Informational)     │
├─────────────────────────────────────┤
│ Log suspicious activity: YES        │
│ Block suspicious requests: NO       │
│ Console warnings: YES               │
│ Purpose: Developer debugging        │
└─────────────────────────────────────┘


PRODUCTION MODE (deployed)
┌─────────────────────────────────────┐
│ Rate Limits (Strict)                │
├─────────────────────────────────────┤
│ Per Minute: 5 requests              │
│ Per Hour: 50 requests               │
│ Purpose: Bot prevention             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Security Checks (Enforced)          │
├─────────────────────────────────────┤
│ Log suspicious activity: YES        │
│ Block suspicious requests: YES      │
│ Console warnings: NO                │
│ Purpose: User protection            │
└─────────────────────────────────────┘
```

---

## Attack Prevention Examples

```
ATTACK 1: Rapid Scanning
┌─────────────────────────────────────┐
│ Attacker Script                     │
│ for qrId in 1..1000:                │
│   verify(qrId)                      │
└─────────────────────────────────────┘
            │
            ▼ Rate Limit Check
            │
    ┌───────┴────────┐
    │                │
 Request 1-5     Request 6
    │                │
    ✅              ❌
   PASS           BLOCKED
            │
            ▼
    Result: Only 5 requests processed
    Attack: FAILED ❌

ATTACK 2: SQL Injection
┌──────────────────────────────────────┐
│ Attacker URL                         │
│ /verify?qr_id=PROD"; DROP TABLE--   │
└──────────────────────────────────────┘
            │
            ▼ Input Validation
            │
       Format Check
            │
    ┌───────┴────────┐
    │                │
  VALID           INVALID
    │                │
   ✅              ❌
                 BLOCKED
            │
            ▼
    Result: Request rejected
    Attack: FAILED ❌

ATTACK 3: Bot Tool Usage
┌──────────────────────────────────────┐
│ Attacker Code                        │
│ selenium = Selenium()                │
│ selenium.verify(qr)                  │
└──────────────────────────────────────┘
            │
            ▼ Bot Detection
            │
       User-Agent Check
            │
    ┌───────┴────────┐
    │                │
 LEGITIMATE      BOT TOOL
    │                │
   ✅              ❌
                 BLOCKED
            │
            ▼
    Result: Selenium blocked
    Attack: FAILED ❌
```

---

*Diagram Documentation Complete*
*Last Updated: May 27, 2026*
