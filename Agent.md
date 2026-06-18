# AGENT.md — CricAuction Project Guide

> **Purpose:** This file is the single entry point for anyone (human or AI assistant) picking up work on this project. Upload this file alongside `PRD.md` to your chat session to have enough context to start working immediately.
>
> **Rule for contributors (non-negotiable):** Every time you finish a work session, update the **Current Build Status** table AND add an entry to the **Changelog** at the bottom. This is how the next person (or AI session) knows exactly where to start.

---

## 1. Project Summary

**CricAuction** is a real-time SaaS platform for managing cricket league structures: organizer authentication, tournament creation, public player registration, team configuration, and live interactive player auctions with WebSocket-driven bidding.

Full product spec, UI layout descriptions, and component details live in [`PRD.md`](./PRD.md). This file is about **engineering state**: what's built, what's planned, how to run it, and what to do next.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), JavaScript only — no TypeScript |
| Backend | Node.js + Express |
| Database | MongoDB (via Mongoose) |
| Real-time | WebSockets (Socket.IO) |
| Auth | JWT-based authentication |
| Repo structure | Monorepo — frontend and backend are sibling folders under project root |

> **Hard rule:** Do not introduce TypeScript anywhere in this project. JS only, across both frontend and backend.

---

## 3. Target Folder Structure

This is the **agreed full structure** for the project as derived from the PRD. Build toward this. Mark folders/files as you create them in the changelog.

