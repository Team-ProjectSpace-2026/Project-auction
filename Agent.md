# AGENT.md — CricAuction Project Guide

> **Purpose:** This file is the single entry point for anyone (human or AI assistant) picking up work on this project. Upload this file alongside `PRD.md` to your chat session to have enough context to start working immediately.
>
> **Rule for contributors (non-negotiable):** Every time you finish a work session, update the **Current Build Status** table AND add an entry to the **Changelog** at the bottom. This is how the next person (or AI session) knows exactly where to start.


## 1. Project Summary
---

### 2026-06-22 — Tournament Hub Tab Contents Complete (AI session)
**Worked on:** Implemented all 5 tournament hub tab sections with real UI and mock data; fixed TournamentStats component styling issues.
**Changed:** Updated `TournamentHubPage.jsx` with mock tournament/teams/players data; implemented all tab contents (Overview metrics grid, Registration Link copy box, Teams budget table, Players position table, Live Auction placeholder); fixed `TournamentStats.jsx` to use inline styles and display mock data correctly (340 bids, ₹85,500 budget, 112 players sold, Active status); ensured all changes persist after dev server restart; improved `TournamentCard.jsx` rendering.
**Next step for whoever picks this up:** Connect backend API endpoints to replace mock data; add edit/delete functionality for teams and players; build remaining pages (Profile, Settings, Public Registration, Live Auction full workspace); implement real live auction interface with WebSocket integration.

---

### 2026-07-05 — Auction Engine Backend Complete (Pratham)
**Worked on:** Implemented complete auction engine with SOLD/UNSOLD socket events, auction state tracking, and REST fallback endpoints.
**Changed:** Added `currentPlayerId` and `auctionStatus` to Tournament model; added `cancelActiveBids` helper; added `mark-sold`, `mark-unsold`, `get-auction-state` socket events; modified `reveal-player` to update state; added bid rejection guard in `place-bid`; added `markSold`/`markUnsold` REST controllers and routes.
**Next step for whoever picks this up:** Pallavi needs to implement frontend socket integration (`useSocket` hook, `socket.io-client`), wire SOLD/UNSOLD buttons to emit backend events.

---

### 2026-06-22 — Tournament Hub Design & List Page Complete (AI session)
**Worked on:** Built full tournament management UI including list page and hub with tabs.
**Changed:** Created `TournamentsListPage.jsx` with search/filter/pagination; `TournamentTabs.jsx` for tab navigation; `TournamentCard.jsx` for card layout; integrated `TournamentStats` into hub; added route `/tournaments-list`; wired Sidebar navigation to route to tournaments list on click; updated build status table.
**Next step for whoever picks this up:** Fill out tab section contents (Overview metrics, Registration Link copy area, Teams grid, Players table, Live Auction workspace) or move on to building remaining pages (Profile, Team Detail, Player Directory, Live Auction full workspace).

---

### 2026-06-22 — TournamentStats component (AI session)
**Worked on:** Added `TournamentStats` UI component, export, route, and test skeleton.
**Changed:** Created `src/components/tournament/TournamentStats.jsx`, exported via index, inserted into `TournamentHubPage.jsx`, added route in `AppRouter.jsx`, wrote design spec markdown, and added unit test.
**Next step for whoever picks this up:** Implement real API in `auctionService.getStats`, style the component to match design, and verify integration with live auction data.

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
| Create Tournament | ✅ Done |
| Tournaments List | ✅ Done |
| Tournament Hub (tabbed) | ✅ Done |
| Registration Link Tab | ✅ Done |
| Teams Grid | ✅ Done |
| Players Table | ✅ Done |
| Live Auction Placeholder | ✅ Done |
| Public Registration Form | ⬜ Not started |
| Teams Panel | ⬜ Not started |
| Team Detail / Squad Roster | ⬜ Not started |
| Players Directory | ⬜ Not started |
| Pre-Auction Dashboard | ✅ Done |
| Shuffle Modal | ✅ Done |
| Player Reveal Modal | ✅ Done |
| Live Auction Room | ✅ Done (socket-integrated) |
| Sold Confirmation Modal | ✅ Done (dynamic data) |
| Unsold Confirmation Modal | ✅ Done (dynamic data) |

