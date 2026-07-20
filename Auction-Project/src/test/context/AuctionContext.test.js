import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/auctionService.js', () => ({
  getAuctionState: vi.fn(),
}));

vi.mock('../hooks/useSocket.js', () => ({
  useSocket: vi.fn(() => ({
    isConnected: false,
    connectionError: null,
    connect: vi.fn(() => ({
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    })),
    joinTournament: vi.fn(),
    emit: vi.fn(),
  })),
}));

describe('AuctionContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports useAuction hook', async () => {
    const mod = await import('../context/AuctionContext.jsx');
    expect(typeof mod.useAuction).toBe('function');
  });

  it('exports AuctionProvider component', async () => {
    const mod = await import('../context/AuctionContext.jsx');
    expect(mod.AuctionProvider).toBeDefined();
  });

  it('useAuction throws outside provider', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { useAuction } = await import('../context/AuctionContext.jsx');

    expect(() => {
      renderHook(() => useAuction());
    }).toThrow('useAuction must be used within AuctionProvider');
  });
});