```
PROJECT-AUCTION/
├── .github/
│   └── workflows/
│       └── ci.yml                        ← CI pipeline (lint + build; document what it runs when confirmed)
│
├── Auction-Project/                       ← Frontend (React + Vite)
│   ├── public/
│   │   └── assets/                        ← Static images, tournament logos, team emblems
│   │
│   ├── src/
│   │   ├── assets/                        ← Local image/icon imports used in components
│   │   │
│   │   ├── components/                    ← Reusable UI components (not page-specific)
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── InputField.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Pill.jsx               ← Status/role badge pills used across the app
│   │   │   │   ├── AlertBanner.jsx        ← Info/warning/error strip banners
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── Avatar.jsx             ← Circular profile picture with camera overlay
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx            ← Global nav sidebar (organizer workspace)
│   │   │   │   ├── TopBar.jsx             ← Header bar with language selector
│   │   │   │   └── ProgressFooter.jsx     ← Fixed 4-step progress bar (PRD §3.1)
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── MetricCard.jsx         ← Telemetry ribbon cards (PRD §3.1)
│   │   │   │   └── TournamentRow.jsx      ← Row in the recent tournaments table
│   │   │   │
│   │   │   ├── tournament/
│   │   │   │   ├── TournamentCard.jsx     ← Card in the tournaments list view (PRD §3.3)
│   │   │   │   └── TournamentForm.jsx     ← Shared form for create/edit tournament
│   │   │   │
│   │   │   ├── teams/
│   │   │   │   ├── TeamCard.jsx           ← Franchise card with emblem + budget (PRD §4.4)
│   │   │   │   └── RosterTable.jsx        ← Squad table in team detail view (PRD §4.5)
│   │   │   │
│   │   │   ├── players/
│   │   │   │   ├── PlayerRow.jsx          ← Row in the global players directory (PRD §4.6)
│   │   │   │   └── PlayerForm.jsx         ← Add/edit player modal form
│   │   │   │
│   │   │   └── auction/
│   │   │       ├── BidLedger.jsx          ← Latest 5 bids sidebar (PRD §6.2)
│   │   │       ├── ActivityFeed.jsx       ← Real-time auction log timeline (PRD §6.2)
│   │   │       ├── BidControls.jsx        ← Increment buttons + custom bid field (PRD §6.1)
│   │   │       ├── TeamProxyGrid.jsx      ← All-teams emblem row for manual bid (PRD §6.1)
│   │   │       ├── PlayerRevealModal.jsx  ← Post-shuffle player reveal modal (PRD §5.3)
│   │   │       ├── ShuffleModal.jsx       ← Randomizer carousel overlay (PRD §5.2)
│   │   │       └── SoldModal.jsx          ← Sold confirmation overlay (PRD §6.4)
│   │   │
│   │   ├── pages/                         ← One file per route/screen
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx          ← PRD §2.1 — dual-column, email/password
│   │   │   │   └── RegisterPage.jsx       ← PRD §2.2 — name/email/mobile/password
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   └── ProfilePage.jsx        ← PRD §2.3 — avatar + account form grid
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.jsx      ← PRD §3.1 — metrics ribbon + tournament table
│   │   │   │
│   │   │   ├── tournaments/
│   │   │   │   ├── TournamentsListPage.jsx  ← PRD §3.3 — search/filter/card list
│   │   │   │   ├── CreateTournamentPage.jsx ← PRD §3.2 — two-column input form
│   │   │   │   └── TournamentHubPage.jsx    ← PRD §4.1 — tabbed hub (Overview / Registration Link / Teams / Players / Live Auction)
│   │   │   │
│   │   │   ├── registration/
│   │   │   │   └── PublicRegistrationPage.jsx ← PRD §4.3 — public-facing player intake form
│   │   │   │
│   │   │   ├── teams/
│   │   │   │   └── TeamDetailPage.jsx     ← PRD §4.5 — franchise detail + squad roster table
│   │   │   │
│   │   │   └── auction/
│   │   │       └── LiveAuctionPage.jsx    ← PRD §6 — full live bidding workspace
│   │   │
│   │   ├── hooks/                         ← Custom React hooks
│   │   │   ├── useAuth.js                 ← Auth state + token management
│   │   │   ├── useSocket.js               ← Socket.IO connection + event listeners
│   │   │   └── useTournament.js           ← Tournament data fetching helpers
│   │   │
│   │   ├── context/                       ← React Context providers
│   │   │   ├── AuthContext.jsx            ← Logged-in user state
│   │   │   └── AuctionContext.jsx         ← Live auction state (current player, bids, etc.)
│   │   │
│   │   ├── services/                      ← API call functions (axios wrappers)
│   │   │   ├── api.js                     ← Axios instance with base URL + auth headers
│   │   │   ├── authService.js             ← login, register, getProfile
│   │   │   ├── tournamentService.js       ← CRUD for tournaments
│   │   │   ├── playerService.js           ← CRUD for players
│   │   │   ├── teamService.js             ← Team fetch + squad roster
│   │   │   └── auctionService.js          ← Auction state, bid history
│   │   │
│   │   ├── utils/                         ← Pure helper functions
│   │   │   ├── formatCurrency.js          ← ₹ formatting (e.g. ₹1,00,000)
│   │   │   ├── formatDate.js
│   │   │   └── validators.js              ← Form validation helpers
│   │   │
│   │   ├── constants/
│   │   │   └── roles.js                   ← Player role enums: Batsman, Bowler, All Rounder, Wicket Keeper
│   │   │
│   │   ├── router/
│   │   │   └── AppRouter.jsx              ← React Router routes + auth guards
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example                       ← Template for required env vars (see §5)
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── Auction-Server/                        ← Backend (Node.js + Express) — scaffold when ready
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                      ← MongoDB connection setup
│   │   │
│   │   ├── models/                        ← Mongoose schemas
│   │   │   ├── User.js                    ← Organizer account
│   │   │   ├── Tournament.js              ← Tournament entity
│   │   │   ├── Player.js                  ← Registered player
│   │   │   ├── Team.js                    ← Franchise/team with budget
│   │   │   └── Bid.js                     ← Bid transaction record
│   │   │
│   │   ├── routes/                        ← Express route definitions
│   │   │   ├── auth.routes.js             ← POST /auth/login, /auth/register
│   │   │   ├── tournament.routes.js       ← CRUD /tournaments
│   │   │   ├── player.routes.js           ← CRUD /players
│   │   │   ├── team.routes.js             ← GET /teams, /teams/:id
│   │   │   └── auction.routes.js          ← Auction state endpoints
│   │   │
│   │   ├── controllers/                   ← Route handler logic
│   │   │   ├── auth.controller.js
│   │   │   ├── tournament.controller.js
│   │   │   ├── player.controller.js
│   │   │   ├── team.controller.js
│   │   │   └── auction.controller.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js         ← JWT verification guard
│   │   │   └── errorHandler.js            ← Centralized error response formatter
│   │   │
│   │   ├── socket/
│   │   │   ├── auctionSocket.js           ← Socket.IO event handlers for live bidding
│   │   │   └── socketManager.js           ← Socket server init + room management
│   │   │
│   │   └── utils/
│   │       └── bidValidator.js            ← Atomic bid validation (floor price, budget cap)
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js                          ← Entry point — Express app + Socket.IO init
│
├── node_modules/
├── AGENT.md                               ← You are here
├── PRD.md                                 ← Full product requirements doc
├── package.json                           ← Root monorepo wrapper
├── package-lock.json
└── README.md
```

