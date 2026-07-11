import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuction } from "../../context/AuctionContext";
import { playerPhotoUrl } from "../../utils/playerPhotoUrl";
import StadiumBackground from "../auction/StadiumBackground";
import "./reveal-screen.css";

/**
 * PlayerRevealModal
 * 
 * Three-phase auction reveal:
 *   1. Shuffling — cards scroll rapidly across a horizontal belt
 *   2. Selection — belt decelerates, center card locks with golden glow
 *   3. Identity Reveal — card flips to show player, then transitions to details
 *
 * Uses `players` from AuctionContext. Calls `revealPlayer()` when revealing.
 * All backend/socket logic is unchanged.
 */

// Player silhouette SVG icon
const PlayerSilhouette = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <circle cx="12" cy="8" r="4.5" opacity="0.5" />
    <ellipse cx="12" cy="21" rx="8" ry="5" opacity="0.5" />
  </svg>
);

// Sparkle particle positions around the selected card
const SPARKLE_POSITIONS = [
  { top: "-12px", right: "-12px", size: 16, delay: 0 },
  { bottom: "-10px", left: "-10px", size: 13, delay: 0.3 },
  { top: "14px", left: "-14px", size: 11, delay: 0.6 },
  { bottom: "20px", right: "-14px", size: 15, delay: 0.9 },
  { top: "-8px", left: "50%", size: 9, delay: 0.4 },
  { bottom: "-6px", left: "45%", size: 10, delay: 0.7 },
];

// Card width + gap for position calculations
const CARD_WIDTH = 140;
const CARD_GAP = 16;
const CARD_STEP = CARD_WIDTH + CARD_GAP;

