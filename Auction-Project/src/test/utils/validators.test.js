import { describe, it, expect } from 'vitest';
import { validateEmail } from '../utils/validators';

describe('validateEmail', () => {
  it('accepts valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('rejects email without @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('accepts email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true);
  });

  it('accepts email with plus', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });
});
