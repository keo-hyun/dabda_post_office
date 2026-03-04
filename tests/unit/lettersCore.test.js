import { describe, expect, it } from 'vitest';
import { validateLetterPayload, canViewLetter } from '../../src/backend/core/lettersCore.js';

describe('letter rules', () => {
  it('rejects content over 1000 chars and hides private letters from list', () => {
    expect(validateLetterPayload({ content: 'a'.repeat(1001) }).ok).toBe(false);
    expect(canViewLetter({ visibility: 'PRIVATE' }, { isOwner: false, isAdmin: false })).toBe(false);
  });
});