### Infrastructure
| Area | Status |
|---|---|
| Frontend scaffold (Vite + React) | ✅ Initialized |
| Routing setup (React Router) | ✅ Done |
| Auth Context + JWT handling | ✅ Done |
| Axios service layer (with JWT interceptor) | ✅ Done |
| Socket.IO client (`useSocket` hook) | ✅ Done |
| Auction Context (real-time state) | ✅ Done |
| BidControls component | ✅ Done |
| TeamProxyGrid component | ✅ Done |
| ActivityFeed component | ✅ Done |
| BidLedger component | ✅ Done |
| Backend scaffold (Express) | ✅ Done |
| MongoDB models | ✅ Done |
| Socket.IO server setup | ✅ Done |
| Auction Engine (bid logic, SOLD/UNSOLD) | ✅ Done |
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
- ~~Pallavi: Implement frontend socket integration (`useSocket` hook, `socket.io-client`), wire SOLD/UNSOLD buttons to backend~~ ✅ DONE
- Karthik: Complete JWT auth flow, wire login/register to backend
- Ashith: Connect tournament CRUD to backend API
- Swaroop: Fix team controller bugs, implement cascade delete
- Manasa: Connect player list to backend API, fix upload directory
- Rahul: Write Jest tests for controllers, generate API documentation

**Completed (2026-07-06):**
- ✅ Installed `socket.io-client` dependency
- ✅ Implemented `useSocket.js` hook with JWT auth and auto-reconnect
- ✅ Implemented `AuctionContext.jsx` with full auction state management
- ✅ Implemented `AuthContext.jsx` with login/register/logout and token persistence
- ✅ Added JWT token interceptor to `api.js` Axios instance
- ✅ Built `BidControls.jsx` — quick bids, custom bid, team selection, SOLD/UNSOLD buttons
- ✅ Built `TeamProxyGrid.jsx` — clickable team grid for bid targeting
- ✅ Built `ActivityFeed.jsx` — real-time live bidding feed
- ✅ Built `BidLedger.jsx` — bid history with status badges
- ✅ Rewrote `AuctionRoom.jsx` — all mock data replaced with real socket/API data
- ✅ Updated `SoldPlayerModal.jsx` and `UnsoldPlayerModal.jsx` — dynamic data props
- ✅ Updated `LiveAuctionPage.jsx` — connects to auction context, joins tournament room
- ✅ Updated `LiveAuctionTab.jsx` — passes tournamentId to live-auction route
- ✅ Updated `formatCurrency.js` — proper INR formatting with Intl.NumberFormat

**Known blockers / open questions:**
- Frontend `api.js` now injects JWT auth headers — ready for backend integration
- `AuctionContext` and `useSocket` hooks are fully implemented and working
- No `constants/socketEvents.js` file exists — event strings are inline (consider creating for consistency)

---

## 9. Conventions & Decisions

Document every team decision here. The goal: no one re-debates the same thing twice.

- **Language:** JavaScript only — do not introduce TypeScript files anywhere.
- **Component files:** PascalCase (e.g. `TeamCard.jsx`). Utility/service files: camelCase (e.g. `formatCurrency.js`).
- **Pages vs Components:** `pages/` holds route-level screens. `components/` holds anything reused across more than one page.
- **Currency formatting:** Always render INR amounts in Indian numbering format (e.g. ₹1,00,000). Use `utils/formatCurrency.js` — do not inline format logic in components.
- **Player roles:** Use the constants in `constants/roles.js` (Batsman, Bowler, All Rounder, Wicket Keeper). Do not hardcode role strings in components.
- **API calls:** All HTTP calls go through `services/` — never write `fetch`/`axios` calls directly inside components or pages.
- **Socket events:** All Socket.IO event names must be defined as constants (add a `constants/socketEvents.js` file when backend work begins) to avoid string typos across client and server. Current events: `join-tournament`, `place-bid`, `reveal-player`, `start-auction`, `end-auction`, `mark-sold`, `mark-unsold`, `get-auction-state`.
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


## Daily Work Log

---

### 2026-07-06 — Auction UI & Socket Integration Complete (Pallavi)

**Worked on:** Implemented complete frontend socket integration for the live auction room, replacing all hardcoded mock data with real-time Socket.IO communication. Built all auction sub-components, authentication context, and wired the entire auction flow end-to-end.

**Changed:**

