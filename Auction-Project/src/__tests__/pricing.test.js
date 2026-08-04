/* global describe, test, expect */
import { getPlanForTeamCount, VIP_EMAILS } from '../constants/pricing.js';

describe('Auction Pricing Constants & Rules', () => {
  test('Returns free plan for 3 teams', () => {
    const res = getPlanForTeamCount(3);
    expect(res.requiresPayment).toBe(false);
    expect(res.price).toBe(0);
    expect(res.plan.name).toBe('Plan 1');
  });

  test('Returns ₹20 test plan for 4 teams', () => {
    const res = getPlanForTeamCount(4);
    expect(res.requiresPayment).toBe(true);
    expect(res.price).toBe(20);
  });

  test('Returns ₹349 plan for 6 teams', () => {
    const res = getPlanForTeamCount(6);
    expect(res.requiresPayment).toBe(true);
    expect(res.price).toBe(349);
  });

  test('Bypasses payment for VIP email address', () => {
    const vipEmail = VIP_EMAILS[0];
    const res = getPlanForTeamCount(10, vipEmail);
    expect(res.isVip).toBe(true);
    expect(res.requiresPayment).toBe(false);
    expect(res.price).toBe(0);
  });

  test('Flags error when exceeding 20 teams', () => {
    const res = getPlanForTeamCount(25);
    expect(res.exceedsLimit).toBe(true);
    expect(res.requiresPayment).toBe(true);
  });
});
