import { describe, expect, it } from 'vitest';
import { validateEntryCode } from '../../src/backend/core/authCore.js';

describe('entry code validation', () => {
  it('accepts only exact configured code', () => {
    expect(validateEntryCode('DABDA2026', 'DABDA2026')).toBe(true);
    expect(validateEntryCode('WRONG', 'DABDA2026')).toBe(false);
  });
});
