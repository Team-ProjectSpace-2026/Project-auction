import { useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useAuction } from "../../context/AuctionContext";
import AuctionRoom from "../../components/tournament/AuctionRoom";

const LiveAuctionPage = () => {
  const [searchParams] = useSearchParams();
  const urlParams = useParams();
  const tournamentId = searchParams.get("tournamentId") || urlParams.tournamentId;
  const { joinAndListen } = useAuction();

  useEffect(() => {
    if (tournamentId) {
      const cleanup = joinAndListen(tournamentId);
      return cleanup;
    }
  }, [tournamentId, joinAndListen]);

  return <AuctionRoom />;
};

export default LiveAuctionPage;
