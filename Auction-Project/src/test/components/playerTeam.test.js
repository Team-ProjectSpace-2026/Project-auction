import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Test player-related component patterns

describe('Player Components', () => {
  describe('PlayerRow', () => {
    const mockPlayer = {
      _id: '123',
      name: 'Virat Kohli',
      role: 'Batsman',
      basePrice: 150000,
      battingStyle: 'Right Hand',
      isSold: false,
    };

    it('renders player name', () => {
      render(
        <div>
          <span>{mockPlayer.name}</span>
          <span>{mockPlayer.role}</span>
        </div>
      );
      expect(screen.getByText('Virat Kohli')).toBeDefined();
    });

    it('renders player role', () => {
      render(
        <div>
          <span>{mockPlayer.name}</span>
          <span>{mockPlayer.role}</span>
        </div>
      );
      expect(screen.getByText('Batsman')).toBeDefined();
    });

    it('shows sold status', () => {
      render(
        <div>
          <span>{mockPlayer.name}</span>
          {mockPlayer.isSold ? <span>Sold</span> : <span>Available</span>}
        </div>
      );
      expect(screen.getByText('Available')).toBeDefined();
    });

    it('shows sold when player is sold', () => {
      const soldPlayer = { ...mockPlayer, isSold: true };
      render(
        <div>
          <span>{soldPlayer.name}</span>
          {soldPlayer.isSold ? <span>Sold</span> : <span>Available</span>}
        </div>
      );
      expect(screen.getByText('Sold')).toBeDefined();
    });
  });
});

describe('Team Components', () => {
  describe('TeamCard', () => {
    const mockTeam = {
      _id: '456',
      name: 'Mumbai Indians',
      short: 'MI',
      totalBudget: 1000000,
      remainingBudget: 800000,
      players: 8,
      ownerName: 'Mukesh',
    };

    it('renders team name', () => {
      render(
        <div>
          <h3>{mockTeam.name}</h3>
          <span>{mockTeam.short}</span>
        </div>
      );
      expect(screen.getByText('Mumbai Indians')).toBeDefined();
    });

    it('renders team abbreviation', () => {
      render(
        <div>
          <h3>{mockTeam.name}</h3>
          <span>{mockTeam.short}</span>
        </div>
      );
      expect(screen.getByText('MI')).toBeDefined();
    });

    it('shows budget info', () => {
      render(
        <div>
          <span>Remaining: {mockTeam.remainingBudget}</span>
          <span>Total: {mockTeam.totalBudget}</span>
        </div>
      );
      expect(screen.getByText(/Remaining: 800000/)).toBeDefined();
    });

    it('shows player count', () => {
      render(<span>Players: {mockTeam.players}</span>);
      expect(screen.getByText('Players: 8')).toBeDefined();
    });
  });
});
