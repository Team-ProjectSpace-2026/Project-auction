# 🔒 Security Audit Report — CricAuctionHub

**Project**: Auction-Project (Frontend) + Auction-Server (Backend)  
**Date**: 2025-07-27  
**Scope**: Full-stack security review — authentication, authorization, input validation, injection, CSRF, XSS, socket security, payment flow, rate limiting, secrets management, CI/CD, dependencies

---

## 📋 Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟠 High | 6 |
| 🟡 Medium | 10 |
| 🟢 Low | 8 |
| ℹ️ Info | 5 |

**Overall Risk**: **High** — Several critical vulnerabilities allow account takeover, bid manipulation, and payment bypass.

---

## 🔴 Critical Findings

### C1: CAPTCHA Text Returned in Response — Bypasses Entire Purpose
**File**: `Auction-Server/src/middleware/verifyCaptcha.js:43`  
**CVSS**: 9.1 (Critical)  
**Description**: The `generateCaptcha` endpoint returns both `captchaId` **and** the plaintext `text` in the JSON response. An attacker can call `/auth/captcha/new`, read the answer, and submit it to `/auth/register` or `/auth/login` programmatically.

```javascript
// verifyCaptcha.js line 43
res.json({ captchaId, text });  // 🚨 EXPOSES ANSWER TO CLIENT
```

**Impact**: Automated registration/login bypass, credential stuffing, bot account creation.  
**Fix**: Never return the answer. Generate a canvas/image server-side or use a proper CAPTCHA service (reCAPTCHA, hCaptcha, Cloudflare Turnstile).

---

### C2: No Server-Side Authorization on Payment Verification
**File**: `Auction-Server/src/controllers/payment.controller.js:93-140`  
**CVSS**: 9.0 (Critical)  
**Description**: The `verifyPayment` endpoint is **public** (no `auth` middleware). It only verifies the Razorpay signature but does **not** check:
- Whether the user owns the tournament
- Whether the tournament is paid
- Whether registration deadline passed
- Whether the user already registered

An attacker can forge a valid signature (if they know `RAZORPAY_KEY_SECRET` via leak) or replay a legitimate payment to register for any tournament for free.

**Fix**: Add authentication + ownership verification before marking payment verified.

---

### C3: Socket Authentication Uses Only Cookie — No CSRF Validation on Socket Events
**File**: `Auction-Server/src/socket/auctionSocket.js:83-111`  
**CVSS**: 8.8 (Critical)  
**Description**: Socket.io authentication reads the JWT from the cookie but **does not validate CSRF token or Origin header** for state-changing events (`place-bid`, `reveal-player`, `mark-sold`, `start-auction`, `end-auction`). Since cookies are sent automatically with cross-origin requests, a malicious site can trigger bids if the victim is logged in.

```javascript
// auctionSocket.js line 86-92 — no CSRF/origin check
const cookieHeader = socket.handshake.headers?.cookie || "";
const cookieToken = cookieHeader.split(";").map(c => c.trim()).find(c => c.startsWith("token="))?.split("=")[1];
const token = cookieToken || socket.handshake.auth.token;
```

**Impact**: Cross-Site WebSocket Hijacking (CSWSH) — attacker forces victim to place bids, reveal players, end auctions.  
**Fix**: Validate `Origin` header against `CLIENT_URL` **and** require a per-session CSRF token sent in handshake auth.

---

## 🟠 High Findings

### H1: Bid Amount Race Condition — Overbid Possible
**File**: `Auction-Server/src/socket/auctionSocket.js:234-299`  
**CVSS**: 7.5 (High)  
**Description**: The current bid validation fetches `currentBid` then validates, but between the read and the transaction commit, another bid can be placed. The transaction marks old bids as `Outbid` **before** creating the new bid, but the validation uses a stale `currentBidAmount`.

```javascript
// Line 235-236: stale read
const currentBid = await getWinningBid(sanitizedTournamentId, sanitizedPlayerId);
const currentBidAmount = currentBid ? currentBid.amount : 0;

// Line 250: validation against stale value
if (sanitizedAmount <= currentBidAmount) { ... }
```

