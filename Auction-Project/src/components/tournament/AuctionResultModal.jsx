import { useEffect, useState, useRef } from "react";
import { Trophy, AlertTriangle, X } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { playerPhotoUrl } from "../../utils/playerPhotoUrl";
import "./AuctionResult.css";

const AuctionResultModal = ({
  status, // "sold" or "unsold"
  playerName,
  playerRole,
  playerPhoto,
  basePrice,
  soldPrice,
  winningTeam, // { name, logo, primaryColor, secondaryColor, short }
  onClose,
  onNextPlayer,
}) => {
  const [isSlammed, setIsSlammed] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const explosionSpawnedRef = useRef(false);

  // Countdown timer for display
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Set isSlammed after 700ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSlammed(true);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Canvas particle logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = [];
    const colors = status === "sold"
      ? [
          winningTeam?.primaryColor || "#1e3a8a",
          winningTeam?.secondaryColor || "#2563eb",
          "#ffffff",
          winningTeam?.primaryColor || "#1e3a8a",
          winningTeam?.secondaryColor || "#2563eb",
        ]
      : ["#ef4444", "#dc2626", "#b91c1c", "#fca5a5", "#ff0000"];

    class Particle {
      constructor(x, y, isExplosion = false) {
        this.x = x;
        this.y = y;
        this.size = isExplosion
          ? Math.random() * 5 + 3
          : Math.random() * (status === "sold" ? 8 : 4) + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        if (isExplosion) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 10 + 5;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
          this.gravity = status === "sold" ? 0.25 : 0.05;
        } else {
          // Normal background drift particles
          if (status === "sold") {
            // Confetti falling
            this.vx = Math.random() * 2 - 1;
            this.vy = Math.random() * 3 + 2; // fall down
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
            this.width = this.size * (Math.random() * 1.5 + 0.8);
            this.height = this.size * 0.6;
          } else {
            // Unsold sparks rising
            this.vx = Math.random() * 1 - 0.5;
            this.vy = -(Math.random() * 2 + 1); // rise up
          }
        }
        
        this.opacity = 1;
        this.fade = isExplosion
          ? Math.random() * 0.02 + 0.015
          : Math.random() * 0.005 + 0.003;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.gravity) {
          this.vy += this.gravity;
        }

        if (status === "sold" && !this.gravity) {
          // Sway confetti
          this.vx += Math.sin(this.y * 0.01) * 0.05;
          if (this.rotation !== undefined) {
            this.rotation += this.rotationSpeed;
          }
        } else if (status === "unsold") {
          // Sway sparks
          this.vx += Math.sin(this.y * 0.02) * 0.03;
        }

        this.opacity -= this.fade;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;

        if (status === "sold" && this.rotation !== undefined) {
          // Draw rectangular rotating confetti
          ctx.translate(this.x, this.y);
          ctx.rotate((this.rotation * Math.PI) / 180);
          ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        } else {
          // Draw circular sparks/stars
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Spawn initial background particles
    if (status === "sold") {
      for (let i = 0; i < 40; i++) {
        particles.push(new Particle(Math.random() * width, Math.random() * height));
      }
    } else {
      for (let i = 0; i < 20; i++) {
        particles.push(new Particle(Math.random() * width, height - Math.random() * 200));
      }
    }

    const spawnExplosion = () => {
      const centerX = width / 2;
      const centerY = height * 0.42; // close to player image center
      const particleCount = status === "sold" ? 60 : 40;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(centerX, centerY, true));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Check if we need to spawn the explosion on stamp slam
      if (isSlammed && !explosionSpawnedRef.current) {
        spawnExplosion();
        explosionSpawnedRef.current = true;
      }

      // Continuous spawning
      if (Math.random() < (status === "sold" ? 0.4 : 0.25)) {
        if (status === "sold") {
          // Confetti at top
          particles.push(new Particle(Math.random() * width, -10));
        } else {
          // Sparks at bottom
          particles.push(new Particle(Math.random() * width, height + 10));
        }
      }

      // Update and draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.opacity <= 0) {
          particles.splice(i, 1);
        } else {
          p.draw();
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [status, isSlammed, winningTeam]);

  const hasPhoto = !!playerPhoto;
  const photoUrl = playerPhotoUrl(playerPhoto);

  // Helper to convert hex to rgb object for dynamic shading
  const hexToRgb = (hexStr, fallback = { r: 30, g: 58, b: 138 }) => {
    if (!hexStr || typeof hexStr !== "string") return fallback;
    let c = hexStr.replace("#", "").trim();
    if (c.length === 3) {
      c = c.split("").map((x) => x + x).join("");
    }
    if (c.length !== 6) return fallback;
    const num = parseInt(c, 16);
    if (isNaN(num)) return fallback;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  // Dynamic colors for SOLD theme using exact primary color selected at team creation
  const dynamicStyles = status === "sold" ? (() => {
    const hex = winningTeam?.primaryColor || "#1e3a8a";
    const rgb = hexToRgb(hex);

    const lightR = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * 0.4));
    const lightG = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * 0.4));
    const lightB = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * 0.4));

    const darkR = Math.max(0, Math.round(rgb.r * 0.2));
    const darkG = Math.max(0, Math.round(rgb.g * 0.2));
    const darkB = Math.max(0, Math.round(rgb.b * 0.2));

    const accentR = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * 0.65));
    const accentG = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * 0.65));
    const accentB = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * 0.65));

    return {
      "--primary-color": hex,
      "--primary-color-rgb": `${rgb.r}, ${rgb.g}, ${rgb.b}`,
      "--primary-color-light": `rgb(${lightR}, ${lightG}, ${lightB})`,
      "--primary-color-dark": `rgb(${darkR}, ${darkG}, ${darkB})`,
      "--primary-color-accent": `rgb(${accentR}, ${accentG}, ${accentB})`,
      "--secondary-color": winningTeam?.secondaryColor || "#0f172a",
    };
  })() : {};

  return (
    <div
      className={`result-overlay ${status === "sold" ? "sold-theme" : "unsold-theme"}`}
      style={dynamicStyles}
    >
      {/* Background Watermark - Only Team Logo in big light color */}
      <div className="watermark-container">
        {status === "unsold" ? (
          <div className="unsold-watermark">UNSOLD</div>
        ) : winningTeam?.logo ? (
          <img
            src={winningTeam.logo}
            alt={winningTeam.name}
            className="sold-watermark"
          />
        ) : (
          <div className="sold-text-watermark">
            {winningTeam?.short || winningTeam?.name || "SOLD"}
          </div>
        )}
      </div>

      {/* Atmospheric lighting */}
      {status === "unsold" ? (
        <div className="ambient-glow-siren" />
      ) : (
        <div className="spotlight-beam" />
      )}

      {/* 60 FPS Particle Canvas */}
      <canvas ref={canvasRef} className="particles-canvas" />

      {/* Content wrapper with camera shake animation trigger */}
      <div className={`result-content-container ${isSlammed ? "shake" : ""}`}>
        
        {/* Player Image Centerpiece with Spotlight Glow */}
        <div className="focus-player-wrapper">
          <button
            className="card-top-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close"
          >
            <X size={18} />
          </button>
          {hasPhoto ? (
            <img
              src={photoUrl}
              alt={playerName}
              className="player-main-image"
            />
          ) : (
            <div
              className="player-main-image"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(30, 41, 59, 0.8)",
              }}
            >
              {status === "unsold" ? (
                <AlertTriangle size={80} strokeWidth={1} style={{ color: "#ef4444", opacity: 0.8 }} />
              ) : (
                <Trophy size={80} strokeWidth={1} style={{ color: winningTeam?.primaryColor || "#1e3a8a", opacity: 0.8 }} />
              )}
            </div>
          )}

          {/* Stamp Slam Container */}
          <div className={`stamp-slam-container ${isSlammed ? "slam" : ""}`}>
            {status === "unsold" ? (
              <div className="unsold-stamp-graphic">UNSOLD</div>
            ) : (
              <div className="sold-stamp-graphic">
                <div className="inner-circle">SOLD</div>
              </div>
            )}
          </div>
        </div>

        {/* Player Details */}
        <div className="result-info-text">
          <h1 className="result-player-name">{playerName || "Unknown Player"}</h1>
          <p className="result-player-role">{playerRole || "Player"}</p>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <div className="result-price-box">
              <span className="result-price-label">
                {status === "unsold" ? "Base Price" : "Sold Price"}
              </span>
              <span className="result-price-val">
                {status === "unsold"
                  ? formatCurrency(basePrice || 0)
                  : formatCurrency(soldPrice || 0)}
              </span>
            </div>

            {/* Broadcast-style Countdown Timer */}
            <div className="broadcast-timer-badge">
              <span className="timer-pulse-dot" />
              DECISION TIME: {countdown > 0 ? `${countdown}s` : "MANUAL PROCEED"}
            </div>

            {/* Action Buttons */}
            <div className="result-action-buttons">
              <button
                className="result-btn primary-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  if (onNextPlayer) onNextPlayer();
                }}
              >
                Reveal Next Player
              </button>
              <button
                className="result-btn secondary-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                Return to Auction
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right Winning Team Badge (Only on Sold) */}
      {status === "sold" && (
        <div className="winning-team-card" onClick={(e) => e.stopPropagation()}>
          <div className="winning-team-badge-wrapper">
            {winningTeam?.logo ? (
              <img src={winningTeam.logo} alt={winningTeam.name} />
            ) : (
              <div className="initials-badge">
                {winningTeam?.short || winningTeam?.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="winning-team-info">
            <span className="winning-team-lbl">Purchased By</span>
            <span className="winning-team-name">{winningTeam?.name || "Unknown Team"}</span>
            <span className="winning-team-price" style={{ color: winningTeam?.primaryColor || "#1e3a8a" }}>{formatCurrency(soldPrice || 0)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionResultModal;
