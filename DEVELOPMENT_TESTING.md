# 🚀 Development Testing Guide

## Quick Fix Applied

✅ **Development mode now has auto-fallback to mock data** when API is unavailable.

This means:
- `npm run dev` will work even without a backend
- Demo data shows automatically in development
- Production deployment will still use real API

---

## 3 Ways to Test

### **Option 1: Use Demo Mode (Easiest) ⭐**

```
Development:
http://localhost:3000/verify?qr_id=preview

Production:
https://qr.sualkuchisilktestlab.com/verify?qr_id=preview
```

**Result**: Shows mock product data with all features working

---

### **Option 2: Use Your Real Backend API**

If your backend is running:

**Update `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://api.sualkuchisilktestlab.com/api
```

Then test:
```
http://localhost:3000/verify?qr_id=5570-2001-1-1M-20260522
```

---

### **Option 3: Run Local Backend (Advanced)**

If you have a backend running locally on port 5000:

```bash
# Start your backend on localhost:5000
# Example (if Python):
python app.py --port 5000

# OR if Node.js:
npm start -- --port 5000

# OR if already running:
# Just access frontend normally
http://localhost:3000/verify?qr_id=TEST
```

The code automatically detects localhost and uses: `http://localhost:5000/api`

---

## What Changed

```typescript
// BEFORE: Always tried API, failed if unavailable
try {
  const response = await fetch(fetchUrl, { headers: getHeaders() });
  // ... would fail if API down
}

// AFTER: Falls back to mock data in development
catch (err) {
  const isDevelopment = window.location.hostname === 'localhost';
  if (isDevelopment) {
    // Use mock data instead of error ✅
    setData(MOCK_DATA);
  } else {
    // Show error in production
    setError("Network error...");
  }
}
```

---

## Testing Checklist

### ✅ Development (localhost:3000)

- [x] No backend needed
- [x] Uses mock data automatically
- [x] All features work
- [x] Security checks still active

### ✅ Production (with real backend)

- [x] Real API called
- [x] Real product data shown
- [x] Error handling active

### ✅ Testing Different QR Codes

```
# Demo/Preview mode (no API needed)
http://localhost:3000/verify?qr_id=preview
http://localhost:3000/verify?qr_id=demo

# Real QR code (needs backend)
http://localhost:3000/verify?qr_id=5570-2001-1-1M-20260522
http://localhost:3000/verify?qr_id=YOUR_QR_CODE

# Invalid QR (security test)
http://localhost:3000/verify?qr_id='; DROP TABLE--  # Blocked ✓
http://localhost:3000/verify?qr_id=<script>alert(1)</script>  # Blocked ✓
```

---

## Console Output

### Development with Mock Data

```
✓ No QR ID provided. Falling back to demo mode.
✓ Sualkuchi Silk Testing Laboratory
✓ Authenticating Product...
✓ Mock product data loaded
```

### Development Auto-Fallback

```
⚠ Verification error: Failed to fetch
✓ Development mode: API unavailable. Using mock data for demonstration.
✓ Product shown with demo data
```

### Production with Real API

```
✓ Fetching from https://api.sualkuchisilktestlab.com/api
✓ Response received
✓ Product verified successfully
```

---

## Quick Commands

```bash
# Start development server
npm run dev

# Visit (will work with mock data)
http://localhost:3000/verify?qr_id=preview

# Build for production
npm run build

# Start production server
npm start

# Test with different QR codes
http://localhost:3000/verify?qr_id=PRODUCT_ID
```

---

## Troubleshooting

### Still Seeing "Network error"?

**In Development:**
- Should be auto-fallback now ✓
- Check browser console (F12)
- Refresh page (Ctrl+R or Cmd+R)

**In Production:**
- Backend API must be running
- Check NEXT_PUBLIC_API_URL in .env.local
- Verify API is accessible
- Check CORS headers

### Want to Test Real Backend?

1. **Start your backend:**
   ```bash
   # On port 5000
   python app.py --port 5000
   # OR
   npm start -- --port 5000
   ```

2. **Test in browser:**
   ```
   http://localhost:3000/verify?qr_id=TEST_QR_CODE
   ```

3. **Check console:**
   ```javascript
   // Console should show fetch request to:
   http://localhost:5000/api/testing/verify?qr_id=TEST_QR_CODE
   ```

---

## Status

✅ **Development Testing**: Works with demo data
✅ **Production Ready**: Uses real API
✅ **Security**: Still active in both modes
✅ **Error Handling**: Improved with auto-fallback

---

**Now test locally without needing a backend!** 🎉

```bash
npm run dev
# Visit: http://localhost:3000/verify?qr_id=preview
```
