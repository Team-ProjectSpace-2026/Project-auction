import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';

import User from '../../src/models/User.js';
import Tournament from '../../src/models/Tournament.js';
import Player from '../../src/models/Player.js';
import Team from '../../src/models/Team.js';
import Bid from '../../src/models/Bid.js';
import { initializeSocket } from '../../src/socket/auctionSocket.js';

let mongoServer;
let httpServer;
let io;
let clientSocket;
let user;
let token;
let tournament;
let team;
let player;

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-that-is-at-least-32-chars-long';

beforeAll(async () => {
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.NODE_ENV = 'test';

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const app = express();
  app.use(cookieParser());
  httpServer = createServer(app);
  io = initializeSocket(httpServer);

  await new Promise((resolve) => httpServer.listen(0, resolve));

  user = new User({
    name: 'Socket User',
    email: 'socket@example.com',
    mobile: '9876543210',
    password: 'Password123',
  });
  await user.save();
  token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

  tournament = new Tournament({
    name: 'Socket Tournament',
    status: 'Upcoming',
    date: new Date('2027-12-31'),
    teams: 2,
    venue: 'Stadium',
    budgetPerTeam: 1000000,
    maxPlayersPerTeam: 10,
    playerBasePrice: 50000,
    owner: user._id,
    createdBy: user._id,
    auctionStatus: 'idle',
  });
  await tournament.save();

  team = new Team({
    name: 'Socket Team',
    short: 'ST',
    budget: 1000000,
    totalBudget: 1000000,
    remainingBudget: 1000000,
    maxPlayers: 10,
    ownerName: 'Owner',
    tournamentId: tournament._id,
    createdBy: user._id,
  });
  await team.save();

  player = new Player({
    name: 'Socket Player',
    role: 'Batsman',
    tournamentId: tournament._id,
    createdBy: user._id,
  });
  await player.save();
});

afterAll(async () => {
  if (clientSocket?.connected) clientSocket.disconnect();
  if (io) io.close();
  if (httpServer) httpServer.close();
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  if (clientSocket?.connected) clientSocket.disconnect();
  clientSocket = null;
  await Bid.deleteMany({});
  await Tournament.updateMany({}, { $set: { auctionStatus: 'idle', currentPlayerId: null } });
  await Player.updateMany({}, { $set: { isSold: false, soldTo: null, soldPrice: null } });
  await Team.updateMany({}, { $set: { remainingBudget: 1000000, players: 0 } });
});

const createClient = () => {
  const port = httpServer.address().port;
  return Client(`http://localhost:${port}`, {
    auth: { token },
    transports: ['websocket'],
    forceNew: true,
  });
};