*New Files Created:*
- `src/hooks/useSocket.js` — Socket.IO client hook with JWT authentication, auto-reconnect, connect/disconnect/emit/on helpers. Connects to `VITE_SOCKET_URL` with token from localStorage.
- `src/context/AuctionContext.jsx` — Full auction state provider managing current player, bids, teams, sold/unsold state via socket events. Exposes `placeBid`, `revealPlayer`, `markSold`, `markUnsold`, `startAuction`, `endAuction` actions. Handles all incoming socket events (`new-bid`, `player-revealed`, `player-sold`, `player-unsold`, `auction-state`).
- `src/context/AuthContext.jsx` — Full AuthProvider with login/register/logout, auto-loads user profile from JWT token on mount.
- `src/components/auction/BidControls.jsx` — Bid placement UI with 6 quick bid buttons (+₹1K to +₹50K), custom bid input, team selection grid, SOLD/UNSOLD action buttons. Validates bidding state and team selection before allowing bids.
- `src/components/auction/TeamProxyGrid.jsx` — Clickable team grid for selecting which team to bid for. Shows team name, initials, remaining budget. Highlights selected team.
- `src/components/auction/ActivityFeed.jsx` — Real-time live bidding feed showing all bids as they come in with timestamps, team avatars, and amounts.
- `src/components/auction/BidLedger.jsx` — Bid history for the current player with status badges (Active/Won/Outbid), time, team, and amount columns.

*Modified Files:*
- `src/hooks/useAuth.js` — Now re-exports `useAuth` from AuthContext.
- `src/services/api.js` — Added Axios request interceptor to automatically inject JWT `Authorization: Bearer <token>` header on all API calls.
- `src/main.jsx` — Wrapped app with `AuthProvider` and `AuctionProvider` context providers.
- `src/utils/formatCurrency.js` — Replaced placeholder with proper INR formatting using `Intl.NumberFormat("en-IN")`.
- `src/pages/auction/LiveAuctionPage.jsx` — Connects to auction context, reads `tournamentId` from URL query params, joins tournament socket room on mount.
- `src/components/tournament/AuctionRoom.jsx` — Complete rewrite: replaced all hardcoded mock data (teams, bids, player details) with real context data. Integrated BidControls, TeamProxyGrid, ActivityFeed, BidLedger components. Shows connection status banner. Dynamic player photo, name, role, age, style, base price, current bid, highest bidder.
- `src/components/tournament/SoldPlayerModal.jsx` — Now accepts dynamic `playerName`, `teamName`, `soldPrice` props instead of hardcoded values.
- `src/components/tournament/UnsoldPlayerModal.jsx` — Now accepts dynamic `playerName` prop.
- `src/components/tournament/LiveAuctionTab.jsx` — Passes `tournamentId` from route params to live-auction navigation URL.
- `Auction-Project/package.json` — Installed `socket.io-client` dependency.

*Socket Events Handled (Frontend):*
| Event | Direction | Purpose |
|-------|-----------|---------|
| `join-tournament` | Client→Server | Join tournament room on mount |
| `place-bid` | Client→Server | Submit a bid (amount, teamId, playerId) |
| `reveal-player` | Client→Server | Reveal next player for auction |
| `mark-sold` | Client→Server | Mark player sold to highest bidder |
| `mark-unsold` | Client→Server | Mark player as unsold |
| `start-auction` | Client→Server | Signal auction start |
| `end-auction` | Client→Server | Signal auction end |
| `get-auction-state` | Client→Server | Request current state on join |
| `new-bid` | Server→Client | Broadcast new bid to all clients |
| `player-revealed` | Server→Client | Broadcast revealed player data |
| `player-sold` | Server→Client | Broadcast sale details (player, team, price) |
| `player-unsold` | Server→Client | Broadcast unsold info |
| `auction-state` | Server→Client | Current auction state response |
| `bid-error` | Server→Client | Bid rejection message |
| `reveal-error` | Server→Client | Reveal error message |

**Build Status:**
- `npm run lint` — 0 errors, 0 warnings
- `npm run build` — passes successfully

**Next step for whoever picks this up:** Karthik needs to complete JWT auth flow and wire login/register to backend; Ashith needs to connect tournament CRUD to backend API; Swaroop needs to fix team controller bugs and implement cascade delete; Manasa needs to connect player list to backend API; Rahul needs to write Jest tests and generate API documentation.

---

