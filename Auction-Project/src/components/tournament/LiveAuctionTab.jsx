import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayerRevealModal from "./PlayerRevealModal";
import PlayerDetailsModal from "./PlayerDetailsModal";

const LiveAuctionTab = () => {
  const navigate = useNavigate();

  const [showRevealModal, setShowRevealModal] = useState(false);
  const [showPlayerCard, setShowPlayerCard] = useState(false);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2.3fr 1fr",
        gap: "24px",
      }}
    >
      {/* Left Section */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8eaf0",
          borderRadius: "16px",
          padding: "40px",
          minHeight: "620px",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#eef4ff",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "#2563eb",
            }}
          >
            ⚒️
          </div>

          <h2
            style={{
              marginTop: "18px",
              marginBottom: "8px",
              fontSize: "28px",
              color: "#111827",
            }}
          >
            Live Auction
          </h2>

          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Auction has not started yet.
          </p>

          <div
            style={{
              marginTop: "32px",
              marginBottom: "32px",
              borderTop: "1px solid #edf1f7",
            }}
          />
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "60px",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "#eef4ff",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "56px",
            }}
          >
            🔨
          </div>

          <h2
            style={{
              marginTop: "24px",
              fontSize: "34px",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            Ready to Start the Auction?
          </h2>

          <p
            style={{
              color: "#6b7280",
              marginTop: "12px",
              fontSize: "15px",
            }}
          >
            Once you start the auction, teams will be able to
            place bids on players.
          </p>

          <button
            onClick={() => setShowRevealModal(true)}
            style={{
              marginTop: "28px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "14px 36px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ▶ Start Auction
          </button>

          <p
            style={{
              marginTop: "20px",
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            ℹ️ You can't pause or reset the auction once it has started.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Current Auction */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8eaf0",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                color: "#111827",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Current Auction
            </h3>

            <span
              style={{
                background: "#eef4ff",
                color: "#2563eb",
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              Not Started
            </span>
          </div>

          <div
            style={{
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "#f3f4f6",
                margin: "0 auto 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
              }}
            >
              👤
            </div>

            <h4
              style={{
                color: "#111827",
                marginBottom: "6px",
              }}
            >
              No Player Selected
            </h4>

            <p
              style={{
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              The auction will begin once you start.
            </p>
          </div>

          <div
            style={{
              borderTop: "1px solid #edf1f7",
              paddingTop: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <span>Base Price</span>
              <span>-</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <span>Current Bid</span>
              <span>-</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Highest Bidder</span>
              <span>-</span>
            </div>
          </div>
        </div>

        {/* Auction Activity */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8eaf0",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              marginBottom: "24px",
              fontSize: "18px",
              fontWeight: "700",
            }}
          >
            Auction Activity
          </h3>

          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "#eef4ff",
                margin: "0 auto 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
              }}
            >
              ⚒️
            </div>

            <h4
              style={{
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              No activity yet
            </h4>

            <p
              style={{
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              Auction activity will appear here once the auction begins.
            </p>
          </div>
        </div>
      </div>

      {showRevealModal && (
        <PlayerRevealModal
          onClose={() => setShowRevealModal(false)}
          onContinue={() => {
            setShowRevealModal(false);
            setShowPlayerCard(true);
          }}
        />
      )}

      {showPlayerCard && (
        <PlayerDetailsModal
          onClose={() => setShowPlayerCard(false)}
          onStartBidding={() => {
            setShowPlayerCard(false);
            navigate("/live-auction");
          }}
        />
      )}
    </div>
  );
};

export default LiveAuctionTab;