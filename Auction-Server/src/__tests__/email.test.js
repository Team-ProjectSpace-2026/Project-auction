import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { sendPlayerRegistrationEmail } from '../services/email.service.js';

describe('Player Registration Email Service Tests', () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv, BREVO_API_KEY: 'xkeysib-mock-test-key-12345' };
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ messageId: '<test-message-id-12345@mailin.fr>' })
      })
    );
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  test('Skips email dispatch gracefully if player has no email address', async () => {
    const result = await sendPlayerRegistrationEmail({
      player: { name: 'Player No Email' },
      tournament: { name: 'Test League' }
    });
    expect(result).toBeUndefined();
  });

  test('Executes email dispatch with valid player details via Brevo API', async () => {
    const mockPlayer = {
      name: 'Rahul Sharma',
      email: 'test@example.com',
      role: 'Batsman',
      registrationNumber: 15,
      jerseyName: 'RAHUL',
      jerseySize: 'M',
      paymentDetails: { amountPaid: 249, utrLast4: '1234', paidAt: new Date() }
    };
    const mockTournament = { name: 'Super Premier League' };

    const result = await sendPlayerRegistrationEmail({
      player: mockPlayer,
      tournament: mockTournament
    });

    expect(result).toBeDefined();
    expect(result.messageId).toBe('<test-message-id-12345@mailin.fr>');
  });
});