### 2026-07-05 — Auction Engine: SOLD/UNSOLD Flow & State Management (Pratham)

**Worked on:** Implemented complete auction engine backend with SOLD/UNSOLD socket events, auction state tracking, and REST API fallback endpoints.

**Changed:**

*Backend — Tournament Model (`Auction-Server/src/models/Tournament.js`):*
- Added `currentPlayerId` field (ObjectId ref Player, default null) to track which player is currently being auctioned
- Added `auctionStatus` field (enum: idle, bidding, sold, unsold, default idle) to track auction state

*Backend — Bid Validator (`Auction-Server/src/utils/bidValidator.js`):*
- Added `cancelActiveBids(tournamentId, playerId, session)` helper function to cancel all active bids for a player (used in UNSOLD flow)
- Returns count of cancelled bids

*Backend — Socket Events (`Auction-Server/src/socket/auctionSocket.js`):*
- Added `mark-sold` event: finds active bid → calls `processWinningBid()` → updates Tournament state → broadcasts `player-sold` to all clients
- Added `mark-unsold` event: calls `cancelActiveBids()` → updates Tournament state → broadcasts `player-unsold` to all clients
- Added `get-auction-state` event: returns current player, bid, and auction status to requester (for new client sync)
- Modified `reveal-player` event: now verifies player exists, updates Tournament `currentPlayerId` and `auctionStatus = "bidding"`, broadcasts populated player data
- Added bid rejection guard in `place-bid`: rejects bids if `auctionStatus !== "bidding"` or wrong player

*Backend — Controllers (`Auction-Server/src/controllers/auction.controller.js`):*
- Added `markSold` controller: REST endpoint for marking player as sold
- Added `markUnsold` controller: REST endpoint for marking player as unsold
- Added bid rejection guard in `placeBid` controller

*Backend — Routes (`Auction-Server/src/routes/auction.routes.js`):*
- Added `POST /:tournamentId/mark-sold` route
- Added `POST /:tournamentId/mark-unsold` route

**Socket Events Summary:**
| Event | Direction | Purpose |
|-------|-----------|---------|
| `mark-sold` | Client→Server | Organizer marks player as sold |
| `mark-sold-success` | Server→Client | Confirmation to sender |
| `player-sold` | Server→Client | Broadcast sale to all clients |
| `mark-unsold` | Client→Server | Organizer marks player as unsold |
| `mark-unsold-success` | Server→Client | Confirmation to sender |
| `player-unsold` | Server→Client | Broadcast unsold to all clients |
| `get-auction-state` | Client→Server | Request current auction state |
| `auction-state` | Server→Client | Send current state to requester |

**REST Endpoints Added:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auction/:tournamentId/mark-sold` | POST | Mark player as sold (fallback) |
| `/api/auction/:tournamentId/mark-unsold` | POST | Mark player as unsold (fallback) |

**Next step for whoever picks this up:** Pallavi needs to implement frontend socket integration (`useSocket` hook, install `socket.io-client`), wire SOLD/UNSOLD buttons to emit `mark-sold`/`mark-unsold`, and listen for `player-sold`, `player-unsold`, `new-bid`, `player-revealed` events.

---

### 2026-07-05 — ESLint Lint Error Fixes (AI session)

**Worked on:** Resolved all 30 ESLint errors across 9 files in the landing page and layout components.

**Changed:**
- Removed unused `React` imports from `AboutSection.jsx`, `FeaturesSection.jsx`, `Footer.jsx`, `HeroSection.jsx`, `NavBar.jsx`, `OurAuctions.jsx`, `RecentAuctions.jsx`, `LandingPage.jsx`
- Removed unused icon imports (`FiCompass`, `FiGlobe`, `FiClock`, `FiHome`, `FiLayout`, `FiUser`, `FiSettings`, `FiLogOut`) from `FeaturesSection.jsx`, `RecentAuctions.jsx`, `TopBar.jsx`
- Removed unused variables (`location`, `handleLogout`) from `NavBar.jsx` and `TopBar.jsx`
- Removed unused `useAuth` import from `TopBar.jsx`
- Moved `Math.random()` particle/gavel arrays to module scope in `HeroSection.jsx` to satisfy `react-hooks/purity` rule
- Merged duplicate `animate`/`transition` props on scroll indicator in `HeroSection.jsx`
- Removed unused `index` prop from `AuctionCard` in `RecentAuctions.jsx`
- Added `useCallback` for `nextSlide` and fixed `useEffect` dependency array in `RecentAuctions.jsx`

**Build Status:**
- `npm run lint` — 0 errors, 0 warnings

**Next step for whoever picks this up:** Continue building remaining pages per PRD, or address any of the inline code review comments noted in previous sessions.

---

### 2026-07-01 - Dark/Light Mode Implementation & Bug Fixes

**Summary:** Implemented full dark mode support across the application, moved theme toggle to Settings page, added logout confirmation popup, and fixed multiple code quality issues.

#### Dark/Light Mode
- Added CSS variable system in `index.css` with `:root` (light) and `body.dark-mode` (dark) overrides
- Replaced all hardcoded hex colors (`#fff`, `#1a1d2e`, `#e8eaf0`, etc.) with CSS variables (`var(--card-bg-light)`, `var(--text-primary-light)`, `var(--border-light)`, etc.) across 20+ files
- Updated pages: Dashboard, TournamentsList, TournamentHub, TeamDetails, PlayerDetails, CreateTournament, EditTournament
- Updated components: MetricCard, TournamentRow, TournamentHeader, OverviewTab, TeamsTab, PlayersTab, RegistrationTab, AuctionRoom, PlayerRevealModal, SoldPlayerModal, UnsoldPlayerModal, PlayerDetailsModal, SuccessModal
- Updated CSS files: CreateTournamentPage.css, EditTournment.css, common.css
- Added new CSS variables for role badges, status colors, info boxes, warning boxes, table headers, form inputs, avatars, breadcrumbs
- Added smooth `transition` properties for color changes

