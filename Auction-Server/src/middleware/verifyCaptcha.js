import crypto from "crypto";

// In-memory captcha store with TTL
const captchaStore = new Map();
const CAPTCHA_TTL = 5 * 60 * 1000; // 5 minutes

// Cleanup expired captchas every minute
setInterval(() => {
  const now = Date.now();
  for (const [id, captcha] of captchaStore) {
    if (now - captcha.createdAt > CAPTCHA_TTL) {
      captchaStore.delete(id);
    }
  }
}, 60 * 1000);

/**
 * Generate random 5-character alphanumeric text
 */
function generateRandomText() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let text = "";
  for (let i = 0; i < 5; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

/**
 * Generate a new captcha challenge
 * POST /auth/captcha/new
 */
export const generateCaptcha = (req, res) => {
  const captchaId = crypto.randomUUID();
  const text = generateRandomText();

  captchaStore.set(captchaId, {
    text: text.toLowerCase(),
    createdAt: Date.now(),
  });

  // Return captchaId AND text (text is drawn client-side, verified server-side)
  res.json({ captchaId, text });
};

/**
 * Verify captcha answer middleware
 */
export const verifyCaptcha = async (req, res, next) => {
  const { captchaId, captchaAnswer } = req.body;

  if (!captchaId || !captchaAnswer) {
    return res.status(403).json({
      message: "Security verification required. Please complete the CAPTCHA.",
    });
  }

  const captcha = captchaStore.get(captchaId);

  if (!captcha) {
    return res.status(403).json({
      message: "Captcha expired or invalid. Please try again.",
    });
  }

  // Delete after use (one-time use)
  captchaStore.delete(captchaId);

  // Compare answers (case-insensitive)
  if (captchaAnswer.toLowerCase() !== captcha.text) {
    return res.status(403).json({
      message: "Security verification failed. Please try again.",
    });
  }

  next();
};
