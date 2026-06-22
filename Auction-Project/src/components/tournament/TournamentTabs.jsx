const tabs = [
  "overview",
  "registration",
  "teams",
  "players",
  "auction",
];

const labels = {
  overview: "Overview",
  registration: "Registration Link",
  teams: "Teams",
  players: "Players",
  auction: "Live Auction",
};

const TournamentTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-2 mt-4">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            {labels[tab]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TournamentTabs;