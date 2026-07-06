# ARCHITECTURE.md

## System Pattern
- Client-Server Architecture
- Real-time Bidirectional Communication (WebSockets) for the live auction

## Layers
1. **Frontend (Auction-Project)**
   - React components
   - React Router for SPA navigation
   - Axios for REST API communication
   - Socket.IO-client (implied) for real-time updates
2. **Backend (Auction-Server)**
   - Express server (`server.js` entry point)
   - Route handlers and controllers
   - Mongoose models for data persistence
   - Socket.IO server for real-time broadcasting

## Data Flow
- Standard HTTP REST for CRUD operations (Users, Tournaments, Teams, Players).
- WebSockets for Live Auction Control (bids, timers, sold/unsold events).

## Entry Points
- Frontend: `Auction-Project/index.html` & `src/main.jsx`
- Backend: `Auction-Server/server.js`