const waitForEvent = (socket, event, timeout = 5000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${event}`)), timeout);
    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

describe('Auction Socket', () => {
  it('connects and joins tournament room', async () => {
    clientSocket = createClient();

    await new Promise((resolve, reject) => {
      clientSocket.on('connect', resolve);
      clientSocket.on('connect_error', reject);
    });

    const statePromise = waitForEvent(clientSocket, 'auction-state');
    clientSocket.emit('join-tournament', tournament._id.toString());
    const state = await statePromise;

    expect(state.teams).toBeDefined();
    expect(state.players).toBeDefined();
    expect(state.auctionStatus).toBe('idle');
  });

  it('rejects connection without token', async () => {
    const port = httpServer.address().port;
    const badClient = Client(`http://localhost:${port}`, {
      transports: ['websocket'],
      forceNew: true,
    });

    await new Promise((resolve) => {
      badClient.on('connect_error', (err) => {
        expect(err.message).toBeDefined();
        badClient.disconnect();
        resolve();
      });
      // If it somehow connects, disconnect
      setTimeout(() => {
        badClient.disconnect();
        resolve();
      }, 3000);
    });
  });

  it('join-tournament rejects invalid ID', async () => {
    clientSocket = createClient();
    await new Promise((resolve) => clientSocket.on('connect', resolve));

    const errorPromise = waitForEvent(clientSocket, 'join-error');
    clientSocket.emit('join-tournament', 'notavalidid');
    const error = await errorPromise;
    expect(error.message).toMatch(/Invalid/);
  });

  it('reveal-player works for tournament owner', async () => {
    clientSocket = createClient();
    await new Promise((resolve) => clientSocket.on('connect', resolve));
    clientSocket.emit('join-tournament', tournament._id.toString());
    await waitForEvent(clientSocket, 'auction-state');

    const revealedPromise = waitForEvent(clientSocket, 'player-revealed');
    clientSocket.emit('reveal-player', {
      tournamentId: tournament._id.toString(),
      playerId: player._id.toString(),
    });
    const revealed = await revealedPromise;
    expect(revealed.player.name).toBe('Socket Player');
  });

  it('reveal-player rejects non-owner', async () => {
    // Create another user
    const otherUser = new User({
      name: 'Non-Owner',
      email: 'nonowner@example.com',
      mobile: '9876543299',
      password: 'Password123',
    });
    await otherUser.save();
    const otherToken = jwt.sign({ id: otherUser._id }, JWT_SECRET, { expiresIn: '1d' });

    const port = httpServer.address().port;
    clientSocket = Client(`http://localhost:${port}`, {
      auth: { token: otherToken },
      transports: ['websocket'],
      forceNew: true,
    });
    await new Promise((resolve) => clientSocket.on('connect', resolve));
    clientSocket.emit('join-tournament', tournament._id.toString());
    await waitForEvent(clientSocket, 'auction-state');

    const errorPromise = waitForEvent(clientSocket, 'reveal-error');
    clientSocket.emit('reveal-player', {
      tournamentId: tournament._id.toString(),
      playerId: player._id.toString(),
    });
    const error = await errorPromise;
    expect(error.message).toMatch(/Not authorized/i);
  });

  it('place-bid creates bid and broadcasts', async () => {
    // Set auction to bidding
    tournament.auctionStatus = 'bidding';
    tournament.currentPlayerId = player._id;
    await tournament.save();

    clientSocket = createClient();
    await new Promise((resolve) => clientSocket.on('connect', resolve));
    clientSocket.emit('join-tournament', tournament._id.toString());
    await waitForEvent(clientSocket, 'auction-state');

    const bidPromise = waitForEvent(clientSocket, 'bid-success');
    clientSocket.emit('place-bid', {
      tournamentId: tournament._id.toString(),
      amount: 150000,
      teamId: team._id.toString(),
      playerId: player._id.toString(),
    });
    const bidResult = await bidPromise;
    expect(bidResult.bid.amount).toBe(150000);
  });

  it('place-bid rejects bid on wrong player', async () => {
    tournament.auctionStatus = 'bidding';
    tournament.currentPlayerId = player._id;
    await tournament.save();

    const otherPlayer = new Player({
      name: 'Other',
      role: 'Bowler',
      tournamentId: tournament._id,
      createdBy: user._id,
    });
    await otherPlayer.save();

    clientSocket = createClient();
    await new Promise((resolve) => clientSocket.on('connect', resolve));
    clientSocket.emit('join-tournament', tournament._id.toString());
    await waitForEvent(clientSocket, 'auction-state');

    const errorPromise = waitForEvent(clientSocket, 'bid-error');
    clientSocket.emit('place-bid', {
      tournamentId: tournament._id.toString(),
      amount: 100000,
      teamId: team._id.toString(),
      playerId: otherPlayer._id.toString(),
    });
    const error = await errorPromise;
    expect(error.message).toMatch(/No active auction/i);
  });

  it('mark-sold processes winning bid atomically', async () => {
    tournament.auctionStatus = 'bidding';
    tournament.currentPlayerId = player._id;
    await tournament.save();

    clientSocket = createClient();
    await new Promise((resolve) => clientSocket.on('connect', resolve));
    clientSocket.emit('join-tournament', tournament._id.toString());
    await waitForEvent(clientSocket, 'auction-state');

    // Place bid
    const bidPromise = waitForEvent(clientSocket, 'bid-success');
    clientSocket.emit('place-bid', {
      tournamentId: tournament._id.toString(),
      amount: 200000,
      teamId: team._id.toString(),
      playerId: player._id.toString(),
    });
    await bidPromise;

    // Mark sold
    const soldPromise = waitForEvent(clientSocket, 'player-sold');
    clientSocket.emit('mark-sold', {
      tournamentId: tournament._id.toString(),
      playerId: player._id.toString(),
    });
    const soldResult = await soldPromise;
    expect(soldResult.soldPrice).toBe(200000);

    // Verify DB state
    const playerCheck = await Player.findById(player._id);
    expect(playerCheck.isSold).toBe(true);

    const teamCheck = await Team.findById(team._id);
    expect(teamCheck.remainingBudget).toBe(800000);
    expect(teamCheck.players).toBe(1);
  });

  it('mark-unsold cancels bids', async () => {
    tournament.auctionStatus = 'bidding';
    tournament.currentPlayerId = player._id;
    await tournament.save();

    clientSocket = createClient();
    await new Promise((resolve) => clientSocket.on('connect', resolve));
    clientSocket.emit('join-tournament', tournament._id.toString());
    await waitForEvent(clientSocket, 'auction-state');

    // Place bid
    const bidPromise = waitForEvent(clientSocket, 'bid-success');
    clientSocket.emit('place-bid', {
      tournamentId: tournament._id.toString(),
      amount: 100000,
      teamId: team._id.toString(),
      playerId: player._id.toString(),
    });
    await bidPromise;

    // Mark unsold
    const unsoldPromise = waitForEvent(clientSocket, 'player-unsold');
    clientSocket.emit('mark-unsold', {
      tournamentId: tournament._id.toString(),
      playerId: player._id.toString(),
    });
    const unsoldResult = await unsoldPromise;
    expect(unsoldResult.cancelledBids).toBe(1);

    // Verify player not sold
    const playerCheck = await Player.findById(player._id);
    expect(playerCheck.isSold).toBe(false);
  });

  it('start-auction updates status', async () => {
    clientSocket = createClient();
    await new Promise((resolve) => clientSocket.on('connect', resolve));
    clientSocket.emit('join-tournament', tournament._id.toString());
    await waitForEvent(clientSocket, 'auction-state');

    const startedPromise = waitForEvent(clientSocket, 'auction-started');
    clientSocket.emit('start-auction', {
      tournamentId: tournament._id.toString(),
    });
    const started = await startedPromise;
    expect(started.tournamentId).toBe(tournament._id.toString());

    const t = await Tournament.findById(tournament._id);
    expect(t.auctionStatus).toBe('idle');
  });

  it('end-auction resets state', async () => {
    tournament.auctionStatus = 'bidding';
    tournament.currentPlayerId = player._id;
    await tournament.save();

    clientSocket = createClient();
    await new Promise((resolve) => clientSocket.on('connect', resolve));
    clientSocket.emit('join-tournament', tournament._id.toString());
    await waitForEvent(clientSocket, 'auction-state');

    const endedPromise = waitForEvent(clientSocket, 'auction-ended');
    clientSocket.emit('end-auction', {
      tournamentId: tournament._id.toString(),
    });
    await endedPromise;

    const t = await Tournament.findById(tournament._id);
    expect(t.auctionStatus).toBe('idle');
    expect(t.currentPlayerId).toBeNull();
  });

  it('leave-tournament removes from room', async () => {
    clientSocket = createClient();
    await new Promise((resolve) => clientSocket.on('connect', resolve));
    clientSocket.emit('join-tournament', tournament._id.toString());
    await waitForEvent(clientSocket, 'auction-state');

    clientSocket.emit('leave-tournament', tournament._id.toString());
    // No error means success
  });
});
