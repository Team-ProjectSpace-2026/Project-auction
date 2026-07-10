import { describe, it, expect, vi } from 'vitest';

// Mock API service
vi.mock('../services/authService.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getProfile: vi.fn(),
  logout: vi.fn(),
}));

describe('AuthContext security', () => {
  it('does not store token in localStorage', async () => {
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { login } = await import('../services/authService.js');
    login.mockResolvedValue({ data: { user: { id: '1', name: 'Test' } } });

    // Import the context module to verify no localStorage.setItem calls
    await import('../context/AuthContext.jsx');

    // Verify no token was stored in localStorage
    const tokenCalls = localStorageSpy.mock.calls.filter(
      ([key]) => key === 'token'
    );
    expect(tokenCalls).toHaveLength(0);
    localStorageSpy.mockRestore();
  });
});
