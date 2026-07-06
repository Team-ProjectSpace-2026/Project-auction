# CONCERNS.md

## Technical Debt & Issues
- Frontend lacks automated testing setup (no Vitest/RTL in dependencies).
- Backend tests are currently set to `--passWithNoTests`, indicating testing is not yet fully implemented or enforced.
- Lack of TypeScript: The project relies entirely on JavaScript, which may cause maintainability issues as the codebase grows.
- Uploads handled via `multer`, need to ensure proper storage configuration (e.g., local vs cloud storage like S3) is secure and scalable.
- Rate limiting is installed (`express-rate-limit`) but its actual strictness in the auction environment needs verification.
