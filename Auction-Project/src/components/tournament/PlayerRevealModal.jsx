import { useState, useEffect, useRef } from "react";

const PlayerRevealModal = ({ onClose, onContinue }) => {
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

  return (
    <>
      <style>{`
        @keyframes slideRightFast {
          0% { transform: translateX(0); filter: blur(0px); }
          25% { transform: translateX(70px); filter: blur(4px); }
          50% { transform: translateX(50px); filter: blur(3px); }
          75% { transform: translateX(20px); filter: blur(1px); }
          100% { transform: translateX(0); filter: blur(0px); }
        }
        @keyframes slideRightSlow {
          0% { transform: translateX(0); filter: blur(0px); }
          30% { transform: translateX(40px); filter: blur(2px); }
          60% { transform: translateX(15px); filter: blur(0.5px); }
          100% { transform: translateX(0); filter: blur(0px); }
        }
        @keyframes goldenGlow {
          0% { box-shadow: 0 0 0 rgba(255,200,0,0); border: 3px solid #2563eb; background: linear-gradient(135deg,#1d4ed8,#2563eb); }
          100% { box-shadow: 0 0 35px rgba(255,180,0,0.6), 0 0 60px rgba(255,180,0,0.3); border: 3px solid #f59e0b; background: linear-gradient(135deg,#f59e0b,#d97706); }
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
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: "560px",
            background: "var(--card-bg-light)",
            borderRadius: "20px",
            padding: "32px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            transition: 'background-color 0.2s ease',
          }}
        >
          <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary-light)' }}>
            ×
          </button>
          <h2
            style={{
              fontSize: "30px",
              fontWeight: "700",
              marginBottom: "10px",
              color: "var(--text-primary-light)",
            }}
          >
            Revealing Next Player
          </h2>

          <p
            style={{
              color: "var(--text-secondary-light)",
              marginBottom: "30px",
            }}
          >
            Please wait while we reveal the next player...
          </p>

          {/* Cards */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              marginBottom: "30px",
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => {
              const isCenter = i === 2;
              const delay = `${i * 100}ms`;

              return (
                <div
                  key={i}
                  style={{
                    width: isCenter ? "100px" : "80px",
                    height: isCenter ? "150px" : "120px",
                    borderRadius: "14px",
                    background: isCenter && isRevealed
                      ? "linear-gradient(135deg, #f59e0b, #d97706)"
                      : !isCenter && isRevealed
                      ? "linear-gradient(135deg, #93c5fd, #60a5fa)"
                      : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isCenter ? "50px" : "38px",
                    fontWeight: "700",
                    position: "relative",
                    animation: isCenter && isRevealed
                      ? "goldenGlow 0.8s ease-out forwards"
                      : isShuffling
                      ? `slideRight${step === 2 ? "Fast" : "Slow"} 1.4s ease-in-out ${delay} infinite`
                      : "none",
                    opacity: !isCenter && isRevealed ? 0.5 : 1,
                    transition: "opacity 0.5s ease, background 0.5s ease",
                  }}
                >
                  {isCenter && step === 5 && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "silhouetteIn 0.6s ease-out forwards",
                        overflow: "hidden",
                      }}
                    >
                      <svg
                        viewBox="0 0 100 120"
                        style={{ width: "60px", height: "72px", opacity: 0.85 }}
                      >
                        <circle cx="50" cy="35" r="22" fill="rgba(0,0,0,0.5)" />
                        <ellipse cx="50" cy="100" rx="35" ry="28" fill="rgba(0,0,0,0.5)" />
                      </svg>
                    </div>
                  )}

                  {isCenter && isRevealed && (
                    <>
                      <span style={{ position: "absolute", top: "-8px", right: "-8px", fontSize: "16px", color: "#f59e0b", animation: "sparkle 1.2s ease-in-out infinite" }}>✦</span>
                      <span style={{ position: "absolute", bottom: "-6px", left: "-6px", fontSize: "12px", color: "#f59e0b", animation: "sparkle2 1.4s ease-in-out infinite", animationDelay: "0.3s" }}>✦</span>
                      <span style={{ position: "absolute", top: "10px", left: "-10px", fontSize: "10px", color: "#f59e0b", animation: "sparkle 1s ease-in-out infinite", animationDelay: "0.6s" }}>✦</span>
                      <span style={{ position: "absolute", bottom: "15px", right: "-10px", fontSize: "14px", color: "#f59e0b", animation: "sparkle2 1.3s ease-in-out infinite", animationDelay: "0.9s" }}>✦</span>
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
              gap: "8px",
              marginBottom: "18px",
            }}
          >
            {[1, 2, 3, 4, 5].map((dot) => (
              <div
                key={dot}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: dot <= step ? "#2563eb" : "transparent",
                  border: dot <= step ? "none" : "2px solid #cbd5e1",
                  transition: "all 0.3s ease",
                  animation: dot === step ? "dotPulse 0.6s ease-in-out" : "none",
                }}
              />
            ))}
          </div>

          {/* Status text */}
          <h3
            style={{
              fontSize: "22px",
              fontWeight: "700",
              marginBottom: "8px",
              color: isRevealed ? "#f59e0b" : "var(--text-primary-light)",
              transition: "color 0.3s ease",
            }}
          >
            {isRevealed ? "Player Revealed!" : "Shuffling Players..."}
          </h3>

          <p
            style={{
              color: "var(--text-secondary-light)",
              marginBottom: "24px",
            }}
          >
            {isFullyRevealed
              ? "Click below to continue."
              : "This will only take a few seconds."}

          </p>

          <button
            onClick={handleRevealClick}
            style={{
              background: "var(--accent-light)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 28px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {isFullyRevealed ? "Continue" : "Reveal Player"}

          </button>
        </div>
      </div>
    </>
  );
};

export default PlayerRevealModal;