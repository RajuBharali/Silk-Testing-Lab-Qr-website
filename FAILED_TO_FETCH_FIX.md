# 🔧 "Failed to fetch" Diagnosis & Fix

## 🔴 What's Happening

**"Failed to fetch"** error means:
- ❌ Cannot reach the API server
- ❌ CORS headers missing
- ❌ Network blocked
- ❌ API domain is wrong

---

## 🔍 Step 1: Check Browser Console

1. **Open DevTools:** F12
2. **Go to:** Console tab
3. **Look for messages starting with:**
   - 🔍 "Attempting to fetch from API..."
   - 📍 "API URL: ..."
   - 📊 "Status: ..."
   - ❌ "Verification error: ..."

**Copy and show me ALL the console messages.** This will tell us exactly what's wrong.

---

## 🧪 Step 2: Test API Directly

### Test 1: From Browser Console

```javascript
const apiUrl = "https://api.sualkuchisilktestlab.com/api/testing/verify";
const qrId = "6509-0108143-1-1M-20260526";

console.log("Testing API directly...");

fetch(`${apiUrl}?qr_id=${qrId}`, {
  headers: {
    'x-api-key': 'admin_key_2026_sualkuchitat_xK9pL2mN_admin',
    'Content-Type': 'application/json'
  }
})
.then(r => {
  console.log("Status:", r.status);
  console.log("CORS Header:", r.headers.get('access-control-allow-origin'));
  return r.json();
})
.then(d => console.log("✅ Success:", d))
.catch(e => console.error("❌ Error:", e.message));
```

**What to look for:**
- ✅ `Status: 200` and JSON response → API works
- ❌ `Status: 0` → CORS blocked
- ❌ `Network Error` → API unreachable
- ❌ `Failed to fetch` → Connection issue

---

### Test 2: From Terminal

```bash
curl -i https://api.sualkuchisilktestlab.com/api/testing/verify?qr_id=6509-0108143-1-1M-20260526 \
  -H "x-api-key: admin_key_2026_sualkuchitat_xK9pL2mN_admin" \
  -H "Content-Type: application/json"
```

**Expected:**
```
HTTP/1.1 200 OK
access-control-allow-origin: *
content-type: application/json

{
  "success": true,
  "verified": true,
  ...
}
```

**If you get:**
```
Failed to connect
Connection refused
```
→ API server not running

---

## 🛠️ Step 3: Potential Fixes

### Fix 1: Backend Not Running

**Problem:** API server is down

**Solution:** Start your backend

```bash
# If Python/Flask
python app.py --port 5000

# If Node.js
npm start -- --port 5000

# If Java
java -jar app.jar

# Check if running
curl https://api.sualkuchisilktestlab.com/api/health
```

---

### Fix 2: CORS Headers Missing

**Problem:** Backend doesn't allow cross-origin requests

**Solution:** Add CORS to your backend

#### Python/Flask:
```python
from flask_cors import CORS
from flask import Flask

app = Flask(__name__)
CORS(app)

# OR manually:
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,x-api-key')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response
```

#### Node.js/Express:
```javascript
const cors = require('cors');
const app = require('express')();

app.use(cors());

// OR manually:
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,x-api-key');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

---

### Fix 3: Wrong API URL

**Problem:** `.env.local` has incorrect API URL

**Check:** Your `.env.local`

```env
NEXT_PUBLIC_API_URL=https://api.sualkuchisilktestlab.com/api
```

**Is this correct?** Or should it be:
- `https://your-domain.com/api`?
- `http://localhost:5000/api`?
- Different port/path?

**Fix:**

```env
# Update to your actual API URL
NEXT_PUBLIC_API_URL=https://your-correct-api-domain.com/api
```

Restart: `npm run dev`

---

### Fix 4: API Key Wrong

**Problem:** API key in `.env.local` is invalid

**Check:** 
```env
NEXT_PUBLIC_ADMIN_API_KEY=admin_key_2026_sualkuchitat_xK9pL2mN_admin
```

Is this the correct key? Ask your backend developer for the correct API key.

---

## 📋 Diagnostic Checklist

- [ ] 1. Check console messages (copy them for me)
- [ ] 2. Test API in browser console (does it work?)
- [ ] 3. Test API from terminal (curl command)
- [ ] 4. Verify `.env.local` has correct API URL
- [ ] 5. Verify API key is correct
- [ ] 6. Check if backend is running
- [ ] 7. Check if backend has CORS headers

---

## 📝 When You Tell Me, Include:

1. **Console messages** (copy from F12 console)
2. **Terminal curl result** (success or error?)
3. **API URL** (what should it be?)
4. **Is backend running?** (Yes/No/Don't know)
5. **Backend framework** (Python/Node/Java/Other?)

---

## 🚀 Quick Test

1. **Restart dev server:**
   ```bash
   pkill -f "next dev"
   npm run dev
   ```

2. **Visit verify page:**
   ```
   http://localhost:3000/verify?qr_id=6509-0108143-1-1M-20260526
   ```

3. **Open console (F12)** and screenshot all messages

4. **Tell me what you see!**

---

The logging I added will show exactly where the problem is. Share the console output and I can fix it! 🔍
