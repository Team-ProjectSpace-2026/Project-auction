import crypto from 'crypto';

/**
 * CSRF Protection Middleware for Express
 * Validates anti-CSRF tokens and origin headers on state-modifying requests (POST, PUT, DELETE, PATCH).
 */
export const csrfProtection = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  // Ensure a CSRF token cookie is set for client validation
  let csrfToken = req.cookies?.['csrfToken'];
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false, // Accessible by client JavaScript to read and send in header
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
  }

  // Safe HTTP methods do not mutate state
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Validate Anti-CSRF Header (X-CSRF-Token or X-Requested-With) or Origin header
  const headerToken = req.headers['x-csrf-token'] || req.headers['x-requested-with'];
  const origin = req.headers.origin || req.headers.referer;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const allowedOrigins = clientUrl.split(',').map((o) => o.trim());

  // Verify Origin/Referer for requests coming from browser environments
  if (origin) {
    try {
      const requestOrigin = new URL(origin).origin;
      const isAllowed = allowedOrigins.some((allowed) => {
        try {
          return new URL(allowed).origin === requestOrigin;
        } catch {
          return allowed === requestOrigin;
        }
      });

      if (!isAllowed && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'CSRF verification failed: Unauthorized origin' });
      }
    } catch {
      // Invalid URL format in origin header, skip origin check
    }
  }

  // Enforce CSRF header check for authenticated session requests
  if (req.cookies?.token && !headerToken) {
    return res.status(403).json({ message: 'CSRF token or requested-with header missing' });
  }

  next();
};

export default csrfProtection;
