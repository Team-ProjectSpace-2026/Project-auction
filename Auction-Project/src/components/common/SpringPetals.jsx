import { useMemo } from "react";
import "./SpringPetals.css";

// Deterministic pseudo-random generator for React 19 purity
function pseudoRandom(seed) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

const CricketParticles = ({ count = 30 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => {
      const left = pseudoRandom(index + 1) * 100;
      const duration = 5 + pseudoRandom(index + 2) * 10;
      const delay = pseudoRandom(index + 3) * 8;
      const size = 10 + pseudoRandom(index + 4) * 18;
      const opacity = 0.4 + pseudoRandom(index + 6) * 0.5;
      const swayDuration = 2 + pseudoRandom(index + 7) * 4;

      // Distribute particle types
      const typeRand = pseudoRandom(index + 10);
      let type;
      if (typeRand < 0.25) type = "cricket-ball";
      else if (typeRand < 0.45) type = "bid-tag";
      else if (typeRand < 0.7) type = "sparkle";
      else type = "confetti";

      // Bid amounts for bid-tag type
      const bidAmounts = ["₹2Cr", "₹5Cr", "₹10Cr", "₹15Cr", "₹1.5Cr", "₹7Cr", "₹3Cr", "SOLD!", "BID!", "🏏"];
      const bidText = bidAmounts[index % bidAmounts.length];

      // Confetti colors
      const confettiColors = [
        "#f97316", "#3b82f6", "#22c55e", "#eab308",
        "#ef4444", "#a855f7", "#06b6d4", "#ec4899",
      ];
      const confettiColor = confettiColors[index % confettiColors.length];

      return {
        id: index,
        type,
        left: `${left}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        swayDuration: `${swayDuration}s`,
        size,
        opacity,
        bidText,
        confettiColor,
      };
    });
  }, [count]);

  return (
    <div className="cricket-particles-container" aria-hidden="true">
      {particles.map((p) => {
        if (p.type === "cricket-ball") {
          return (
            <div
              key={p.id}
              className="cricket-particle-wrapper"
              style={{
                left: p.left,
                animationDuration: p.animationDuration,
                animationDelay: p.animationDelay,
                opacity: p.opacity,
              }}
            >
              <div
                className="cricket-ball"
                style={{ animationDuration: p.swayDuration }}
              >
                🏏
              </div>
            </div>
          );
        }

        if (p.type === "bid-tag") {
          return (
            <div
              key={p.id}
              className="cricket-particle-wrapper bid-rise"
              style={{
                left: p.left,
                animationDuration: p.animationDuration,
                animationDelay: p.animationDelay,
                opacity: p.opacity,
              }}
            >
              <div className="bid-tag-bubble" style={{ animationDuration: p.swayDuration }}>
                {p.bidText}
              </div>
            </div>
          );
        }

        if (p.type === "sparkle") {
          return (
            <div
              key={p.id}
              className="cricket-particle-wrapper sparkle-drift"
              style={{
                left: p.left,
                animationDuration: p.animationDuration,
                animationDelay: p.animationDelay,
              }}
            >
              <div
                className="sparkle-dot"
                style={{
                  width: `${p.size * 0.4}px`,
                  height: `${p.size * 0.4}px`,
                  animationDuration: p.swayDuration,
                }}
              />
            </div>
          );
        }

        // confetti
        return (
          <div
            key={p.id}
            className="cricket-particle-wrapper confetti-fall"
            style={{
              left: p.left,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
              opacity: p.opacity,
            }}
          >
            <div
              className="confetti-piece"
              style={{
                width: `${p.size * 0.6}px`,
                height: `${p.size * 0.25}px`,
                backgroundColor: p.confettiColor,
                animationDuration: p.swayDuration,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default CricketParticles;
