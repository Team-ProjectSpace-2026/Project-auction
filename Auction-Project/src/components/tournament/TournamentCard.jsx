import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";

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

const TournamentCard = ({ tournament }) => {
  const navigate = useNavigate();
  const status = getDynamicStatus(tournament.date);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
          <Trophy size={28} strokeWidth={1.5} className="text-gray-400" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {tournament.name}
          </h3>

          <span
            className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
              status === "Active"
                ? "bg-green-100 text-green-700"
                : status === "Upcoming"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Auction Date</span>
          <span>{tournament.date}</span>
        </div>

        <div className="flex justify-between">
          <span>Teams</span>
          <span>{tournament.teams}</span>
        </div>
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
  );
};

export default TournamentCard;