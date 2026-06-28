# CricAuction Backend Server

Complete Node.js + Express + MongoDB + Socket.IO backend for the CricAuction platform.

## Features

- **Authentication**: JWT-based user authentication
- **Tournament Management**: CRUD operations for tournaments
- **Player Management**: CRUD operations for cricket players
- **Team Management**: CRUD operations for franchise teams
- **Live Auction System**: Real-time bidding with Socket.IO
- **Bid Validation**: Atomic bid validation with budget constraints
- **MongoDB Integration**: Mongoose ODM for database operations
- **Real-time Updates**: WebSocket-based live bid broadcasting

## Setup Instructions

### 1. Install Dependencies
```bash
cd Auction-Server
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/cricauction
JWT_SECRET=your_jwt_secret_here_please_replace_with_secure_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Start MongoDB
Make sure MongoDB is running locally or provide a cloud URI.

### 4. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `POST /api/tournaments` - Create new tournament (protected)
- `GET /api/tournaments/:id` - Get specific tournament
- `PUT /api/tournaments/:id` - Update tournament (protected)
- `DELETE /api/tournaments/:id` - Delete tournament (protected)

### Players
- `GET /api/players` - Get all players
- `POST /api/players` - Create new player (protected)
- `GET /api/players/:id` - Get specific player
- `PUT /api/players/:id` - Update player (protected)
- `DELETE /api/players/:id` - Delete player (protected)

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team (protected)
- `GET /api/teams/:id` - Get specific team
- `PUT /api/teams/:id` - Update team (protected)
- `DELETE /api/teams/:id` - Delete team (protected)

### Auction
- `GET /api/auction/:tournamentId` - Get auction state
- `POST /api/auction/:tournamentId/bid` - Place bid (protected)
- `GET /api/auction/:tournamentId/bids/:playerId?` - Get bid history (protected)

## WebSocket Events

### Client → Server
- `join-tournament` - Join tournament room
- `place-bid` - Place a bid
- `reveal-player` - Reveal player information
- `start-auction` - Start auction
- `end-auction` - End auction

### Server → Client
- `new-bid` - New bid placed
- `bid-success` - Bid successful
- `bid-error` - Bid error
- `player-revealed` - Player revealed
- `auction-started` - Auction started
- `auction-ended` - Auction ended

## Data Models

### User
- name, email, mobile, password, role

### Tournament
- name, status, date, teams, format

### Player
- name, role, style, keeper, basePrice, isSold, tournamentId

### Team
- name, short, players, budget, maxPlayers, totalBudget, remainingBudget, tournamentId

### Bid
- tournamentId, playerId, teamId, amount, status, timestamp

## Development

### Scripts
- `npm run dev` - Start with nodemon
- `npm start` - Start server
- `npm test` - Run tests (to be implemented)

### Technology Stack
- Node.js 18+
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT
- bcrypt
- express-validator
- express-rate-limit