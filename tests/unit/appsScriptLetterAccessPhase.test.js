import { afterEach, describe, expect, it } from 'vitest';
import { doGet } from '../../apps-script/Code.js';

afterEach(() => {
  delete globalThis.PropertiesService;
  delete globalThis.SpreadsheetApp;
});

describe('apps script letter access phase context', () => {
  it('allows public letter detail when phase is PHASE_2', () => {
    globalThis.PropertiesService = {
      getScriptProperties: () => ({
        getProperties: () => ({
          SPREADSHEET_ID: 'sheet-id',
          PHASE_MODE: 'PHASE_2'
        })
      })
    };

    globalThis.SpreadsheetApp = {
      openById: () => ({
        getSheetByName: (name) => {
          if (name !== 'Letters') return null;

          return {
            getDataRange: () => ({
              getValues: () => [
                ['letter_id', 'user_id', 'nickname', 'content', 'image_file_id', 'visibility', 'phase_created', 'created_at'],
                ['l_test_1', '', '테스터', 'phase2 상세 조회', '', 'PUBLIC', 'PHASE_1', '2026-03-04T00:00:00.000Z']
              ]
            })
          };
        }
      })
    };

    const response = doGet({
      parameter: {
        path: '/api/letters/l_test_1'
      }
    });
    const parsed = JSON.parse(response);

    expect(parsed.ok).toBe(true);
    expect(parsed.letter.letter_id).toBe('l_test_1');
  });
});
