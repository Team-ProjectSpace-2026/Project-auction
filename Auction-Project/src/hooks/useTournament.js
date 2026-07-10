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
      const [tourneyRes, playersRes] = await Promise.all([
        tournamentService.getTournament(tournamentId),
        playerService.getPlayers(tournamentId),
      ]);
      setTournament(tourneyRes.data);
      setPlayers(playersRes.data);
      setError(null);
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
