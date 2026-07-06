# CONVENTIONS.md

## Code Style
- Configured via ESLint (`eslint.config.js`) and Prettier
- JavaScript (ES Modules `type: "module"`) in both frontend and backend

## Patterns
- Express middlewares for rate limiting (`express-rate-limit`) and validation (`express-validator`)
- JWT for stateless authentication

## Error Handling
- Handled via Express middleware and Validator response formats (implied)
- Frontend Axios interceptors for global API error handling (implied)
