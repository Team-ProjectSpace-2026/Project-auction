const verifyTurnstile = async (req, res, next) => {
  const { turnstileToken } = req.body;

  if (!turnstileToken) {
    console.log("[Turnstile] No token provided");
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
    console.log("[Turnstile] Verification result:", data);

    if (!data.success) {
      return res.status(403).json({
        message: "Security verification failed. Please try again.",
      });
    }

    // Token is valid, proceed
    next();
  } catch (error) {
    console.error("[Turnstile] Verification error:", error);
    return res.status(500).json({
      message: "Security verification error. Please try again.",
    });
  }
};

export default verifyTurnstile;
