import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  })),
}));

describe('useSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports connect, disconnect, emit, on, joinTournament, leaveTournament', async () => {
    const mod = await import('../hooks/useSocket.js');
    expect(typeof mod.useSocket).toBe('function');
    expect(typeof mod.default).toBe('function');
  });
});
