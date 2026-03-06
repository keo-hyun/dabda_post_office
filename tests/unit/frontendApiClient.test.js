import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../../web/api.js';

const GAS_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbzLKag8DcYZC2EAZdBVIwUHmpq8X8cZh8JicQNo1IDrpM3i4YmpVZfMTo1iwWYFlmK1QA/exec';

afterEach(() => {
  delete globalThis.window;
  delete globalThis.fetch;
});

describe('frontend api client', () => {
  it('uses mock api on localhost by default', async () => {
    globalThis.window = {
      location: {
        hostname: '127.0.0.1',
        search: ''
      }
    };
    globalThis.fetch = vi.fn();

    const api = createApiClient();
    const result = await api.enter('DABDA2026');

    expect(result.ok).toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('routes requests to GAS endpoint when apiMode=real and apiBase is set', async () => {
    globalThis.window = {
      location: {
        hostname: '127.0.0.1',
        search: `?apiMode=real&apiBase=${encodeURIComponent(GAS_WEB_APP_URL)}`
      }
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, phase: 'PHASE_1' })
    });

    const api = createApiClient();
    const result = await api.enter('DABDA2026');

    expect(result.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${GAS_WEB_APP_URL}?path=%2Fapi%2Fenter`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
      })
    );
  });

  it('requires nickname only when creating comment in mock mode', async () => {
    globalThis.window = {
      location: {
        hostname: '127.0.0.1',
        search: ''
      }
    };
    globalThis.fetch = vi.fn();

    const api = createApiClient();
    const withNickname = await api.createComment('letter-1', {
      nickname: '테스터',
      content: '댓글 테스트'
    });

    expect(withNickname.ok).toBe(true);

    const missingNickname = await api.createComment('letter-1', {
      content: '댓글 테스트'
    });

    expect(missingNickname.ok).toBe(false);
  });

  it('reuses phase2 mailbox prefetch request when mailbox is requested immediately after entry', async () => {
    globalThis.window = {
      location: {
        hostname: '127.0.0.1',
        search: `?apiMode=real&apiBase=${encodeURIComponent(GAS_WEB_APP_URL)}`
      }
    };

    let resolveMailbox;
    globalThis.fetch = vi.fn().mockImplementation((url) => {
      if (String(url).includes('%2Fapi%2Fenter')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true, phase: 'PHASE_2' })
        });
      }

      if (String(url).includes('%2Fapi%2Fmailboxes')) {
        return new Promise((resolve) => {
          resolveMailbox = () =>
            resolve({
              ok: true,
              json: async () => ({ ok: true, letters: [{ letter_id: 'l1', visibility: 'PUBLIC' }] })
            });
        });
      }

      return Promise.reject(new Error(`Unexpected url: ${url}`));
    });

    const api = createApiClient();
    const entered = await api.enter('DABDA2026');
    expect(entered.phase).toBe('PHASE_2');
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);

    const mailboxesPromise = api.getMailboxes();
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);

    resolveMailbox();
    const mailboxes = await mailboxesPromise;
    expect(mailboxes.ok).toBe(true);
    expect(mailboxes.letters).toHaveLength(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });
});
