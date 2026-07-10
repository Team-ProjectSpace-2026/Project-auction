import { useState, useEffect, useCallback } from "react";
import * as tournamentService from "../services/tournamentService";
import * as playerService from "../services/playerService";

export function useTournament(tournamentId) {
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTournament = useCallback(async () => {
    if (!tournamentId) return;
    try {
      setLoading(true);
      const [tourneyResult, playersResult] = await Promise.allSettled([
        tournamentService.getTournament(tournamentId),
        playerService.getPlayers(tournamentId),
      ]);
      if (tourneyResult.status === "fulfilled") {
        setTournament(tourneyResult.value.data);
      } else {
        setError(tourneyResult.reason?.response?.data?.message || tourneyResult.reason?.message);
      }
      if (playersResult.status === "fulfilled") {
        setPlayers(playersResult.value.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  return { tournament, players, loading, error, refetch: fetchTournament };
}