#### Theme Toggle
- Removed theme toggle button from TopBar.jsx
- Added iOS-style sliding toggle switch in ProfilePage.jsx (Settings page at `/settings`)
- Toggle uses `useTheme()` context to switch between light/dark themes
- Added `.theme-toggle` CSS styles with slider animation and `:focus-visible` for keyboard accessibility

#### Login/Register Exclusion
- Added CSS variable overrides inside `.login-page` and `.register-page` containers in LoginPage.css and RegisterPage.css
- These pages force light theme colors regardless of `body.dark-mode` state

#### Logout Confirmation
- Added confirmation modal in Sidebar.jsx when Logout button is clicked
- Modal shows "Are you sure you want to logout?" with No/Yes buttons
- "Yes, Logout" clears auth tokens and navigates to `/login` with `replace: true` (prevents back-button navigation)

#### Bug Fixes
- Fixed duplicate `transition` key in Sidebar.jsx button style object (ESLint error)
- Fixed logout redirect to use `navigate("/login", { replace: true })` so users can't return to protected pages after logout
- Fixed ThemeContext flash of light theme on refresh by adding synchronous `document.body.classList` initialization before useEffect
- Fixed PlayersTab search input and select dropdown missing `color: var(--input-text)` for dark mode
- Fixed RegistrationTab URL input missing `background: var(--input-bg)` and `color: var(--input-text)`
- Fixed AuctionRoom BATSMAN badge using wrong token (`var(--accent-light)` → `var(--role-batsman-text)`)
- Fixed AuctionRoom custom bid input hardcoded border (`#d1d5db` → `var(--input-border)`)
- Added role text dark mode overrides (`--role-batsman-text`, `--role-bowler-text`, `--role-allrounder-text`, `--role-keeper-text`) in `body.dark-mode`
- Removed empty lines between CSS declarations in CreateTournamentPage.css and EditTournment.css (Stylelint fix)

#### Files Modified
- `src/index.css`
- `src/context/ThemeContext.jsx`
- `src/components/layout/TopBar.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/components/common/common.css`
- `src/components/common/SuccessModal.jsx`
- `src/components/dashboard/MetricCard.jsx`
- `src/components/dashboard/TournamentRow.jsx`
- `src/components/tournament/TournamentHeader.jsx`
- `src/components/tournament/OverviewTab.jsx`
- `src/components/tournament/TeamsTab.jsx`
- `src/components/tournament/PlayersTab.jsx`
- `src/components/tournament/RegistrationTab.jsx`
- `src/components/tournament/AuctionRoom.jsx`
- `src/components/tournament/PlayerRevealModal.jsx`
- `src/components/tournament/SoldPlayerModal.jsx`
- `src/components/tournament/UnsoldPlayerModal.jsx`
- `src/components/tournament/PlayerDetailsModal.jsx`
- `src/pages/dashboard/DashboardPage.jsx`
- `src/pages/tournaments/TournamentsListPage.jsx`
- `src/pages/tournaments/TournamentHubPage.jsx`
- `src/pages/tournaments/TeamDetailsPage.jsx`
- `src/pages/tournaments/PlayerDetailsPage.jsx`
- `src/pages/tournaments/CreateTournamentPage.css`
- `src/pages/tournaments/EditTournment.css`
- `src/pages/profile/ProfilePage.jsx`
- `src/pages/auth/LoginPage.css`
- `src/pages/auth/RegisterPage.css`

