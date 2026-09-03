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
  const { isConnected, connectionError, connect, joinTournament, emit } = useSocket();

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
  const [tournament, setTournament] = useState(null);

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
      if (data.recentBids) setBids(data.recentBids);
      if (data.currentPlayer) setCurrentPlayer(data.currentPlayer);
      if (data.auctionStatus) setAuctionStatus(data.auctionStatus);
      if (data.tournament) setTournament(data.tournament);
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
        const targetTeamId = String(typeof data.teamId === 'object' ? data.teamId._id : data.teamId);
        const targetPlayerId = String(typeof data.playerId === 'object' ? data.playerId._id : data.playerId);
        setTeams((prev) =>
          prev.map((t) => {
            if (String(t._id) === targetTeamId) {
              return {
                ...t,
                remainingBudget: Math.max(0, (t.remainingBudget || 0) - (data.soldPrice || 0)),
                players: (t.players || 0) + 1,
              };
            }
            return t;
          })
        );
        setPlayers((prev) =>
          prev.map((p) =>
            String(p._id) === targetPlayerId
              ? { ...p, isSold: true, soldTo: targetTeamId, soldPrice: data.soldPrice }
              : p
          )
        );
      };

      const onPlayerUnsold = (data) => {
        setUnsoldInfo(data);
        setAuctionStatus("unsold");
        setCurrentBid(null);
        setHighestBidder(null);
        setPlayers((prev) =>
          prev.map((p) =>
            p._id === data.playerId
              ? { ...p, isUnsold: true }
              : p
          )
        );
      };

      const onAuctionStarted = () => setAuctionStatus("bidding");
      const onAuctionEnded = () => {
        setAuctionStatus("completed");
        setPlayers(prev => prev.map(p => ({ ...p, isUnsold: false })));
      };

      const onAuctionState = (data) => {
        const { currentPlayer: cp, currentBid: cb, highestBidder: hb, auctionStatus: status, teams, players, tournament, unsoldPlayerIds } = data;
        if (cp) setCurrentPlayer(cp);
        if (cb) setCurrentBid(cb);
        if (hb) setHighestBidder(hb);
        if (status) setAuctionStatus(status);
        if (teams) setTeams(teams);
        if (players) setPlayers(players);
        if (tournament) setTournament(tournament);
        if (unsoldPlayerIds && unsoldPlayerIds.length > 0) {
          setPlayers(prev => prev.map(p =>
            unsoldPlayerIds.includes(p._id) ? { ...p, isUnsold: true } : p
          ));
        }
      };

      const onUnsoldReset = () => {
        setPlayers((prev) => prev.map((p) => (!p.isSold ? { ...p, isUnsold: false } : p)));
        setAuctionStatus("idle");
        setCurrentPlayer(null);
        setCurrentBid(null);
        setHighestBidder(null);
        setUnsoldInfo(null);
      };

      const onError = (data) => setError(data.message);

      socket.on("new-bid", onNewBid);
      socket.on("player-revealed", onPlayerRevealed);
      socket.on("player-sold", onPlayerSold);
      socket.on("player-unsold", onPlayerUnsold);
      socket.on("unsold-reset", onUnsoldReset);
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
        socket.off("unsold-reset", onUnsoldReset);
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
      if (!tournamentId) {
        setError("No tournament selected");
        return;
      }
      if (!teamId) {
        setError("No team selected for bidding");
        return;
      }
      if (!playerId) {
        setError("No player selected for bidding");
        return;
      }
      if (!amount || amount <= 0) {
        setError("Invalid bid amount");
        return;
      }
      emit("place-bid", { tournamentId, amount, teamId, playerId });
    },
    [emit, tournamentId]
  );

  const revealPlayer = useCallback(
    (playerId) => {
      if (!tournamentId) {
        setError("No tournament selected");
        return;
      }
      if (!playerId) {
        setError("No player selected to reveal");
        return;
      }
      emit("reveal-player", { tournamentId, playerId });
    },
    [emit, tournamentId]
  );

  const markSold = useCallback(
    (playerId) => {
      if (!tournamentId) {
        setError("No tournament selected");
        return;
      }
      if (!playerId) {
        setError("No player selected to mark as sold");
        return;
      }
      emit("mark-sold", { tournamentId, playerId });
    },
    [emit, tournamentId]
  );

  const markUnsold = useCallback(
    (playerId) => {
      if (!tournamentId) {
        setError("No tournament selected");
        return;
      }
      if (!playerId) {
        setError("No player selected to mark as unsold");
        return;
      }
      emit("mark-unsold", { tournamentId, playerId });
    },
    [emit, tournamentId]
  );

  const startAuction = useCallback(() => {
    if (!tournamentId) {
      setError("No tournament selected");
      return;
    }
    emit("start-auction", { tournamentId });
  }, [emit, tournamentId]);

  const endAuction = useCallback(() => {
    if (!tournamentId) {
      setError("No tournament selected");
      return;
    }
    emit("end-auction", { tournamentId });
  }, [emit, tournamentId]);

  const reauctionUnsold = useCallback(() => {
    setPlayers((prev) => prev.map((p) => (!p.isSold ? { ...p, isUnsold: false } : p)));
    setAuctionStatus("idle");
    setCurrentPlayer(null);
    setCurrentBid(null);
    setHighestBidder(null);
    setUnsoldInfo(null);

    if (tournamentId) {
      emit("re-auction-unsold", { tournamentId });
    }
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
    tournament,
    initTournament,
    joinAndListen,
    placeBid,
    revealPlayer,
    markSold,
    markUnsold,
    reauctionUnsold,
    startAuction,
    endAuction,
    clearSoldInfo,
    clearUnsoldInfo,
    clearError,
    setTeams,
    setPlayers,
    setTournament,
  }), [
    isConnected, connectionError,
    tournamentId, currentPlayer, currentBid, highestBidder, auctionStatus,
    teams, bids, players, error, soldInfo, unsoldInfo, revealedPlayer, tournament,
    initTournament, joinAndListen, placeBid, revealPlayer, markSold,
    markUnsold, reauctionUnsold, startAuction, endAuction, clearSoldInfo, clearUnsoldInfo,
    clearError,
  ]);

  return (
    <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>
  );
};

export default AuctionContext;
