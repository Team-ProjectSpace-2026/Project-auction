import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

const PlayerDetailsPage = () => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f6fb",
      }}
    >
      <Sidebar activePage="tournaments" />

      <div
        style={{
          marginLeft: "220px",
          flex: 1,
        }}
      >
        <TopBar
          user={{
            name: "Rahul Organizer",
            role: "Organizer",
          }}
        />

        <main
          style={{
            padding: "96px 32px 32px",
          }}
        >
          {/* Back Button */}
          <div
            style={{
              color: "#2563eb",
              fontWeight: "600",
              marginBottom: "24px",
              cursor: "pointer",
            }}
          >
            ← Back to Players
          </div>

          {/* Player Header */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8eaf0",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "#dbeafe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#2563eb",
                }}
              >
                VK
              </div>

              <div>
                <h1
                  style={{
                    fontSize: "40px",
                    fontWeight: "800",
                    color: "#111827",
                    marginBottom: "12px",
                  }}
                >
                  Virat Kohli
                </h1>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "#dbeafe",
                      color: "#2563eb",
                      fontWeight: "600",
                    }}
                  >
                    Batsman
                  </span>

                  <span
                    style={{
                      color: "#6b7280",
                    }}
                  >
                    Team: Mangalore Warriors
                  </span>
                </div>
              </div>
            </div>

            <button
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 24px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Edit Player
            </button>
          </div>

          {/* Information Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            {/* Player Information */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8eaf0",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  marginBottom: "20px",
                  color: "#111827",
                }}
              >
                Player Information
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  rowGap: "16px",
                }}
              >
                <span>Age</span>
                <strong>36</strong>

                <span>Batting Style</span>
                <strong>Right Hand Bat</strong>

                <span>Bowling Style</span>
                <strong>Right Arm Medium</strong>

                <span>Nationality</span>
                <strong>India</strong>

                <span>Role</span>
                <strong>Batsman</strong>

                <span>Keeper</span>
                <strong>No</strong>
              </div>
            </div>

            {/* Auction Information */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8eaf0",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  marginBottom: "20px",
                  color: "#111827",
                }}
              >
                Auction Information
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  rowGap: "16px",
                }}
              >
                <span>Base Price</span>
                <strong>₹50,000</strong>

                <span>Sold Price</span>
                <strong>₹85,00,000</strong>

                <span>Status</span>
                <strong style={{ color: "#16a34a" }}>
                  Sold
                </strong>

                <span>Current Team</span>
                <strong>Mangalore Warriors</strong>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div
            style={{
              marginTop: "24px",
              background: "#fff",
              border: "1px solid #e8eaf0",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                marginBottom: "24px",
                color: "#111827",
              }}
            >
              Player Statistics
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5,1fr)",
                gap: "16px",
              }}
            >
              {[
                ["Matches", "250"],
                ["Runs", "12,500"],
                ["Wickets", "4"],
                ["Strike Rate", "135.4"],
                ["Average", "52.6"],
              ].map((stat) => (
                <div
                  key={stat[0]}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#6b7280",
                      marginBottom: "8px",
                    }}
                  >
                    {stat[0]}
                  </div>

                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {stat[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlayerDetailsPage;