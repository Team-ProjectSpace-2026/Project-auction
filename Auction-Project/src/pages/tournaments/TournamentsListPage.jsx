import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

const MOCK_USER = {
  name: "Rahul Organizer",
  role: "Organizer",
};

const TournamentsListPage = () => {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("tournaments");

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f6fb",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div
        style={{
          marginLeft: "220px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar user={MOCK_USER} />

        <main
          style={{
            padding: "96px 32px 32px",
          }}
        >
          <h1
            style={{
              fontSize: "30px",
              fontWeight: 800,
              color: "#1a1d2e",
              marginBottom: "6px",
            }}
          >
            Tournaments
          </h1>

          <p
            style={{
              color: "#8a94a6",
              fontSize: "14px",
              marginBottom: "24px",
            }}
          >
            Manage all your cricket tournaments.
          </p>

          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid #e8eaf0",
              padding: "24px",
            }}
          >
            {/* Search Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  flex: 1,
                }}
              >
                <input
                  placeholder="Search tournament by name..."
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    border: "1px solid #dbe1ea",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />

                <select
                  style={{
                    width: "180px",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #dbe1ea",
                    fontSize: "14px",
                  }}
                >
                  <option>All Status</option>
                </select>
              </div>

              <button
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + New Tournament
              </button>
            </div>

            {/* Tournament Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
              }}
            >
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  style={{
                    border: "1px solid #e8eaf0",
                    borderRadius: "14px",
                    padding: "16px",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      background: "#f3f4f6",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      marginBottom: "14px",
                    }}
                  >
                    🏆
                  </div>

                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      marginBottom: "10px",
                      color: "#1a1d2e",
                    }}
                  >
                    Summer League 2027
                  </h3>

                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#15803d",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    Active
                  </span>

                  <div
                    style={{
                      marginTop: "18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      color: "#5b6475",
                      fontSize: "14px",
                    }}
                  >
                    <div>📅 Auction Date : 20 Jun 2027</div>
                    <div>👥 Teams : 12 Teams</div>
                    <div>🏆 Format : T20 League</div>
                  </div>

                  <button
                    onClick={() => navigate("/tournament-details")}
                    style={{
                      width: "100%",
                      marginTop: "18px",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #2563eb",
                      background: "#fff",
                      color: "#2563eb",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    View Details →
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "28px",
                gap: "10px",
              }}
            >
              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid #dbe1ea",
                  background: "#fff",
                }}
              >
                Previous
              </button>

              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#2563eb",
                  color: "#fff",
                }}
              >
                1
              </button>

              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid #dbe1ea",
                  background: "#fff",
                }}
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TournamentsListPage;