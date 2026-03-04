import { describe, expect, it } from 'vitest';
import { reduceAppState } from '../../web/state.js';

describe('state transitions', () => {
  it('moves from ENTRY to COMPOSE after successful auth', () => {
    const next = reduceAppState({ screen: 'ENTRY' }, { type: 'AUTH_OK', phase: 'PHASE_1' });
    expect(next.screen).toBe('COMPOSE');
  });
});
