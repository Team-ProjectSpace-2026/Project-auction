import { useState } from "react";
import PlayerRevealModal from "./PlayerRevealModal";
import SoldPlayerModal from "./SoldPlayerModal";
import UnsoldPlayerModal from "./UnsoldPlayerModal";

const teams = [
  "Mangalore Warriors",
  "Coastal Kings",
  "Tech Titans",
  "Mysore Royals",
  "Blasters Club",
  "Strikers XI",
  "Royal Challengers",
  "United Stars",
];

const teamBudgets = [
  { name: "Mangalore Warriors", short: "MW", remaining: 85000, players: 6, maxPlayers: 15, color: "#2563eb" },
  { name: "Coastal Kings", short: "CK", remaining: 70000, players: 7, maxPlayers: 15, color: "#16a34a" },
  { name: "Tech Titans", short: "TT", remaining: 95000, players: 6, maxPlayers: 15, color: "#7c3aed" },
  { name: "Mysore Royals", short: "MR", remaining: 60000, players: 8, maxPlayers: 15, color: "#d97706" },
  { name: "Blasters Club", short: "BC", remaining: 75000, players: 7, maxPlayers: 15, color: "#dc2626" },
  { name: "Thunder Strikers", short: "TS", remaining: 80000, players: 7, maxPlayers: 15, color: "#0891b2" },
];

const liveBids = [
  { time: "11:45 AM", team: "Mangalore Warriors", short: "MW", amount: 50000, color: "#2563eb" },
  { time: "11:44 AM", team: "Coastal Kings", short: "CK", amount: 45000, color: "#16a34a" },
  { time: "11:43 AM", team: "Tech Titans", short: "TT", amount: 40000, color: "#7c3aed" },
  { time: "11:42 AM", team: "Mysore Royals", short: "MR", amount: 35000, color: "#d97706" },
  { time: "11:41 AM", team: "Blasters Club", short: "BC", amount: 30000, color: "#dc2626" },
];

