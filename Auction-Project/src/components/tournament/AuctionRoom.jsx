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

const AuctionRoom = () => {
    const [showRevealModal, setShowRevealModal] = useState(false);
    const [showSoldModal, setShowSoldModal] = useState(false);
    const [showUnsoldModal, setShowUnsoldModal] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Top Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1.4fr",
          gap: "20px",
        }}
      >
        {/* Current Player */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8eaf0",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>Current Player</h3>

          <div
            style={{
              display: "flex",
              gap: "20px",
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
                  background: "#dbeafe",
                  color: "#2563eb",
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
            background: "#fff",
            border: "1px solid #e8eaf0",
            borderRadius: "16px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h3>Current Bid</h3>

          <h1
            style={{
              color: "#2563eb",
              fontSize: "42px",
              marginTop: "20px",
            }}
          >
            ₹50,000
          </h1>

          <p style={{ color: "#6b7280" }}>(Base Price)</p>

          <hr
            style={{
              margin: "20px 0",
              border: "none",
              borderTop: "1px solid #e8eaf0",
            }}
          />

          <h4>Highest Bidder</h4>

          <div
            style={{
              fontSize: "48px",
              marginTop: "12px",
            }}
          >
            🏆
          </div>

          <h3>Mangalore Warriors</h3>
        </div>

        {/* Latest Bids */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8eaf0",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>Latest 5 Bids</h3>

          {[
            ["Mangalore Warriors", "₹50,000"],
            ["Coastal Kings", "₹45,000"],
            ["Tech Titans", "₹40,000"],
            ["Mysore Royals", "₹35,000"],
            ["Blasters Club", "₹30,000"],
          ].map((bid, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span>{bid[0]}</span>
              <strong>{bid[1]}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Quick Bid */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8eaf0",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3>Quick Bid Amounts</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "10px",
              marginTop: "16px",
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
                  border: "1px solid #2563eb",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#2563eb",
                  cursor: "pointer",
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
            background: "#fff",
            border: "1px solid #e8eaf0",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3>Custom Bid</h3>

          <input
            placeholder="Enter custom amount"
            style={{
              width: "100%",
              marginTop: "16px",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          />

          <button
            style={{
              width: "100%",
              marginTop: "14px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Place Bid
          </button>
        </div>

        {/* Activity */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8eaf0",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3>Auction Activity</h3>

          <div style={{ marginTop: "16px", lineHeight: "2" }}>
            <div>11:45 AM - ₹50,000</div>
            <div>11:44 AM - ₹45,000</div>
            <div>11:43 AM - ₹40,000</div>
            <div>11:42 AM - ₹35,000</div>
            <div>11:41 AM - ₹30,000</div>
          </div>
        </div>
      </div>

      {/* Teams */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8eaf0",
          borderRadius: "16px",
          padding: "16px",
        }}
      >
        <h3>All Teams</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, minmax(120px,1fr))",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          {teams.map((team) => (
            <div
              key={team}
              style={{
                border: "1px solid #dbe1ea",
                borderRadius: "10px",
                padding: "8px",
                textAlign: "center",
                cursor: "pointer",
                background: "#fff",
                minHeight: "70px",
                display: "flex",
                flexDirection: "column",
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
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
        }}
      >
        <button
            onClick={() => setShowSoldModal(true)}
            style={{
                background: "#278510",
                color: "#fff",
                border: "none",
                padding: "18px",
                borderRadius: "10px",
                fontWeight: "600",
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
                padding: "18px",
                borderRadius: "10px",
                fontWeight: "600",
                cursor: "pointer",
            }}
        >
        ✕ Mark Unsold
    </button>

        <button
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "18px",
            borderRadius: "10px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          → Next Player
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