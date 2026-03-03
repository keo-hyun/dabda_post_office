import { afterEach, describe, expect, it } from 'vitest';
import { doPost } from '../../apps-script/Code.js';

afterEach(() => {
  delete globalThis.PropertiesService;
  delete globalThis.SpreadsheetApp;
});

describe('apps script error handling', () => {
  it('returns json error when letter persistence throws', () => {
    globalThis.PropertiesService = {
      getScriptProperties: () => ({
        getProperties: () => ({
          SPREADSHEET_ID: 'spreadsheet-id'
        })
      })
    };

    globalThis.SpreadsheetApp = {
      openById: () => ({
        getSheetByName: () => null
      })
    };

    const response = doPost({
      parameter: { path: '/api/letters' },
      postData: {
        contents: JSON.stringify({
          nickname: '테스터',
          content: '편지 테스트',
          visibility: 'PUBLIC'
        })
      }
    });
    const parsed = JSON.parse(response);

    expect(parsed.ok).toBe(false);
    expect(parsed.message).toContain('Sheet not found: Letters');
  });
});
