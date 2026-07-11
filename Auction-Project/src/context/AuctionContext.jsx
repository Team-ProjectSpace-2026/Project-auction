import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useSocket } from "../hooks/useSocket";
import { getAuctionState } from "../services/auctionService";

const AuctionContext = createContext(null);

export const useAuction = () => {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error("useAuction must be used within AuctionProvider");
  return ctx;
};

export const AuctionProvider = ({ children }) => {
  const { isConnected, connectionError, connect, disconnect, joinTournament, leaveTournament, emit, on } = useSocket();

  const [tournamentId, setTournamentId] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [highestBidder, setHighestBidder] = useState(null);
  const [auctionStatus, setAuctionStatus] = useState("idle");
  const [teams, setTeams] = useState([]);
  const [bids, setBids] = useState([]);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [soldInfo, setSoldInfo] = useState(null);
  const [unsoldInfo, setUnsoldInfo] = useState(null);
  const [revealedPlayer, setRevealedPlayer] = useState(null);

  const initTournament = useCallback(async (id) => {
    setTournamentId(id);
    setBids([]);
    setCurrentPlayer(null);
    setCurrentBid(null);
    setHighestBidder(null);
    setAuctionStatus("idle");
    setSoldInfo(null);
    setUnsoldInfo(null);

    try {
      const res = await getAuctionState(id);
      const data = res.data;
      if (data.teams) setTeams(data.teams);
      if (data.players) setPlayers(data.players);
      if (data.bids) setBids(data.bids);
      if (data.currentPlayer) setCurrentPlayer(data.currentPlayer);
      if (data.auctionStatus) setAuctionStatus(data.auctionStatus);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load auction state");
    }
  }, []);

  const joinAndListen = useCallback(
    (id) => {
      initTournament(id);

      const socket = connect();
      if (!socket) return;

      joinTournament(id);

      const onNewBid = (data) => {
        const { bid } = data;
        setCurrentBid(bid);
        if (bid.teamId) setHighestBidder(bid.teamId);
        setBids((prev) => {
          const exists = prev.find((b) => b._id === bid._id);
          if (exists) return prev;
          return [bid, ...prev].slice(0, 50);
        });
      };

      const onPlayerRevealed = (data) => {
        const { player } = data;
        setCurrentPlayer(player);
        setCurrentBid(null);
        setHighestBidder(null);
        setAuctionStatus("bidding");
        setRevealedPlayer(player);
        setSoldInfo(null);
        setUnsoldInfo(null);
      };

      const onPlayerSold = (data) => {
        setSoldInfo(data);
        setAuctionStatus("sold");
        setCurrentBid(null);
        setHighestBidder(null);
        setTeams((prev) =>
          prev.map((t) => {
            if (t._id === data.teamId) {
              return {
                ...t,
                remainingBudget: t.remainingBudget - data.soldPrice,
                players: (t.players || 0) + 1,
              };
            }
            return t;
          })
        );
      };

      const onPlayerUnsold = (data) => {
        setUnsoldInfo(data);
        setAuctionStatus("unsold");
        setCurrentBid(null);
        setHighestBidder(null);
      };

      const onAuctionStarted = () => setAuctionStatus("bidding");
      const onAuctionEnded = () => setAuctionStatus("completed");

      const onAuctionState = (data) => {
        const { currentPlayer: cp, currentBid: cb, highestBidder: hb, auctionStatus: status } = data;
        if (cp) setCurrentPlayer(cp);
        if (cb) setCurrentBid(cb);
        if (hb) setHighestBidder(hb);
        if (status) setAuctionStatus(status);
      };

      const onError = (data) => setError(data.message);

      socket.on("new-bid", onNewBid);
      socket.on("player-revealed", onPlayerRevealed);
      socket.on("player-sold", onPlayerSold);
      socket.on("player-unsold", onPlayerUnsold);
      socket.on("auction-started", onAuctionStarted);
      socket.on("auction-ended", onAuctionEnded);
      socket.on("auction-state", onAuctionState);
      socket.on("bid-error", onError);
      socket.on("reveal-error", onError);
      socket.on("mark-sold-error", onError);
      socket.on("mark-unsold-error", onError);

      return () => {
        socket.off("new-bid", onNewBid);
        socket.off("player-revealed", onPlayerRevealed);
        socket.off("player-sold", onPlayerSold);
        socket.off("player-unsold", onPlayerUnsold);
        socket.off("auction-started", onAuctionStarted);
        socket.off("auction-ended", onAuctionEnded);
        socket.off("auction-state", onAuctionState);
        socket.off("bid-error", onError);
        socket.off("reveal-error", onError);
        socket.off("mark-sold-error", onError);
        socket.off("mark-unsold-error", onError);
      };
    },
    [initTournament, connect, joinTournament]
  );

  const placeBid = useCallback(
    (amount, teamId, playerId) => {
      if (!tournamentId) return;
      emit("place-bid", { tournamentId, amount, teamId, playerId });
    },
    [emit, tournamentId]
  );

  const revealPlayer = useCallback(
    (playerId) => {
      if (!tournamentId) return;
      emit("reveal-player", { tournamentId, playerId });
    },
    [emit, tournamentId]
  );

  const markSold = useCallback(
    (playerId) => {
      if (!tournamentId) return;
      emit("mark-sold", { tournamentId, playerId });
    },
    [emit, tournamentId]
  );

  const markUnsold = useCallback(
    (playerId) => {
      if (!tournamentId) return;
      emit("mark-unsold", { tournamentId, playerId });
    },
    [emit, tournamentId]
  );

  const startAuction = useCallback(() => {
    if (!tournamentId) return;
    emit("start-auction", { tournamentId });
  }, [emit, tournamentId]);

  const endAuction = useCallback(() => {
    if (!tournamentId) return;
    emit("end-auction", { tournamentId });
  }, [emit, tournamentId]);

  const clearSoldInfo = useCallback(() => setSoldInfo(null), []);
  const clearUnsoldInfo = useCallback(() => setUnsoldInfo(null), []);
  const clearError = useCallback(() => setError(null), []);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({
    isConnected,
    connectionError,
    tournamentId,
    currentPlayer,
    currentBid,
    highestBidder,
    auctionStatus,
    teams,
    bids,
    players,
    error,
    soldInfo,
    unsoldInfo,
    revealedPlayer,
    initTournament,
    joinAndListen,
    placeBid,
    revealPlayer,
    markSold,
    markUnsold,
    startAuction,
    endAuction,
    clearSoldInfo,
    clearUnsoldInfo,
    clearError,
    setTeams,
    setPlayers,
  }), [
    isConnected, connectionError,
    tournamentId, currentPlayer, currentBid, highestBidder, auctionStatus,
    teams, bids, players, error, soldInfo, unsoldInfo, revealedPlayer,
    initTournament, joinAndListen, placeBid, revealPlayer, markSold,
    markUnsold, startAuction, endAuction, clearSoldInfo, clearUnsoldInfo,
    clearError,
  ]);

  return (
    <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>
  );
};

export default AuctionContext;
