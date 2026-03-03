import { describe, expect, it } from 'vitest';
import { buildMetricEvent } from '../../src/backend/core/metricsCore.js';

describe('metric events', () => {
  it('normalizes event payload', () => {
    const event = buildMetricEvent('LETTER_SUBMITTED', { userId: 'u1' });
    expect(event.event_name).toBe('LETTER_SUBMITTED');
    expect(event.user_id).toBe('u1');
  });
});
