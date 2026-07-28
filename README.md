<div align="center">

# 🏏 CricAuction
### Next-Generation Real-Time Cricket League & Live Auction SaaS Platform

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%2018%2B%20%7C%20Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Real--Time-Socket.IO-010101?logo=socket.io)](https://socket.io/)
[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)](#-project-status)

---

<p align="center">
  <b>An enterprise-grade, high-performance web application for organizing cricket leagues, managing player rosters, and orchestrating live, real-time player auctions with sub-200ms WebSocket latency.</b>
</p>

</div>

---

## 📋 Table of Contents

- [✨ Feature Highlights](#-feature-highlights)
- [🎨 Heavy Animated Glassmorphism UI & Theme](#-heavy-animated-glassmorphism-ui--theme)
- [🎯 Core Functionality & Modules](#-core-functionality--modules)
- [🛠 Technology Stack](#-technology-stack)
- [📁 Architecture & Directory Structure](#-architecture--directory-structure)
- [⚡ Real-Time Bidding Architecture](#-real-time-bidding-architecture)
- [🔒 Security & Protection Layer](#-security--protection-layer)
- [🚀 Getting Started](#-getting-started)
- [📊 Project Status](#-project-status)
- [📄 License & Credits](#-license--credits)

---

## ✨ Feature Highlights

```
 🏆 LEAGUE MANAGEMENT       🏏 LIVE PLAYER AUCTIONS      ⚡ REAL-TIME WEBSOCKETS
 ─────────────────────     ────────────────────────      ───────────────────────
 • Tournament Scaffolding  • Atomic Sub-200ms Bids        • Room-based Isolation
 • Team Roster Allocation  • Live Bid Activity Feed      • Instant State Sync
 • Budget Tracking (INR)   • Sold/Unsold State Locks     • Automatic Reconnection
```

* **⚡ Sub-200ms Live Bidding Engine**: High-frequency WebSocket communication powered by Socket.IO for seamless real-time auctioning.
* **🎨 Immersive Cricket Auction Theme**: Dynamic night stadium atmosphere, GPU-accelerated 60fps floating particles, glowing stumps, and animated tickers.
* **💎 True Glassmorphism Design System**: Ultra-craft frosted glass interfaces with hardware-accelerated CSS `backdrop-filter`, animated light sweeps, and liquid button effects.
* **🔒 Enterprise Security**: Multi-tier security including CAPTCHA verification, JWT auth, rate limiting, XSS input sanitization, and CSRF protection.
* **📱 Responsive & Interactive**: Modern UI built for high performance across desktop and mobile browsers.

---

## 🎨 Heavy Animated Glassmorphism UI & Theme

The authentication & auction workspaces feature a high-craft **Cricket Auction Storm Theme**:

### Key Visual & Animation Systems
* **🏏 Dynamic Particle Engine (`CricketParticles.jsx`)**:
  * 30+ hardware-accelerated floating particles (`will-change: transform`).
  * 🏏 Spinning cricket balls with 3D rotation.
  * 💰 Rising auction bid tags (`₹2Cr`, `₹5Cr`, `SOLD!`, `BID!`) drifting upward.
  * ✨ Pulsing sparkle orbs and cascading confetti.
* **⚡ Animated Stadium Environment (`CricketStumpsAnimation.jsx`)**:
  * Glowing cricket stumps with wobbling bails.
  * Flying cricket ball trajectory animation.
  * Scrolling **"🔨 AUCTION LIVE • 🏏 BID NOW • 💰 SOLD!"** neon ticker bar.
  * Stadium floodlight light rays with pulsing opacity loops.
* **💎 Ultra-Craft Glassmorphism Center Card**:
  * Translucent background: `linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(200, 220, 255, 0.15))`.
  * Heavy blur: `backdrop-filter: blur(28px) saturate(200%)`.
  * Animated light reflection sweep (`glass-shine-sweep`).
  * Liquid wave shimmer buttons on hover and glass focus input wrappers.

---

## 🎯 Core Functionality & Modules

### 1. 🔐 Authentication & Security Workflow
- **JWT Login & Registration**: Token-based auth with secure cookie/header storage.
- **Forgot Password Flow**: 
  - Email verification with `verifyCaptcha.js` security validation.
  - 6-digit OTP delivery system (via SMTP/Gmail NodeMailer).
  - Smooth step transitions (Email/CAPTCHA → Animated OTP → New Password → Success).
- **RobotCAPTCHA (`RobotCaptcha.jsx`)**: Interactive math/visual verification shield.
- **Animated OTP Input (`AnimatedOtpInput.jsx`)**: Auto-focusing multi-box OTP entry with key handling.

### 2. 🏟️ Tournament Management Hub
- Create tournaments with customizable parameters:
  - Team count, max roster size, team budgets (formatted in Indian numbering e.g., `₹10,00,00,000`).
  - Event scheduling, venue details, and ground rules.
- Telemetry dashboard with active metric cards and tournament status filters.

### 3. 👥 Player Self-Registration & Roster Directory
- External self-registration form for players (name, role, age, photo upload, batting/bowling attributes).
- Role badges for **Batsman**, **Bowler**, **All-Rounder**, and **Wicket Keeper**.
- Global searchable player roster with real-time filters.

### 4. 🔨 Live Auction Control Room
- **Lot Management**: Reveal mystery player cards with server-side shuffle randomization.
- **Real-Time Bidding**: Instant increment buttons (+₹1K, +₹5K, +₹10K, +₹50K) and custom bid inputs.
- **Franchise Proxy Grid**: Quick-switch franchise bid selectors.
- **Bid Ledger**: Live chronological transaction feed with winner highlighting.
- **Sold / Unsold Locks**: Freeze bidding state and update team budget & squad count atomically.

---

## 🛠 Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | **React 19 (Vite)** | Modern component-driven UI with HMR |
| **Styling** | **Vanilla CSS & Glassmorphism** | Custom design tokens, GPU acceleration, keyframe animations |
| **Backend Runtime** | **Node.js 18+ & Express** | RESTful API server & middleware orchestration |
| **Real-Time Socket** | **Socket.IO 4.x** | Bi-directional WebSocket channels for live bidding |
| **Database** | **MongoDB (Mongoose ODM)** | Document storage for users, tournaments, players, teams & bids |
| **Authentication** | **JWT & NodeMailer SMTP** | Token rotation, password hashing (bcrypt), OTP mailer |
| **Security** | **Express Rate Limit, DOMPurify, CSRF** | Defensive middleware stack against common web vulnerabilities |

---

## 📁 Architecture & Directory Structure

Monorepo architecture hosting frontend (`Auction-Project`) and backend (`Auction-Server`):

```
PROJECT-AUCTION/
├── Auction-Project/                     # FRONTEND (React 19 + Vite)
│   ├── src/
│   │   ├── assets/                      # High-res stadium artwork, logos & media
│   │   ├── components/
│   │   │   ├── common/                  # Shared UI (CricketParticles, CricketStumps, RobotCaptcha, AnimatedOtpInput, etc.)
│   │   │   ├── layout/                  # Navigation Header, Sidebar, ProgressFooter
│   │   │   ├── auction/                 # Live auction widgets (BidLedger, BidControls, SoldModal)
│   │   │   ├── players/                 # Player cards, forms & role badges
│   │   │   └── tournament/              # Tournament cards & forms
│   │   ├── pages/
│   │   │   ├── auth/                    # ForgotPasswordPage, LoginPage, RegisterPage
│   │   │   ├── landing/                 # LandingPage
│   │   │   ├── dashboard/               # DashboardPage
│   │   │   ├── auction/                 # LiveAuctionPage
│   │   │   ├── tournaments/             # Tournament views
│   │   │   └── registration/            # PublicRegistrationPage
│   │   ├── services/                    # API wrappers (axios) & WebSocket handlers
│   │   └── router/                      # React Router configuration & guards
│   ├── vite.config.js                   # Vite bundler settings
│   └── package.json
│
├── Auction-Server/                      # BACKEND (Node.js + Express)
│   ├── src/
│   │   ├── config/                      # MongoDB connection setup (`db.js`)
│   │   ├── controllers/                 # Auth, Tournament, Player, Team & Auction controllers
│   │   ├── middleware/                  # JWT auth, CAPTCHA verification, CSRF, Rate limiter, Sanitizer
│   │   ├── models/                      # User, Tournament, Player, Team, Bid schemas
│   │   ├── routes/                      # Express route endpoints
│   │   ├── socket/                      # Socket.IO event handlers (`auctionSocket.js`)
│   │   └── utils/                       # Atomic bid validator & helpers
│   ├── server.js                        # Express & Socket.IO server bootstrap
│   └── package.json
│
└── README.md                            # Project documentation
```

---

## ⚡ Real-Time Bidding Architecture

```
                      +-------------------+
                      |   Client Browser  |
                      +---------+---------+
                                |  (Socket.IO / HTTP)
                                v
                      +-------------------+
                      |   Express Server  |
                      +---------+---------+
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
   +-------------------+                 +-------------------+
   | Atomic Validator  |                 | Socket.IO Room    |
   | (Budget & Bid)    |                 | Broadcast Engine  |
   +---------+---------+                 +---------+---------+
             |                                     |
             v                                     v
   +-------------------+                 +-------------------+
   | MongoDB Database  |                 | Connected Clients |
   +-------------------+                 +-------------------+
```

### WebSocket Event Pipeline:
1. **Room Join**: Client joins tournament room (`tournament_${id}`).
2. **Bid Placement**: Client fires bid event → `bidValidator.js` checks team budget, minimum increment & timestamp.
3. **Atomic Commit**: If valid, backend records bid transaction in MongoDB.
4. **Room Broadcast**: Server broadcasts updated highest bid & ledger payload to all clients in `< 200ms`.

---

## 🔒 Security & Protection Layer

- **CAPTCHA Shield**: Prevents automated bot submissions on public forms and password resets.
- **JWT Expiration & Refresh**: Secure token rotation with 7-day expiration.
- **Input Sanitization**: XSS defense via `sanitize.js` cleaning all request body parameters.
- **CSRF Token Validation**: Anti-forgery checks on sensitive mutation endpoints.
- **Rate Limiting**: Protects authentication & OTP endpoints against brute-force attacks.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* **MongoDB**: Local MongoDB server or MongoDB Atlas URI

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/Project-auction.git
cd Project-auction

# Install Frontend dependencies
cd Auction-Project
npm install

# Install Backend dependencies
cd ../Auction-Server
npm install
```

### 2. Configure Environment Variables

**Frontend (`Auction-Project/.env`)**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Backend (`Auction-Server/.env`)**:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cricauction
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Run Locally
```bash
# Terminal 1: Start Backend Server
cd Auction-Server
npm run dev

# Terminal 2: Start Frontend Dev Server
cd Auction-Project
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📊 Project Status

- ✅ **Authentication System**: Completed with OTP, CAPTCHA & Heavy Glassmorphism Theme
- ✅ **Cricket Auction Storm Theme**: Animated stadium background, 60fps particles, glowing stumps, and ticker
- ✅ **Tournament & Roster Management**: Database schemas, APIs, and UI complete
- ✅ **Real-Time Auction Socket Engine**: Sub-200ms WebSocket bidding pipeline complete
- 🔄 **Live Production Polish**: Active performance optimization

---

## 📄 License & Credits

**Proprietary – Team ProjectSpace 2026**  
All rights reserved. Built with ❤️ for Cricket League Organizers worldwide.
