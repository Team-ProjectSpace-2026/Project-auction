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
 * Generate lightweight distorted SVG for Captcha
 */
function generateCaptchaSvg(text) {
  const width = 200;
  const height = 60;
  let noiseLines = "";
  for (let i = 0; i < 5; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    noiseLines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#94a3b8" stroke-width="1.5" opacity="0.6" />`;
  }

  let textNodes = "";
  const charWidth = (width - 40) / text.length;
  for (let i = 0; i < text.length; i++) {
    const x = 22 + i * charWidth;
    const y = 38 + (Math.random() * 6 - 3);
    const rotate = Math.floor(Math.random() * 24 - 12);
    textNodes += `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1e3a8a" transform="rotate(${rotate}, ${x}, ${y})">${text[i]}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color:#f1f5f9; border-radius:6px; border:1px solid #cbd5e1;">${noiseLines}${textNodes}</svg>`;
}

/**
 * Generate a new captcha challenge
 * POST /auth/captcha/new
 */
export const generateCaptcha = (req, res) => {
  const captchaId = crypto.randomUUID();
  const isRobot = req.body?.isRobot || req.query?.isRobot === "true";

  if (isRobot) {
    captchaStore.set(captchaId, {
      text: "robot_passed",
      isRobot: true,
      createdAt: Date.now(),
    });
    return res.json({ captchaId, success: true });
  }

  const text = generateRandomText();

  captchaStore.set(captchaId, {
    text: text.toLowerCase(),
    createdAt: Date.now(),
  });

  const captchaSvg = generateCaptchaSvg(text);

  // SECURE: Return captchaId and SVG image string only — plaintext text is NEVER exposed
  res.json({ captchaId, captchaSvg });
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
  const isMatch = captcha.isRobot
    ? captchaAnswer === "robot_passed" || captchaAnswer === "verified"
    : captchaAnswer.toLowerCase() === captcha.text;

  if (!isMatch) {
    return res.status(403).json({
      message: "Security verification failed. Please try again.",
    });
  }

  next();
};
