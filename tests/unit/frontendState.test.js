import { describe, expect, it } from 'vitest';
import { reduceAppState } from '../../web/state.js';

describe('state transitions', () => {
  it('moves from ENTRY to COMPOSE after successful auth', () => {
    const next = reduceAppState({ screen: 'ENTRY' }, { type: 'AUTH_OK', phase: 'PHASE_1' });
    expect(next.screen).toBe('COMPOSE');
  });

  it('updates entry code and clears entry errors without changing screen', () => {
    const next = reduceAppState(
      { screen: 'ENTRY', entryCode: '', error: '입장에 실패했어요.' },
      { type: 'SET_ENTRY_CODE', value: 'DABDA2026' }
    );

    expect(next.screen).toBe('ENTRY');
    expect(next.entryCode).toBe('DABDA2026');
    expect(next.error).toBe('');
  });
});