const AuctionRoom = () => {
    const [showRevealModal, setShowRevealModal] = useState(false);
    const [showSoldModal, setShowSoldModal] = useState(false);
    const [showUnsoldModal, setShowUnsoldModal] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Top Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1.4fr",
          gap: "24px",
        }}
      >
        {/* Current Player */}
        <div
          style={{
            background: "var(--card-bg-light)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "24px",
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
        >
          <h3 style={{ marginBottom: "20px" }}>Current Player</h3>

          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "center",
            }}
          >
            <img
              src="https://via.placeholder.com/150"
              alt="player"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "12px",
                objectFit: "cover",
              }}
            />

            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  marginBottom: "10px",
                }}
              >
                VIRAT KOHLI
              </h1>

              <span
                style={{
                  background: "var(--role-batsman-bg)",
                  color: "var(--role-batsman-text)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                BATSMAN
              </span>

              <div style={{ marginTop: "18px", lineHeight: "2" }}>
                <div>🏏 Batting Style : Right Hand Bat</div>
                <div>🎯 Bowling Style : Medium Pace</div>
                <div>🇮🇳 Nationality : India</div>
                <div>💰 Base Price : ₹50,000</div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Bid */}
        <div
          style={{
            background: "var(--card-bg-light)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
        >
          <h3>Current Bid</h3>

          <h1
            style={{
              color: "var(--accent-light)",
              fontSize: "42px",
              marginTop: "24px",
            }}
          >
            ₹50,000
          </h1>

          <p style={{ color: "var(--text-secondary-light)" }}>(Base Price)</p>

          <hr
            style={{
              margin: "24px 0",
              border: "none",
              borderTop: "1px solid var(--border-light)",
            }}
          />

          <h4>Highest Bidder</h4>

          <div
            style={{
              fontSize: "48px",
              marginTop: "16px",
            }}
          >
            🏆
          </div>

          <h3>Mangalore Warriors</h3>
        </div>

        {/* Team Budgets */}
        <div
          style={{
            background: "var(--card-bg-light)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "24px",
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
        >
          <h3 style={{ marginBottom: "20px" }}>Team Budgets</h3>

          {/* Table Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid var(--border-light)",
              fontSize: "11px",
              fontWeight: "600",
              color: "var(--text-primary-light)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <div style={{ flex: "2" }}>Team</div>
            <div style={{ flex: "1.2", textAlign: "right" }}>Remaining Budget</div>
            <div style={{ flex: "0.8", textAlign: "right" }}>Players</div>
          </div>

          {/* Table Body */}
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {teamBudgets.map((team, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: index < teamBudgets.length - 1 ? "1px solid var(--border-light)" : "none",
                }}
              >
                {/* Team Logo + Name */}
                <div style={{ flex: "2", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: team.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "700",
                      flexShrink: 0,
                    }}
                  >
                    {team.short}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary-light)" }}>
                    {team.name}
                  </span>
                </div>

                {/* Remaining Budget */}
                <div style={{ flex: "1.2", textAlign: "right", fontSize: "13px", fontWeight: "700", color: "#16a34a" }}>
                  ₹{team.remaining.toLocaleString("en-IN")}
                </div>

                {/* Players */}
                <div style={{ flex: "0.8", textAlign: "right", fontSize: "13px", color: "var(--text-primary-light)" }}>
                  {team.players}/{team.maxPlayers}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "24px",
        }}
      >
        {/* Quick Bid */}
        <div
          style={{
            background: "var(--card-bg-light)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "24px",
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
        >
          <h3>Quick Bid Amounts</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            {[
              "+ ₹1,000",
              "+ ₹2,000",
              "+ ₹5,000",
              "+ ₹10,000",
              "+ ₹20,000",
              "+ ₹50,000",
            ].map((amount) => (
              <button
                key={amount}
                style={{
                  padding: "12px",
                  border: "1px solid var(--accent-light)",
                  borderRadius: "8px",
                  background: "var(--card-bg-light)",
                  color: "var(--accent-light)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Bid */}
        <div
          style={{
            background: "var(--card-bg-light)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "24px",
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
        >
          <h3>Custom Bid</h3>

          <input
            placeholder="Enter custom amount"
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px",
              border: "1px solid var(--input-border)",
              borderRadius: "8px",
              background: "var(--input-bg)",
              color: "var(--input-text)",
              fontSize: "14px",
              outline: "none",
              transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
            }}
          />

          <button
            style={{
              width: "100%",
              marginTop: "16px",
              background: "var(--accent-light)",
              color: "#fff",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Place Bid
          </button>
        </div>

        {/* Live Bidding Feed */}
        <div
          style={{
            background: "var(--card-bg-light)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "24px",
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
        >
          {/* Title with red pulse indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#ef4444",
                display: "inline-block",
                animation: "livePulse 1.5s ease-in-out infinite",
              }}
            />
            <h3 style={{ margin: 0 }}>Live Bidding Feed</h3>
          </div>

          <style>{`
            @keyframes livePulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.4; transform: scale(1.3); }
            }
          `}</style>

          {/* Bid Feed */}
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {liveBids.map((bid, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: index < liveBids.length - 1 ? "1px solid var(--border-light)" : "none",
                  gap: "10px",
                }}
              >
                {/* Time */}
                <span style={{ fontSize: "12px", color: "var(--text-secondary-light)", whiteSpace: "nowrap" }}>
                  {bid.time}
                </span>

                {/* Separator */}
                <span style={{ color: "var(--text-secondary-light)", fontSize: "12px" }}>•</span>

                {/* Team Logo */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: bid.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: "700",
                    flexShrink: 0,
                  }}
                >
                  {bid.short}
                </div>

                {/* Team Name */}
                <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary-light)" }}>
                  {bid.team}
                </span>

                {/* "bid" label */}
                <span style={{ fontSize: "12px", color: "var(--text-secondary-light)", fontStyle: "italic" }}>
                  bid
                </span>

                {/* Separator */}
                <span style={{ color: "var(--text-secondary-light)", fontSize: "12px" }}>•</span>

                {/* Bid Amount */}
                <span style={{ flex: 1, textAlign: "right", fontSize: "13px", fontWeight: "700", color: "#d97706" }}>
                  ₹{bid.amount.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teams */}
      <div
        style={{
          background: "var(--card-bg-light)",
          border: "1px solid var(--border-light)",
          borderRadius: "16px",
          padding: "24px",
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <h3>All Teams</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, minmax(120px,1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          {teams.map((team) => (
            <div
              key={team}
              style={{
                border: "1px solid var(--border-light)",
                borderRadius: "10px",
                padding: "12px",
                textAlign: "center",
                cursor: "pointer",
                background: "var(--card-bg-light)",
                minHeight: "80px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
            >
              🏏
              <div
                style={{
                  fontSize: "12px",
                  marginTop: "8px",
                }}
              >
                {team}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <button
            onClick={() => setShowSoldModal(true)}
            style={{
                background: "#278510",
                color: "#fff",
                border: "none",
                padding: "20px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "15px",
                cursor: "pointer",
            }}
        >
            ✓ Mark Sold
        </button>

        <button
            onClick={() => setShowUnsoldModal(true)}
            style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "20px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "15px",
                cursor: "pointer",
            }}
        >
            ✕ Mark Unsold
        </button>
      </div>
      {showRevealModal && (
        <PlayerRevealModal
        onClose={() => setShowRevealModal(false)}
        onContinue={() => {
        setShowRevealModal(false);
        }}
        />
    )}

    {showSoldModal && (
  <SoldPlayerModal
    onClose={() => setShowSoldModal(false)}
    onNextPlayer={() => {
      setShowSoldModal(false);
      setShowRevealModal(true);
    }}
  />
)}

{showUnsoldModal && (
  <UnsoldPlayerModal
    onClose={() => setShowUnsoldModal(false)}
    onNextPlayer={() => {
      setShowUnsoldModal(false);
      setShowRevealModal(true);
    }}
  />
)}
    </div>
    
  );
};

export default AuctionRoom;
