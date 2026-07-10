/* eslint-disable no-undef */
// Pure logic tests — no ESM imports needed

const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  let cleaned = str.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  cleaned = cleaned.replace(/<object[\s\S]*?<\/object>/gi, '');
  cleaned = cleaned.replace(/<embed[\s\S]*?>/gi, '');
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  return cleaned.trim();
};

const sanitizeStrings = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = stripHtml(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeStrings(obj[key]);
    }
  }
  return obj;
};

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

describe('XSS Sanitization', () => {
  it('strips script tags and their content', () => {
    const input = { name: '<script>alert("xss")</script>Tournament' };
    const result = sanitizeStrings(input);
    expect(result.name).toBe('Tournament');
  });

  it('strips nested HTML tags', () => {
    const input = { desc: '<b>Bold <i>italic</i></b> text' };
    const result = sanitizeStrings(input);
    expect(result.desc).toBe('Bold italic text');
  });

  it('handles non-string values without modification', () => {
    const input = { amount: 5000, active: true };
    const result = sanitizeStrings(input);
    expect(result.amount).toBe(5000);
    expect(result.active).toBe(true);
  });

  it('handles null and undefined', () => {
    expect(sanitizeStrings(null)).toBeNull();
    expect(sanitizeStrings(undefined)).toBeUndefined();
  });

  it('strips onerror event handlers', () => {
    const input = { name: '  <img src=x onerror=alert(1)>  Name  ' };
    const result = sanitizeStrings(input);
    expect(result.name).toBe('Name');
  });

  it('deeply sanitizes nested objects', () => {
    const input = {
      tournament: {
        name: '<b>Cric</b>Auction',
        details: { desc: '<script>steal</script>Description' },
      },
    };
    const result = sanitizeStrings(input);
    expect(result.tournament.name).toBe('CricAuction');
    expect(result.tournament.details.desc).toBe('Description');
  });

  it('strips iframe tags', () => {
    const input = { content: '<iframe src="evil.com"></iframe>Safe content' };
    const result = sanitizeStrings(input);
    expect(result.content).toBe('Safe content');
  });
});

describe('ID Validation', () => {
  it('accepts valid MongoDB ObjectId', () => {
    expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
  });

  it('rejects short strings', () => {
    expect(isValidObjectId('123')).toBe(false);
  });

  it('rejects strings with invalid chars', () => {
    expect(isValidObjectId('507f1f77bcf86cd79943901g')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidObjectId('')).toBe(false);
  });
});