---

## 4. Screen → PRD Section Map

Use this when building a page or component — it maps each screen directly to where the spec lives in `PRD.md`.

| Screen / Component | PRD Section | Notes |
|---|---|---|
| Login Page | §2.1 | Dual-column layout, email + password |
| Register Page | §2.2 | Gold CTA button distinguishes it from login |
| Profile & Settings | §2.3 | Avatar upload, account form, disclaimer banner |
| Organizer Dashboard | §3.1 | Metrics ribbon, recent tournaments table, progress footer |
| Create Tournament | §3.2 | Two-column form, calendar picker for auction date |
| Tournaments List | §3.3 | Search + filter + card grid + pagination |
| Tournament Hub (tabs) | §4.1 | 5 tabs: Overview, Registration Link, Teams, Players, Live Auction |
| Registration Link Tab | §4.2 | Copy link, registration settings summary |
| Public Registration Form | §4.3 | External-facing; photo upload, role grid, bowling type radio |
| Teams Panel | §4.4 | Franchise cards, emblem, budget remaining |
| Team Detail / Squad | §4.5 | Roster table: #, Name, Role, Purchase Price |
| Players Directory | §4.6 | Full player table with edit/delete per row |
| Pre-Auction Dashboard | §5.1 | "Start Auction" CTA, warning notice |
| Shuffle / Randomizer Modal | §5.2 | Carousel animation, blur background |
| Player Reveal Modal | §5.3 | Left photo + right attributes + "Start Bidding" |
| Live Auction Room | §6.1–§6.3 | Full bidding workspace — see ASCII layout in PRD §6 |
| Sold Confirmation Modal | §6.4 | SOLD overlay, auto-close countdown timer |

---

## 5. Current Build Status

> ⚠️ Always check the **Changelog** below for the most recent update — this table reflects the state at the last entry.

### Frontend Screens
| Screen | Status |
|---|---|
| Login Page | ⬜ Not started |
| Register Page | ⬜ Not started |
| Profile & Settings | ⬜ Not started |
| Organizer Dashboard | ⬜ Not started |
| Create Tournament | ⬜ Not started |
| Tournaments List | ⬜ Not started |
| Tournament Hub (tabbed) | ⬜ Not started |
| Registration Link Tab | ⬜ Not started |
| Public Registration Form | ⬜ Not started |
| Teams Panel | ⬜ Not started |
| Team Detail / Squad Roster | ⬜ Not started |
| Players Directory | ⬜ Not started |
| Pre-Auction Dashboard | ⬜ Not started |
| Shuffle Modal | ⬜ Not started |
| Player Reveal Modal | ⬜ Not started |
| Live Auction Room | ⬜ Not started |
| Sold Confirmation Modal | ⬜ Not started |

### Infrastructure
| Area | Status |
|---|---|
| Frontend scaffold (Vite + React) | ✅ Initialized |
| Routing setup (React Router) | ⬜ Not started |
| Auth Context + JWT handling | ⬜ Not started |
| Axios service layer | ⬜ Not started |
| Backend scaffold (Express) | ⬜ Not started |
| MongoDB models | ⬜ Not started |
| Socket.IO setup | ⬜ Not started |
| CI/CD (`ci.yml`) | ⚠️ File exists — contributor: document what it runs |
| Deployment | ⬜ Not configured |

---

## 6. Environment Variables

### Frontend (`Auction-Project/.env`)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (`Auction-Server/.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/cricauction
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

> Copy `.env.example` in each folder to `.env` and fill in values. Never commit `.env` files.

---

## 7. Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd <project-root>

# Frontend
cd Auction-Project
npm install
npm run dev                    # Runs on http://localhost:5173

