import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const drawCaptcha = (canvas, text) => {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Background
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, width, height);

  // Noise lines
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 150}, ${Math.random() * 150}, ${Math.random() * 150}, 0.5)`;
    ctx.lineWidth = 1 + Math.random();
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // Noise dots
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200}, 0.6)`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw text
  const fontSize = 28;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textBaseline = "middle";

  const charWidth = (width - 40) / text.length;
  for (let i = 0; i < text.length; i++) {
    const x = 20 + i * charWidth + charWidth / 2;
    const y = height / 2;
    const rotation = (Math.random() - 0.5) * 0.4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = `rgb(${30 + Math.random() * 50}, ${30 + Math.random() * 50}, ${30 + Math.random() * 50})`;
    ctx.fillText(text[i], -fontSize / 4, 0);
    ctx.restore();
  }
};

const SimpleCaptcha = forwardRef(({ onVerify, onExpire }, ref) => {
  const canvasRef = useRef(null);
  const [captchaId, setCaptchaId] = useState(null);
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const fetchCaptcha = useCallback(async () => {
    try {
      setStatus("loading");
      setError(null);
      setUserInput("");

      const csrfMatch = document.cookie.match(new RegExp("(^| )csrfToken=([^;]+)"));
      const res = await fetch(`${API_BASE}/auth/captcha/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...(csrfMatch?.[2] && { "X-CSRF-Token": csrfMatch[2] }),
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load captcha");

      setCaptchaId(data.captchaId);
      setCaptchaText(data.text);
      setStatus("ready");

      // Draw captcha on canvas using server-provided text
      if (canvasRef.current && data.text) {
        drawCaptcha(canvasRef.current, data.text);
      }
    } catch (err) {
      setError(err.message);
      setStatus("error");
      if (onExpire) onExpire();
    }
  }, [onExpire]);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  useEffect(() => {
    if (status === "ready" && canvasRef.current && captchaText) {
      drawCaptcha(canvasRef.current, captchaText);
    }
  }, [status, captchaText]);

  const handleRefresh = () => {
    fetchCaptcha();
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
  };

  const handleVerify = () => {
    if (userInput.length > 0 && captchaId) {
      setStatus("verified");
      if (onVerify) onVerify(userInput, captchaId);
    }
  };

  useImperativeHandle(ref, () => ({
    resetCaptcha: () => {
      fetchCaptcha();
    },
  }));

  return (
    <div style={{
      border: "1px solid var(--border-light)",
      borderRadius: "10px",
      padding: "16px",
      background: "var(--card-bg-light)",
      marginTop: "16px",
    }}>
      <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary-light)", marginBottom: "10px" }}>
        Security Verification
      </div>

      {status === "loading" && (
        <div style={{ fontSize: "12px", color: "var(--text-secondary-light)", padding: "20px 0", textAlign: "center" }}>
          Loading captcha...
        </div>
      )}

      {status === "error" && (
        <div style={{ fontSize: "12px", color: "#dc2626", padding: "10px", background: "#fef2f2", borderRadius: "6px", marginBottom: "10px" }}>
          {error || "Failed to load captcha. Please try again."}
        </div>
      )}

      {status !== "loading" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <canvas
              ref={canvasRef}
              width={200}
              height={60}
              style={{
                border: "1px solid var(--border-light)",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              onClick={handleRefresh}
              title="Click to refresh"
            />
            <button
              type="button"
              onClick={handleRefresh}
              style={{
                padding: "8px 12px",
                border: "1px solid var(--border-light)",
                borderRadius: "6px",
                background: "var(--card-bg-light)",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-primary-light)",
              }}
            >
              Refresh
            </button>
          </div>

          <div style={{ fontSize: "11px", color: "var(--text-secondary-light)", marginBottom: "8px" }}>
            Type the text shown in the image above
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={userInput}
              onChange={handleChange}
              maxLength={captchaText.length || 5}
              placeholder="Enter text"
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid var(--border-light)",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                letterSpacing: "3px",
                background: "var(--input-bg)",
                color: "var(--input-text)",
              }}
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={userInput.length === 0}
              style={{
                padding: "10px 16px",
                background: userInput.length > 0 ? "var(--accent-light)" : "#94a3b8",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: userInput.length > 0 ? "pointer" : "not-allowed",
              }}
            >
              Verify
            </button>
          </div>

          {status === "verified" && (
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#16a34a", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>&#10003;</span> Verified
            </div>
          )}
        </>
      )}
    </div>
  );
});

SimpleCaptcha.displayName = "SimpleCaptcha";

export default SimpleCaptcha;
