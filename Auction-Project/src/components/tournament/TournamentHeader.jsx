import { useNavigate } from "react-router-dom";
import { Trophy, Users, Calendar, Pencil } from "lucide-react";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getDynamicStatus = (date) => {
  if (!date) return "Upcoming";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const auctionDate = new Date(date);
  auctionDate.setHours(0, 0, 0, 0);
  if (auctionDate < today) return "Completed";
  if (auctionDate.getTime() === today.getTime()) return "Active";
  return "Upcoming";
};

const TournamentHeader = ({ tournament }) => {
  const navigate = useNavigate();

  const name = tournament?.name || "Tournament";
  const status = getDynamicStatus(tournament?.date);
  const teams = tournament?.teams || 0;
  const date = tournament?.date || "";
  const getStatusStyle = (s) => {
    if (s === "Active") return { background: "var(--status-active-bg)", color: "var(--status-active-text)" };
    if (s === "Upcoming") return { background: "#dbeafe", color: "#2563eb" };
    return { background: "#e5e7eb", color: "#4b5563" };
  };

  return (
    <div
      style={{
        background: "var(--card-bg-light)",
        border: "1px solid var(--border-light)",
        borderRadius: "16px",
        padding: "18px 24px",
        marginBottom: "18px",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/tournaments")}
        style={{
          border: "none",
          background: "transparent",
          color: "var(--accent-light)",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "14px",
          fontSize: "14px",
        }}
      >
        ← Back to Tournaments
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left Side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Tournament Logo */}
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "0px",
              background: "transparent",
              border: "1px solid var(--border-light)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "34px",
              overflow: "hidden",
            }}
          >
            {tournament?.logo ? (
              <img
                src={`${API_BASE}${tournament.logo}`}
                alt={tournament.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Trophy size={34} strokeWidth={1.5} style={{ color: "var(--text-secondary-light)" }} />
            )}
          </div>

          <div>
            {/* Title */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "var(--text-primary-light)",
                }}
              >
                {name}
              </h1>

              <span
                style={{
                  ...getStatusStyle(status),
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {status}
              </span>
            </div>

            {/* Info Row */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                color: "var(--text-secondary-light)",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Users size={15} strokeWidth={2} /> {teams} Teams</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Calendar size={15} strokeWidth={2} /> Auction on {formatDate(date)}</span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <button
          onClick={() =>
            navigate("/edit-tournament", {
              state: { tournament },
              params: { tournamentId: tournament?._id },
            })
          }
          style={{
            background: "var(--card-bg-light)",
            color: "var(--accent-light)",
            border: "1px solid var(--accent-light)",
            borderRadius: "10px",
            padding: "12px 18px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Pencil size={15} strokeWidth={2} /> Edit Tournament</span>
        </button>
      </div>
    </div>
  );
};

export default TournamentHeader;
