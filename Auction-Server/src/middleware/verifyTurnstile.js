const verifyTurnstile = async (req, res, next) => {
  // Fail closed: if secret key is not configured, reject all requests
  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.error("[Turnstile] TURNSTILE_SECRET_KEY not configured — rejecting request");
    return res.status(503).json({
      message: "Security verification is not configured. Please contact the administrator.",
    });
  }

  const { turnstileToken } = req.body;

  if (!turnstileToken) {
    return res.status(403).json({
      message: "Security verification required. Please complete the CAPTCHA.",
    });
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
          remoteip: req.ip,
        }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      return res.status(403).json({
        message: "Security verification failed. Please try again.",
      });
    }

    // Token is valid, proceed
    next();
  } catch (error) {
    // Fail closed: network errors = reject, never allow through
    console.error("[Turnstile] Verification error:", error.message);
    return res.status(403).json({
      message: "Security verification failed. Please try again.",
    });
  }
};

export default verifyTurnstile;
