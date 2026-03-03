import { describe, expect, it } from 'vitest';
import { reduceAppState } from '../../web/state.js';

describe('frontend async state', () => {
  it('stores loading and clears it on success', () => {
    let state = reduceAppState({ loading: false, error: '' }, { type: 'REQUEST_START' });
    expect(state.loading).toBe(true);

    state = reduceAppState(state, { type: 'REQUEST_SUCCESS' });
    expect(state.loading).toBe(false);
  });
});
