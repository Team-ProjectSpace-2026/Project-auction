import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const joinedTournamentsRef = useRef(new Set());

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    // Use httpOnly cookie auth — withCredentials sends cookies automatically
    // No need for localStorage token
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
      // Re-join tournaments after reconnection
      for (const tournamentId of joinedTournamentsRef.current) {
        socket.emit("join-tournament", tournamentId);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      setConnectionError(err.message || "Connection failed");
      setIsConnected(false);
    });

    socketRef.current = socket;
    return socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      joinedTournamentsRef.current.clear();
    }
  }, []);

  const joinTournament = useCallback((tournamentId) => {
    joinedTournamentsRef.current.add(tournamentId);
    socketRef.current?.emit("join-tournament", tournamentId);
  }, []);

  const leaveTournament = useCallback((tournamentId) => {
    joinedTournamentsRef.current.delete(tournamentId);
    socketRef.current?.emit("leave-tournament", tournamentId);
  }, []);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return useMemo(() => ({
    isConnected,
    connectionError,
    connect,
    disconnect,
    joinTournament,
    leaveTournament,
    emit,
    on,
  }), [isConnected, connectionError, connect, disconnect, joinTournament, leaveTournament, emit, on]);
};

export default useSocket;
