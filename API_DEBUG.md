# 🔧 API Connection Debugger

## Step 1: Test API Connection from Browser Console

Open DevTools (F12) and paste this:

```javascript
// Test API endpoint
const apiUrl = "https://api.sualkuchisilktestlab.com/api/testing/verify";
const qrId = "6509-0108143-1-1M-20260526";

console.log("Testing API connection...");
console.log("URL:", apiUrl);
console.log("QR ID:", qrId);

fetch(`${apiUrl}?qr_id=${qrId}`, {
  headers: {
    'x-api-key': 'admin_key_2026_sualkuchitat_xK9pL2mN_admin',
    'Content-Type': 'application/json'
  }
})
.then(r => {
  console.log("Response status:", r.status);
  return r.json();
})
.then(data => {
  console.log("✅ API Response:", data);
})
.catch(e => {
  console.error("❌ API Error:", e.message);
});
```

---

## Step 2: What to Look For

### ✅ Success Response
```javascript
{
  success: true,
  verified: true,
  productDetails: { ... }
}
```

### ❌ Error Response
```
ERR_NAME_NOT_RESOLVED
```
→ API domain is wrong or DNS issue

```
ERR_CONNECTION_REFUSED
```
→ API server is not running

```
Failed to fetch
```
→ CORS issue or network problem

---

## Step 3: Check Your Setup

### Question 1: Is your backend API running?

```bash
# Test if API is accessible
curl -v https://api.sualkuchisilktestlab.com/api/testing/verify?qr_id=6509-0108143-1-1M-20260526 \
  -H "x-api-key: admin_key_2026_sualkuchitat_xK9pL2mN_admin" \
  -H "Content-Type: application/json"
```

**Expected:** Should return JSON response (success or error)  
**Problem:** Connection refused / timeout / 404

---

### Question 2: Is API URL correct?

Check your `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.sualkuchisilktestlab.com/api
```

Is this the correct domain? Or should it be:
- `https://your-domain.com/api`?
- `http://localhost:5000/api`?
- Something else?

---

### Question 3: Is API key correct?

```env
NEXT_PUBLIC_ADMIN_API_KEY=admin_key_2026_sualkuchitat_xK9pL2mN_admin
```

Is this the correct key?

---

## Step 4: Quick Fixes

### Fix 1: Update API URL (if wrong)

Edit `.env.local`:
```env
# Change this:
NEXT_PUBLIC_API_URL=https://api.sualkuchisilktestlab.com/api

# To this (example):
NEXT_PUBLIC_API_URL=https://your-correct-api-domain.com/api
```

Then restart dev server:
```bash
npm run dev
```

---

### Fix 2: Check Backend is Running

If backend should be on localhost:5000:

```bash
# Check if port 5000 is listening
lsof -i :5000

# If not, start your backend:
python app.py --port 5000
# OR
npm start -- --port 5000
```

Then test:
```
http://localhost:3000/verify?qr_id=6509-0108143-1-1M-20260526
```

---

### Fix 3: Add CORS Headers (Backend Issue)

If API is running but you get CORS error, your backend needs:

```python
# Python/Flask example
from flask_cors import CORS
CORS(app)

# OR manually add headers:
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, x-api-key'
    return response
```

---

## Step 5: Test Different Scenarios

### Scenario A: Test with Demo Data (No API needed)
```
http://localhost:3000/verify?qr_id=preview
```
✅ Should work without any API

### Scenario B: Test with Real QR (Needs API)
```
http://localhost:3000/verify?qr_id=6509-0108143-1-1M-20260526
```
❓ Works only if API is accessible

---

## Step 6: Browser Console Debugging

When you visit the verify page, check console output:

### Good Signs:
```
✓ Fetching from: https://api.sualkuchisilktestlab.com/api/testing/verify?qr_id=6509-0108143-1-1M-20260526
✓ Response received
✓ Product verified
```

### Bad Signs:
```
✗ Failed to fetch
✗ ERR_CONNECTION_REFUSED
✗ CORS policy error
✗ Network error
```

---

## Tell Me:

1. **Is your backend API running?** (Yes/No/Don't know)
2. **What's the correct API URL?** (Full URL)
3. **What error do you see in browser console?** (Copy the exact error)

Then I can fix it! 🔧

---

## Quick Test Command

Run this in your terminal:

```bash
# Replace with your actual QR code
curl -i https://api.sualkuchisilktestlab.com/api/testing/verify?qr_id=6509-0108143-1-1M-20260526 \
  -H "x-api-key: admin_key_2026_sualkuchitat_xK9pL2mN_admin"
```

**If it returns data** → API works, but frontend has issue  
**If it fails** → API is not accessible  
**If it's 404** → API endpoint is wrong