#### Build Status
- `npm run build` ✅ passes
- `npm run lint` ✅ 0 errors

---

### 2026-07-01 11:39 — Add Team Modal & Backend Integration (AI session)

**Worked on:** Added "Add Team" button to the Teams tab with a modal form for registering new teams, including full backend model updates.

**Changed:**

*Frontend:*
- Created `src/components/teams/AddTeamModal.jsx` — modal form with Team Name, Team Logo (file upload with preview), and Owner Name fields
- Updated `src/components/tournament/TeamsTab.jsx` — added "+ Add Team" button in header, modal state management, renders uploaded logo on team cards with fallback to initials

*Backend:*
- Updated `Auction-Server/src/models/Team.js` — added `logo` (String, nullable) and `ownerName` (String, required) fields
- Updated `Auction-Server/src/controllers/team.controller.js` — `createTeam` and `updateTeam` now handle `ownerName` and `logo` fields, auto-set `remainingBudget` on creation
- Updated `Auction-Server/src/utils/validators.js` — added `ownerName` validation to `validateTeam`
- Updated `Auction-Server/server.js` — increased `express.json()` payload limit to 10MB for base64 logo support

*Earlier in session:*
- Renamed `organizerName` → `ownerName` across all frontend and backend files (model, controller, validator, modal, teams tab)

**Next step for whoever picks this up:** Wire the modal's `onSubmit` to call `teamService.createTeam()` with the current tournament ID; add logo/image storage (e.g., multer + local uploads or cloud storage); connect TeamsTab to fetch teams from the API instead of mock data.

---

### 2026-07-03 — Public Registration Form Updates (Karthik)
**Worked on:** Updated `PublicRegistrationPage.jsx` with jersey details, role-based field logic, and photo cropping.
**Changed:** Added jersey number/size/name section; removed Wicket Keeper as primary role (now Batsman/Bowler/All Rounder only); added conditional field visibility per role; added `react-easy-crop` for 3:4 photo cropping with zoom; simplified mobile input (removed country code dropdown); simplified bowling styles (5 options).
**Next step for whoever picks this up:** Add jersey fields to backend Player model; test full registration flow with new fields.

---

### 2026-07-03 — Code Review Fixes & Role Reassignment (AI session)

**Worked on:** Verified and fixed 12 issues from code review across frontend components and backend controllers/services. Also restructured team role assignments.

#### Frontend Fixes
- **InputField.jsx** — Added `id`, `required`, `min`, `max` props and `htmlFor` binding on label (was dropping props passed by PublicRegistrationPage)
- **Button.jsx** — Added `disabled` and `style` prop forwarding (was silently ignoring them)
- **common.css** — Added `.cric-btn:disabled` styles for opacity and cursor
- **PublicRegistrationPage.jsx** — Extracted `DEFAULT_FORM` constant to eliminate duplication across useState, success reset, and Reset button; added `if (loading) return` guard to prevent duplicate submissions; improved error message chain to read `err.response.data.errors[0].msg` → `err.response.data.message` → `err.message` → default; made photo dropzone keyboard-accessible with `tabIndex={0}`, `role="button"`, and `onKeyDown` for Enter/Space
- **playerService.js** — Removed hardcoded `Content-Type: multipart/form-data` header (axios auto-detects correctly for FormData)
- **TournamentHubPage.jsx** — Added `useParams` for `tournamentId` route param; fetches tournament from API on mount if not in location.state
- **AppRouter.jsx** — Updated route from `/tournament-details` to `/tournament-details/:tournamentId`
- **RegistrationTab.jsx** — Removed `demo-tournament` fallback URL; added loading state guard when tournament data is missing

