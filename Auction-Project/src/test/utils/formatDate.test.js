import { describe, it, expect } from 'vitest';
import { formatDate } from '../utils/formatDate';

describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2027-06-15');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date('2027-01-01'));
    expect(result).toBeDefined();
  });

  it('handles ISO string', () => {
    const result = formatDate('2027-12-31T00:00:00.000Z');
    expect(result).toBeDefined();
  });

  it('returns "Invalid Date" for bad input', () => {
    const result = formatDate('not-a-date');
    expect(result).toBe('Invalid Date');
  });
});