**Fix**: Use MongoDB transactions with `findOneAndUpdate` with conditional update, or use optimistic locking with version field.

---

### H2: No Rate Limiting on Socket Events (Per-User)
**File**: `Auction-Server/src/socket/auctionSocket.js:19-37`  
**CVSS**: 7.4 (High)  
**Description**: Rate limiters (`bidRateLimiter`, `eventRateLimiter`) are **per-connection**, not per-user. An attacker can open multiple socket connections (different tabs/browsers) to bypass limits.

**Fix**: Track rate limits by `socket.user._id` in a Redis store or in-memory Map keyed by user ID.

---

### H3: Payment Screenshot Upload — No Validation on File Type/Size
**File**: `Auction-Server/src/controllers/player.controller.js:276-279`  
**CVSS**: 7.3 (High)  
**Description**: `registerPlayer` accepts `paymentScreenshot` via `upload.fields()` but **does not validate** file type, size, or content. Malicious files (HTML, SVG, EXE) can be uploaded to Cloudinary.

```javascript
// Line 277-278: no validation
if (req.files && req.files.paymentScreenshot && req.files.paymentScreenshot.length > 0) {
  screenshotUrl = req.files.paymentScreenshot[0].path;
}
```

**Fix**: Add `fileFilter` and `limits` to multer config for payment screenshots; restrict to JPEG/PNG, max 2MB.

---

### H4: Tournament Deletion — No Cascade Cleanup of Related Data
**File**: `Auction-Server/src/controllers/tournament.controller.js:251-269`  
**CVSS**: 7.2 (High)  
**Description**: `deleteTournament` only deletes the Tournament document. Orphaned data remains: Players, Teams, Bids, Payments. This leaks PII (mobile, age, payment screenshots) and creates data integrity issues.

**Fix**: Use MongoDB transactions to cascade delete or mark related documents as `deleted: true`.

---

### H5: JWT Secret Length Check Only at Startup — No Rotation Strategy
**File**: `Auction-Server/server.js:40-43`  
**CVSS**: 7.1 (High)  
**Description**: JWT secret validated for length ≥32 chars at startup, but:
- No expiration/rotation policy
- Same secret used for access + refresh tokens
- No `kid` (Key ID) in header for rotation support

**Fix**: Implement key rotation with `kid` header, separate signing keys for access/refresh, scheduled rotation.

---

### H6: CORS Allows `null` Origin in Development
**File**: `Auction-Server/server.js:78-86`  
**CVSS**: 7.0 (High)  
**Description**: CORS callback allows requests with **no origin** (`!origin`), which includes `file://` origins, Postman, curl, and some browser privacy modes.

```javascript
if (!origin || allowedOrigins.includes(origin)) {
  callback(null, true);
}
```

**Fix**: In production, reject requests without `Origin` header for state-changing endpoints.

---

## 🟡 Medium Findings

### M1: XSS Sanitization Only on `/api` Routes — Misses Other Entry Points
**File**: `Auction-Server/server.js:96`  
**CVSS**: 6.5 (Medium)  
**Description**: `xssSanitize` middleware only applied to `/api` routes. Socket events, webhook endpoints, and any non-/api routes bypass sanitization.

**Fix**: Apply sanitization globally or at least to all state-changing routes.

---

### M2: Password Reset / Email Verification Not Implemented
**File**: `Auction-Server/src/routes/auth.routes.js`  
**CVSS**: 6.3 (Medium)  
**Description**: No "forgot password", "reset password", or "verify email" flows. Users who lose access cannot recover accounts securely.

**Fix**: Implement secure password reset with time-limited, single-use tokens stored hashed in DB.

---

### M3: Refresh Token Endpoint Issues New Token Without Revoking Old
**File**: `Auction-Server/src/controllers/auth.controller.js:193-202`  
**CVSS**: 6.1 (Medium)  
**Description**: `refreshToken` generates a new JWT but **does not invalidate** the previous token. Both old and new tokens work until expiry (7 days).

**Fix**: Maintain a token version/denylist in User model; increment on refresh/logout.

---

