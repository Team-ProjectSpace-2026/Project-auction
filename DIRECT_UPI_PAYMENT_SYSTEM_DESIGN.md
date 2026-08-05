# Direct UPI Payment & Player Registration Verification System Design

## 1. Executive Summary & Overview
This document specifies the technical architecture, database schema, API contracts, and user experience for a secure, $0-cost Direct UPI payment verification system for the Cricket Auction Platform. 

It eliminates reliance on third-party payment gateways (which reject auction apps under policy restrictions) while completely preventing fake, edited, or reused payment screenshots.

---

## 2. Understanding Summary & Key Constraints
* **Purpose**: Allow players to register for paid cricket auction tournaments via direct UPI transfer (GPay, PhonePe, Paytm, BHIM) to the tournament organizer's UPI ID with zero fake registrations.
* **Cost**: $0 (Uses open-source browser OCR, Node.js crypto, and MongoDB indexes).
* **Key Components**:
  * Dynamic `upi://pay` URI, QR code, and copy fallback buttons.
  * 5-Minute Slot Reservation Timer to prevent spam & abandoned registrations.
  * In-Browser OCR (`tesseract.js`) for auto-extracting 12-digit UTR from payment screenshots.
  * 3-Tier Server Safeguards (Unique UTR Index, SHA-256 Image Hash, 12-digit Format Validation).
  * 1-Click Organizer Admin Verification Dashboard.

---

## 3. When & How the 5-Minute Reservation Timer Works

```
[ Step 1: Form Fill ] ──► Click "Proceed to Pay" ──► [ TIMER STARTS: 05:00 ]
                                                            │
                                                            ▼
[ Step 2: UPI Pay ]   ──► Tap GPay / Scan QR     ──► [ TIMER TICKING: 03:20 ]
                                                            │
                                                            ▼
[ Step 3: Proof Submit ] ──► Upload Receipt + OCR ──► [ TIMER STOPS: SUCCESS ]
                                                            │
                                  (If 5 Mins Expire Without Submission)
                                                            ▼
                                                   [ STATUS: EXPIRED ]
```

1. **Timer Trigger**: The timer starts the **exact moment** a player completes Step 1 of the registration form and clicks **"Proceed to Pay"**.
2. **Backend Action**: The server creates a temporary `Player` record with `paymentStatus: 'RESERVED'` and `expiresAt = Date.now() + 300,000` (5 minutes).
3. **Frontend Display**: A live countdown widget displays `⏱️ 04:59` ticking down.
4. **On Expiration**: If the timer hits `00:00` before proof submission, the slot is released, the form disables, and the status changes to `'EXPIRED'`.
5. **On Submission**: Submitting the UTR + screenshot before `00:00` stops the timer and transitions the status to `'PENDING_VERIFICATION'`.

---

## 4. End-to-End User Experience (Step-by-Step Scenario)

### Scenario: Rahul Registering for ₹500 Tournament
1. **Form Fill**: Rahul enters Name, Age, Mobile, Role. Clicks *Proceed to Pay*.
2. **Timer Starts**: Live timer displays `⏱️ 04:59`.
3. **Payment Screen**:
   * Option A (Mobile): Taps **[Pay via UPI App]** -> GPay opens with ₹500 & `PAY-8942` pre-filled.
   * Option B (Desktop): Scans QR Code with GPay.
   * Option C (Fallback): Clicks **[Copy UPI ID]** and **[Copy Note]**.
4. **Share Receipt & Upload**: Rahul completes payment in GPay, taps **Share Receipt**, saves image, and uploads it on the registration page.
5. **OCR Auto-Fill**: `tesseract.js` in the browser scans the receipt, extracts `421589301234`, and fills the UTR box automatically.
6. **Submit & Instant Safeguards**: Rahul clicks **Submit**. Server verifies:
   * Is `421589301234` already used in DB? -> No.
   * Is image hash unique? -> Yes.
   * Is timer valid? -> Yes.
7. **Pending Approval**: Status becomes `PENDING_VERIFICATION`. Rahul is informed that his registration is pending organizer confirmation.
8. **Organizer 1-Click Verification**: Organizer opens Admin Dashboard, sees Rahul's submission (`PAY-8942` / UTR `421589301234`), checks their bank app, and clicks **[APPROVE]**.
9. **Auction Pool Activation**: Rahul receives an approval email/SMS and goes live in the auction pool!

---

## 5. System Architecture & Technical Specifications

### Data Models

#### Player Schema (`Auction-Server/src/models/Player.js`)
```javascript
paymentDetails: {
  paymentCode: { type: String, required: true }, // e.g. "PAY-8942"
  utrNumber: { type: String, sparse: true, index: true }, // 12-digit UTR
  paymentScreenshot: { type: String, default: "" }, // Cloudinary URL
  imageHash: { type: String, sparse: true }, // SHA-256 image hash
  paymentStatus: {
    type: String,
    enum: ['RESERVED', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'EXPIRED'],
    default: 'RESERVED'
  },
  reservedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  verifiedAt: { type: Date },
  rejectionReason: { type: String, default: "" }
}
```

#### Tournament Schema (`Auction-Server/src/models/Tournament.js`)
```javascript
organizerPaymentInfo: {
  upiId: { type: String, required: true }, // e.g. "organizer@upi"
  upiName: { type: String, default: "" },  // e.g. "Sunil Verma"
  qrCodeUrl: { type: String, default: "" }
}
```

---

## 6. Decision Log

| Decision | Option Chosen | Alternatives Considered | Rationale |
| :--- | :--- | :--- | :--- |
| **Payment Gateway** | Direct P2P UPI (GPay/PhonePe) | Gateway (Razorpay/Cashfree) | Policy restrictions block auction apps on gateways; Direct UPI gives 0% fees and 100% direct organizer payouts. |
| **GPay Failure Fix** | Dynamic `upi://pay` URI + QR Code + Copy Buttons | Web Intent Link Only | Bypasses NPCI intent link blocks on personal VPAs; guarantees 100% device compatibility. |
| **Mobile UTR Entry** | In-Browser OCR (`tesseract.js`) Auto-Extraction | Manual Copy-Paste | Removes manual typing errors and app switching friction for mobile users. |
| **Spam Prevention** | 5-Minute Live Reservation Timer | Unlimited Time | Cleans up abandoned slots automatically and prevents database bloat. |
| **Fraud Prevention** | 3-Tier Security (UTR Unique Index + SHA-256 Image Hash + Format Check) | Raw Screenshot Upload | 100% prevents fake, edited, or reused payment screenshots. |

---

## 7. Implementation Roadmap & Verification Strategy

### Step 1: Backend API Implementation
* Update `Player.js` and `Tournament.js` models.
* Add `/api/players/initiate-registration` (reservation & 5-min timer).
* Add `/api/players/submit-payment-proof` (UTR uniqueness, image hash, expiration check).
* Add `/api/players/:id/verify-payment` (Admin approve/reject).

### Step 2: Frontend Implementation
* Integrate `tesseract.js` OCR into `PlayerRegistrationForm.jsx`.
* Build 5-minute Live Countdown Timer component.
* Render `upi://pay` button, QR code, and Copy fallback buttons.
* Update `PlayersTab.jsx` with Pending Payment verification cards for organizers.

### Step 3: Verification & Automated Tests
* Write unit tests for UTR duplicate rejection, image hashing, and 5-min expiration logic.
* Perform manual E2E test of registration flow on mobile & desktop views.
