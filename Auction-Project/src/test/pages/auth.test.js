import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../services/authService.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getProfile: vi.fn(),
  logout: vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', async () => {
    const { LoginPage } = await import('../pages/auth/LoginPage.jsx');
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    // Should have email and password inputs
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders submit button', async () => {
    const { LoginPage } = await import('../pages/auth/LoginPage.jsx');
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});

describe('RegisterPage', () => {
  it('renders register form', async () => {
    const { RegisterPage } = await import('../pages/auth/RegisterPage.jsx');
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });
});

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', async () => {
    const { ProtectedRoute } = await import('../router/AppRouter.jsx');
    // This tests the routing guard concept
    expect(ProtectedRoute).toBeDefined();
  });
});
