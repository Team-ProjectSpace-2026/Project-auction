import "./CyclingBoyAnimation.css";

const CricketStumpsAnimation = () => {
  return (
    <div className="stumps-track" aria-hidden="true">
      {/* Left side stumps */}
      <div className="stump-group stump-left">
        <div className="stump s1" />
        <div className="stump s2" />
        <div className="stump s3" />
        <div className="bail bail-left" />
        <div className="bail bail-right" />
        <div className="stump-glow" />
      </div>

      {/* Right side stumps */}
      <div className="stump-group stump-right">
        <div className="stump s1" />
        <div className="stump s2" />
        <div className="stump s3" />
        <div className="bail bail-left" />
        <div className="bail bail-right" />
        <div className="stump-glow" />
      </div>

      {/* Animated cricket ball bouncing across */}
      <div className="flying-ball-container">
        <div className="flying-ball">🏏</div>
      </div>

      {/* Neon "AUCTION LIVE" ticker */}
      <div className="auction-ticker">
        <span className="ticker-text">
          🔨 AUCTION LIVE &nbsp;•&nbsp; 🏏 BID NOW &nbsp;•&nbsp; 💰 SOLD! &nbsp;•&nbsp; 🔨 AUCTION LIVE &nbsp;•&nbsp; 🏏 BID NOW &nbsp;•&nbsp; 💰 SOLD! &nbsp;•&nbsp;
        </span>
      </div>
    </div>
  );
};

export default CricketStumpsAnimation;
