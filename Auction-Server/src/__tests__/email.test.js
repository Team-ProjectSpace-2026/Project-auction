import { describe, test, expect } from '@jest/globals';
import { sendPlayerRegistrationEmail } from '../services/email.service.js';

describe('Player Registration Email Service Tests', () => {
  test('Skips email dispatch gracefully if player has no email address', async () => {
    const result = await sendPlayerRegistrationEmail({
      player: { name: 'Player No Email' },
      tournament: { name: 'Test League' }
    });
    expect(result).toBeUndefined();
  });

  test('Executes email dispatch with valid player details without throwing error', async () => {
    const mockPlayer = {
      name: 'Rahul Sharma',
      email: 'heyprojectspace@gmail.com',
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
    expect(result.messageId || result.id).toBeTruthy();
  });
});
