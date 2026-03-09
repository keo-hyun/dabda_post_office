import { describe, expect, it, vi } from 'vitest';
import { createCommentRoute } from '../../apps-script/routes/comments.js';
import { createLetterRoute, getLetterByIdRoute, getMailboxesRoute } from '../../apps-script/routes/letters.js';

describe('apps script route caching', () => {
  it('reuses cached mailbox list to avoid repeated sheets reads', () => {
    const cache = new Map();
    const sheetsGateway = {
      getAllRows: vi.fn(() => [
        { letter_id: 'l1', visibility: 'PUBLIC' },
        { letter_id: 'l2', visibility: 'PUBLIC' }
      ])
    };
    const cacheGateway = {
      get: vi.fn((key) => cache.get(key) || ''),
      set: vi.fn((key, value) => {
        cache.set(key, value);
      }),
      remove: vi.fn()
    };

    const deps = {
      spreadsheetId: 'sheet_1',
      sheetsGateway,
      cacheGateway
    };

    const first = getMailboxesRoute([], { phase: 'PHASE_2' }, deps);
    const second = getMailboxesRoute([], { phase: 'PHASE_2' }, deps);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(sheetsGateway.getAllRows).toHaveBeenCalledTimes(1);
    expect(cacheGateway.set).toHaveBeenCalledTimes(1);
  });

  it('reuses cached letter detail with comments', () => {
    const cache = new Map();
    const sheetsGateway = {
      findRowBy: vi.fn(() => ({
        row: { letter_id: 'l1', visibility: 'PUBLIC', content: 'test' }
      })),
      getAllRows: vi.fn(() => [
        {
          comment_id: 'c1',
          letter_id: 'l1',
          nickname: 'n',
          content: 'hello',
          deleted_at: '',
          created_at: '2026-03-09T00:00:00.000Z'
        }
      ])
    };
    const cacheGateway = {
      get: vi.fn((key) => cache.get(key) || ''),
      set: vi.fn((key, value) => {
        cache.set(key, value);
      }),
      remove: vi.fn()
    };

    const deps = {
      spreadsheetId: 'sheet_1',
      sheetsGateway,
      cacheGateway
    };

    const first = getLetterByIdRoute(null, { letterId: 'l1', phase: 'PHASE_2' }, deps);
    const second = getLetterByIdRoute(null, { letterId: 'l1', phase: 'PHASE_2' }, deps);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(first.letter.comments).toHaveLength(1);
    expect(second.letter.comments).toHaveLength(1);
    expect(sheetsGateway.findRowBy).toHaveBeenCalledTimes(1);
    expect(sheetsGateway.getAllRows).toHaveBeenCalledTimes(1);
    expect(cacheGateway.set).toHaveBeenCalledTimes(1);
  });

  it('invalidates letter detail cache when comment is created', () => {
    const cacheGateway = {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn()
    };
    const sheetsGateway = {
      appendRow: vi.fn()
    };

    const result = createCommentRoute(
      {
        letter_id: 'l1',
        nickname: '작성자',
        content: '댓글'
      },
      {
        spreadsheetId: 'sheet_1',
        sheetsGateway,
        cacheGateway
      }
    );

    expect(result.ok).toBe(true);
    expect(cacheGateway.remove).toHaveBeenCalledTimes(1);
    expect(cacheGateway.remove.mock.calls[0][0]).toContain('l1');
  });

  it('invalidates mailbox cache when letter is created', () => {
    const cacheGateway = {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn()
    };
    const sheetsGateway = {
      appendRow: vi.fn()
    };

    const result = createLetterRoute(
      {
        nickname: '작성자',
        content: '내용',
        visibility: 'PUBLIC'
      },
      {
        spreadsheetId: 'sheet_1',
        sheetsGateway,
        cacheGateway
      }
    );

    expect(result.ok).toBe(true);
    expect(cacheGateway.remove).toHaveBeenCalledTimes(1);
    expect(cacheGateway.remove.mock.calls[0][0]).toContain('mailboxes');
  });
});