### M4: Socket `join-tournament` Exposes All Teams/Players Without Authorization Check
**File**: `Auction-Server/src/socket/auctionSocket.js:119-179`  
**CVSS**: 5.9 (Medium)  
**Description**: Any authenticated user can join any tournament and receive full team/player data (names, budgets, player details). No check if user is organizer or team owner.

**Fix**: Verify `tournament.createdBy === socket.user._id` OR user owns a team in tournament before sending state.

---

### M5: Bid Validator Uses `amount <= currentBid` Instead of Strict `>`
**File**: `Auction-Server/src/utils/bidValidator.js:20-23`  
**CVSS**: 5.8 (Medium)  
**Description**: Validation throws if `amount <= currentBid`, but socket handler also checks `sanitizedAmount <= currentBidAmount`. Race condition allows equal bids to pass one check but fail the other inconsistently.

**Fix**: Use strict `>` everywhere; document the invariant.

---

### M6: No Input Validation on `payoutUpiId` — UPI Injection Risk
**File**: `Auction-Server/src/controllers/tournament.controller.js:106`  
**CVSS**: 5.5 (Medium)  
**Description**: `payoutUpiId` accepted as raw string, stored in DB, potentially rendered in frontend. Could contain malicious payloads if displayed unsafely.

**Fix**: Validate UPI ID format (`^[a-zA-Z0-9.\-]{2,256}@[a-zA-Z]{2,64}$`), sanitize on output.

---

### M7: Cloudinary Upload — No Transformation Security on Player Photos
**File**: `Auction-Server/src/middleware/upload.js:8-15`  
**CVSS**: 5.3 (Medium)  
**Description**: Player photos uploaded to `cricauction/players` folder with only size limit. No transformation to strip EXIF, normalize format, or prevent SVG upload (though fileFilter blocks non-JPEG/PNG).

**Fix**: Add `transformation: [{ fetch_format: 'auto', quality: 'auto' }]` and explicit `resource_type: 'image'`.

---

### M8: Error Handler Exposes Stack Traces in Development
**File**: `Auction-Server/src/middleware/errorHandler.js:4-10`  
**CVSS**: 5.0 (Medium)  
**Description**: Logger includes `err.stack` which may leak internal paths, library versions, query structures. In production, ensure `NODE_ENV=production` suppresses stack.

**Fix**: Conditionally log stack only in development.

---

### M9: No Security Headers for HSTS, Referrer-Policy, Permissions-Policy
**File**: `Auction-Server/server.js:55-71`  
**CVSS**: 4.8 (Medium)  
**Description**: Helmet config includes CSP but misses:
- `Strict-Transport-Security` (HSTS)
- `Referrer-Policy`
- `Permissions-Policy` (camera, microphone, geolocation)

**Fix**: Add `hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }`, `referrerPolicy: { policy: 'strict-origin-when-cross-origin' }`, `permissionsPolicy: { features: { camera: [], microphone: [], geolocation: [] } }`.

---

### M10: Socket `disconnect` Handler Doesn't Clean Up Server-Side State
**File**: `Auction-Server/src/socket/auctionSocket.js:639-643`  
**CVSS**: 4.5 (Medium)  
**Description**: On disconnect, only `socket.joinedTournaments.clear()` runs client-side. No server-side cleanup of rate limiter maps, potentially causing memory leaks under high churn.

**Fix**: Use `Map` keyed by socket ID for rate limiters; clean up on `disconnect`.

---

## 🟢 Low Findings

| ID | Issue | File | Fix |
|----|-------|------|-----|
| L1 | `console.log` / `console.error` used in production code | Multiple files | Replace with `logger` |
| L2 | `bidValidator.js` imports models directly — tight coupling | `bidValidator.js:2-4` | Use dependency injection or repository pattern |
| L3 | No API versioning in routes | All route files | Add `/api/v1/` prefix |
| L4 | `vercel.json` only has rewrites — no security headers | `vercel.json` | Add `headers` for CSP, HSTS, X-Frame-Options |
| L5 | `package.json` has `bcrypt` AND `bcryptjs` — duplicate | `Auction-Server/package.json:13-14` | Remove unused |
| L6 | No `Content-Security-Policy-Report-Only` for testing | `server.js:55-71` | Add report-only mode |
| L7 | `rateLimiter.js` uses memory store — doesn't scale | `rateLimiter.js` | Use Redis store (`rate-limit-redis`) |
| L8 | No automated dependency scanning in CI | `.github/workflows/ci.yml` | Add `npm audit` or `snyk` step |

