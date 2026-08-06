import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const drawCaptcha = (canvas, text) => {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#f1f5f9");
  grad.addColorStop(1, "#e2e8f0");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = i % 2 === 0 ? "rgba(59, 130, 246, 0.3)" : "rgba(217, 119, 6, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(100, 116, 139, ${0.15 + Math.random() * 0.25})`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

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
    ctx.fillStyle = i % 2 === 0 ? "#1e293b" : "#d97706";
    ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    ctx.shadowBlur = 3;
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
    setUserInput(e.target.value);
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
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "12px 14px",
        background: "#f9fafb",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: "700",
          color: "#374151",
          marginBottom: "8px",
        }}
      >
        Security Verification
      </div>

      {status === "loading" && (
        <div style={{ fontSize: "12px", color: "#6b7280", padding: "14px 0", textAlign: "center" }}>
          Loading security check...
        </div>
      )}

      {status === "error" && (
        <div
          style={{
            fontSize: "12px",
            color: "#dc2626",
            padding: "8px 12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
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
                  border: "1px solid #e5e7eb",
                }}
              />
            ) : (
              <canvas
                ref={canvasRef}
                width={190}
                height={50}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  cursor: "pointer",
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
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: "#ffffff",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "700",
                color: "#374151",
                transition: "all 0.2s ease",
              }}
            >
              Refresh
            </button>
          </div>

          <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "8px", fontWeight: "500" }}>
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
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: "700",
                letterSpacing: "3px",
                background: "#ffffff",
                color: "#111827",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={userInput.length === 0}
              style={{
                padding: "8px 16px",
                background: userInput.length > 0 ? "#1e40af" : "#e5e7eb",
                color: userInput.length > 0 ? "#ffffff" : "#9ca3af",
                border: "none",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: userInput.length > 0 ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
              }}
            >
              Verify
            </button>
          </div>

          {status === "verified" && (
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#16a34a", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
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
