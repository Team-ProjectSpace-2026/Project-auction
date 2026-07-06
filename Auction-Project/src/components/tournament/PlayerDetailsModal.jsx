import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const PlayerDetailsModal = ({ onClose, onStartBidding }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Theme-dependent colors
  const bg = isDark ? "#0f172a" : "#f4f6fb";
  const textPrimary = isDark ? "#fff" : "#1a1d2e";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "rgba(26,29,46,0.5)";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const statLabelColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(26,29,46,0.45)";
  const closeBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const closeBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const closeColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(26,29,46,0.4)";
  const closeHoverBg = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
  const closeHoverColor = isDark ? "#fff" : "#1a1d2e";
  const photoShadow = isDark ? "0 8px 40px rgba(0,0,0,0.3)" : "0 8px 40px rgba(0,0,0,0.1)";
  const roleBg = isDark ? "rgba(37,99,235,0.15)" : "rgba(37,99,235,0.08)";
  const roleBorder = isDark ? "rgba(37,99,235,0.25)" : "rgba(37,99,235,0.15)";
  const roleText = isDark ? "#60a5fa" : "#2563eb";

  return createPortal(
    <>
      <style>{`
        @keyframes detailFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes photoZoomIn {
          0% { opacity: 0; transform: scale(0.7); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }
        @keyframes nameSlideIn {
          0% { opacity: 0; transform: translateX(40px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes priceReveal {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(37,99,235,0.15); }
          50% { box-shadow: 0 0 35px rgba(37,99,235,0.3); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(37,99,235,0.3); }
          50% { border-color: rgba(37,99,235,0.6); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.6; }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          background: bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: 1,
          overflow: "hidden",
        }}
      >
        {/* Background accents */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: i % 2 === 0 ? "rgba(245,158,11,0.2)" : "rgba(37,99,235,0.2)",
              top: `${15 + i * 14}%`,
              left: `${10 + i * 15}%`,
              animation: `floatParticle ${2.5 + i * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            background: closeBg,
            border: `1px solid ${closeBorder}`,
            borderRadius: "10px",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            cursor: "pointer",
            color: closeColor,
            transition: "all 0.2s ease",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = closeHoverBg;
            e.currentTarget.style.color = closeHoverColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = closeBg;
            e.currentTarget.style.color = closeColor;
          }}
        >
          ×
        </button>

        {/* Main content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
            zIndex: 1,
            maxWidth: "900px",
            width: "100%",
            padding: "0 32px",
          }}
        >
          {/* Header title */}
          <h1
            style={{
              fontSize: "42px",
              fontWeight: "800",
              color: "#f59e0b",
              textAlign: "center",
              letterSpacing: "2px",
              animation: visible ? "fadeSlideUp 0.6s ease-out forwards" : "none",
              opacity: visible ? 1 : 0,
              textShadow: isDark ? "0 0 30px rgba(245,158,11,0.3)" : "none",
            }}
          >
            PLAYER REVEALED!
          </h1>

          {/* Player card */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              alignItems: "center",
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: "20px",
              padding: "36px",
              width: "100%",
              animation: visible ? "glowPulse 3s ease-in-out infinite" : "none",
            }}
          >
            {/* Player photo */}
            <div
              style={{
                width: "280px",
                height: "340px",
                borderRadius: "16px",
                overflow: "hidden",
                flexShrink: 0,
                border: "2px solid rgba(245,158,11,0.3)",
                animation: visible ? "photoZoomIn 0.8s ease-out 0.1s forwards, borderGlow 2s ease-in-out infinite" : "none",
                opacity: visible ? 1 : 0,
                boxShadow: photoShadow,
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a"
                alt="player"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Player details */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Name */}
              <h2
                style={{
                  fontSize: "40px",
                  fontWeight: "800",
                  color: textPrimary,
                  margin: 0,
                  letterSpacing: "-0.5px",
                  animation: visible ? "nameSlideIn 0.6s ease-out 0.3s forwards" : "none",
                  opacity: visible ? 1 : 0,
                }}
              >
                VIRAT KOHLI
              </h2>

              {/* Role badge */}
              <div
                style={{
                  animation: visible ? "fadeSlideUp 0.5s ease-out 0.5s forwards" : "none",
                  opacity: visible ? 1 : 0,
                }}
              >
                <span
                  style={{
                    background: roleBg,
                    color: roleText,
                    padding: "6px 16px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "13px",
                    letterSpacing: "1px",
                    border: `1px solid ${roleBorder}`,
                  }}
                >
                  BATSMAN
                </span>
              </div>

              {/* Stats grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginTop: "8px",
                }}
              >
                {[
                  { label: "Batting Style", value: "Right Hand Bat", delay: "0.6s" },
                  { label: "Bowling Style", value: "Medium Pace", delay: "0.75s" },
                  { label: "Nationality", value: "India", delay: "0.9s", flag: true },
                  { label: "Base Price", value: "₹50,000", delay: "1.05s", highlight: true },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      animation: visible ? `fadeSlideUp 0.5s ease-out ${stat.delay} forwards` : "none",
                      opacity: visible ? 1 : 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: statLabelColor,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px",
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: stat.highlight ? "#f59e0b" : textPrimary,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {stat.flag && <span style={{ fontSize: "18px" }}>🇮🇳</span>}
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bid section */}
          <div
            style={{
              width: "100%",
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: "16px",
              padding: "28px",
              textAlign: "center",
              animation: visible ? "fadeSlideUp 0.6s ease-out 1.1s forwards" : "none",
              opacity: visible ? 1 : 0,
            }}
          >
            <p
              style={{
                color: textSecondary,
                marginBottom: "8px",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: "600",
              }}
            >
              Starting Bid
            </p>

            <h1
              style={{
                fontSize: "48px",
                color: "#f59e0b",
                fontWeight: "800",
                marginBottom: "24px",
                animation: visible ? "priceReveal 0.6s ease-out 1.1s forwards" : "none",
                opacity: visible ? 1 : 0,
                textShadow: isDark ? "0 0 20px rgba(245,158,11,0.2)" : "none",
              }}
            >
              ₹ 50,000
            </h1>

            <button
              onClick={() => {
                if (onStartBidding) {
                  onStartBidding();
                } else {
                  navigate("/live-auction");
                }
              }}
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "14px 40px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
                animation: visible ? "fadeSlideUp 0.5s ease-out 1.3s forwards" : "none",
                opacity: visible ? 1 : 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 28px rgba(37,99,235,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.35)";
              }}
            >
              Start Bidding
            </button>

            <p
              style={{
                marginTop: "16px",
                color: textSecondary,
                fontSize: "13px",
              }}
            >
              Bidding will begin once you click Start Bidding.
            </p>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default PlayerDetailsModal;
