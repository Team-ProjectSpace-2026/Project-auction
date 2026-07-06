import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../context/ThemeContext";

const PlayerRevealModal = ({ onClose, onContinue }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [step, setStep] = useState(1);
  const timersRef = useRef([]);

  useEffect(() => {
    timersRef.current = [
      setTimeout(() => setStep(2), 800),
      setTimeout(() => setStep(3), 2200),
      setTimeout(() => setStep(4), 3600),
      setTimeout(() => setStep(5), 4600),
    ];
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const isShuffling = step >= 2 && step <= 3;
  const isRevealed = step >= 4;
  const isFullyRevealed = step === 5;

  const handleRevealClick = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (step < 5) {
      setStep(step + 1);
    } else {
      onContinue();
    }
  };

  // Theme-dependent colors
  const bg = isDark ? "#0f172a" : "#f4f6fb";
  const textPrimary = isDark ? "#fff" : "#1a1d2e";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "rgba(26,29,46,0.5)";
  const inactiveCardBg = isDark
    ? "linear-gradient(135deg, rgba(96,165,250,0.25), rgba(147,197,253,0.15))"
    : "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(96,165,250,0.08))";
  const inactiveDotBg = isDark ? "rgba(255,255,255,0.12)" : "rgba(26,29,46,0.1)";
  const ringColor = isDark ? "rgba(37,99,235,0.4)" : "rgba(37,99,235,0.25)";
  const cardShadow = isDark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.08)";
  const radialGlow = isDark
    ? "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)"
    : "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)";
  const closeBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const closeBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const closeColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(26,29,46,0.4)";
  const closeHoverBg = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
  const closeHoverColor = isDark ? "#fff" : "#1a1d2e";

  return createPortal(
    <>
      <style>{`
        @keyframes revealFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes titleGlow {
          0% { text-shadow: 0 0 10px rgba(37,99,235,0.3); }
          50% { text-shadow: 0 0 25px rgba(37,99,235,0.6), 0 0 50px rgba(37,99,235,0.2); }
          100% { text-shadow: 0 0 10px rgba(37,99,235,0.3); }
        }
        @keyframes slideRightFast {
          0% { transform: translateX(0) scale(1); filter: blur(0px); }
          20% { transform: translateX(80px) scale(1.03); filter: blur(3px); }
          40% { transform: translateX(60px) scale(1.01); filter: blur(2px); }
          60% { transform: translateX(30px) scale(1.02); filter: blur(1.5px); }
          80% { transform: translateX(50px) scale(1.01); filter: blur(1px); }
          100% { transform: translateX(0) scale(1); filter: blur(0px); }
        }
        @keyframes slideRightSlow {
          0% { transform: translateX(0) scale(1); filter: blur(0px); }
          30% { transform: translateX(50px) scale(1.02); filter: blur(2px); }
          60% { transform: translateX(20px) scale(1.01); filter: blur(0.5px); }
          100% { transform: translateX(0) scale(1); filter: blur(0px); }
        }
        @keyframes goldenGlow {
          0% {
            box-shadow: 0 0 0 rgba(255,200,0,0), 0 0 0 rgba(255,200,0,0);
            border-color: #2563eb;
            background: linear-gradient(135deg, #1d4ed8, #2563eb);
          }
          50% {
            box-shadow: 0 0 40px rgba(255,180,0,0.7), 0 0 80px rgba(255,180,0,0.3);
            border-color: #fbbf24;
            background: linear-gradient(135deg, #f59e0b, #d97706);
          }
          100% {
            box-shadow: 0 0 30px rgba(255,180,0,0.5), 0 0 60px rgba(255,180,0,0.2);
            border-color: #f59e0b;
            background: linear-gradient(135deg, #f59e0b, #d97706);
          }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @keyframes sparkle2 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(45deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(225deg); }
        }
        @keyframes silhouetteIn {
          0% { opacity: 0; transform: scale(0.5); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.4); }
        }
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.6; }
        }
        @keyframes btnFadeIn {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bgPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
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
        {/* Background radial glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background: radialGlow,
            pointerEvents: "none",
            animation: isRevealed ? "none" : "bgPulse 3s ease-in-out infinite",
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
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

        {/* Title */}
        <h2
          style={{
            fontSize: "36px",
            fontWeight: "800",
            color: textPrimary,
            marginBottom: "8px",
            textAlign: "center",
            letterSpacing: "-0.5px",
            animation: isRevealed ? "none" : "titleGlow 2s ease-in-out infinite",
            zIndex: 1,
          }}
        >
          Revealing Next Player
        </h2>

        <p
          style={{
            color: textSecondary,
            fontSize: "15px",
            marginBottom: "48px",
            textAlign: "center",
            zIndex: 1,
          }}
        >
          Please wait while we reveal the next player...
        </p>

        {/* Cards container */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            marginBottom: "48px",
            zIndex: 1,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => {
            const isCenter = i === 2;
            const delay = `${i * 80}ms`;

            return (
              <div
                key={i}
                style={{
                  width: isCenter ? "130px" : "100px",
                  height: isCenter ? "190px" : "145px",
                  borderRadius: "16px",
                  background:
                    isCenter && isRevealed
                      ? "linear-gradient(135deg, #f59e0b, #d97706)"
                      : !isCenter && isRevealed
                      ? inactiveCardBg
                      : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isCenter ? "56px" : "40px",
                  fontWeight: "700",
                  position: "relative",
                  animation:
                    isCenter && isRevealed
                      ? "goldenGlow 0.8s ease-out forwards"
                      : isShuffling
                      ? `slideRight${step === 2 ? "Fast" : "Slow"} 1.4s ease-in-out ${delay} infinite`
                      : "none",
                  opacity: !isCenter && isRevealed ? 0.3 : 1,
                  transition: "opacity 0.6s ease, background 0.6s ease, width 0.3s ease, height 0.3s ease",
                  boxShadow: isCenter && isRevealed
                    ? "0 0 40px rgba(255,180,0,0.4)"
                    : isCenter && isShuffling
                    ? "0 0 20px rgba(37,99,235,0.3)"
                    : cardShadow,
                }}
              >
                {/* Pulsing ring during shuffle */}
                {isCenter && isShuffling && (
                  <div
                    style={{
                      position: "absolute",
                      inset: "-8px",
                      borderRadius: "22px",
                      border: `2px solid ${ringColor}`,
                      animation: "ringPulse 1.5s ease-in-out infinite",
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* Player silhouette */}
                {isCenter && step === 5 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "silhouetteIn 0.7s ease-out forwards",
                      overflow: "hidden",
                    }}
                  >
                    <svg viewBox="0 0 100 120" style={{ width: "70px", height: "84px", opacity: 0.85 }}>
                      <circle cx="50" cy="35" r="22" fill="rgba(0,0,0,0.45)" />
                      <ellipse cx="50" cy="100" rx="35" ry="28" fill="rgba(0,0,0,0.45)" />
                    </svg>
                  </div>
                )}

                {/* Sparkle particles */}
                {isCenter && isRevealed && (
                  <>
                    <span style={{ position: "absolute", top: "-10px", right: "-10px", fontSize: "18px", color: "#fbbf24", animation: "sparkle 1.2s ease-in-out infinite" }}>✦</span>
                    <span style={{ position: "absolute", bottom: "-8px", left: "-8px", fontSize: "14px", color: "#fbbf24", animation: "sparkle2 1.4s ease-in-out infinite", animationDelay: "0.3s" }}>✦</span>
                    <span style={{ position: "absolute", top: "12px", left: "-12px", fontSize: "12px", color: "#fbbf24", animation: "sparkle 1s ease-in-out infinite", animationDelay: "0.6s" }}>✦</span>
                    <span style={{ position: "absolute", bottom: "18px", right: "-12px", fontSize: "16px", color: "#fbbf24", animation: "sparkle2 1.3s ease-in-out infinite", animationDelay: "0.9s" }}>✦</span>
                    <span style={{ position: "absolute", top: "-6px", left: "50%", fontSize: "10px", color: "#fbbf24", animation: "sparkle 1.5s ease-in-out infinite", animationDelay: "0.4s" }}>✦</span>
                    <span style={{ position: "absolute", bottom: "-4px", left: "40%", fontSize: "11px", color: "#fbbf24", animation: "sparkle2 1.1s ease-in-out infinite", animationDelay: "0.7s" }}>✦</span>
                  </>
                )}

                {!isRevealed && "?"}
              </div>
            );
          })}
        </div>

        {/* Progress dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "24px",
            zIndex: 1,
          }}
        >
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              style={{
                width: dot <= step ? "12px" : "10px",
                height: dot <= step ? "12px" : "10px",
                borderRadius: "50%",
                background: dot <= step
                  ? isRevealed ? "#f59e0b" : "#2563eb"
                  : inactiveDotBg,
                border: "none",
                transition: "all 0.3s ease",
                animation: dot === step ? "dotPulse 0.6s ease-in-out" : "none",
                boxShadow: dot <= step
                  ? isRevealed ? "0 0 8px rgba(245,158,11,0.5)" : "0 0 8px rgba(37,99,235,0.5)"
                  : "none",
              }}
            />
          ))}
        </div>

        {/* Status text */}
        <h3
          style={{
            fontSize: "26px",
            fontWeight: "700",
            marginBottom: "8px",
            color: isRevealed ? "#f59e0b" : textPrimary,
            transition: "color 0.4s ease",
            zIndex: 1,
          }}
        >
          {isRevealed ? "Player Revealed!" : "Shuffling Players..."}
        </h3>

        <p
          style={{
            color: textSecondary,
            marginBottom: "32px",
            fontSize: "14px",
            zIndex: 1,
          }}
        >
          {isFullyRevealed ? "Click below to continue." : "This will only take a few seconds."}
        </p>

        {/* Action button */}
        <button
          onClick={handleRevealClick}
          style={{
            background: isFullyRevealed
              ? "linear-gradient(135deg, #f59e0b, #d97706)"
              : "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "14px 36px",
            fontWeight: "700",
            fontSize: "15px",
            cursor: "pointer",
            zIndex: 1,
            transition: "all 0.3s ease",
            animation: isFullyRevealed ? "btnFadeIn 0.5s ease-out forwards" : "none",
            boxShadow: isFullyRevealed
              ? "0 4px 20px rgba(245,158,11,0.4)"
              : "0 4px 20px rgba(37,99,235,0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = isFullyRevealed
              ? "0 6px 28px rgba(245,158,11,0.5)"
              : "0 6px 28px rgba(37,99,235,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = isFullyRevealed
              ? "0 4px 20px rgba(245,158,11,0.4)"
              : "0 4px 20px rgba(37,99,235,0.3)";
          }}
        >
          {isFullyRevealed ? "Continue" : "Reveal Player"}
        </button>
      </div>
    </>,
    document.body
  );
};

export default PlayerRevealModal;
