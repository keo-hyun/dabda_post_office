import { describe, expect, it } from 'vitest';
import { resolvePhase } from '../../src/shared/phase.js';

describe('phase resolver', () => {
  it('returns PHASE_1 on 2026-03-25 and TRANSITION on 2026-04-10', () => {
    expect(resolvePhase(new Date('2026-03-25T09:00:00+09:00'))).toBe('PHASE_1');
    expect(resolvePhase(new Date('2026-04-10T09:00:00+09:00'))).toBe('TRANSITION');
  });
});
