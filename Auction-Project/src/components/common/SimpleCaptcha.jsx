import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const drawCaptcha = (canvas, text) => {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Dark sleek gradient background matching stadium glass theme
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(1, "#1e293b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Noise lines in soft gold / blue
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = i % 2 === 0 ? "rgba(96, 165, 250, 0.4)" : "rgba(251, 191, 36, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // Noise dots
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw text - bright crisp white and gold letters
  const fontSize = 24;
  ctx.font = `bold ${fontSize}px "Segoe UI", sans-serif`;
  ctx.textBaseline = "middle";

  const charWidth = (width - 30) / text.length;
  for (let i = 0; i < text.length; i++) {
    const x = 15 + i * charWidth + charWidth / 2;
    const y = height / 2;
    const rotation = (Math.random() - 0.5) * 0.3;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#fbbf24";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 4;
    ctx.fillText(text[i], -fontSize / 4, 0);
    ctx.restore();
  }
};

const SimpleCaptcha = forwardRef(({ onVerify, onExpire }, ref) => {
  const canvasRef = useRef(null);
  const [captchaId, setCaptchaId] = useState(null);
  const [captchaSvg, setCaptchaSvg] = useState("");
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
      setCaptchaSvg(data.captchaSvg || "");
      setCaptchaText(data.text || "");
      setStatus("ready");

      // Draw captcha on canvas if server provided text fallback
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
    <div
      style={{
        border: "1.5px solid rgba(255, 255, 255, 0.25)",
        borderRadius: "14px",
        padding: "12px 14px",
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        marginTop: "10px",
        marginBottom: "10px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.25) inset",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: "700",
          color: "#ffffff",
          marginBottom: "8px",
          textShadow: "0 1px 3px rgba(0, 0, 0, 0.6)",
          letterSpacing: "0.4px",
        }}
      >
        Security Verification
      </div>

      {status === "loading" && (
        <div style={{ fontSize: "12px", color: "#cbd5e1", padding: "14px 0", textAlign: "center" }}>
          Loading security check...
        </div>
      )}

      {status === "error" && (
        <div
          style={{
            fontSize: "12px",
            color: "#fecaca",
            padding: "8px 12px",
            background: "rgba(220, 38, 38, 0.25)",
            border: "1px solid rgba(254, 202, 202, 0.5)",
            borderRadius: "8px",
            marginBottom: "8px",
          }}
        >
          {error || "Failed to load captcha. Please try again."}
        </div>
      )}

      {status !== "loading" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
            {captchaSvg ? (
              <div
                dangerouslySetInnerHTML={{ __html: captchaSvg }}
                onClick={handleRefresh}
                title="Click to refresh"
                style={{
                  cursor: "pointer",
                  display: "inline-block",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1.5px solid rgba(255, 255, 255, 0.3)",
                }}
              />
            ) : (
              <canvas
                ref={canvasRef}
                width={190}
                height={50}
                style={{
                  border: "1.5px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                }}
                onClick={handleRefresh}
                title="Click to refresh"
              />
            )}
            <button
              type="button"
              onClick={handleRefresh}
              style={{
                padding: "8px 12px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.15)",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "700",
                color: "#ffffff",
                transition: "all 0.2s ease",
              }}
            >
              Refresh
            </button>
          </div>

          <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.75)", marginBottom: "8px", fontWeight: "500" }}>
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
                padding: "8px 12px",
                border: "1.5px solid rgba(255, 255, 255, 0.35)",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: "700",
                letterSpacing: "3px",
                background: "rgba(15, 23, 42, 0.6)",
                color: "#ffffff",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={userInput.length === 0}
              style={{
                padding: "8px 16px",
                background: userInput.length > 0 ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "rgba(255, 255, 255, 0.15)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: userInput.length > 0 ? "pointer" : "not-allowed",
                boxShadow: userInput.length > 0 ? "0 4px 12px rgba(37, 99, 235, 0.4)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              Verify
            </button>
          </div>

          {status === "verified" && (
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#4ade80", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <span>✓</span> Security Check Passed
            </div>
          )}
        </>
      )}
    </div>
  );
});

SimpleCaptcha.displayName = "SimpleCaptcha";

export default SimpleCaptcha;
