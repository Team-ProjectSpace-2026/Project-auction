import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";
import http from "http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { io as Client } from "socket.io-client";
import { initializeSocket } from "../socket/auctionSocket.js";
import User from "../models/User.js";
import Tournament from "../models/Tournament.js";
import Team from "../models/Team.js";
import Player from "../models/Player.js";
import Bid from "../models/Bid.js";

describe("Live Auction Engine - WebSocket Max-Bid Cap Integration Test", () => {
  let server;
  let serverPort;
  let clientSocket1;
  let clientSocket2;

  const jwtSecret = "test-jwt-secret-key-12345";
  process.env.JWT_SECRET = jwtSecret;

  const mockUserId1 = new mongoose.Types.ObjectId();
  const mockUserId2 = new mongoose.Types.ObjectId();
  const mockTournamentId = new mongoose.Types.ObjectId();
  const mockPlayerId = new mongoose.Types.ObjectId();
  const mockTeam1Id = new mongoose.Types.ObjectId();
  const mockTeam2Id = new mongoose.Types.ObjectId();

  const token1 = jwt.sign({ id: mockUserId1.toString() }, jwtSecret);
  const token2 = jwt.sign({ id: mockUserId2.toString() }, jwtSecret);

  // Tournament rules: minSquadSize = 15, minReserve = 100
  const tournamentRules = {
    minSquadSize: 15,
    maxSquadSize: 18,
    minReservePerSlot: 100,
    maxOverseas: 8,
  };

  // Team 1 state: remaining 1,000, 5 players owned.
  // slotsNeededAfterThis = 15 - 5 - 1 = 9 slots -> reserveNeeded = 900
  // Team 1 maxBid = 1,000 - 900 = 100!
  const team1State = {
    _id: mockTeam1Id,
    name: "Team Alpha",
    short: "ALP",
    tournamentId: mockTournamentId,
    remainingBudget: 1000,
    players: 5,
    save: jest.fn().mockResolvedValue(true),
  };

  // Team 2 state: remaining 3,000, 5 players owned.
  // reserveNeeded = 900 -> Team 2 maxBid = 2,100!
  const team2State = {
    _id: mockTeam2Id,
    name: "Team Beta",
    short: "BET",
    tournamentId: mockTournamentId,
    remainingBudget: 3000,
    players: 5,
    save: jest.fn().mockResolvedValue(true),
  };

  const tournamentDoc = {
    _id: mockTournamentId,
    name: "Championship 2026",
    status: "Upcoming",
    auctionStatus: "bidding",
    currentPlayerId: mockPlayerId,
    playerBasePrice: 100,
    maxPlayersPerTeam: 18,
    tournamentRules,
    unsoldPlayerIds: [],
    save: jest.fn().mockResolvedValue(true),
  };

  const playerDoc = {
    _id: mockPlayerId,
    name: "Star Batsman",
    role: "Batsman",
    basePrice: 100,
    tournamentId: mockTournamentId,
    isSold: false,
    deleted: false,
  };

  let ioInstance;

  beforeAll((done) => {
    server = http.createServer();
    ioInstance = initializeSocket(server);

    // Spy on Mongoose models
    jest.spyOn(User, "findById").mockImplementation((id) => {
      const idStr = id?.toString();
      if (idStr === mockUserId1.toString()) {
        return Promise.resolve({ _id: mockUserId1, email: "user1@example.com" });
      }
      if (idStr === mockUserId2.toString()) {
        return Promise.resolve({ _id: mockUserId2, email: "user2@example.com" });
      }
      return Promise.resolve(null);
    });

    jest.spyOn(Tournament, "findById").mockImplementation(() => ({
      lean: () => Promise.resolve(tournamentDoc),
      populate: () => Promise.resolve(tournamentDoc),
      then: (resolve) => resolve(tournamentDoc),
    }));

    jest.spyOn(Team, "findById").mockImplementation((id) => {
      const idStr = id?.toString();
      if (idStr === mockTeam1Id.toString()) return Promise.resolve(team1State);
      if (idStr === mockTeam2Id.toString()) return Promise.resolve(team2State);
      return Promise.resolve(null);
    });

    jest.spyOn(Team, "find").mockImplementation(() => ({
      lean: () => Promise.resolve([team1State, team2State]),
    }));

    jest.spyOn(Player, "findById").mockImplementation((id) => {
      if (id?.toString() === mockPlayerId.toString()) {
        return {
          ...playerDoc,
          lean: () => Promise.resolve(playerDoc),
          then: (resolve) => resolve(playerDoc),
        };
      }
      return Promise.resolve(null);
    });

    jest.spyOn(Player, "countDocuments").mockResolvedValue(0);

    let activeBid = null;
    jest.spyOn(Bid, "findOne").mockImplementation(() => ({
      sort: () => Promise.resolve(activeBid),
    }));

    jest.spyOn(Bid, "updateMany").mockResolvedValue({ modifiedCount: 1 });
    jest.spyOn(Bid, "startSession").mockRejectedValue(new Error("No replica set")); // trigger fallback path

    jest.spyOn(Bid.prototype, "save").mockImplementation(function () {
      activeBid = {
        _id: this._id || new mongoose.Types.ObjectId(),
        tournamentId: this.tournamentId,
        playerId: this.playerId,
        teamId: this.teamId,
        amount: this.amount,
        status: "Active",
      };
      return Promise.resolve(activeBid);
    });

    jest.spyOn(Bid, "findById").mockImplementation(() => ({
      populate: () => ({
        populate: () =>
          Promise.resolve({
            _id: activeBid?._id || new mongoose.Types.ObjectId(),
            amount: activeBid?.amount || 100,
            playerId: { _id: mockPlayerId, name: playerDoc.name },
            teamId: {
              _id: activeBid?.teamId || mockTeam1Id,
              name: activeBid?.teamId?.toString() === mockTeam1Id.toString() ? team1State.name : team2State.name,
              short: activeBid?.teamId?.toString() === mockTeam1Id.toString() ? team1State.short : team2State.short,
            },
          }),
      }),
    }));

    server.listen(() => {
      serverPort = server.address().port;
      done();
    });
  });

  afterAll(async () => {
    if (clientSocket1?.connected) clientSocket1.disconnect();
    if (clientSocket2?.connected) clientSocket2.disconnect();
    if (ioInstance) {
      await new Promise((res) => ioInstance.close(res));
    }
    if (server?.listening) {
      await new Promise((res) => server.close(res));
    }
  });

  test("Two teams connect and join tournament room successfully", (done) => {
    let connectedCount = 0;
    const checkDone = () => {
      connectedCount++;
      if (connectedCount === 2) done();
    };

    clientSocket1 = Client(`http://localhost:${serverPort}`, {
      auth: { token: token1 },
      transports: ["websocket"],
    });

    clientSocket2 = Client(`http://localhost:${serverPort}`, {
      auth: { token: token2 },
      transports: ["websocket"],
    });

    clientSocket1.on("connect", () => {
      clientSocket1.emit("join-tournament", { tournamentId: mockTournamentId.toString() });
      checkDone();
    });

    clientSocket2.on("connect", () => {
      clientSocket2.emit("join-tournament", { tournamentId: mockTournamentId.toString() });
      checkDone();
    });
  });

  test("Team 1 places legal opening bid of ₹100 (equal to Team 1 maxBid)", (done) => {
    clientSocket1.once("bid-success", (data) => {
      expect(data.isWinningBid).toBe(true);
      expect(data.bid.amount).toBe(100);
      expect(data.eligibility).toBeDefined();
      done();
    });

    clientSocket1.emit("place-bid", {
      tournamentId: mockTournamentId.toString(),
      teamId: mockTeam1Id.toString(),
      playerId: mockPlayerId.toString(),
      amount: 100,
    });
  });

  test("Team 2 raises bid to ₹200 within Team 2 cap", (done) => {
    clientSocket2.once("bid-success", (data) => {
      expect(data.isWinningBid).toBe(true);
      expect(data.bid.amount).toBe(200);
      done();
    });

    clientSocket2.emit("place-bid", {
      tournamentId: mockTournamentId.toString(),
      teamId: mockTeam2Id.toString(),
      playerId: mockPlayerId.toString(),
      amount: 200,
    });
  });

  test("Server REJECTS direct WebSocket bid from Team 1 exceeding its live maxBid cap", (done) => {
    // Wait > 600ms to respect userRateLimitStore window
    setTimeout(() => {
      // Team 1 attempts to bid ₹300 directly over WebSocket
      // But Team 1's maxBid is 100 (needs 900 reserve for 9 remaining squad slots)
      // Server must reject with bid-error and descriptive reason!
      clientSocket1.once("bid-error", (data) => {
        expect(data.message).toBeDefined();
        expect(data.message).toContain("exceeds team's maximum allowed bid");
        expect(data.message).toContain("guarantee squad completion");
        done();
      });

      // Send direct WebSocket event (bypassing UI)
      clientSocket1.emit("place-bid", {
        tournamentId: mockTournamentId.toString(),
        teamId: mockTeam1Id.toString(),
        playerId: mockPlayerId.toString(),
        amount: 300,
      });
    }, 700);
  });

  test("Team 2 can continue bidding legally within its higher cap", (done) => {
    // Team 2 still has cap of 2,100, so bid of 300 is legal for Team 2
    clientSocket2.once("bid-success", (data) => {
      expect(data.isWinningBid).toBe(true);
      expect(data.bid.amount).toBe(300);
      done();
    });

    clientSocket2.emit("place-bid", {
      tournamentId: mockTournamentId.toString(),
      teamId: mockTeam2Id.toString(),
      playerId: mockPlayerId.toString(),
      amount: 300,
    });
  });
});
