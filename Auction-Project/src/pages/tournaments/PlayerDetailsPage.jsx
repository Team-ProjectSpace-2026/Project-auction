import Sidebar from "../../components/layout/Sidebar";
// import TopBar from "../../components/layout/TopBar";
import bgStadium from "../../assets/bgstadium2.png";

const PlayerDetailsPage = () => {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
    >
      <Sidebar activePage="tournaments" />

      <div
        style={{
          marginLeft: "220px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "auto",
          position: "relative",
        }}
      >
        {/* Fixed background image */}
        <div style={{
          position: "fixed",
          top: 0,
          left: "220px",
          right: 0,
          bottom: 0,
          backgroundImage: `url(${bgStadium})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }} />

        {/* <TopBar
          user={{
            name: "Rahul Organizer",
            role: "Organizer",
          }}
        /> */}

        <main
          style={{
            padding: "28px 32px 32px",
            overflow: "visible",
            position: "relative",
            zIndex: 1,
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
               background: "var(--glass-bg)",
               backdropFilter: "blur(16px)",
               WebkitBackdropFilter: "blur(16px)",
               border: "1px solid var(--glass-border)",
               borderRadius: "16px",
               padding: "24px",
               display: "flex",
               justifyContent: "space-between",
               alignItems: "center",
               marginBottom: "24px",
               boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
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
                background: "rgba(37, 99, 235, 0.9)",
                color: "#fff",
                border: "1px solid var(--glass-border)",
                borderRadius: "10px",
                padding: "12px 24px",
                fontWeight: "600",
                cursor: "pointer",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
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
                background: "var(--glass-bg)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid var(--glass-border)",
                borderRadius: "16px",
                padding: "24px",
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
                background: "var(--glass-bg)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid var(--glass-border)",
                borderRadius: "16px",
                padding: "24px",
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
              background: "var(--glass-bg)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--glass-border)",
              borderRadius: "16px",
              padding: "24px",
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