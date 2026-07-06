# STACK.md

## Languages
- JavaScript
- HTML/CSS

## Runtimes
- Node.js (>= 18.0.0)

## Frameworks & Libraries
- **Frontend (Auction-Project):**
  - React 19 (`react`, `react-dom`)
  - Vite (build tool)
  - React Router (`react-router-dom`)
  - Framer Motion (`framer-motion`) for animations
  - React Icons (`react-icons`)
- **Backend (Auction-Server):**
  - Express.js (`express`)
  - Socket.IO (`socket.io`) for real-time auction functionality
  - Mongoose (`mongoose`) for MongoDB ODM

## Dependencies
- **Security & Auth:** `bcrypt`, `jsonwebtoken`
- **Networking:** `axios` (Frontend), `cors` (Backend)
- **Validation:** `express-validator`
- **File Uploads:** `multer`

## Configuration
- Environment variables via `dotenv`
- Linter configured via ESLint (`eslint`, `@eslint/js`, `eslint-plugin-react`)
- Prettier for formatting
