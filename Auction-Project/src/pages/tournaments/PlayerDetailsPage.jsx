import Sidebar from "../../components/layout/Sidebar";
// import TopBar from "../../components/layout/TopBar";

const PlayerDetailsPage = () => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-primary-light)",
        transition: "background-color 0.2s ease",
      }}
    >
      <Sidebar activePage="tournaments" />

      <div
        style={{
          marginLeft: "220px",
          flex: 1,
        }}
      >
        {/* <TopBar
          user={{
            name: "Rahul Organizer",
            role: "Organizer",
          }}
        /> */}

        <main
          style={{
            padding: "28px 32px 32px",
          }}
        >
          {/* Back Button */}
          <div
            style={{
              color: "var(--accent-light)",
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
              background: "var(--card-bg-light)",
              border: "1px solid var(--border-light)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              transition: "background-color 0.2s ease, border-color 0.2s ease",
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
                   background: "var(--role-batsman-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "var(--role-batsman-text)",
                }}
              >
                VK
              </div>

              <div>
                <h1
                  style={{
                    fontSize: "40px",
                    fontWeight: "800",
                    color: "var(--text-primary-light)",
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
                       background: "var(--role-batsman-bg)",
                      color: "var(--role-batsman-text)",
                      fontWeight: "600",
                    }}
                  >
                    Batsman
                  </span>

                  <span
                    style={{
                      color: "var(--text-secondary-light)",
                    }}
                  >
                    Team: Mangalore Warriors
                  </span>
                </div>
              </div>
            </div>

            <button
              style={{
                background: "var(--accent-light)",
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
                background: "var(--card-bg-light)",
                border: "1px solid var(--border-light)",
                borderRadius: "16px",
                padding: "24px",
                transition: "background-color 0.2s ease, border-color 0.2s ease",
              }}
            >
              <h2
                style={{
                  marginBottom: "20px",
                  color: "var(--text-primary-light)",
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
                background: "var(--card-bg-light)",
                border: "1px solid var(--border-light)",
                borderRadius: "16px",
                padding: "24px",
                transition: "background-color 0.2s ease, border-color 0.2s ease",
              }}
            >
              <h2
                style={{
                  marginBottom: "20px",
                  color: "var(--text-primary-light)",
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
                <strong style={{ color: "var(--status-active-text)" }}>
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
              background: "var(--card-bg-light)",
              border: "1px solid var(--border-light)",
              borderRadius: "16px",
              padding: "24px",
              transition: "background-color 0.2s ease, border-color 0.2s ease",
            }}
          >
              <h2
                style={{
                  marginBottom: "20px",
                  color: "var(--text-primary-light)",
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
                    background: "var(--table-header-bg)",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                       color: "var(--text-secondary-light)",
                      marginBottom: "8px",
                    }}
                  >
                    {stat[0]}
                  </div>

                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                       color: "var(--text-primary-light)",
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