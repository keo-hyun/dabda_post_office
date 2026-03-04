import { describe, expect, it } from 'vitest';
import { enterRoute } from '../../apps-script/routes/auth.js';
import { phaseRoute } from '../../apps-script/routes/phase.js';

describe('apps script phase mode override', () => {
  it('forces phase endpoint result when PHASE_MODE is configured', () => {
    const result = phaseRoute({
      PHASE_MODE: 'PHASE_2',
      now: '2026-03-03T00:00:00+09:00'
    });

    expect(result.phase).toBe('PHASE_2');
  });

  it('forces enter endpoint result when PHASE_MODE is configured', () => {
    const result = enterRoute(
      { entryCode: 'DABDA2026' },
      {
        ENTRY_CODE: 'DABDA2026',
        PHASE_MODE: 'TRANSITION',
        now: '2026-03-03T00:00:00+09:00'
      }
    );

    expect(result.phase).toBe('TRANSITION');
  });
});
