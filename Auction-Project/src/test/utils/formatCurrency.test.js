import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../utils/formatCurrency';

describe('formatCurrency', () => {
  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('formats null/undefined as ₹0', () => {
    expect(formatCurrency(null)).toBe('₹0');
    expect(formatCurrency(undefined)).toBe('₹0');
  });

  it('formats small amounts in Indian notation', () => {
    expect(formatCurrency(1000)).toBe('₹1,000');
  });

  it('formats lakhs (1,00,000)', () => {
    expect(formatCurrency(100000)).toBe('₹1,00,000');
  });

  it('formats crores (1,00,00,000)', () => {
    expect(formatCurrency(10000000)).toBe('₹1,00,00,000');
  });

  it('formats typical auction amounts', () => {
    expect(formatCurrency(1500000)).toBe('₹15,00,000');
    expect(formatCurrency(500000)).toBe('₹5,00,000');
  });

  it('has no decimal places', () => {
    const result = formatCurrency(1234.56);
    expect(result).not.toContain('.');
  });
});
