import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import TournamentHeader from "../../components/tournament/TournamentHeader";
import OverviewTab from "../../components/tournament/OverviewTab";
import RegistrationTab from "../../components/tournament/RegistrationTab";
import TeamsTab from "../../components/tournament/TeamsTab";

const MOCK_USER = {
  name: "Rahul Organizer",
  role: "Organizer",
};

const TournamentHubPage = () => {
  const [activePage, setActivePage] = useState("tournaments");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f6fb",
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
        }}
      >
        <TopBar user={MOCK_USER} />

        <main
          style={{
            padding: "96px 32px 32px",
          }}
        >
          {/* Tournament Header */}
          <TournamentHeader />

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "32px",
              background: "#fff",
              marginTop: "16px",
              padding: "18px 24px",
              borderRadius: "16px",
              border: "1px solid #e8eaf0",
            }}
          >
            {[
              "overview",
              "registration",
              "teams",
              "players",
              "auction",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "15px",
                  textTransform: "capitalize",
                  paddingBottom: "8px",
                  fontWeight:
                    activeTab === tab ? 700 : 500,
                  color:
                    activeTab === tab
                      ? "#2563eb"
                      : "#6b7280",
                  borderBottom:
                    activeTab === tab
                      ? "2px solid #2563eb"
                      : "2px solid transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div
            style={{
              marginTop: "16px",
            }}
          >
            {activeTab === "overview" && <OverviewTab />}

            {activeTab === "registration" && <RegistrationTab />}

            {activeTab === "teams" && <TeamsTab />}

            {activeTab === "players" && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e8eaf0",
                  borderRadius: "16px",
                  padding: "24px",
                  minHeight: "500px",
                }}
              >
                Players Content
              </div>
            )}

            {activeTab === "auction" && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e8eaf0",
                  borderRadius: "16px",
                  padding: "24px",
                  minHeight: "500px",
                }}
              >
                Auction Content
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TournamentHubPage;