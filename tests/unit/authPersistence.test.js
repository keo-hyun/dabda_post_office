import { describe, expect, it } from 'vitest';
import { buildUserInsert } from '../../src/backend/core/authCore.js';

describe('auth persistence shape', () => {
  it('creates users row payload with hashed password', () => {
    const row = buildUserInsert('keo', 'secret');
    expect(row.nickname).toBe('keo');
    expect(row.password_hash).not.toBe('secret');
  });
});
