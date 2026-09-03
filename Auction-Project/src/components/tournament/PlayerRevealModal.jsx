import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuction } from "../../context/AuctionContext";
import { playerPhotoUrl } from "../../utils/playerPhotoUrl";
import StadiumBackground from "../auction/StadiumBackground";
import AuctionConcludedModal from "./AuctionConcludedModal";
import "./reveal-screen.css";

/**
 * PlayerRevealModal
 * 
 * Two-phase auction reveal:
 *   1. Shuffling — cards scroll rapidly across a horizontal belt
 *   2. Selection — belt decelerates, center card locks with golden glow
 *   3. Flip — card flips to reveal player identity, then transitions to PlayerDetailsModal
 *
 * Uses `players` from AuctionContext. Calls `revealPlayer()` when revealing.
 * After flip, calls `onContinue()` to show PlayerDetailsModal (the single "PLAYER REVEALED!" screen).
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
  const { players, revealPlayer, tournamentId, reauctionUnsold } = useAuction();

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

  // Filter available players: exclude sold players, include unsold only when no fresh remain
  const availablePlayers = useMemo(() => {
    const fresh = (players || []).filter((p) => !p.isSold && !p.isUnsold);
    if (fresh.length > 0) return fresh;
    return (players || []).filter((p) => !p.isSold && p.isUnsold);
  }, [players]);

  // Build card list: use available players, repeat enough to fill the strip
  const cardList = useMemo(() => {
    if (!availablePlayers || availablePlayers.length === 0) {
      // No available players loaded/remaining
      return [];
    }
    // ponytail: enough copies to fill ~2 screens of scroll, max 30 DOM nodes
    const copies = Math.max(1, Math.ceil(30 / availablePlayers.length));
    const list = [];
    for (let c = 0; c < copies; c++) {
      availablePlayers.forEach((p, i) => {
        list.push({
          ...p,
          _cardKey: `${c}-${i}`,
          displayNumber: String(p.registrationNumber || i + 1).padStart(3, "0"),
        });
      });
    }
    return list;
  }, [availablePlayers]);

  // ---- Shuffle animation with bounce-back ----
  const startShuffle = useCallback(() => {
    setPhase("shuffling");
    startTimeRef.current = performance.now();

    // Compute target index dynamically from current cardList
    if (!availablePlayers || availablePlayers.length === 0) {
      targetIndexRef.current = 0;
    } else if (availablePlayers.length <= 1) {
      targetIndexRef.current = 0;
    } else {
      targetIndexRef.current = Math.floor(Math.random() * cardList.length);
    }
    const ti = targetIndexRef.current;

    // Calculate target offset to center the selected card
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const centerOffset = containerWidth / 2 - CARD_WIDTH / 2;
    const targetOffset = -(ti * CARD_STEP) + centerOffset;

    const startOffset = centerOffset;
    const totalDistance = Math.abs(targetOffset - startOffset);

    // Fixed 4s total: 3s fast spin + 1s deceleration
    const TOTAL_DURATION = 4000;

    // 4-phase bounce easing: constant-speed spin → overshoot → bounce back → settle
    const bounceEase = (t) => {
      if (t < 0.75) {
        return (t / 0.75) * 0.90;
      } else if (t < 0.82) {
        const p = (t - 0.75) / 0.07;
        return 0.90 + p * 0.18;
      } else if (t < 0.92) {
        const p = (t - 0.82) / 0.10;
        return 1.08 - p * 0.11;
      } else {
        const p = (t - 0.92) / 0.08;
        return 0.97 + p * 0.03;
      }
    };

    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / TOTAL_DURATION, 1);
      const eased = bounceEase(progress);

      const currentOffset = startOffset - (totalDistance * eased);

      let wiggle = 0;
      if (progress > 0.75 && progress < 0.92) {
        wiggle = Math.sin((progress - 0.75) * 40) * 4 * (1 - (progress - 0.75) / 0.17);
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
  }, [availablePlayers, cardList]);

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

    // Transition directly to PlayerDetailsModal
    setTimeout(() => {
      setPhase("done");
      onContinue();
    }, 900);
  }, [phase, selectedPlayer, revealPlayer, onContinue]);

  // ---- Progress dots ----
  const progressPhase = phase === "idle" ? 0 : phase === "shuffling" ? 1 : phase === "selected" ? 2 : 3;

  if (!players || players.length === 0 || availablePlayers.length === 0) {
    return (
      <AuctionConcludedModal
        onClose={onClose}
        onReauction={() => {
          if (reauctionUnsold) reauctionUnsold();
        }}
        tournamentId={tournamentId}
      />
    );
  }

  return createPortal(
    <div className="auction-screen">
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
            {phase === "shuffling" && (availablePlayers.length === 1 ? "Final Player Loading..." : "Shuffling Players...")}
            {phase === "selected" && `${availablePlayers.length === 1 ? "🌟 Final Player" : "Player"} #${selectedPlayer?.displayNumber || "???"} Selected!`}
            {(phase === "flipping" || phase === "done") && "Revealing Identity..."}
          </motion.div>
          <p className="reveal-status__hint">
            {phase === "selected"
              ? (availablePlayers.length === 1
                  ? "Click below to reveal the final player of this auction!"
                  : "Click the button below to reveal this player")
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
          {phase === "selected"
            ? (availablePlayers.length === 1 ? "⚡ REVEAL FINAL PLAYER" : "⚡ REVEAL PLAYER")
            : (availablePlayers.length === 1 ? "REVEAL FINAL PLAYER" : "REVEAL PLAYER")}
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
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>,
    document.body
  );
};

export default PlayerRevealModal;