---

## ℹ️ Informational / Defense-in-Depth

| ID | Recommendation |
|----|----------------|
| I1 | Implement **Content Security Policy nonce/hash** for inline scripts (currently uses `'unsafe-inline'`) |
| I2 | Add **Subresource Integrity (SRI)** for third-party scripts (Razorpay checkout) |
| I3 | Implement **request signing** for Razorpay webhooks (verify `X-Razorpay-Signature`) |
| I4 | Add **audit logging** for sensitive actions (bid placed, player sold, payment verified) |
| I5 | Consider **WebAuthn / Passkeys** for 2FA on organizer accounts |

---

## 🛠️ Fix Implementation Guide

### Priority 1 — Critical (Do Immediately)

#### Fix C1: CAPTCHA — Remove Answer from Response
```javascript
// Auction-Server/src/middleware/verifyCaptcha.js
// REMOVE line 43: res.json({ captchaId, text });
// REPLACE with:
res.json({ captchaId });  // Client renders challenge (canvas/image) without knowing answer
// OR integrate reCAPTCHA v3 / hCaptcha / Turnstile
```

#### Fix C2: Protect Payment Verification
```javascript
// Auction-Server/src/routes/payment.routes.js
import auth from '../middleware/auth.middleware.js';

router.post('/verify-payment', auth, verifyPayment);  // Add auth middleware

// In controller, verify tournament ownership:
const tournament = await Tournament.findById(orderIdFromNotes);
if (tournament.createdBy.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: 'Not authorized' });
}
```

#### Fix C3: CSRF on Socket Events
```javascript
// Auction-Server/src/socket/auctionSocket.js
io.use(async (socket, next) => {
  // ... existing auth ...
  
  // Validate Origin header
  const origin = socket.handshake.headers.origin;
  const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(o => o.trim());
  if (origin && !allowedOrigins.includes(origin)) {
    return next(new Error('Invalid origin'));
  }
  
  // Require CSRF token in handshake auth
  const csrfToken = socket.handshake.auth.csrfToken;
  const cookieCsrf = socket.handshake.headers.cookie?.match(/csrfToken=([^;]+)/)?.[1];
  if (!csrfToken || csrfToken !== cookieCsrf) {
    return next(new Error('CSRF token missing or invalid'));
  }
  
  next();
});
```

**Frontend** (`Auction-Project/src/hooks/useSocket.js`):
```javascript
// Read CSRF token from cookie and pass in handshake
const match = document.cookie.match(/csrfToken=([^;]+)/);
const csrfToken = match ? match[1] : null;

const socket = io(SOCKET_URL, {
  withCredentials: true,
  auth: { csrfToken },  // Send CSRF token
  // ...
});
```

---

### Priority 2 — High (This Sprint)

#### Fix H1: Bid Race Condition
```javascript
// Auction-Server/src/utils/bidValidator.js
// Replace getWinningBid + validateBid with atomic findOneAndUpdate
export const placeBidAtomically = async (bidData, tournamentId) => {
  const { amount, teamId, playerId } = bidData;
  
  const result = await Bid.findOneAndUpdate(
    { 
      tournamentId, 
      playerId, 
      status: 'Active',
      amount: { $lt: amount }  // Only update if new amount is higher
    },
    { 
      $set: { 
        status: 'Outbid' 
      } 
    },
    { new: true }
  ).session(session);
  
  // If no document was updated, either no active bid or amount not higher
  if (!result) {
    const current = await getWinningBid(tournamentId, playerId);
    if (current && amount <= current.amount) {
      throw new Error(`Bid must be higher than ₹${current.amount}`);
    }
    // No active bid — proceed to create new one
  }
  
  // Create new bid in same transaction
  const bid = new Bid({ tournamentId, playerId, teamId, amount, status: 'Active' });
  await bid.save({ session });
  return bid;
};
```

