import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appendRow, clearGatewayCache, mapHeaderRow } from '../../apps-script/lib/sheetsGateway.js';

describe('sheets gateway', () => {
  beforeEach(() => {
    clearGatewayCache();
  });

  it('maps row array by headers', () => {
    const row = mapHeaderRow(['user_id', 'nickname'], ['u1', 'keo']);
    expect(row.user_id).toBe('u1');
    expect(row.nickname).toBe('keo');
  });

  it('reuses spreadsheet handle within the same runtime for the same spreadsheetId', () => {
    const appendLetters = vi.fn();
    const appendMetrics = vi.fn();
    const lettersSheet = {
      getLastColumn: () => 2,
      getRange: () => ({ getValues: () => [['letter_id', 'content']] }),
      appendRow: appendLetters
    };
    const metricsSheet = {
      getLastColumn: () => 2,
      getRange: () => ({ getValues: () => [['event_id', 'event_name']] }),
      appendRow: appendMetrics
    };
    const openById = vi.fn(() => ({
      getSheetByName: (name) => (name === 'Letters' ? lettersSheet : metricsSheet)
    }));

    appendRow('Letters', { letter_id: 'l1', content: 'hello' }, { spreadsheetId: 'sheet-1', services: { openById } });
    appendRow('Metrics', { event_id: 'e1', event_name: 'LETTER_SUBMITTED' }, { spreadsheetId: 'sheet-1', services: { openById } });

    expect(openById).toHaveBeenCalledTimes(1);
    expect(appendLetters).toHaveBeenCalledTimes(1);
    expect(appendMetrics).toHaveBeenCalledTimes(1);
  });
});
