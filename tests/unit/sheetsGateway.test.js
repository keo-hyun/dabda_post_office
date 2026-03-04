import { describe, expect, it } from 'vitest';
import { mapHeaderRow } from '../../apps-script/lib/sheetsGateway.js';

describe('sheets gateway', () => {
  it('maps row array by headers', () => {
    const row = mapHeaderRow(['user_id', 'nickname'], ['u1', 'keo']);
    expect(row.user_id).toBe('u1');
    expect(row.nickname).toBe('keo');
  });
});
