import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
// import TopBar from "../../components/layout/TopBar";

// const MOCK_USER = {
// name: "Rahul Organizer",
// role: "Organizer",
// };

const tournaments = [
{
id: 1,
name: "Summer League 2027",
status: "Active",
date: "20 Jun 2027",
teams: "12 Teams",
format: "T20 League",
},
{
id: 2,
name: "Champions Cup 2027",
status: "Upcoming",
date: "05 Jul 2027",
teams: "10 Teams",
format: "T20 League",
},
{
id: 3,
name: "Winter League 2027",
status: "Upcoming",
date: "10 Aug 2027",
teams: "8 Teams",
format: "T10 League",
},
{
id: 4,
name: "City Premier League",
status: "Completed",
date: "02 Feb 2027",
teams: "12 Teams",
format: "T20 League",
},
{
id: 5,
name: "Rising Stars Cup",
status: "Completed",
date: "25 Apr 2027",
teams: "8 Teams",
format: "T10 League",
},
];

const getStatusStyle = (status) => {
if (status === "Active") {
return {
background: "#dcfce7",
color: "#15803d",
};
}

if (status === "Upcoming") {
return {
background: "#dbeafe",
color: "#2563eb",
};
}

return {
background: "#e5e7eb",
color: "#4b5563",
};
};

const TournamentsListPage = () => {
const navigate = useNavigate();
const [activePage, setActivePage] = useState("tournaments");

return (
<div
  style={{
    display: "flex",
    minHeight: "100vh",
    background: "var(--bg-primary-light)",
    fontFamily: "'Inter','Segoe UI',sans-serif",
    transition: "background-color 0.2s ease",
  }}
   > <Sidebar
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
    {/* <TopBar user={MOCK_USER} /> */}
  

    <main
  style={{
    padding: "28px 28px 28px"
  }}
>
  <h1
  style={{
    fontSize: "28px",
    fontWeight: 700,
    color: "var(--text-primary-light)",
    margin: 0,
  }}
>
  Tournaments
</h1>

<p
  style={{
    color: "var(--text-secondary-light)",
    fontSize: "14px",
    marginTop: "4px",
    marginBottom: "16px",
  }}
>
  Manage all your cricket tournaments.
</p>

      <div
        style={{
          background: "var(--card-bg-light)",
          borderRadius: "16px",
          border: "1px solid var(--border-light)",
          padding: "18px",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        {/* Search Row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <input
            placeholder="🔍 Search tournament by name..."
            style={{
              flex: 1,
              padding: "14px 18px",
              borderRadius: "10px",
              border: "1px solid var(--border-light)",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "var(--bg-secondary-light)",
              color: "var(--text-primary-light)",
              transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
            }}
          />

          <select
            style={{
              width: "200px",
              borderRadius: "10px",
              border: "1px solid var(--border-light)",
              padding: "14px",
              backgroundColor: "var(--bg-secondary-light)",
              color: "var(--text-primary-light)",
              transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
            }}
          >
            <option>All Status</option>
          </select>


          <button
  onClick={() => navigate("/create-tournament")}
  style={{
    background: "var(--accent-light)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "14px 24px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  }}
>
  + New Tournament
</button>
</div>


        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: "20px",
          }}
        >
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              style={{
                background: 'var(--card-bg-light)',
                border: '1px solid var(--border-light)',
                borderRadius: "14px",
                padding: "16px",
                position: "relative",
                boxShadow:
                  "0 2px 8px rgba(15,23,42,0.04)",
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: 'var(--text-secondary-light)',
                }}
              >
                ⋮
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "12px",
                    background: "var(--bg-secondary-light)",
                    border: "1px solid var(--border-light)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "32px",
                    transition: "background-color 0.2s ease, border-color 0.2s ease",
                  }}
                >
                  🏆
                </div>

                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: "700",
                      color: 'var(--text-primary-light)',
                      marginBottom: "8px",
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {tournament.name}
                  </h3>

                  <span
                    style={{
                      ...getStatusStyle(
                        tournament.status
                      ),
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {tournament.status}
                  </span>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  transition: 'border-color 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: 'var(--text-secondary-light)', transition: 'color 0.2s ease' }}>
                    📅 Auction Date
                  </span>

                  <strong style={{ color: 'var(--text-primary-light)', transition: 'color 0.2s ease' }}>
                    {tournament.date}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: 'var(--text-secondary-light)', transition: 'color 0.2s ease' }}>
                    👥 Teams
                  </span>

                  <strong style={{ color: 'var(--text-primary-light)', transition: 'color 0.2s ease' }}>
                    {tournament.teams}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: 'var(--text-secondary-light)', transition: 'color 0.2s ease' }}>
                    🏆 Format
                  </span>

                  <strong style={{ color: 'var(--text-primary-light)', transition: 'color 0.2s ease' }}>
                    {tournament.format}
                  </strong>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate("/tournament-details")
                }
                style={{
                  width: "100%",
                  marginTop: "16px",
                  height: "44px",
                  borderRadius: "10px",
                  border: '1px solid var(--accent-light)',
                  background: 'var(--card-bg-light)',
                  color: 'var(--accent-light)',
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                }}
              >
                View Details →
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "24px",
          }}
        >
          <span
            style={{
              color: 'var(--text-secondary-light)',
              fontSize: "14px",
              transition: 'color 0.2s ease',
            }}
          >
            Showing 1 to 5 of 5 tournaments
          </span>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: '1px solid var(--border-light)',
                background: 'var(--card-bg-light)',
                color: 'var(--text-primary-light)',
                transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
              }}
            >
              Previous
            </button>

            <button
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                background: 'var(--accent-light)',
                color: "#fff",
                transition: 'background-color 0.2s ease',
              }}
            >
              1
            </button>

            <button
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: '1px solid var(--border-light)',
                background: 'var(--card-bg-light)',
                color: 'var(--text-primary-light)',
                transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>

);
};

export default TournamentsListPage;
