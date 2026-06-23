import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import TournamentHeader from "../../components/tournament/TournamentHeader";
import OverviewTab from "../../components/tournament/OverviewTab";
import RegistrationTab from "../../components/tournament/RegistrationTab";
import TeamsTab from "../../components/tournament/TeamsTab";
import PlayersTab from "../../components/tournament/PlayersTab";
import LiveAuctionTab from "../../components/tournament/LiveAuctionTab";
import { useLocation } from "react-router-dom";

const MOCK_USER = {
  name: "Rahul Organizer",
  role: "Organizer",
};

const TournamentHubPage = () => {
  const [activePage, setActivePage] = useState("tournaments");
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
  location.state?.activeTab || "overview"
);

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
    gap: "40px",
    background: "#fff",
    marginTop: "16px",
    padding: "0 24px",
    height: "64px",
    alignItems: "center",
    borderRadius: "16px",
    border: "1px solid #e8eaf0",
  }}
>
  {[
    { id: "overview", label: "🕒 Overview" },
    { id: "registration", label: "🔗 Registration Link" },
    { id: "teams", label: "👥 Teams" },
    { id: "players", label: "👤 Players" },
    { id: "auction", label: "⚒ Live Auction" },
  ].map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        height: "100%",
        fontSize: "14px",
        fontWeight: activeTab === tab.id ? 700 : 500,
        color:
          activeTab === tab.id
            ? "#2563eb"
            : "#6b7280",
        borderBottom:
          activeTab === tab.id
            ? "3px solid #2563eb"
            : "3px solid transparent",
      }}
    >
      {tab.label}
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

            {activeTab === "players" && <PlayersTab />}

            {activeTab === "auction" && <LiveAuctionTab />}

          </div>
        </main>
      </div>
    </div>
  );
};

export default TournamentHubPage;