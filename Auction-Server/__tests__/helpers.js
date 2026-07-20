import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';
import Tournament from '../src/models/Tournament.js';
import Player from '../src/models/Player.js';
import Team from '../src/models/Team.js';
import Bid from '../src/models/Bid.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-that-is-at-least-32-chars-long';

export const signToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });
};

export const createTestUser = async (overrides = {}) => {
  const user = new User({
    name: overrides.name || 'Test User',
    email: overrides.email || `test${Date.now()}@example.com`,
    mobile: overrides.mobile || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    password: overrides.password || 'Password123',
    role: overrides.role || 'Organizer',
  });
  await user.save();
  return user;
};

export const createTestTournament = async (ownerId, overrides = {}) => {
  const tournament = new Tournament({
    name: overrides.name || `Tournament ${Date.now()}`,
    status: overrides.status || 'Upcoming',
    date: overrides.date || new Date('2027-12-31'),
    teams: overrides.teams || 4,
    venue: overrides.venue || 'Mumbai Stadium',
    budgetPerTeam: overrides.budgetPerTeam || 1000000,
    maxPlayersPerTeam: overrides.maxPlayersPerTeam || 15,
    playerBasePrice: overrides.playerBasePrice || 50000,
    description: overrides.description || 'Test tournament',
    owner: ownerId,
    createdBy: ownerId,
    ...overrides,
  });
  await tournament.save();
  return tournament;
};

export const createTestPlayer = async (tournamentId, createdBy, overrides = {}) => {
  const player = new Player({
    name: overrides.name || `Player ${Date.now()}`,
    role: overrides.role || 'Batsman',
    style: overrides.style || 'Right Hand Bat',
    battingStyle: overrides.battingStyle || 'Right Hand',
    bowlingStyle: overrides.bowlingStyle || '',
    keeper: overrides.keeper || false,
    basePrice: overrides.basePrice || 50000,
    tournamentId,
    createdBy,
    ...overrides,
  });
  await player.save();
  return player;
};

export const createTestTeam = async (tournamentId, createdBy, overrides = {}) => {
  const totalBudget = overrides.totalBudget || 1000000;
  const team = new Team({
    name: overrides.name || `Team ${Date.now()}`,
    short: overrides.short || 'TM' + Math.floor(Math.random() * 90 + 10),
    budget: overrides.budget || totalBudget,
    maxPlayers: overrides.maxPlayers || 15,
    totalBudget,
    remainingBudget: overrides.remainingBudget || totalBudget,
    ownerName: overrides.ownerName || 'Owner Name',
    tournamentId,
    createdBy,
    ...overrides,
  });
  await team.save();
  return team;
};

export const createTestBid = async (tournamentId, playerId, teamId, overrides = {}) => {
  const bid = new Bid({
    tournamentId,
    playerId,
    teamId,
    amount: overrides.amount || 100000,
    status: overrides.status || 'Active',
    ...overrides,
  });
  await bid.save();
  return bid;
};

export const makeAuthRequest = (app) => {
  const agent = (await import('supertest')).default;
  return agent(app);
};