const PlayerRevealModal = ({ onClose, onContinue }) => {
  const { players, revealPlayer } = useAuction();

  // ---- State ----
  const [phase, setPhase] = useState("idle"); // idle | shuffling | selected | flipping | done
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSweep, setShowSweep] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const containerRef = useRef(null);
  const beltRef = useRef(null);
  const targetIndexRef = useRef(null);

  // Build card list: use all players, repeat enough to fill the strip
  const cardList = useMemo(() => {
    if (!players || players.length === 0) {
      // No players loaded yet - return empty array
      return [];
    }
    // Create enough copies to fill a long strip
    const copies = Math.max(3, Math.ceil(50 / players.length));
    const list = [];
    for (let c = 0; c < copies; c++) {
      players.forEach((p, i) => {
        list.push({
          ...p,
          _cardKey: `${c}-${i}`,
          displayNumber: String(p.registrationNumber || i + 1).padStart(3, "0"),
        });
      });
    }
    return list;
  }, [players]);

  // ---- Shuffle animation with bounce-back ----
  const startShuffle = useCallback(() => {
    setPhase("shuffling");
    startTimeRef.current = performance.now();

    // Compute target index dynamically from current cardList
    if (!players || players.length === 0) {
      targetIndexRef.current = 15;
    } else {
      const start = players.length;
      const end = Math.max(start + 1, cardList.length - players.length);
      targetIndexRef.current = start + Math.floor(Math.random() * (end - start));
    }
    const ti = targetIndexRef.current;

    // Calculate target offset to center the selected card
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const centerOffset = containerWidth / 2 - CARD_WIDTH / 2;
    const targetOffset = -(ti * CARD_STEP) + centerOffset;

    const startOffset = centerOffset;
    const totalDistance = Math.abs(targetOffset - startOffset);

    // Total duration — slower for dramatic effect
    const TOTAL_DURATION = 6000;

    // 4-phase bounce easing: fast forward → overshoot → bounce back → settle
    const bounceEase = (t) => {
      if (t < 0.50) {
        return (t / 0.50) * 0.90;
      } else if (t < 0.68) {
        const p = (t - 0.50) / 0.18;
        return 0.90 + p * 0.18;
      } else if (t < 0.84) {
        const p = (t - 0.68) / 0.16;
        return 1.08 - p * 0.11;
      } else {
        const p = (t - 0.84) / 0.16;
        return 0.97 + p * 0.03;
      }
    };

    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / TOTAL_DURATION, 1);
      const eased = bounceEase(progress);

      const currentOffset = startOffset - (totalDistance * eased);

      let wiggle = 0;
      if (progress > 0.50 && progress < 0.84) {
        wiggle = Math.sin((progress - 0.50) * 40) * 4 * (1 - (progress - 0.50) / 0.34);
      }

      // Update belt transform directly via ref (no re-render per frame)
      if (beltRef.current) {
        beltRef.current.style.transform = `translateY(calc(-50% + ${wiggle}px)) translateX(${currentOffset}px)`;
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Snap to exact target via ref
        if (beltRef.current) {
          beltRef.current.style.transform = `translateY(-50%) translateX(${targetOffset}px)`;
        }
        setSelectedIndex(ti);
        setSelectedPlayer(cardList[ti]);
        setPhase("selected");
      }
    };

    // Set initial belt position via ref
    if (beltRef.current) {
      beltRef.current.style.transform = `translateY(-50%) translateX(${startOffset}px)`;
    }
    animFrameRef.current = requestAnimationFrame(animate);
  }, [players, cardList]);

  // Auto-start shuffle on mount
  useEffect(() => {
    const timer = setTimeout(startShuffle, 600);
    return () => {
      clearTimeout(timer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [startShuffle]);

  // ---- Reveal handler ----
  const handleRevealClick = useCallback(() => {
    if (phase !== "selected" || !selectedPlayer) return;

    // Guard: don't reveal if player is placeholder or no players loaded
    if (!selectedPlayer._id || selectedPlayer._id.startsWith("placeholder")) {
      return;
    }

    // Phase: flipping
    setPhase("flipping");
    setShowSweep(true);

    // Golden sweep → card flip → transition
    setTimeout(() => setShowSweep(false), 600);
    setTimeout(() => setIsFlipped(true), 200);

    // Emit reveal-player via existing socket logic
    if (selectedPlayer._id && !selectedPlayer._id.startsWith("placeholder")) {
      revealPlayer(selectedPlayer._id);
    }

    // Transition to revealed details screen
    setTimeout(() => {
      setPhase("revealed");
    }, 900);
  }, [phase, selectedPlayer, revealPlayer]);

  // ---- Continue to auction ----
  const handleContinueToAuction = useCallback(() => {
    setPhase("done");
    onContinue();
  }, [onContinue]);

  // ---- Progress dots ----
  const progressPhase = phase === "idle" ? 0 : phase === "shuffling" ? 1 : phase === "selected" ? 2 : 3;

  return createPortal(
    <>
      {/* Golden light sweep overlay */}
      <AnimatePresence>
        {showSweep && <div className="golden-sweep" key="sweep" />}
      </AnimatePresence>

      <div className="reveal-modal" ref={containerRef}>
        <StadiumBackground />

        {/* Close button */}
        <button
          className="reveal-modal__close"
          onClick={onClose}
          aria-label="Close reveal screen"
        >
          ×
        </button>

        {/* Title */}
        <motion.h2
          className="reveal-modal__title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {phase === "selected" ? "✨ PLAYER SELECTED! ✨" : "REVEALING NEXT PLAYER"}
        </motion.h2>

        <motion.p
          className="reveal-modal__subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {phase === "selected"
            ? "Click below to reveal player details"
            : "Selecting next player for auction..."}
        </motion.p>

        {/* Card Strip */}
        <div className="card-strip">
          {/* Center selection marker */}
          <div
            className={`card-strip__center-marker ${
              phase === "selected" ? "card-strip__center-marker--selected" : ""
            }`}
          />

          {/* Scrolling belt of cards */}
          <div
            className="card-strip__belt"
            ref={beltRef}
            style={{ transition: phase === "idle" ? "none" : undefined }}
          >
            {cardList.map((card, idx) => {
              const isSelected = phase === "selected" && idx === selectedIndex;
              const isFaded = phase === "selected" && idx !== selectedIndex;

              return (
                <div
                  key={card._cardKey || card._id || idx}
                  className={`player-card ${
                    isSelected ? "player-card--selected" : ""
                  } ${isFaded ? "player-card--faded" : ""}`}
                >
                  {/* Player silhouette icon */}
                  <div className="player-card__icon">
                    <PlayerSilhouette />
                  </div>

                  {/* Registration number */}
                  <div className="player-card__number">
                    #{card.displayNumber}
                  </div>

                  {/* Label */}
                  <div className="player-card__label">PLAYER</div>

                  {/* Golden sparkle particles on selected card */}
                  {isSelected &&
                    SPARKLE_POSITIONS.map((sp, si) => (
                      <motion.span
                        key={si}
                        className="golden-particle"
                        style={{
                          top: sp.top,
                          bottom: sp.bottom,
                          left: sp.left,
                          right: sp.right,
                          fontSize: `${sp.size}px`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 1, 0],
                          scale: [0, 1.2, 1, 0],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: sp.delay,
                          ease: "easeInOut",
                        }}
                      >
                        ✦
                      </motion.span>
                    ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress dots */}
        <div className="reveal-progress">
          {[0, 1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={`reveal-progress__dot ${
                dot <= progressPhase
                  ? phase === "selected" || phase === "flipping"
                    ? "reveal-progress__dot--gold"
                    : "reveal-progress__dot--active"
                  : ""
              }`}
            />
          ))}
        </div>

        {/* Status text */}
        <div className="reveal-status">
          <motion.div
            className={`reveal-status__text ${
              phase === "selected" ? "reveal-status__text--gold" : ""
            }`}
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {phase === "idle" && "Preparing..."}
            {phase === "shuffling" && "Shuffling Players..."}
            {phase === "selected" && `Player #${selectedPlayer?.displayNumber || "???"} Selected!`}
            {(phase === "flipping" || phase === "done") && "Revealing Identity..."}
          </motion.div>
          <p className="reveal-status__hint">
            {phase === "selected"
              ? "Click the button below to reveal this player"
              : phase === "shuffling"
              ? "Please wait while we select the next player..."
              : ""}
          </p>
        </div>

        {/* Reveal button */}
        <motion.button
          className={`reveal-btn ${phase === "selected" ? "reveal-btn--gold" : ""}`}
          disabled={phase !== "selected"}
          onClick={handleRevealClick}
          initial={{ opacity: 0, y: 16 }}
          animate={{
            opacity: phase === "selected" ? 1 : 0.45,
            y: 0,
          }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 120 }}
        >
          {phase === "selected" ? "⚡ REVEAL PLAYER" : "REVEAL PLAYER"}
        </motion.button>
      </div>

      {/* Card flip overlay during reveal transition */}
      <AnimatePresence>
        {phase === "flipping" && selectedPlayer && (
          <motion.div
            className="card-flip-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ zIndex: 100000 }}
          >
            {/* Background blur */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(247,249,252,0.85)",
                backdropFilter: "blur(8px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Flipping card */}
            <motion.div
              className="card-flip"
              initial={{ scale: 1 }}
              animate={{ scale: 1.5 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 80 }}
              style={{ zIndex: 1 }}
            >
              <div className={`card-flip__inner ${isFlipped ? "card-flip__inner--flipped" : ""}`}>
                {/* Front: registration number */}
                <div className="card-flip__front">
                  <div className="player-card__icon">
                    <PlayerSilhouette />
                  </div>
                  <div className="player-card__number">
                    #{selectedPlayer.displayNumber}
                  </div>
                  <div className="player-card__label">PLAYER</div>
                </div>

                {/* Back: player identity */}
                <div className="card-flip__back">
                  {selectedPlayer.photo ? (
                    <img
                      className="card-flip__back-photo"
                      src={playerPhotoUrl(selectedPlayer.photo)}
                      alt={selectedPlayer.name || "Player"}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "36px",
                      }}
                    >
                      🏏
                    </div>
                  )}
                  <div className="card-flip__back-name">
                    {(selectedPlayer.name || "Player").toUpperCase()}
                  </div>
                  <div className="card-flip__back-role" style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.1)",
                    fontSize: "10px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    <span style={{ fontSize: "8px" }}>&#10022;</span>
                    {selectedPlayer.role || "CRICKETER"}
                  </div>

                  {/* Highlighted badges */}
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                    {selectedPlayer.battingStyle && (
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: "rgba(255,255,255,0.15)",
                        fontSize: "8px",
                        fontWeight: "600",
                      }}>{selectedPlayer.battingStyle}</span>
                    )}
                    {selectedPlayer.bowlingStyle && selectedPlayer.bowlingStyle !== "Not Applicable" && (
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: "rgba(255,255,255,0.15)",
                        fontSize: "8px",
                        fontWeight: "600",
                      }}>{selectedPlayer.bowlingStyle}</span>
                    )}
                    {selectedPlayer.style && (
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: "rgba(255,255,255,0.15)",
                        fontSize: "8px",
                        fontWeight: "600",
                      }}>{selectedPlayer.style}</span>
                    )}
                    {selectedPlayer.keeper && (
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: "rgba(124, 58, 237, 0.4)",
                        fontSize: "8px",
                        fontWeight: "700",
                      }}>WK</span>
                    )}
                  </div>

                  {/* Other details */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "8px", fontSize: "8px", color: "rgba(255,255,255,0.7)", flexWrap: "wrap", justifyContent: "center" }}>
                    {selectedPlayer.age && <span>Age: {selectedPlayer.age}</span>}
                    {selectedPlayer.mobile && <span>{selectedPlayer.countryCode} {selectedPlayer.mobile}</span>}
                    {selectedPlayer.basePrice > 0 && <span>Base: ₹{selectedPlayer.basePrice.toLocaleString("en-IN")}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PLAYER REVEALED! Full Details Screen */}
      <AnimatePresence>
        {phase === "revealed" && selectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100001,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              overflowY: "auto",
            }}
          >
            <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
              <StadiumBackground />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 2,
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(0,0,0,0.1)",
                color: "#64748b",
                fontSize: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontSize: "48px",
                fontWeight: "900",
                color: "#d97706",
                margin: "0 0 30px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                textAlign: "center",
                textShadow: "0 2px 10px rgba(217, 119, 6, 0.3)",
                position: "relative",
                zIndex: 1,
              }}
            >
              PLAYER REVEALED!
            </motion.h2>

            {/* Player Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              style={{
                background: "#fff",
                borderRadius: "20px",
                border: "3px solid #2563eb",
                padding: "40px",
                maxWidth: "700px",
                width: "100%",
                display: "flex",
                gap: "40px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Photo */}
              <div style={{
                width: "250px",
                height: "320px",
                borderRadius: "14px",
                border: selectedPlayer.photo ? "none" : "2px dashed #cbd5e1",
                background: selectedPlayer.photo ? "transparent" : "#f1f5f9",
                flexShrink: 0,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {selectedPlayer.photo ? (
                  <img
                    src={playerPhotoUrl(selectedPlayer.photo)}
                    alt={selectedPlayer.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: "64px", opacity: 0.3 }}>&#127951;</span>
                )}
              </div>

              {/* Details */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h1 style={{ fontSize: "42px", fontWeight: "900", color: "#1e293b", margin: 0, letterSpacing: "-0.5px" }}>
                  {(selectedPlayer.name || "PLAYER").toUpperCase()}
                </h1>

                {/* Role Badge */}
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "12px",
                  marginBottom: "28px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1.5px solid #2563eb",
                  background: "rgba(37, 99, 235, 0.08)",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#2563eb",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  alignSelf: "flex-start",
                }}>
                  <span style={{ fontSize: "11px" }}>&#10022;</span>
                  {selectedPlayer.role || "CRICKETER"}
                </div>

                {/* Highlighted Details */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                  {selectedPlayer.battingStyle && (
                    <div style={{
                      padding: "10px 16px",
                      borderRadius: "10px",
                      border: "1.5px solid #2563eb",
                      background: "rgba(37, 99, 235, 0.06)",
                    }}>
                      <div style={{ fontSize: "10px", fontWeight: "600", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>Batting Style</div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", marginTop: "2px" }}>{selectedPlayer.battingStyle}</div>
                    </div>
                  )}
                  {selectedPlayer.bowlingStyle && selectedPlayer.bowlingStyle !== "Not Applicable" && (
                    <div style={{
                      padding: "10px 16px",
                      borderRadius: "10px",
                      border: "1.5px solid #2563eb",
                      background: "rgba(37, 99, 235, 0.06)",
                    }}>
                      <div style={{ fontSize: "10px", fontWeight: "600", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>Bowling Style</div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", marginTop: "2px" }}>{selectedPlayer.bowlingStyle}</div>
                    </div>
                  )}
                  {selectedPlayer.keeper && (
                    <div style={{
                      padding: "10px 16px",
                      borderRadius: "10px",
                      border: "1.5px solid #7c3aed",
                      background: "rgba(124, 58, 237, 0.08)",
                    }}>
                      <div style={{ fontSize: "10px", fontWeight: "600", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.5px" }}>Role</div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#7c3aed", marginTop: "2px" }}>Wicket Keeper</div>
                    </div>
                  )}
                </div>

                {/* Other Details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {selectedPlayer.style && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Playing Style</div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{selectedPlayer.style}</div>
                    </div>
                  )}
                  {selectedPlayer.age && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Age</div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{selectedPlayer.age} Years</div>
                    </div>
                  )}
                  {selectedPlayer.mobile && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mobile</div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{selectedPlayer.countryCode} {selectedPlayer.mobile}</div>
                    </div>
                  )}
                  {selectedPlayer.basePrice > 0 && (
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Base Price</div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#d97706" }}>₹{selectedPlayer.basePrice.toLocaleString("en-IN")}</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Starting Bid & Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{
                marginTop: "30px",
                textAlign: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>Starting Bid</div>
              <div style={{ fontSize: "48px", fontWeight: "900", color: "#d97706", lineHeight: "1" }}>
                ₹{(selectedPlayer.basePrice || 0).toLocaleString("en-IN")}
              </div>

              <motion.button
                onClick={handleContinueToAuction}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  marginTop: "20px",
                  padding: "16px 48px",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 4px 20px rgba(37, 99, 235, 0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                <span style={{ fontSize: "18px" }}>&#9889;</span>
                START BIDDING
              </motion.button>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "12px" }}>
                Bidding will begin once you click Start Bidding.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
};

export default PlayerRevealModal;
