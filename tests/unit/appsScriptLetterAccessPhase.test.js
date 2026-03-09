import { afterEach, describe, expect, it } from 'vitest';
import { doGet } from '../../apps-script/Code.js';

afterEach(() => {
  delete globalThis.PropertiesService;
  delete globalThis.SpreadsheetApp;
});

describe('apps script letter access phase context', () => {
  it('allows public letter detail when phase is PHASE_2 and attaches non-deleted comments', () => {
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
          if (name === 'Letters') {
            return {
              getDataRange: () => ({
                getValues: () => [
                  ['letter_id', 'user_id', 'nickname', 'content', 'image_file_id', 'visibility', 'phase_created', 'created_at'],
                  ['l_test_1', '', '테스터', 'phase2 상세 조회', '', 'PUBLIC', 'PHASE_1', '2026-03-04T00:00:00.000Z']
                ]
              })
            };
          }

          if (name === 'Comments') {
            return {
              getDataRange: () => ({
                getValues: () => [
                  ['comment_id', 'letter_id', 'nickname', 'password_hash', 'content', 'created_at', 'updated_at', 'deleted_at'],
                  ['c_1', 'l_test_1', '작성자A', '', '첫 댓글', '2026-03-04T01:00:00.000Z', '', ''],
                  ['c_2', 'l_test_2', '작성자B', '', '다른 편지 댓글', '2026-03-04T01:10:00.000Z', '', ''],
                  ['c_3', 'l_test_1', '작성자C', '', '삭제된 댓글', '2026-03-04T01:20:00.000Z', '', '2026-03-05T00:00:00.000Z']
                ]
              })
            };
          }

          return null;
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
    expect(parsed.letter.comments).toHaveLength(1);
    expect(parsed.letter.comments[0].comment_id).toBe('c_1');
  });
});
