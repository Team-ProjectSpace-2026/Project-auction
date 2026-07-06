import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuction } from "../../context/AuctionContext";
import AuctionRoom from "../../components/tournament/AuctionRoom";

const LiveAuctionPage = () => {
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");
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