# Backend (once Auction-Server/ exists)
cd ../Auction-Server
npm install
npm run dev                    # Runs on http://localhost:5000
```

- **Node version:** 18+ required (confirm and lock in `.nvmrc` when decided)
- **MongoDB:** Must be running locally or provide a cloud URI (MongoDB Atlas) in `MONGO_URI`
- **Root `package.json`:** Currently a monorepo wrapper — contributor: confirm if it has workspace scripts or is unused boilerplate

---

## 8. Where to Pick Up Next

> Update this every session — this is the literal answer to "what do I do first?"

**Current priority:**
*(contributor: fill this in — e.g. "Build Login + Register pages per PRD §2.1–2.2" or "Scaffold Auction-Server/ with Express + Mongoose")*

**Known blockers / open questions:**
- Root `package.json` purpose not yet confirmed — does it run scripts or is it boilerplate?
- `ci.yml` contents not yet documented — what does it actually run?
- Node version not locked — add `.nvmrc` when decided
- State management decision pending — Context API is the default assumption; switch to Zustand if complexity grows (decide and document before building auction logic)
- Socket.IO room strategy not yet designed — each tournament gets its own room? Confirm before building `auctionSocket.js`

---

## 9. Conventions & Decisions

Document every team decision here. The goal: no one re-debates the same thing twice.

- **Language:** JavaScript only — do not introduce TypeScript files anywhere.
- **Component files:** PascalCase (e.g. `TeamCard.jsx`). Utility/service files: camelCase (e.g. `formatCurrency.js`).
- **Pages vs Components:** `pages/` holds route-level screens. `components/` holds anything reused across more than one page.
- **Currency formatting:** Always render INR amounts in Indian numbering format (e.g. ₹1,00,000). Use `utils/formatCurrency.js` — do not inline format logic in components.
- **Player roles:** Use the constants in `constants/roles.js` (Batsman, Bowler, All Rounder, Wicket Keeper). Do not hardcode role strings in components.
- **API calls:** All HTTP calls go through `services/` — never write `fetch`/`axios` calls directly inside components or pages.
- **Socket events:** All Socket.IO event names must be defined as constants (add a `constants/socketEvents.js` file when backend work begins) to avoid string typos across client and server.
- **Auth guards:** Protected routes are wrapped in a guard component inside `router/AppRouter.jsx` — do not implement auth checks inside individual page components.
- *(add more as decisions are made)*

---

## 10. Real-Time Architecture Notes

The live auction room (PRD §6) is the most complex part of the system. Key rules:

- Bids must be broadcast to all connected clients within **< 200ms** (PRD §7.1).
- **Atomic bid validation** happens server-side only — the backend rejects any bid below the current floor or above the team's remaining budget. The client never trusts its own bid calculation (PRD §7.2).
- Near-simultaneous bids are resolved by **server arrival order**. Slower conflicting bids trigger an error broadcast that refreshes all clients with the correct current bid.
- The shuffle/randomizer (PRD §5.2) selects players randomly server-side. The frontend only animates — it does not control which player is selected.
- Each tournament should have its own Socket.IO room so events don't bleed across tournaments.

---

## 11. Changelog / Update Log

> **Append-only.** Add a new entry at the top. Do not edit or delete past entries — this is the project's history. Include: date, who/what worked on it, what changed, and what's next.

### Template
```
### YYYY-MM-DD — [Your name / handle / "AI session"]
**Worked on:**
**Changed:**
**Next step for whoever picks this up:**
```

---

### 2026-06-18 — AGENT.md restructure (AI session)
**Worked on:** Rewrote `AGENT.md` from scratch based on `PRD.md` v4.0.
**Changed:** Added full target folder structure for both `Auction-Project/` (frontend) and `Auction-Server/` (backend) derived from PRD requirements; added screen → PRD section map; expanded build status table to cover all 17 screens; added environment variable reference; added real-time architecture notes; expanded conventions section; added open questions to §8.
**Next step for whoever picks this up:** Confirm open questions in §8 (root `package.json`, `ci.yml`, Node version, state management choice), then start building — recommended starting point is Login + Register pages (PRD §2.1–2.2) to get auth flow working end-to-end before building data screens.

---

### 2026-06-18 — Initial setup
**Worked on:** Created `AGENT.md` to replace `AI-GUIDE.md` as the team/AI onboarding doc.
**Changed:** Documented current repo structure (frontend-only, MERN stack, React+Vite+JS), confirmed no backend exists yet, set up status table and changelog format.
**Next step for whoever picks this up:** Fill in the placeholder sections above (env vars, CI workflow contents, root package.json purpose, first dev priority) with real project details, then start building frontend screens per `PRD.md` or scaffold the backend — whichever the team decides first.