#### Backend Fixes
- **player.controller.js** — Added `mongoose.Types.ObjectId.isValid()` check before `Tournament.findById` (prevents CastError → 500); removed unused `isAllRounder` from destructuring; added duplicate registration check (`Player.findOne` by mobile+tournamentId → 409 Conflict)
- **upload.js** — Added `fs.mkdir` with `{ recursive: true }` to ensure `uploads/photos` directory exists before multer writes
- **validators.js** — Added `countryCode` (optional, isIn known codes), `isKeeper` (optional, isBoolean), `isAllRounder` (optional, isBoolean) validators to `validatePublicRegistration`

#### Role Reassignment
- Restructured 7-person team roles: tough roles (Auction Engine, Auth & Security, Auction UI & Socket, Tournament & Dashboard) → Pratham, Karthik, Pallivi, Ashith; easy roles (Team Management, Players & Registration, Testing & DevOps) → Swaroop, Manasa, Rahul

**Next step for whoever picks this up:** Test registration flow end-to-end with the new tournamentId route; verify upload directory creation works on fresh deploy; run full regression on dark/light mode after component changes.

---

### 2026-07-04 14:30 — CricAuction Logo Visibility & Alignment Fixes (AI session)

**Worked on:** Fixed CricAuction logo visibility, alignment, and styling issues across the sidebar, login, and registration pages based on user-reported UI problems.

**Changed:**

*Sidebar (`Sidebar.jsx`):*
- Removed logo image from sidebar header entirely
- Centered "CricAuction" heading and "CRICKET LEAGUE AUCTION MANAGEMENT" subtitle with `textAlign: "center"`
- Adjusted font sizing (`22px` heading, `9px` subtitle) and letter spacing (`1.2px`) for proper alignment within sidebar width
- Removed unused `cricauctionLogo` import

*Login Page (`LoginPage.jsx` + `LoginPage.css`):*
- Updated left panel logo to 120x120px circular with `objectFit: "cover"`
- Updated right panel card logo to 100x100px circular with consistent styling
- Changed `.login-card-icon` wrapper to `width: 100px; height: 100px` with `background: transparent` (removed gradient background)
- Fixed left panel alignment: `align-items: flex-start` with `padding: 60px 50px 40px` to prevent content from pushing downward
- Added `justify-content: center` for horizontal centering

*Register Page (`RegisterPage.jsx` + `RegisterPage.css`):*
- Applied same logo fixes as Login page for consistency
- Changed `.register-card-icon` wrapper to match login (`100x100px`, transparent background)
- Fixed left panel alignment with same padding/alignment adjustments

*All Pages:*
- Removed all `boxShadow` properties from logos (eliminated outer glow ring extending beyond logo circle)
- Removed all `border` properties from logos (eliminated visible white circle artifact around logos)
- Ensured no wrapper backgrounds create unwanted circle effects

**Next step for whoever picks this up:** Test logo rendering across different screen sizes and browser zoom levels; verify sidebar text doesn't overflow on narrow viewports; consider adding responsive breakpoints for sidebar collapse on mobile.

---

### 2026-07-06 13:40 — Hero Section Video Background & Demo Modal Complete (AI session)

**Worked on:** Implemented the hero section video background feature, including a cinematic canvas animation and a full-screen interactive YouTube video modal for the demo.

**Changed:**

*Frontend:*
- Updated `src/components/landing/HeroSection.jsx` — Replaced static background with an interactive `<canvas>` with custom high-performance particle flows, glowing orbs, light beams, and particle connection lines. Added `showVideo` modal state, body scroll-lock side-effects, and a responsive video popup overlay featuring a YouTube player embed (`q4vrzGTbEBs` cricket auction highlights), close logic, and title info bar.
- Updated `src/components/landing/HeroSection.css` — Styled the absolute-positioned `.hero-canvas-bg`, created pulsing rings/animations for the "Watch Demo" play button, designed the video modal overlay (`.video-modal-overlay`, `.video-modal-container`, `.video-glow` border gradient-shimmer, and responsive metadata bar), and optimized layout for mobile devices.

**Next step for whoever picks this up:** Replace the placeholder YouTube video ID with the final production platform overview video URL if needed; integrate lazy loading/suspend logic on the canvas container when scrolling past the fold to optimize rendering performance.