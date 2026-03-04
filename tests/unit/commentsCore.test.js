import { describe, expect, it } from 'vitest';
import { canEditComment } from '../../src/backend/core/commentsCore.js';

describe('comment permissions', () => {
  it('allows edit/delete only with correct writer password or admin', () => {
    const comment = { password_hash: 'hash123' };
    expect(canEditComment(comment, { passwordOk: false, isAdmin: false })).toBe(false);
    expect(canEditComment(comment, { passwordOk: true, isAdmin: false })).toBe(true);
  });
});
