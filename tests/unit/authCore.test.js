import { describe, expect, it } from 'vitest';
import { validateEntryCode } from '../../src/backend/core/authCore.js';

describe('entry code validation', () => {
  it('accepts configured code regardless of letter case', () => {
    expect(validateEntryCode('DABDA2026', 'DABDA2026')).toBe(true);
    expect(validateEntryCode('dabda2026', 'DABDA2026')).toBe(true);
    expect(validateEntryCode('HOPE0324', 'hope0324')).toBe(true);
    expect(validateEntryCode('WRONG', 'DABDA2026')).toBe(false);
  });
});