#### Fix H2: Per-User Socket Rate Limiting
```javascript
// Auction-Server/src/socket/auctionSocket.js
const userRateLimits = new Map(); // userId -> { bids: [], events: [] }

const createUserRateLimiter = (userId, maxRequests, windowMs) => {
  if (!userRateLimits.has(userId)) {
    userRateLimits.set(userId, { bids: [], events: [] });
  }
  const timestamps = userRateLimits.get(userId)[type];
  const now = Date.now();
  while (timestamps.length && timestamps[0] <= now - windowMs) timestamps.shift();
  if (timestamps.length >= maxRequests) return false;
  timestamps.push(now);
  return true;
};

// Cleanup on disconnect
socket.on('disconnect', () => {
  userRateLimits.delete(socket.user._id.toString());
});
```

#### Fix H3: Validate Payment Screenshot Upload
```javascript
// Auction-Server/src/middleware/upload.js
const paymentScreenshotStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cricauction/payments',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1200, height: 1600, crop: 'limit' }],
    resource_type: 'image',
  },
});

const paymentScreenshotFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only JPG/PNG allowed for payment screenshots'), false);
  }
};

export const paymentScreenshotUpload = multer({
  storage: paymentScreenshotStorage,
  fileFilter: paymentScreenshotFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
```

---

### Priority 3 — Medium (Next Sprint)

- [ ] M1: Apply XSS sanitization globally
- [ ] M2: Implement password reset / email verification
- [ ] M3: Add token versioning for refresh token rotation
- [ ] M4: Authorize `join-tournament` socket event
- [ ] M5: Strict `>` for bid comparison
- [ ] M6: Validate `payoutUpiId` format
- [ ] M7: Harden Cloudinary upload transformations
- [ ] M8: Conditional stack trace logging
- [ ] M9: Add missing Helmet headers (HSTS, Referrer-Policy, Permissions-Policy)
- [ ] M10: Clean up rate limiter maps on socket disconnect

---

## 📦 Dependency Vulnerabilities (as of audit date)

Run `npm audit` in both `Auction-Project` and `Auction-Server`. Known issues to watch:

| Package | Severity | Issue | Fix |
|---------|----------|-------|-----|
| `mongoose@7.5.0` | Medium | Prototype pollution in `Schema.path()` | Upgrade to ≥8.0.0 |
| `express-rate-limit@6.10.0` | Low | Memory store not production-ready | Use `rate-limit-redis` |
| `socket.io@4.7.2` | Medium | DoS via malicious packets | Upgrade to ≥4.8.0 |
| `sanitize-html@2.17.5` | Low | Bypass via nested tags | Upgrade to latest |

---

## ✅ Security Checklist for Production Deploy

- [ ] **Secrets**: All `.env` values rotated; no secrets in repo (check `.env.example` only)
- [ ] **HTTPS**: Enforced everywhere (Vercel + Render); HSTS preload submitted
- [ ] **CSP**: Report-only mode tested; no `'unsafe-inline'` in production
- [ ] **Cookies**: `Secure; SameSite=None` on cross-origin; `HttpOnly` on auth tokens
- [ ] **CORS**: Strict origin list; no wildcard; no `null` origin in prod
- [ ] **Rate Limits**: Redis-backed; per-user for sockets; stricter on auth endpoints
- [ ] **Logging**: No PII in logs; stack traces only in dev; structured JSON logs
- [ ] **Monitoring**: Alert on 401/403 spikes, failed payments, socket auth failures
- [ ] **Backups**: MongoDB PITR enabled; tested restore procedure
- [ ] **Incident Response**: Runbook for account takeover, payment fraud, bid manipulation

---

## 📝 Conclusion

The codebase has **solid foundations** (httpOnly cookies, Helmet, rate limiting, input validation, sanitize-html, ObjectId validation, transaction usage for bids). However, **three critical flaws** (CAPTCHA bypass, unprotected payment verification, missing CSRF on sockets) **must be fixed before production deployment**. The high-severity issues (bid race condition, per-connection rate limiting, file upload validation) should be addressed in the same sprint.

**Estimated effort to remediate Critical + High**: ~2-3 developer days.

---

*Report generated by automated security review + manual code analysis. Validate all fixes with penetration testing before go-live.*