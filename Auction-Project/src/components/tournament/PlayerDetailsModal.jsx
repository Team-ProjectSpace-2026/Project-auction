import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuction } from "../../context/AuctionContext";
import { formatCurrency } from "../../utils/formatCurrency";
import StadiumBackground from "../auction/StadiumBackground";
import "./reveal-screen.css";

/**
 * PlayerDetailsModal
 *
 * Shown after the card flip reveal. Displays real player data from AuctionContext.
 * 
 * Enhanced animations:
 *   - Player image: slide from left with spring
 *   - Player name: letter-by-letter reveal
 *   - Role badge: pop scale animation
 *   - Stats: staggered fade-up
 *   - Base price: animated counter
 *   - Start Bidding button: pulse glow
 *
 * Backend/socket logic: UNCHANGED. Uses existing onStartBidding callback.
 */

// Animated price counter
const AnimatedPrice = ({ value, duration = 1200 }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!value) return;
    const start = performance.now();
    const startVal = 0;
    const endVal = value;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + (endVal - startVal) * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [value, duration]);

  return <>{formatCurrency(display)}</>;
};

// Name with letter-by-letter animation
const AnimatedName = ({ name, startDelay = 0.4 }) => {
  const chars = useMemo(() => (name || "").toUpperCase().split(""), [name]);

  return (
    <span>
      {chars.map((char, i) => (
        <span
          key={i}
          className="details-card__name-char"
          style={{
            animationDelay: `${startDelay + i * 0.04}s`,
            display: char === " " ? "inline" : "inline-block",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};

const PlayerDetailsModal = ({ onClose, onStartBidding }) => {
  const navigate = useNavigate();
  const { currentPlayer, revealedPlayer, tournamentId } = useAuction();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Use revealedPlayer first (set by socket event), fallback to currentPlayer
  const player = revealedPlayer || currentPlayer;

  const playerName = player?.name || "Player";
  const playerRole = player?.role || "";
  const playerPhoto = player?.photo || null;
  const basePrice = player?.basePrice || 0;
  const battingStyle = player?.battingStyle || player?.style || "";
  const bowlingStyle = player?.bowlingStyle || "";
  const age = player?.age || "";
  const nationality = player?.nationality || "";

  // Build stats array dynamically from available data
  const stats = useMemo(() => {
    const s = [];
    if (battingStyle) s.push({ label: "Batting Style", value: battingStyle, delay: "0.7s" });
    if (bowlingStyle) s.push({ label: "Bowling Style", value: bowlingStyle, delay: "0.85s" });
    if (age) s.push({ label: "Age", value: `${age} Years`, delay: "1.0s" });
    if (nationality) s.push({ label: "Nationality", value: nationality, delay: "1.15s", flag: true });
    if (basePrice) s.push({ label: "Base Price", value: formatCurrency(basePrice), delay: "1.3s", highlight: true });
    // Ensure at least base price is shown
    if (s.length === 0 && basePrice) {
      s.push({ label: "Base Price", value: formatCurrency(basePrice), delay: "0.7s", highlight: true });
    }
    return s;
  }, [battingStyle, bowlingStyle, age, nationality, basePrice]);

  const handleStartBidding = useCallback(() => {
    if (onStartBidding) {
      onStartBidding();
    } else {
      navigate(`/live-auction?tournamentId=${tournamentId}`);
    }
  }, [onStartBidding, navigate]);

  return createPortal(
    <div className="details-modal">
      <StadiumBackground />

      {/* Close button */}
      <button
        className="reveal-modal__close"
        onClick={onClose}
        aria-label="Close player details"
      >
        ×
      </button>

      {/* Content */}
      <div className="details-modal__content">
        {/* Header */}
        <motion.h1
          className="details-modal__header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          PLAYER REVEALED!
        </motion.h1>

        {/* Player Card */}
        <div className="details-card">
          {/* Golden accent top line rendered via CSS ::before */}

          {/* Player Photo */}
          <motion.div
            className="details-card__photo-container"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -100 }}
            transition={{
              delay: 0.15,
              duration: 0.7,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          >
            {playerPhoto ? (
              <motion.img
                className="details-card__photo"
                src={playerPhoto}
                alt={playerName}
                animate={visible ? { y: [0, -3, 0] } : {}}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              />
            ) : (
              <div className="details-card__photo-placeholder">
                <span className="details-card__photo-placeholder-icon">🏏</span>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "500" }}>
                  Player Photo
                </span>
              </div>
            )}
          </motion.div>

          {/* Player Info */}
          <div className="details-card__info">
            {/* Name with letter reveal */}
            <h2 className="details-card__name">
              {visible && <AnimatedName name={playerName} startDelay={0.4} />}
            </h2>

            {/* Role badge */}
            {playerRole && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: visible ? 1 : 0,
                  scale: visible ? [0, 1.15, 1] : 0,
                }}
                transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 200 }}
              >
                <span className="details-card__role">
                  ✦ {playerRole.toUpperCase()}
                </span>
              </motion.div>
            )}

            {/* Stats grid */}
            <div className="details-card__stats">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
                  transition={{
                    delay: parseFloat(stat.delay),
                    duration: 0.45,
                    ease: "easeOut",
                  }}
                >
                  <div className="details-card__stat-label">{stat.label}</div>
                  <div
                    className={`details-card__stat-value ${
                      stat.highlight ? "details-card__stat-value--highlight" : ""
                    }`}
                  >
                    {stat.flag && <span style={{ fontSize: "18px" }}>🇮🇳</span>}
                    {stat.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bid Section */}
        <motion.div
          className="details-bid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
        >
          <p className="details-bid__label">Starting Bid</p>

          <motion.h1
            className="details-bid__price"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
            transition={{ delay: 1.3, duration: 0.5, type: "spring", stiffness: 150 }}
          >
            {visible && <AnimatedPrice value={basePrice} duration={1200} />}
          </motion.h1>

          <motion.button
            className="details-bid__btn"
            onClick={handleStartBidding}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
            transition={{ delay: 1.5, duration: 0.5, type: "spring", stiffness: 120 }}
            whileHover={{ y: -3, boxShadow: "0 8px 36px rgba(29,78,216,0.45)" }}
            whileTap={{ scale: 0.98 }}
          >
            🏏 START BIDDING
          </motion.button>

          <motion.p
            className="details-bid__hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{ delay: 1.7, duration: 0.3 }}
          >
            Bidding will begin once you click Start Bidding.
          </motion.p>
        </motion.div>
      </div>
    </div>,
    document.body
  );
};

export default PlayerDetailsModal;
