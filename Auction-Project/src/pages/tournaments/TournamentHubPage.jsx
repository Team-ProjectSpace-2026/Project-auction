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
import { Clock, Link, Users, User, Hammer } from "lucide-react";

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
  const [teamsCount, setTeamsCount] = useState(0);
  const [playersCount, setPlayersCount] = useState(0);

  useEffect(() => {
    if (tournamentId) {
      api.get(`/tournaments/${tournamentId}`)
        .then((res) => setTournament(res.data))
        .catch(() => {});
    }
  }, [tournamentId]);

  useEffect(() => {
    const id = tournament?._id || tournamentId;
    if (!id) return;

    api.get(`/teams?tournamentId=${id}`)
      .then((res) => setTeamsCount(res.data.length))
      .catch(() => {});

    api.get(`/players?tournamentId=${id}`)
      .then((res) => setPlayersCount(res.data.length))
      .catch(() => {});
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
          <TournamentHeader tournament={tournament} />

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
    { id: "overview", label: "Overview", icon: Clock },
    { id: "registration", label: "Registration Link", icon: Link },
    { id: "teams", label: "Teams", icon: Users },
    { id: "players", label: "Players", icon: User },
    { id: "auction", label: "Live Auction", icon: Hammer },
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
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <tab.icon size={15} strokeWidth={2} />
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
            {activeTab === "overview" && (
              <OverviewTab
                tournament={tournament}
                teamsCount={teamsCount}
                playersCount={playersCount}
              />
            )}

            {activeTab === "registration" && <RegistrationTab tournament={tournament} />}

            {activeTab === "teams" && <TeamsTab tournamentId={tournamentId} />}

            {activeTab === "players" && <PlayersTab tournamentId={tournament?._id || tournamentId} />}

            {activeTab === "auction" && <LiveAuctionTab />}

          </div>
        </main>
      </div>
    </div>
  );
};

export default TournamentHubPage;