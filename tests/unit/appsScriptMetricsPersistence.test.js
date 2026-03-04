import { afterEach, describe, expect, it, vi } from 'vitest';
import { doPost } from '../../apps-script/Code.js';

afterEach(() => {
  delete globalThis.PropertiesService;
  delete globalThis.appendRow;
  delete globalThis.findRowBy;
  delete globalThis.getAllRows;
  delete globalThis.mapHeaderRow;
  delete globalThis.updateRowBy;
  delete globalThis.normalizeBase64Image;
  delete globalThis.uploadImageToDrive;
});

describe('apps script metrics persistence', () => {
  it('appends route metric to Metrics sheet when available', () => {
    const appendSpy = vi.fn();

    globalThis.PropertiesService = {
      getScriptProperties: () => ({
        getProperties: () => ({
          SPREADSHEET_ID: 'spreadsheet-id',
          ENTRY_CODE: 'DABDA2026',
          PHASE_MODE: 'PHASE_2'
        })
      })
    };

    globalThis.appendRow = (sheetName, payload, options) => {
      appendSpy(sheetName, payload, options);
      return payload;
    };
    globalThis.findRowBy = () => null;
    globalThis.getAllRows = () => [];
    globalThis.mapHeaderRow = () => ({});
    globalThis.updateRowBy = () => null;
    globalThis.normalizeBase64Image = () => ({ mimeType: '', base64: '' });
    globalThis.uploadImageToDrive = () => ({ fileId: '' });

    const response = doPost({
      parameter: { path: '/api/enter' },
      postData: {
        contents: JSON.stringify({ entryCode: 'DABDA2026' })
      }
    });
    const parsed = JSON.parse(response);

    expect(parsed.ok).toBe(true);
    expect(parsed.metric.event_name).toBe('ENTRY_SUCCESS');
    expect(appendSpy).toHaveBeenCalledWith(
      'Metrics',
      expect.objectContaining({ event_name: 'ENTRY_SUCCESS' }),
      { spreadsheetId: 'spreadsheet-id' }
    );
  });
});
