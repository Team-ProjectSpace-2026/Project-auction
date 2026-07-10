import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
// import TopBar from "../../components/layout/TopBar";
import TournamentHeader from "../../components/tournament/TournamentHeader";
import OverviewTab from "../../components/tournament/OverviewTab";
import RegistrationTab from "../../components/tournament/RegistrationTab";
import TeamsTab from "../../components/tournament/TeamsTab";
import PlayersTab from "../../components/tournament/PlayersTab";
import LiveAuctionTab from "../../components/tournament/LiveAuctionTab";
import { useLocation, useParams } from "react-router-dom";
import api from "../../services/api";

// const MOCK_USER = {
//   name: "Rahul Organizer",
//   role: "Organizer",
// };

const TournamentHubPage = () => {
  const [activePage, setActivePage] = useState("tournaments");
  const location = useLocation();
  const urlParams = useParams();
  const [tournament, setTournament] = useState(location.state?.tournament || null);
  const tournamentId = tournament?._id || urlParams.tournamentId;
  const [activeTab, setActiveTab] = useState(
  location.state?.activeTab || "overview"
);

  useEffect(() => {
    if (!tournament && tournamentId) {
      api.get(`/tournaments/${tournamentId}`)
        .then((res) => setTournament(res.data))
        .catch(() => {});
    }
  }, [tournament, tournamentId]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-primary-light)",
        transition: "background-color 0.2s ease",
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
        {/* <TopBar user={MOCK_USER} /> */}

        <main
          style={{
            padding: "28px 32px 32px",
          }}
        >
          {/* Tournament Header */}
          <TournamentHeader />

          {/* Tabs */}
         <div
  style={{
    display: "flex",
    gap: "40px",
    background: "var(--card-bg-light)",
    marginTop: "16px",
    padding: "0 24px",
    height: "64px",
    alignItems: "center",
    borderRadius: "16px",
    border: "1px solid var(--border-light)",
    transition: "background-color 0.2s ease, border-color 0.2s ease",
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
            ? "var(--accent-light)"
            : "var(--text-secondary-light)",
        borderBottom:
          activeTab === tab.id
            ? "3px solid var(--accent-light)"
            : "3px solid transparent",
        transition: "color 0.2s ease, border-color 0.2s ease",
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

            {activeTab === "registration" && <RegistrationTab tournament={tournament} />}

            {activeTab === "teams" && <TeamsTab tournamentId={tournamentId} />}

            {activeTab === "players" && <PlayersTab />}

            {activeTab === "auction" && <LiveAuctionTab />}

          </div>
        </main>
      </div>
    </div>
  );
};

export default TournamentHubPage;