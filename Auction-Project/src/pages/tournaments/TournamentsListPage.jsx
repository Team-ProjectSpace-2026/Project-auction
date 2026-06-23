import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";

const MOCK_USER = {
name: "Rahul Organizer",
role: "Organizer",
};

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
background: "#f4f6fb",
fontFamily: "'Inter','Segoe UI',sans-serif",
}}
> <Sidebar
     activePage={activePage}
     onNavigate={setActivePage}
   />

```
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
    marginTop: "64px",
    padding: "16px 28px 28px"
  }}
>
  <h1
  style={{
    fontSize: "28px",
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  }}
>
  Tournaments
</h1>

<p
  style={{
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "4px",
    marginBottom: "16px",
  }}
>
  Manage all your cricket tournaments.
</p>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #e8eaf0",
          padding: "18px",
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
              border: "1px solid #dbe1ea",
              fontSize: "14px",
              outline: "none",
            }}
          />

          <select
            style={{
              width: "200px",
              borderRadius: "10px",
              border: "1px solid #dbe1ea",
              padding: "14px",
            }}
          >
            <option>All Status</option>
          </select>

          <button
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "14px 24px",
              fontWeight: "700",
              cursor: "pointer",
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
                background: "#fff",
                border: "1px solid #e8eaf0",
                borderRadius: "14px",
                padding: "16px",
                position: "relative",
                boxShadow:
                  "0 2px 8px rgba(15,23,42,0.04)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#64748b",
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
                    background: "#f8fafc",
                    border: "1px solid #e8eaf0",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "32px",
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
                      color: "#111827",
                      marginBottom: "8px",
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
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: "#64748b" }}>
                    📅 Auction Date
                  </span>

                  <strong>
                    {tournament.date}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: "#64748b" }}>
                    👥 Teams
                  </span>

                  <strong>
                    {tournament.teams}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: "#64748b" }}>
                    🏆 Format
                  </span>

                  <strong>
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
                  border: "1px solid #2563eb",
                  background: "#fff",
                  color: "#2563eb",
                  fontWeight: "700",
                  cursor: "pointer",
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
              color: "#64748b",
              fontSize: "14px",
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
      </div>
    </main>
  </div>
</div>

);
};

export default TournamentsListPage;
