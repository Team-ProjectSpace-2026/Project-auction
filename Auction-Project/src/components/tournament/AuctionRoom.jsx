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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "4px 0" }}>
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
        .auction-team-selectable:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(37,99,235,0.15);
        }
        .auction-quick-bid:hover {
          border-color: #2563eb !important;
          color: #2563eb !important;
          background: #f0f4ff !important;
        }
        .auction-action-card:hover { opacity: 0.9; }
      `}</style>

      {/* ===== MAIN LAYOUT ===== */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ===== TOP BAND: Player Hero + Team Budgets (same height) ===== */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "20px" }}>

          {/* --- CURRENT PLAYER HERO CARD --- */}
          <div style={{
            background: "var(--card-bg-light)",
            borderRadius: "16px",
            border: "1px solid var(--border-light)",
            padding: "48px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            transition: "background-color 0.2s ease, border-color 0.2s ease",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{ display: "flex", gap: "50px", alignItems: "stretch", flex: 1 }}>
              {/* Player Photo Placeholder — 3:4 ratio (288×384) */}
              <div style={{
                width: "288px",
                height: "384px",
                borderRadius: "14px",
                border: "2px dashed var(--border-light)",
                background: "color-mix(in srgb, var(--card-bg-light) 60%, var(--bg-primary-light))",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: "48px", opacity: 0.4 }}>&#127951;</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary-light)", fontWeight: "500" }}>
                  Player Photo
                </span>
                <span style={{ fontSize: "20px", opacity: 0.3 }}>&#128247;</span>
              </div>

              {/* Player Details */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h1 style={{ fontSize: "42px", fontWeight: "800", color: "var(--text-primary-light)", margin: 0, letterSpacing: "-0.5px", lineHeight: "1.1" }}>
                    VIRAT KOHLI
                  </h1>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--accent-light)", margin: "6px 0 40px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Batsman
                  </p>

                  {/* Info Row */}
                  <div style={{ display: "flex", gap: "50px", marginTop: "24px" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "12px" }}>&#128100;</span> Age
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary-light)" }}>35 YRS</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "12px" }}>&#127951;</span> Batting Style
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary-light)" }}>Right Handed</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "12px" }}>&#127758;</span> Country
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary-light)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "16px" }}>&#127470;&#127475;</span> India
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats Row */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  paddingTop: "36px",
                  borderTop: "1px solid var(--border-light)",
                  alignItems: "center",
                }}>
                  {/* Highest Bidder */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "42px", height: "42px", borderRadius: "50%",
                      background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "13px", fontWeight: "800", flexShrink: 0,
                    }}>MW</div>
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Highest Bidder</div>
                      <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary-light)", marginTop: "1px" }}>Mangalore Warriors</div>
                    </div>
                  </div>

                  {/* Base Price */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Base Price</div>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary-light)", marginTop: "2px" }}>&#8377;50,000</div>
                  </div>

                  {/* Current Bid */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Current Bid</div>
                    <div style={{ fontSize: "36px", fontWeight: "800", color: "#16a34a", marginTop: "2px", lineHeight: "1" }}>&#8377;50,000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- TEAM BUDGETS (same row as Player Hero) --- */}
          <div style={{
            background: "var(--card-bg-light)",
            borderRadius: "16px",
            border: "1px solid var(--border-light)",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            transition: "background-color 0.2s ease, border-color 0.2s ease",
            display: "flex",
            flexDirection: "column",
          }}>
            <h3 style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-primary-light)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>&#128176;</span> Team Budgets
            </h3>
            <p style={{ fontSize: "11px", color: "var(--text-secondary-light)", margin: "0 0 16px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>Overview</p>

            {/* Table Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.2fr 0.8fr",
              padding: "8px 0",
              borderBottom: "1.5px solid var(--border-light)",
              marginBottom: "4px",
            }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Team</div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Remaining Budget</div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary-light)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Taken Players</div>
            </div>

            {/* Table Body */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              {teamBudgets.map((team, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.2fr 0.8fr",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index < teamBudgets.length - 1 ? "1px solid color-mix(in srgb, var(--border-light) 50%, transparent)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "50%",
                      background: team.color, display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "11px", fontWeight: "800", flexShrink: 0,
                    }}>
                      {team.short}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary-light)" }}>{team.name}</span>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "14px", fontWeight: "700", color: "#16a34a" }}>
                    &#8377;{team.remaining.toLocaleString("en-IN")}
                  </div>
                  <div style={{ textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                    {team.players} / {team.maxPlayers}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== BOTTOM BAND: Quick Bids + Actions + Teams | Live Feed ===== */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "20px" }}>

          {/* --- LEFT: Quick Bids + Action Cards + All Teams --- */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* --- ACTION BUTTONS + CUSTOM BID --- */}
            <div style={{
              background: "var(--card-bg-light)",
              borderRadius: "16px",
              border: "1px solid var(--border-light)",
              padding: "24px 28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              transition: "background-color 0.2s ease, border-color 0.2s ease",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                {/* Sold */}
                <button
                  onClick={() => setShowSoldModal(true)}
                  className="auction-action-card"
                  style={{
                    background: "#fef9e7",
                    border: "1.5px solid #f5e6a3",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <div style={{ fontSize: "16px" }}>&#128296;</div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#b8860b" }}>SOLD</div>
                  <div style={{ fontSize: "9px", color: "#8a7a4a", fontWeight: "500" }}>Player sold to highest bidder</div>
                </button>

                {/* Unsold */}
                <button
                  onClick={() => setShowUnsoldModal(true)}
                  className="auction-action-card"
                  style={{
                    background: "var(--card-bg-light)",
                    border: "1.5px solid var(--border-light)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <div style={{ fontSize: "16px" }}>&#10060;</div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#dc2626" }}>UNSOLD</div>
                  <div style={{ fontSize: "9px", color: "var(--text-secondary-light)", fontWeight: "500" }}>Player goes unsold</div>
                </button>

                {/* Custom Bid Card */}
                <button
                  className="auction-quick-bid"
                  style={{
                    padding: "14px 8px",
                    border: "1.5px dashed var(--accent-light)",
                    borderRadius: "10px",
                    background: "color-mix(in srgb, var(--accent-light) 8%, transparent)",
                    color: "var(--accent-light)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: "700" }}>Custom Bid</div>
                  <div style={{ fontSize: "11px", fontWeight: "500", marginTop: "2px" }}>Enter Amount</div>
                </button>

                {/* Raise Bid */}
                <button
                  className="auction-action-card"
                  style={{
                    background: "var(--accent-light)",
                    border: "1.5px solid var(--accent-light)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <div style={{ fontSize: "16px" }}>&#128296;</div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#fff" }}>RAISE BID</div>
                  <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.8)", fontWeight: "500" }}>Increase the bid</div>
                </button>
              </div>
            </div>

            {/* --- ALL TEAMS --- */}
            <div style={{
              background: "var(--card-bg-light)",
              borderRadius: "16px",
              border: "1px solid var(--border-light)",
              padding: "24px 28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              transition: "background-color 0.2s ease, border-color 0.2s ease",
            }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary-light)", margin: 0, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                All Teams <span style={{ fontWeight: "400", color: "var(--text-secondary-light)", textTransform: "none", fontSize: "12px" }}>(Click on a team to place bid)</span>
              </h3>
              <div style={{ display: "flex", gap: "12px", marginTop: "16px", overflowX: "auto", paddingBottom: "4px" }}>
                {teams.map((team, idx) => (
                  <div
                    key={team}
                    className="auction-team-selectable"
                    style={{
                      border: idx === 0 ? "2.5px solid var(--accent-light)" : "1.5px solid var(--border-light)",
                      borderRadius: "12px",
                      padding: "14px 10px 10px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: idx === 0 ? "color-mix(in srgb, var(--accent-light) 8%, transparent)" : "var(--card-bg-light)",
                      minWidth: "105px",
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%",
                      background: teamBudgets[idx]?.color || "#2563eb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "12px", fontWeight: "800",
                    }}>
                      {team.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: idx === 0 ? "var(--accent-light)" : "var(--text-primary-light)", lineHeight: "1.3" }}>
                      {team}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT: Live Bidding Feed --- */}
          <div style={{
            background: "var(--card-bg-light)",
            borderRadius: "16px",
            border: "1px solid var(--border-light)",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            transition: "background-color 0.2s ease, border-color 0.2s ease",
            alignSelf: "start",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
              <span style={{
                width: "9px", height: "9px", borderRadius: "50%",
                background: "#ef4444", display: "inline-block",
                animation: "livePulse 1.5s ease-in-out infinite",
              }} />
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "var(--text-primary-light)" }}>Live Bidding Feed</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {liveBids.map((bid, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto auto 1fr auto auto",
                    alignItems: "center",
                    gap: "10px",
                    padding: "13px 0",
                    borderBottom: index < liveBids.length - 1 ? "1px solid color-mix(in srgb, var(--border-light) 50%, transparent)" : "none",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap", fontWeight: "500" }}>
                    {bid.time}
                  </span>

                  <div style={{
                    width: "30px", height: "30px", borderRadius: "50%",
                    background: bid.color, display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "10px", fontWeight: "800", flexShrink: 0,
                  }}>
                    {bid.short}
                  </div>

                  <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary-light)" }}>
                    {bid.team}
                  </span>

                  <span style={{ fontSize: "12px", color: "var(--text-secondary-light)", fontStyle: "italic", fontWeight: "500" }}>
                    bid
                  </span>

                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#d97706", whiteSpace: "nowrap" }}>
                    &#8377;{bid.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODALS (unchanged logic) ===== */}
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
